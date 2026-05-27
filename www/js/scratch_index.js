// Main JavaScript file for simulator using Canvas Renderer

let engine = new SimulationEngine()
engine.start()

// Component tracking
let components = {}
let connectors = {}
let wires = {}
let elementId = 0
let connectorId = 0
let wireId = 0

// Editor state
let navMode = 1 // 1: Edit, 0: Pan/Interact
let GRID = 10
let zoom = 1.0

// Interaction states
let dragState = { active: false, component: null, startX: 0, startY: 0, compStartX: 0, compStartY: 0 }
let wireDrawState = { active: false, startConnector: null, previewWire: null }
let wireDragState = { active: false, wireId: null, segIndex: -1, isHorizontal: false, startX: 0, startY: 0, originalBends: null }
let selectState = { active: false, startX: 0, startY: 0, currX: 0, currY: 0 }

// Init Renderer
let renderer = new CanvasRenderer('circuit-canvas')

// Make them globally available for renderer
window.components = Object.values(components)
window.wires = Object.values(wires)
window.selectState = selectState
window.wireDrawState = wireDrawState

// Sync global arrays when objects change
function syncGlobals() {
    window.components = Object.values(components)
    window.wires = Object.values(wires)
}

// ----- UI CONTROLS -----
document.querySelector('#pan-button').addEventListener('click', () => {
    navMode = 0
    document.querySelector('#pan-button').classList.add('active')
    document.querySelector('#edit-button').classList.remove('active')
    document.body.style.cursor = 'all-scroll'
})

document.querySelector('#edit-button').addEventListener('click', () => {
    navMode = 1
    document.querySelector('#pan-button').classList.remove('active')
    document.querySelector('#edit-button').classList.add('active')
    document.body.style.cursor = 'default'
})

// ----- DRAG AND DROP FROM SIDEBAR -----
let dropzone = renderer.canvas;

document.querySelectorAll('.draggable').forEach(el => {
    el.addEventListener('dragstart', (e) => {
        let t = el.id || el.parentElement.id
        if (el.classList.contains('seg7')) t = 'seg7'
        if (el.classList.contains('label')) t = 'label'
        
        let rect = el.getBoundingClientRect()
        let mx = e.clientX - rect.left
        let my = e.clientY - rect.top
        
        e.dataTransfer.setData('text/plain', JSON.stringify({ type: t, xoff: mx, yoff: my }))
        
        // Hide default drag image
        let emptyImg = new Image()
        emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
        e.dataTransfer.setDragImage(emptyImg, 0, 0)
    })
})

dropzone.addEventListener('dragover', (e) => {
    e.preventDefault()
})

dropzone.addEventListener('drop', (e) => {
    e.preventDefault()
    let data = JSON.parse(e.dataTransfer.getData('text/plain'))
    
    let worldPos = renderer.screenToWorld(e.clientX, e.clientY)
    let x = Math.round((worldPos.x - data.xoff) / GRID) * GRID
    let y = Math.round((worldPos.y - data.yoff) / GRID) * GRID
    
    let comp = createComponent(data.type, x, y)
    syncGlobals()
    pushHistory()
})

// ----- COMPONENT CREATION -----
function createComponent(type, x, y, id = null) {
    if (!id) {
        elementId++
        id = elementId
    }
    
    let comp = null;
    let category = getCategory(type)
    
    if (category === 'gate') comp = new Gate(type, x, y, null);
    else if (category === 'input') {
        if (type === 'clock') comp = new Clock(x, y, null);
        else comp = new Input(type, x, y, null);
    }
    else if (category === 'light') comp = new Light(x, y, null);
    else if (category === 'flipflop') comp = new FlipFlop(type, x, y, null);
    else if (category === 'junction') comp = new Junction(type, x, y, null);
    else if (type === 'seg7') comp = new Seg7(x, y, null);
    else if (type === 'label') comp = new Label(x, y, null);

    if (comp) {
        comp.id = id
        components[id] = comp
        engine.registerComponent(id, comp)
        createConnectorsFor(comp)
    }
    return comp
}

function getCategory(type) {
    let catMap = {
        'and': 'gate', 'or': 'gate', 'not': 'gate', 'nand': 'gate', 'nor': 'gate', 'xor': 'gate', 'xnor': 'gate',
        'button': 'input', 'switch': 'input', 'vcc': 'input', 'gnd': 'input', 'clock': 'input',
        'led': 'light', 'tff': 'flipflop', 'jkff': 'flipflop', 'dff': 'flipflop', 'srff': 'flipflop',
        'junction': 'junction', 'junc3': 'junction', 'junc4': 'junction'
    }
    return catMap[type] || type
}

function createConnectorsFor(comp) {
    let c = getCategory(comp.type)
    let makeConn = (type, loc, lx, ly) => {
        connectorId++
        let conn = new Connector(type, loc, comp)
        conn.id = connectorId
        conn.localX = lx
        conn.localY = ly
        comp[loc] = conn
        connectors[connectorId] = conn
        engine.registerConnector(connectorId, conn)
    }

    if (c === 'gate') {
        if (comp.type !== 'not') {
            makeConn('in', 'n1', 0, 20)
            makeConn('in', 'n2', 0, 60)
        } else {
            makeConn('in', 'n1', 0, 40)
        }
        let outX = (comp.type === 'nand' || comp.type === 'nor' || comp.type === 'xnor' || comp.type === 'not') ? 120 : 120;
        makeConn('out', 'nOut', outX, 40)
    } else if (c === 'input') {
        makeConn('out', 'nOut', 50, 20)
    } else if (c === 'light') {
        makeConn('in', 'n1', 20, 50)
    } else if (c === 'flipflop') {
        if (comp.type === 'dff' || comp.type === 'tff') {
            makeConn('in', 'n1', 0, 20)
            makeConn('in', 'nC', 0, 40)
        } else {
            makeConn('in', 'n1', 0, 20)
            makeConn('in', 'nC', 0, 40)
            makeConn('in', 'n2', 0, 60)
        }
        makeConn('out', 'nQ', 140, 20)
        makeConn('out', 'nQNot', 140, 60)
    } else if (c === 'junction') {
        makeConn('in', 'n1', 0, 25)
        makeConn('out', 'n2', 50, 25)
        if (comp.type === 'junc3') {
            makeConn('out', 'n3', 25, 50)
        } else {
            makeConn('out', 'n3', 25, 0)
            makeConn('out', 'n4', 25, 50)
        }
    } else if (comp.type === 'seg7') {
        makeConn('in', 'n1', 30, 80)
        makeConn('in', 'n2', 45, 80)
        makeConn('in', 'n3', 60, 80)
        makeConn('in', 'n4', 75, 80)
    }
}

// ----- POINTER EVENTS -----
let isPanning = false
let panStartX = 0
let panStartY = 0

renderer.canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault()
    let worldPos = renderer.screenToWorld(e.clientX, e.clientY)
    
    // Pan mode logic
    if (navMode === 0 || e.button === 1 || e.button === 2) { // Middle or Right click pans too
        isPanning = true
        panStartX = e.clientX
        panStartY = e.clientY
        
        // Check if interacting with input in pan mode
        let hit = renderer.hitTest(worldPos.x, worldPos.y)
        if (hit && hit.type === 'component') {
            let c = hit.component
            if (c.type === 'button') c.on()
            if (c.type === 'switch') c.toggle()
        }
        return
    }

    let hit = renderer.hitTest(worldPos.x, worldPos.y)

    if (hit) {
        if (hit.type === 'connector') {
            wireDrawState = {
                active: true,
                startConnector: hit.connector,
                previewWire: new Wire(hit.connector, null) // Temporary visual wire
            }
        } else if (hit.type === 'component') {
            let comp = hit.component
            if (!comp.selected && !e.shiftKey) {
                // Deselect others if not shift key
                Object.values(components).forEach(c => c.deselect())
                Object.values(wires).forEach(w => w.deselect())
            }
            comp.select()
            
            dragState = {
                active: true,
                component: comp,
                startX: worldPos.x,
                startY: worldPos.y,
                compStartX: comp.x,
                compStartY: comp.y
            }
            
            // Store starting positions for all selected components in case of group drag
            Object.values(components).forEach(c => {
                if (c.selected) {
                    c.dragStartX = c.x
                    c.dragStartY = c.y
                }
            })
        } else if (hit.type === 'wire') {
            // Handle wire segment dragging
            // Simplified wire bend for now - to be fully implemented later if needed
            hit.wire.select()
        }
    } else {
        // Box select
        if (!e.shiftKey) {
            Object.values(components).forEach(c => c.deselect())
            Object.values(wires).forEach(w => w.deselect())
        }
        selectState = {
            active: true,
            startX: worldPos.x,
            startY: worldPos.y,
            currX: worldPos.x,
            currY: worldPos.y
        }
    }
})

window.addEventListener('pointermove', (e) => {
    let worldPos = renderer.screenToWorld(e.clientX, e.clientY)

    if (isPanning) {
        let dx = e.clientX - panStartX
        let dy = e.clientY - panStartY
        renderer.pan(dx, dy)
        panStartX = e.clientX
        panStartY = e.clientY
    }

    if (dragState.active) {
        let dx = Math.round((worldPos.x - dragState.startX) / GRID) * GRID
        let dy = Math.round((worldPos.y - dragState.startY) / GRID) * GRID
        
        Object.values(components).forEach(c => {
            if (c.selected) {
                c.x = c.dragStartX + dx
                c.y = c.dragStartY + dy
            }
        })
    }

    if (wireDrawState.active) {
        let startPos = { 
            x: wireDrawState.startConnector.parent.x + wireDrawState.startConnector.localX,
            y: wireDrawState.startConnector.parent.y + wireDrawState.startConnector.localY
        }
        // Force bend for preview
        wireDrawState.previewWire.bends = [
            { x: startPos.x, y: Math.round(worldPos.y / GRID) * GRID }
        ]
        // Hack the preview end position
        wireDrawState.previewWire.n2 = { parent: { x: 0, y: 0 }, localX: Math.round(worldPos.x / GRID) * GRID, localY: Math.round(worldPos.y / GRID) * GRID }
    }

    if (selectState.active) {
        selectState.currX = worldPos.x
        selectState.currY = worldPos.y
    }
})

window.addEventListener('pointerup', (e) => {
    let worldPos = renderer.screenToWorld(e.clientX, e.clientY)

    if (isPanning) {
        isPanning = false
        // Handle button off
        Object.values(components).forEach(c => {
            if (c.type === 'button' && c.value) c.off()
        })
    }

    if (dragState.active) {
        dragState.active = false
        pushHistory()
    }

    if (wireDrawState.active) {
        let hit = renderer.hitTest(worldPos.x, worldPos.y)
        if (hit && hit.type === 'connector' && hit.connector !== wireDrawState.startConnector) {
            let n1 = wireDrawState.startConnector
            let n2 = hit.connector
            
            // Swap if n1 is 'in' and n2 is 'out' so n1 is always 'out' (source)
            if (n1.type === 'in' && n2.type === 'out') {
                let temp = n1; n1 = n2; n2 = temp;
            }
            
            if (n1.type === 'out' && n2.type === 'in') {
                wireId++
                let wire = new Wire(n1, n2)
                wire.id = wireId
                wires[wireId] = wire
                engine.registerWire(wireId, wire)
                n1.parent.addOut = wire
                n2.parent.setIn = wire
                
                // Route wire simply for now
                let p1 = { x: n1.parent.x + n1.localX, y: n1.parent.y + n1.localY }
                let p2 = { x: n2.parent.x + n2.localX, y: n2.parent.y + n2.localY }
                wire.bends = [{ x: p2.x, y: p1.y }]
                
                syncGlobals()
                pushHistory()
            }
        }
        wireDrawState.active = false
        wireDrawState.previewWire = null
    }

    if (selectState.active) {
        let minX = Math.min(selectState.startX, selectState.currX)
        let maxX = Math.max(selectState.startX, selectState.currX)
        let minY = Math.min(selectState.startY, selectState.currY)
        let maxY = Math.max(selectState.startY, selectState.currY)
        
        Object.values(components).forEach(c => {
            if (c.x >= minX && c.x <= maxX && c.y >= minY && c.y <= maxY) {
                c.select()
            }
        })
        selectState.active = false
    }
})

// ----- ZOOM & SCROLL -----
renderer.canvas.addEventListener('wheel', (e) => {
    e.preventDefault()
    let zoomDelta = e.deltaY > 0 ? 0.9 : 1.1
    let worldPos = renderer.screenToWorld(e.clientX, e.clientY)
    renderer.setZoom(renderer.zoomScale * zoomDelta, e.clientX, e.clientY)
})

document.getElementById('zoom-slider').addEventListener('input', (e) => {
    renderer.setZoom(parseFloat(e.target.value))
})

// ----- KEYBOARD CONTROLS -----
window.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
        let changed = false
        Object.values(components).forEach(c => {
            if (c.selected) {
                deleteComponent(c.id)
                changed = true
            }
        })
        Object.values(wires).forEach(w => {
            if (w.selected) {
                deleteWire(w.id)
                changed = true
            }
        })
        if (changed) pushHistory()
    }
})

function deleteComponent(id) {
    let comp = components[id]
    if (!comp) return
    // Find connected wires and delete
    let connectedWires = Object.keys(wires).filter(wid => wires[wid].n1.parent === comp || wires[wid].n2.parent === comp)
    connectedWires.forEach(wid => deleteWire(wid))
    
    // Unregister connectors
    let conns = [comp.n1, comp.n2, comp.nC, comp.nOut, comp.nQ, comp.nQNot].filter(c => c)
    conns.forEach(c => {
        engine.unregisterConnector(c.id)
        delete connectors[c.id]
    })
    
    engine.unregisterComponent(id)
    delete components[id]
    syncGlobals()
}

function deleteWire(id) {
    let wire = wires[id]
    if (!wire) return
    engine.unregisterWire(id)
    
    if (wire.n1 && wire.n1.parent && wire.n1.parent.out) {
        let pOut = wire.n1.parent.out
        if (Array.isArray(pOut)) {
            let idx = pOut.indexOf(wire)
            if (idx > -1) pOut.splice(idx, 1)
        }
    }
    if (wire.n1 && wire.n1.parent && wire.n1.parent.qOut) {
        let idx = wire.n1.parent.qOut.indexOf(wire)
        if (idx > -1) wire.n1.parent.qOut.splice(idx, 1)
        let idx2 = wire.n1.parent.qNotOut.indexOf(wire)
        if (idx2 > -1) wire.n1.parent.qNotOut.splice(idx2, 1)
    }
    if (wire.n2 && wire.n2.parent) {
        wire.n2.parent.setIn = null
    }
    
    delete wires[id]
    syncGlobals()
}

// ----- HISTORY -----
let historyStack = []
let historyIndex = -1
let historyIgnore = false

function pushHistory() {
    if (historyIgnore) return
    // Simplified history push
    let state = { components: {}, wires: {} }
    // Add serialize / load logic as needed
}

// Initial Sync
syncGlobals()
