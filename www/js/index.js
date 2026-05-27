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

function getCompDims(type) {
    if (['not','and','or','nand','nor','xor','xnor'].includes(type)) {
        return { w: 120, h: type === 'not' ? 40 : 80 };
    } else if (['dff','tff','jkff','srff'].includes(type)) {
        return { w: 140, h: 80 };
    } else if (type === 'seg7') {
        return { w: 100, h: 135 };
    } else if (type === 'label') {
        return { w: 100, h: 30 };
    }
    return { w: 40, h: 40 };
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
                previewWire: new Wire('preview', hit.connector, { parent: { x: 0, y: 0, rotation: 0 }, localX: worldPos.x, localY: worldPos.y }) // Temporary visual wire
            }
        } else if (hit.type === 'component') {
            let comp = hit.component
            if (comp.type === 'button') comp.on()
            if (comp.type === 'switch') comp.toggle()
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
    }

    // Handle button off
    Object.values(components).forEach(c => {
        if (c.type === 'button' && c.value) c.off()
    })

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
                let wire = new Wire(wireId, n1, n2)
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

renderer.canvas.addEventListener('dblclick', (e) => {
    let worldPos = renderer.screenToWorld(e.clientX, e.clientY)
    let hit = renderer.hitTest(worldPos.x, worldPos.y)
    if (hit && hit.type === 'component') {
        Object.values(components).forEach(c => c.deselect())
        hit.component.select()
        updateSettingsPanel()
    }
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
    let connectedWires = Object.keys(wires).filter(wid => wires[wid].n1?.parent === comp || wires[wid].n2?.parent === comp)
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



// Initial Sync
syncGlobals()



// ===== UNDO / REDO =====
let historyStack = []
let historyIndex = -1
let historyMax = 50
let historyIgnore = false

function pushHistory() {
    if (historyIgnore) return
    let snapshot = JSON.stringify(serializeCircuit())
    historyStack = historyStack.slice(0, historyIndex + 1)
    historyStack.push(snapshot)
    if (historyStack.length > historyMax) historyStack.shift()
    historyIndex = historyStack.length - 1
}

function restoreHistory(snapshot) {
    historyIgnore = true
    let data = JSON.parse(snapshot)
    loadCircuit(data, false)
    historyIgnore = false
}

let undo = () => {
    if (historyIndex <= 0) return
    historyIndex--
    restoreHistory(historyStack[historyIndex])
}

let redo = () => {
    if (historyIndex >= historyStack.length - 1) return
    historyIndex++
    restoreHistory(historyStack[historyIndex])
}


// ===== COPY / PASTE / CUT =====
let clipboard = null
let pasteCount = 0  // increments to offset successive pastes

function copySelection() {
    let selectedIds = Object.keys(components).filter(id => components[id].selected)
    if (selectedIds.length === 0) return
    let selectedSet = new Set(selectedIds.map(id => String(id)))

    let compArr = []
    for (let id of selectedIds) {
        let comp = components[id]
        let cat = categories[comp.getType || comp.type]
        let entry = {
            id: id,
            type: comp.getType || comp.type,
            category: cat,
            x: comp.x,
            y: comp.y,
            rotation: comp.rotation || 0
        }
        if (entry.type === '7seg') entry.type = 'seg7'
        if (comp instanceof Light && comp.lightColor) entry.lightColor = comp.lightColor
        if (comp instanceof Seg7 && comp.displayColor) entry.displayColor = comp.displayColor
        if (comp instanceof Label) entry.text = comp.text
        entry.connectorIds = {}
        if (comp.n1) entry.connectorIds.n1 = comp.n1.id
        if (comp.n2 && comp.n2 !== comp.n1) entry.connectorIds.n2 = comp.n2.id
        if (comp.nOut) entry.connectorIds.nOut = comp.nOut.id
        if (comp.nQ) entry.connectorIds.nQ = comp.nQ.id
        if (comp.nQNot) entry.connectorIds.nQNot = comp.nQNot.id
        if (comp.nC) entry.connectorIds.nC = comp.nC.id
        if (entry.type === 'seg7' || entry.type === 'junc3' || entry.type === 'junc4') {
            entry.connectorIds.n1 = comp.n1 ? comp.n1.id : null
            entry.connectorIds.n2 = comp.n2 ? comp.n2.id : null
            entry.connectorIds.n3 = comp.n3 ? comp.n3.id : null
            entry.connectorIds.n4 = comp.n4 ? comp.n4.id : null
        }
        compArr.push(entry)
    }

    // Only include wires where BOTH endpoints are in the selection
    let wireArr = []
    for (let wid of Object.keys(wires)) {
        let w = wires[wid]
        if (!w || !w.n1 || !w.n2) continue
        let srcCompId = String(w.n1.parent.id)
        let dstCompId = String(w.n2.parent.id)
        if (selectedSet.has(srcCompId) && selectedSet.has(dstCompId)) {
            wireArr.push({
                id: wid,
                src: w.n1.id,
                dst: w.n2.id,
                bends: w.bends ? JSON.parse(JSON.stringify(w.bends)) : null
            })
        }
    }

    clipboard = { version: '0.4.0', components: compArr, wires: wireArr }
    pasteCount = 0
}

function cutSelection() {
    let selectedIds = Object.keys(components).filter(id => components[id].selected)
    if (selectedIds.length === 0) return
    copySelection()
    for (let id of selectedIds) deleteComponent(id)
    pushHistory()
    updateSettingsPanel()
}

function pasteSelection() {
    if (!clipboard) return
    // Deselect current selection
    for (let id of Object.keys(components)) components[id].deselect()
    pasteCount++
    let offset = 30 * pasteCount
    // Deep copy and apply offset from original positions
    let data = JSON.parse(JSON.stringify(clipboard))
    for (let c of data.components) { c.x += offset; c.y += offset }
    for (let w of data.wires) {
        if (w.bends) {
            for (let b of w.bends) { b.x += offset; b.y += offset }
        }
    }
    loadCircuit(data, true)
    pushHistory()
}

let mode = (m) => { if (navMode != m) { navMode = m; updateMode() } }


// ===== EXPORT (save) =====
let save = () => {
    let data = serializeCircuit()
    let blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    let a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'circuit.nandbox.json'
    a.click()
    URL.revokeObjectURL(a.href)
}

function serializeCircuit() {
    let compArr = []
    for (let id of Object.keys(components)) {
        let comp = components[id]
        let cat = getCategory(comp.getType || comp.type)
        let entry = {
            id: id,
            type: comp.getType || comp.type,
            category: cat,
            x: comp.x,
            y: comp.y,
            rotation: comp.rotation || 0
        }
        // Normalize 7seg type for template compatibility
        if (entry.type === '7seg') entry.type = 'seg7'
        // LED-specific: color
        if (comp instanceof Light && comp.lightColor) {
            entry.lightColor = comp.lightColor
        }
        // 7Seg-specific: color
        if (comp instanceof Seg7 && comp.displayColor) {
            entry.displayColor = comp.displayColor
        }
        // Label-specific: text
        if (comp instanceof Label) {
            entry.text = comp.text
        }
        // Store connector IDs
        entry.connectorIds = {}
        if (comp.n1) entry.connectorIds.n1 = comp.n1.id
        if (comp.n2 && comp.n2 !== comp.n1) entry.connectorIds.n2 = comp.n2.id
        if (comp.nOut) entry.connectorIds.nOut = comp.nOut.id
        if (comp.nQ) entry.connectorIds.nQ = comp.nQ.id
        if (comp.nQNot) entry.connectorIds.nQNot = comp.nQNot.id
        if (comp.nC) entry.connectorIds.nC = comp.nC.id
        // 7seg pins
        if (entry.type === 'seg7' || entry.type === 'junc3' || entry.type === 'junc4') {
            entry.connectorIds.n1 = comp.n1 ? comp.n1.id : null
            entry.connectorIds.n2 = comp.n2 ? comp.n2.id : null
            entry.connectorIds.n3 = comp.n3 ? comp.n3.id : null
            entry.connectorIds.n4 = comp.n4 ? comp.n4.id : null
        }
        compArr.push(entry)
    }
    let wireArr = []
    for (let id of Object.keys(wires)) {
        let w = wires[id]
        wireArr.push({
            id: id,
            src: w.n1 ? w.n1.id : null,
            dst: w.n2 ? w.n2.id : null,
            bends: w.bends || null
        })
    }
    return { version: '0.4.0', components: compArr, wires: wireArr }
}



// ===== IMPORT (load) =====
let load = () => {
    let input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,.nandbox.json'
    input.onchange = (e) => {
        let file = e.target.files[0]
        if (!file) return
        let reader = new FileReader()
        reader.onload = (ev) => {
            try {
                let data = JSON.parse(ev.target.result)
                loadCircuit(data)
            } catch (err) {
                alert('Failed to load circuit: ' + err.message)
            }
        }
        reader.readAsText(file)
    }
    input.click()
}

function loadCircuit(data, append) {
    if (!append) {
        components = {}
        connectors = {}
        wires = {}
        elementId = 0
        connectorId = 0
        wireId = 0
    }
    
    let idMap = {}
    let newCompIds = []
    
    for (let cData of data.components) {
        let newId = append ? ++elementId : parseInt(cData.id)
        if (!append && newId > elementId) elementId = newId
        idMap[cData.id] = newId
        
        let comp = createComponent(cData.type, cData.x, cData.y, newId)
        comp.rotation = cData.rotation || 0
        
        if (cData.lightColor && comp instanceof Light) {
            setLedColor(newId, cData.lightColor)
        }
        if (cData.displayColor && comp instanceof Seg7) {
            setSeg7Color(newId, cData.displayColor)
        }
        if (cData.text && comp instanceof Label) {
            comp.text = cData.text
        }
        
        newCompIds.push(newId)
        
        if (cData.connectorIds) {
            let mapConn = (loc, oldId) => {
                if (oldId && comp[loc]) {
                    if (!append) {
                        let oldIdInt = parseInt(oldId)
                        delete connectors[comp[loc].id]
                        comp[loc].id = oldIdInt
                        connectors[oldIdInt] = comp[loc]
                        if (oldIdInt > connectorId) connectorId = oldIdInt
                    }
                }
            }
            mapConn('n1', cData.connectorIds.n1)
            mapConn('n2', cData.connectorIds.n2)
            mapConn('n3', cData.connectorIds.n3)
            mapConn('n4', cData.connectorIds.n4)
            mapConn('nC', cData.connectorIds.nC)
            mapConn('nQ', cData.connectorIds.nQ)
            mapConn('nQNot', cData.connectorIds.nQNot)
            mapConn('nOut', cData.connectorIds.nOut)
        }
    }
    
    for (let wData of data.wires) {
        if (!wData.src || !wData.dst) continue
        
        let n1, n2;
        if (!append) {
            n1 = connectors[wData.src]
            n2 = connectors[wData.dst]
        }
        
        if (n1 && n2) {
            let newWId = append ? ++wireId : parseInt(wData.id)
            if (!append && newWId > wireId) wireId = newWId
            
            let wire = new Wire(newWId, n1, n2)
            wire.bends = wData.bends || null
            
            wires[newWId] = wire
            engine.registerWire(newWId, wire)
            n1.parent.addOut = wire
            n2.parent.setIn = wire
        }
    }
    
    syncGlobals()
}


// ===== SIGNAL COLOR SETTINGS =====
const PRESET_COLORS = ['#ff4b4b', '#2ecc71', '#3498db', '#f1c40f', '#e67e22', '#9b59b6', '#ffffff', '#636e7a', '#000000'];

function generateColorSwatches(currentColor, onChangeStr) {
    let html = '<div style="display:flex;gap:6px;flex-wrap:wrap;padding-top:4px;">';
    for (let c of PRESET_COLORS) {
        let isSelected = c.toLowerCase() === currentColor.toLowerCase();
        let border = isSelected ? 'border: 2px solid #fff;' : 'border: 1px solid rgba(255,255,255,0.2);';
        let scale = isSelected ? 'transform: scale(1.15); box-shadow: 0 0 5px ' + c + ';' : '';
        html += `<div onclick="${onChangeStr.replace(/%COLOR%/g, c)}" style="width:20px;height:20px;border-radius:4px;background-color:${c};cursor:pointer;transition:all 0.1s;${border}${scale}"></div>`;
    }
    html += '</div>';
    return html;
}

function renderSignalColorPickers() {
    let container = document.getElementById('signal-color-pickers')
    if (!container) return
    let root = document.documentElement
    let high = getComputedStyle(root).getPropertyValue('--signal-high').trim() || '#ff4b4b'
    let low = getComputedStyle(root).getPropertyValue('--signal-low').trim() || '#636e7a'
    let float = getComputedStyle(root).getPropertyValue('--signal-float').trim() || '#2ecc71'
    let shortC = getComputedStyle(root).getPropertyValue('--signal-short').trim() || '#00ffff'

    container.innerHTML = `
        <div>
            <label style="font-size:10px;color:#636b7e;display:block;margin-bottom:2px">HIGH (1)</label>
            ${generateColorSwatches(high, "applySignalColor('high', '%COLOR%')")}
        </div>
        <div>
            <label style="font-size:10px;color:#636b7e;display:block;margin-bottom:2px">LOW (0)</label>
            ${generateColorSwatches(low, "applySignalColor('low', '%COLOR%')")}
        </div>
        <div>
            <label style="font-size:10px;color:#636b7e;display:block;margin-bottom:2px">FLOAT</label>
            ${generateColorSwatches(float, "applySignalColor('float', '%COLOR%')")}
        </div>
        <div>
            <label style="font-size:10px;color:#636b7e;display:block;margin-bottom:2px">SHORT</label>
            ${generateColorSwatches(shortC, "applySignalColor('short', '%COLOR%')")}
        </div>
    `
}

function applySignalColor(type, color) {
    let root = document.documentElement
    if (type === 'high') {
        root.style.setProperty('--signal-high', color)
    } else if (type === 'low') {
        root.style.setProperty('--signal-low', color)
    } else if (type === 'float') {
        root.style.setProperty('--signal-float', color)
    } else if (type === 'short') {
        root.style.setProperty('--signal-short', color)
    }
    renderSignalColorPickers()
}

function restoreDefaultColors() {
    applySignalColor('high', '#ff4b4b')
    applySignalColor('low', '#636e7a')
    applySignalColor('float', '#2ecc71')
    applySignalColor('short', '#00ffff')
}


// ===== COMPONENT SETTINGS MODAL =====
let compSettingsTarget = null  // id of the component being configured

function updateSettingsPanel() {
    let selectedComps = Object.keys(components).filter(id => components[id].selected)
    if (selectedComps.length === 1) {
        openCompSettings(selectedComps[0])
    } else {
        closeCompSettings()
    }
}

function openCompSettings(compId) {
    let comp = components[compId]
    if (!comp) return
    compSettingsTarget = compId
    let t = comp.getType || comp.type
    let overlay = document.getElementById('comp-settings-panel')
    let body = document.getElementById('comp-settings-body')

    let html = ''

    // For Label text content:
    if (t === 'label') {
        html += '<div class="modal-field">'
        html += '<label class="modal-label">Text Content</label>'
        html += '<input type="text" class="modal-input" style="width:100%" value="' + (comp.text || "" || '') + '" oninput="updateLabelText(\'' + compId + '\', this.value)">'
        html += '</div>'
    }

    // Position info (Editable by increments of 10 only)
    html += '<div class="modal-field">'
    html += '<label class="modal-label">Position (Grid)</label>'
    html += '<div style="display:flex;gap:16px">'
    
    html += '<div style="display:flex; align-items:center; gap:8px">'
    html += '<span style="font-size:12px;color:#636b7e;font-weight:600">X</span>'
    html += '<input type="number" step="10" class="modal-input" style="width:75px" value="' + Math.round(comp.x || 0) + '" onchange="moveCompTo(\'' + compId + '\',\'x\',+this.value)">'
    html += '</div>'

    html += '<div style="display:flex; align-items:center; gap:8px">'
    html += '<span style="font-size:12px;color:#636b7e;font-weight:600">Y</span>'
    html += '<input type="number" step="10" class="modal-input" style="width:75px" value="' + Math.round(comp.y || 0) + '" onchange="moveCompTo(\'' + compId + '\',\'y\',+this.value)">'
    html += '</div>'
    
    html += '</div></div>'

    // Rotation (90 degree angles only) - except 4-Junction
    if (t !== 'junc4') {
        let curRot = comp.rotation || 0
        html += '<div class="modal-field">'
        html += '<label class="modal-label">Rotation</label>'
        html += '<div style="display:flex;align-items:center;gap:8px;background:rgba(0,0,0,0.2);padding:6px;border-radius:6px;border:1px solid rgba(255,255,255,0.05);width:fit-content">'
        html += '<button class="tb-btn" style="border:1px solid rgba(255,255,255,0.2);padding:6px 12px;font-size:12px;background:rgba(255,255,255,0.1);color:#fff;border-radius:4px" onclick="rotateComponent(\'' + compId + '\',-90)">↺ 90°</button>'
        html += '<span id="comp-rot-display" style="font-family:\'JetBrains Mono\',monospace;font-size:14px;color:#e8eaed;width:48px;text-align:center;font-weight:600">' + curRot + '°</span>'
        html += '<button class="tb-btn" style="border:1px solid rgba(255,255,255,0.2);padding:6px 12px;font-size:12px;background:rgba(255,255,255,0.1);color:#fff;border-radius:4px" onclick="rotateComponent(\'' + compId + '\',90)">↻ 90°</button>'
        html += '</div></div>'
    }

    // Color (Light, 7seg)
    if (comp instanceof Light) {
        let currentColor = comp.lightColor || '#ff4b4b'
        html += '<div class="modal-field">'
        html += '<label class="modal-label">Color</label>'
        html += '<div id="swatches-led">' + generateColorSwatches(currentColor, "setLedColor('" + compId + "', '%COLOR%')") + '</div>'
        html += '</div>'
    } else if (comp instanceof Seg7) {
        let currentColor = comp.displayColor || '#ff4b4b'
        html += '<div class="modal-field">'
        html += '<label class="modal-label">Color</label>'
        html += '<div id="swatches-seg7">' + generateColorSwatches(currentColor, "setSeg7Color('" + compId + "', '%COLOR%')") + '</div>'
        html += '</div>'
    }

    // Footer Buttons (Delete & Close)
    html += '<div style="margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; display: flex; gap: 8px">'
    if (t !== 'junc3' && t !== 'junc4') {
        html += '<button class="tb-btn" style="flex:1; justify-content:center; background:rgba(255, 75, 75, 0.15); color:#ff4b4b; border:1px solid rgba(255, 75, 75, 0.3); padding:8px 0; border-radius:6px; font-size:13px; font-weight:600;" onclick="deleteComponentButton(\'' + compId + '\')">Delete</button>'
    }
    html += '<button class="tb-btn" style="flex:1; justify-content:center; background:rgba(255,255,255,0.05); color:#e8eaed; border:1px solid rgba(255,255,255,0.15); padding:8px 0; border-radius:6px; font-size:13px; font-weight:600;" onclick="closeCompSettings()">Close</button>'
    html += '</div>'

    body.innerHTML = html
    overlay.style.display = 'flex'
}

function updateLabelText(compId, text) {
    let comp = components[compId]
    if (comp) {
        comp.text = text
    }
}

function deleteComponentButton(compId) {
    let comp = components[compId]
    if (comp) {
        comp.selected = true
        let toDelete = Object.keys(components).filter(id => components[id].selected)
        for (let id of toDelete) deleteComponent(id)
        if (toDelete.length > 0) pushHistory()
        updateSettingsPanel()
    }
}

function closeCompSettings() {
    let panel = document.getElementById('comp-settings-panel')
    if (panel) panel.style.display = 'none'
    compSettingsTarget = null
}

function moveCompTo(compId, axis, value) {
    let comp = components[compId]
    if (!comp) return
    comp[axis] = value
}

function setLedColor(compId, color) {
    let comp = components[compId]
    if (!comp) return
    comp.lightColor = color
    // Apply custom color to the LED body when high
    comp._highColor = color
    let container = document.getElementById('swatches-led')
    if (container) container.innerHTML = generateColorSwatches(color, "setLedColor('" + compId + "', '%COLOR%')")
}

function setSeg7Color(compId, color) {
    let comp = components[compId]
    if (!comp) return
    comp.displayColor = color
    // Apply custom color to the 7seg display text
    ('.display')
    
    let container = document.getElementById('swatches-seg7')
    if (container) container.innerHTML = generateColorSwatches(color, "setSeg7Color('" + compId + "', '%COLOR%')")
}

function rotateComponent(compId, angle, reset) {
    let comp = components[compId]
    if (!comp) return
    if (reset) {
        comp.rotation = 0
    } else {
        comp.rotation = ((comp.rotation || 0) + angle) % 360
        if (comp.rotation < 0) comp.rotation += 360
    }
    let dom = {}
    // comp.rotation ? 'rotate(' + comp.rotation + 'deg)' : ''
    // 'center center'
    // Update the display in the settings modal if open
    let rotDisplay = document.getElementById('comp-rot-display')
    if (rotDisplay) rotDisplay.textContent = comp.rotation + '°'
    // Re-render wires connected to this component
    // removed rerenderWiresForComponent
    pushHistory()
}


// ===== RIGHT-CLICK / DOUBLE-TAP → COMPONENT SETTINGS =====
renderer.canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    let worldPos = renderer.screenToWorld(e.clientX, e.clientY)
    let hit = renderer.hitTest(worldPos.x, worldPos.y)
    if (hit && hit.type === 'component') {
        Object.values(components).forEach(c => c.deselect())
        hit.component.select()
        updateSettingsPanel()
    }
})


// ===== MOBILE DRAWER TOGGLE =====
let drawerOpen = false
let toggleDrawer = () => {
    let panel = document.getElementById('side-panel')
    let backdrop = document.getElementById('drawer-backdrop')
    let fab = document.getElementById('mobile-fab')
    drawerOpen = !drawerOpen
    if (drawerOpen) {
        panel.classList.add('open')
        backdrop.classList.add('open')
        fab.classList.add('open')
    } else {
        panel.classList.remove('open')
        backdrop.classList.remove('open')
        fab.classList.remove('open')
    }
}


renderSignalColorPickers();

window.mode = (m) => {
    navMode = m;
    let panBtn = document.querySelector('#pan-button');
    let editBtn = document.querySelector('#edit-button');
    if (m === 0) {
        if (panBtn) panBtn.classList.add('active');
        if (editBtn) editBtn.classList.remove('active');
        document.body.style.cursor = 'all-scroll';
    } else {
        if (panBtn) panBtn.classList.remove('active');
        if (editBtn) editBtn.classList.add('active');
        document.body.style.cursor = 'default';
    }
};

window.trash = () => {
    let changed = false;
    Object.values(components).forEach(c => {
        if (c.selected) { deleteComponent(c.id); changed = true; }
    });
    Object.values(wires).forEach(w => {
        if (w.selected) { deleteWire(w.id); changed = true; }
    });
    if (changed) pushHistory();
};

window.toggleSettings = () => {
    let panel = document.getElementById('settings-panel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' || panel.style.display === '' ? 'block' : 'none';
    }
};

window.help = () => {
    alert("NANDbox Simulator\n\n- Drag components from the left panel.\n- Use Edit mode to wire and move components.\n- Use Pan mode to interact with buttons and switches.\n- Double click a component to open its settings.");
};

window.openLibrary = () => {
    let panel = document.getElementById('side-panel');
    if (panel) panel.classList.add('open');
};

window.closeLibrary = () => {
    let panel = document.getElementById('side-panel');
    if (panel) panel.classList.remove('open');
};

window.recenterView = () => {
    renderer.setZoom(1.0, window.innerWidth / 2, window.innerHeight / 2);
    renderer.panX = 0;
    renderer.panY = 0;
};

// Export let-defined functions to window
window.undo = undo;
window.redo = redo;
window.copySelection = copySelection;
window.cutSelection = cutSelection;
window.pasteSelection = pasteSelection;
window.save = save;
window.load = load;
