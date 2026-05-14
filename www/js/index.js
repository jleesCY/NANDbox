/*
    Main JavaScript file for simulator
    Refactored: tick-based engine, all bug fixes applied
*/

// Init simulation engine
let engine = new SimulationEngine()
engine.start()

// Side panel logic removed as accordion is replaced with flat list.

// Component inner HTML
let HTML = {
    'and': '<div class="in-2"><div class="connector float" tabindex="1"></div><div class="connector float" tabindex="1"></div></div><div class="body and" tabindex="1"><img src="../images/gates/AND.svg" draggable="false"></div><div class="connector float" tabindex="1"></div>',
    'or': '<div class="in-2"><div class="connector float" tabindex="1"></div><div class="connector float" tabindex="1"></div></div><div class="body or" tabindex="1"><img src="../images/gates/OR.svg" draggable="false"></div><div class="connector float" tabindex="1"></div>',
    'not': '<div class="in-1"><div class="connector float" tabindex="1"></div></div><div class="body not" tabindex="1"><img src="../images/gates/NOT.svg" draggable="false"></div><div class="connector float" tabindex="1"></div>',
    'nand': '<div class="in-2"><div class="connector float" tabindex="1"></div><div class="connector float" tabindex="1"></div></div><div class="body nand" tabindex="1"><img src="../images/gates/NAND.svg" draggable="false"></div><div class="connector float" tabindex="1"></div>',
    'nor': '<div class="in-2"><div class="connector float" tabindex="1"></div><div class="connector float" tabindex="1"></div></div><div class="body nor" tabindex="1"><img src="../images/gates/NOR.svg" draggable="false"></div><div class="connector float" tabindex="1"></div>',
    'xor': '<div class="in-2"><div class="connector float" tabindex="1"></div><div class="connector float" tabindex="1"></div></div><div class="body xor" tabindex="1"><img src="../images/gates/XOR.svg" draggable="false"></div><div class="connector float" tabindex="1"></div>',
    'xnor': '<div class="in-2"><div class="connector float" tabindex="1"></div><div class="connector float" tabindex="1"></div></div><div class="body xnor" tabindex="1"><img src="../images/gates/XNOR.svg" draggable="false"></div><div class="connector float" tabindex="1"></div>',
    'button': '<div class="body button low" tabindex="1"></div><div class="connector off" tabindex="1"></div>',
    'switch': '<div class="body switch low" tabindex="1"><div class="top"></div><div class="bottom"></div></div><div class="connector off" tabindex="1"></div>',
    'gnd': '<div class="body const low" tabindex="1">0</div><div class="connector off" tabindex="1"></div>',
    'vcc': '<div class="body const high" tabindex="1">1</div><div class="connector on" tabindex="1"></div>',
    'clock': '<div class="body clock-body low" tabindex="1"><span class="clock-pulse">▼</span><span class="clock-label">CLK</span></div><div class="connector off" tabindex="1"></div>',
    'led': '<div class="body led float" tabindex="1"></div><div class="connector float" tabindex="1"></div>',
    'seg7': '<div class="in-4"><div class="connector float"></div><div class="connector float"></div><div class="connector float"></div><div class="connector float"></div></div><div class="display">0</div>',
    'label': 'NANDlabel',
    'jkff': '<div class="in-3"><div class="connector float" tabindex="1"></div><div class="connector float" tabindex="1"></div><div class="connector float" tabindex="1"></div></div><div class="body jk" tabindex="1"><img src="../images/flipflops/JKFF.svg" draggable="false"></div><div class="out-2"><div class="connector float" tabindex="1"></div><div class="connector float" tabindex="1"></div></div>',
    'tff': '<div class="in-2"><div class="connector float" tabindex="1"></div><div class="connector float" tabindex="1"></div></div><div class="body t" tabindex="1"><img src="../images/flipflops/TFF.svg" draggable="false"></div><div class="out-2"><div class="connector float" tabindex="1"></div><div class="connector float" tabindex="1"></div></div>',
    'dff': '<div class="in-2"><div class="connector float" tabindex="1"></div><div class="connector float" tabindex="1"></div></div><div class="body d" tabindex="1"><img src="../images/flipflops/DFF.svg" draggable="false"></div><div class="out-2"><div class="connector float" tabindex="1"></div><div class="connector float" tabindex="1"></div></div>',
    'srff': '<div class="in-3"><div class="connector float" tabindex="1"></div><div class="connector float" tabindex="1"></div><div class="connector float" tabindex="1"></div></div><div class="body sr" tabindex="1"><img src="../images/flipflops/SRFF.svg" draggable="false"></div><div class="out-2"><div class="connector float" tabindex="1"></div><div class="connector float" tabindex="1"></div></div>',
}

// Possible types of components
let connTypes = ['gate', 'input', 'light', 'flipflop']

// Mapping of individual component names to their types
let categories = {
    'and': connTypes[0], 'or': connTypes[0], 'not': connTypes[0],
    'nand': connTypes[0], 'nor': connTypes[0], 'xor': connTypes[0], 'xnor': connTypes[0],
    'button': connTypes[1], 'switch': connTypes[1], 'vcc': connTypes[1], 'gnd': connTypes[1],
    'clock': connTypes[1],
    'led': connTypes[2],
    'seg7': 'seg7',
    'label': 'label',
    'tff': connTypes[3], 'jkff': connTypes[3], 'dff': connTypes[3], 'srff': connTypes[3]
}

// Fix: use let for globals
let zoom = 0.065
let yoff = document.querySelector("#navbar").getBoundingClientRect().height
let elementId = 0
let connectorId = 0
let wireId = 0
let scale = 1
let components = {}
let connectors = {}
let wires = {}
let navMode = 1

let dropzone = document.querySelector("#dropwindow")
let pressedKeys = {}
let mousedown = false
let drawWire = false
let wireOrigin = null
let justBoxSelected = false  // prevents click from deselecting after box-select

let sim = document.querySelector("#simulation-window")
let instance = panzoom(sim, { smoothScroll: false, zoomSpeed: zoom, minZoom: 0.2, maxZoom: 3.0 })
instance.pause()

// Fix: explicit event parameter in all handlers
let panelDragstart = (event) => {
    let el = event.target
    // Determine component type
    let t = ''
    if (el.classList.contains('seg7')) {
        t = 'seg7'
    } else if (el.classList.contains('label')) {
        t = 'label'
    } else {
        t = el.id || el.parentElement.id
    }
    let rect = el.getBoundingClientRect()
    let mx = event.x - rect.left
    let my = event.y - rect.top
    event.dataTransfer.setData('text/plain', JSON.stringify({ from: 'panel', type: t, xoff: mx, yoff: my }))

    // Create a full-size ghost preview that matches the placed element
    let cat = categories[t]
    let ghost = document.createElement('div')
    ghost.className = cat === 'seg7' ? 'seg7' : (cat || t)
    ghost.innerHTML = HTML[t] || ''
    ghost.style.position = 'absolute'
    ghost.style.left = '-9999px'
    ghost.style.top = '-9999px'
    ghost.style.opacity = '0.8'
    ghost.style.pointerEvents = 'none'
    document.body.appendChild(ghost)

    // Measure the ghost to center the drag offset
    let gRect = ghost.getBoundingClientRect()
    let offsetX = Math.min(mx * (gRect.width / rect.width), gRect.width)
    let offsetY = Math.min(my * (gRect.height / rect.height), gRect.height)
    event.dataTransfer.setDragImage(ghost, offsetX, offsetY)

    // Clean up the ghost after drag starts (browser captures it as image)
    requestAnimationFrame(() => {
        setTimeout(() => ghost.remove(), 0)
    })
}

let updateMode = () => {
    let panBtn = document.querySelector('#pan-button')
    let editBtn = document.querySelector('#edit-button')

    if (navMode == 0) {
        panBtn.classList.add('active')
        editBtn.classList.remove('active')
        instance.resume()
        document.body.style.cursor = 'all-scroll'
        for (let id of Object.keys(components)) {
            components[id].disableSelect()
            let cat = categories[components[id].getType || components[id].type]
            if (cat == 'input') components[id].disablePress()
            else if (cat == 'label') components[id].disableEdit()
        }
        for (let id of Object.keys(connectors)) connectors[id].disableSelect()
        for (let elem of document.querySelectorAll(".draggable")) {
            elem.removeEventListener('dragstart', panelDragstart)
            elem.setAttribute('draggable', 'false')
        }
    } else {
        panBtn.classList.remove('active')
        editBtn.classList.add('active')
        instance.pause()
        document.body.style.cursor = 'default'
        for (let id of Object.keys(components)) {
            components[id].enableSelect()
            let cat = categories[components[id].getType || components[id].type]
            if (cat == 'input') components[id].enablePress()
            else if (cat == 'label') components[id].enableEdit()
        }
        for (let id of Object.keys(connectors)) connectors[id].enableSelect()
        for (let elem of document.querySelectorAll(".draggable")) {
            elem.addEventListener('dragstart', panelDragstart)
            elem.setAttribute('draggable', 'true')
        }
    }
}

let undo = () => { }
let redo = () => { }
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
        let cat = categories[comp.getType || comp.type]
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
        // Gate-specific: input/output delays
        if (comp instanceof Gate) {
            entry.inputDelay = comp.inputDelay || 0
            entry.outputDelay = comp.outputDelay || 0
        }
        // Clock-specific: period and running state
        if (comp instanceof Clock) {
            entry.period = comp.period
            entry.running = comp.running
        }
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
            entry.text = comp.dom.innerText
        }
        // Store connector IDs
        entry.connectorIds = {}
        if (comp.n1 && comp.n1.dom) entry.connectorIds.n1 = comp.n1.dom.id
        if (comp.n2 && comp.n2 !== comp.n1 && comp.n2.dom) entry.connectorIds.n2 = comp.n2.dom.id
        if (comp.nOut && comp.nOut.dom) entry.connectorIds.nOut = comp.nOut.dom.id
        if (comp.nQ && comp.nQ.dom) entry.connectorIds.nQ = comp.nQ.dom.id
        if (comp.nQNot && comp.nQNot.dom) entry.connectorIds.nQNot = comp.nQNot.dom.id
        if (comp.nC && comp.nC.dom) entry.connectorIds.nC = comp.nC.dom.id
        // 7seg pins
        if (entry.type === 'seg7') {
            entry.connectorIds.n1 = comp.n1 ? comp.n1.dom.id : null
            entry.connectorIds.n2 = comp.n2 ? comp.n2.dom.id : null
            entry.connectorIds.n3 = comp.n3 ? comp.n3.dom.id : null
            entry.connectorIds.n4 = comp.n4 ? comp.n4.dom.id : null
        }
        compArr.push(entry)
    }
    let wireArr = []
    for (let id of Object.keys(wires)) {
        let w = wires[id]
        wireArr.push({
            id: id,
            src: w.n1 ? w.n1.dom.id : null,
            dst: w.n2 ? w.n2.dom.id : null
        })
    }
    return { version: '0.2.0', components: compArr, wires: wireArr }
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
        // Clear current circuit
        for (let id of Object.keys(components)) engine.unregisterComponent(id)
        for (let id of Object.keys(wires)) engine.unregisterWire(id)
        for (let id of Object.keys(connectors)) engine.unregisterConnector(id)
        components = {}; connectors = {}; wires = {}
        elementId = 0; connectorId = 0; wireId = 0
        sim.innerHTML = ''
    }

    // Map old IDs to new IDs
    let compIdMap = {}
    let connIdMap = {}
    let offsetX = append ? 50 : 0
    let offsetY = append ? 50 : 0

    for (let entry of data.components) {
        let newElemId = elementId
        compIdMap[entry.id] = newElemId
        let t = entry.type
        let cat = categories[t] || (t === 'seg7' ? 'seg7' : t === 'label' ? 'label' : null)
        let lx = (entry.x || 0) + offsetX
        let ly = (entry.y || 0) + offsetY
        let component = document.createElement('div')
        component.classList.add(cat === 'seg7' ? 'seg7' : (cat || t))
        component.setAttribute('style', 'top:' + ly + 'px;left:' + lx + 'px;')
        component.id = newElemId
        component.innerHTML = HTML[t]

        if (cat === 'gate') {
            components[newElemId] = new Gate(t, lx, ly, component)
            components[newElemId].enableSelect()
            if (entry.inputDelay) components[newElemId].inputDelay = entry.inputDelay
            if (entry.outputDelay) components[newElemId].outputDelay = entry.outputDelay
            components[newElemId].setN1 = new Connector('in', 'n1', component.children[0].children[0], components[newElemId])
            components[newElemId].getN1.getDom.id = 'c' + connectorId
            connIdMap[entry.connectorIds.n1] = 'c' + connectorId
            connectors['c' + connectorId] = components[newElemId].getN1
            connectors['c' + connectorId].enableSelect()
            connectorId++
            if (t !== 'not') {
                components[newElemId].setN2 = new Connector('in', 'n2', component.children[0].children[1], components[newElemId])
                components[newElemId].getN2.getDom.id = 'c' + connectorId
                connIdMap[entry.connectorIds.n2] = 'c' + connectorId
                connectors['c' + connectorId] = components[newElemId].getN2
                connectors['c' + connectorId].enableSelect()
                connectorId++
            } else {
                components[newElemId].setN2 = components[newElemId].getN1
            }
            components[newElemId].setNOut = new Connector('out', 'nOut', component.children[2], components[newElemId])
            components[newElemId].getNOut.getDom.id = 'c' + connectorId
            connIdMap[entry.connectorIds.nOut] = 'c' + connectorId
            connectors['c' + connectorId] = components[newElemId].getNOut
            connectors['c' + connectorId].enableSelect()
            connectorId++
            engine.registerComponent(newElemId, components[newElemId])
        } else if (cat === 'input') {
            if (t === 'clock') {
                components[newElemId] = new Clock(lx, ly, component)
                if (entry.period) components[newElemId].period = entry.period
            } else {
                components[newElemId] = new Input(t, lx, ly, component)
            }
            components[newElemId].enableSelect()
            components[newElemId].enablePress()
            components[newElemId].setN = new Connector('out', 'nOut', component.children[1], components[newElemId])
            components[newElemId].getN.getDom.id = 'c' + connectorId
            connIdMap[entry.connectorIds.nOut || entry.connectorIds.n1] = 'c' + connectorId
            connectors['c' + connectorId] = components[newElemId].getN
            connectors['c' + connectorId].enableSelect()
            connectorId++
            engine.registerComponent(newElemId, components[newElemId])
        } else if (cat === 'light') {
            components[newElemId] = new Light(lx, ly, component)
            if (entry.lightColor) components[newElemId].lightColor = entry.lightColor
            components[newElemId].enableSelect()
            components[newElemId].setN = new Connector('in', 'n1', component.children[1], components[newElemId])
            components[newElemId].getN.getDom.id = 'c' + connectorId
            connIdMap[entry.connectorIds.n1 || entry.connectorIds.nOut] = 'c' + connectorId
            connectors['c' + connectorId] = components[newElemId].getN
            connectors['c' + connectorId].enableSelect()
            connectorId++
            engine.registerComponent(newElemId, components[newElemId])
        } else if (t === 'label') {
            if (entry.text) component.innerText = entry.text
            components[newElemId] = new Label(lx, ly, component)
            components[newElemId].enableSelect()
            components[newElemId].enableEdit()
        } else if (t === 'seg7') {
            components[newElemId] = new Seg7(lx, ly, component)
            if (entry.displayColor) {
                components[newElemId].displayColor = entry.displayColor
                let display = component.querySelector('.display')
                if (display) display.style.color = entry.displayColor
            }
            components[newElemId].enableSelect()
            let pins = ['n1', 'n2', 'n3', 'n4']
            for (let i = 0; i < 4; i++) {
                components[newElemId][pins[i]] = new Connector('in', pins[i], component.children[0].children[i], components[newElemId])
                components[newElemId][pins[i]].dom.id = 'c' + connectorId
                connIdMap[entry.connectorIds[pins[i]]] = 'c' + connectorId
                connectors['c' + connectorId] = components[newElemId][pins[i]]
                connectors['c' + connectorId].enableSelect()
                connectorId++
            }
            engine.registerComponent(newElemId, components[newElemId])
        } else if (cat === 'flipflop') {
            components[newElemId] = new FlipFlop(t, lx, ly, component)
            components[newElemId].enableSelect()
            if (t === 'jkff') {
                components[newElemId].n1 = new Connector('in', 'n1', component.children[0].children[0], components[newElemId]) // J
                components[newElemId].n1.dom.id = 'c' + connectorId
                connIdMap[entry.connectorIds.n1] = 'c' + connectorId
                connectors['c' + connectorId] = components[newElemId].n1
                connectors['c' + connectorId].enableSelect()
                connectorId++
                components[newElemId].nC = new Connector('in', 'n3', component.children[0].children[1], components[newElemId]) // CLK
                components[newElemId].nC.dom.id = 'c' + connectorId
                connIdMap[entry.connectorIds.nC] = 'c' + connectorId
                connectors['c' + connectorId] = components[newElemId].nC
                connectors['c' + connectorId].enableSelect()
                connectorId++
                components[newElemId].n2 = new Connector('in', 'n2', component.children[0].children[2], components[newElemId]) // K
                components[newElemId].n2.dom.id = 'c' + connectorId
                connIdMap[entry.connectorIds.n2] = 'c' + connectorId
                connectors['c' + connectorId] = components[newElemId].n2
                connectors['c' + connectorId].enableSelect()
                connectorId++
            } else if (t === 'srff') {
                components[newElemId].n1 = new Connector('in', 'n1', component.children[0].children[0], components[newElemId]) // S
                components[newElemId].n1.dom.id = 'c' + connectorId
                connIdMap[entry.connectorIds.n1] = 'c' + connectorId
                connectors['c' + connectorId] = components[newElemId].n1
                connectors['c' + connectorId].enableSelect()
                connectorId++
                components[newElemId].nC = new Connector('in', 'n3', component.children[0].children[1], components[newElemId]) // CLK
                components[newElemId].nC.dom.id = 'c' + connectorId
                connIdMap[entry.connectorIds.nC] = 'c' + connectorId
                connectors['c' + connectorId] = components[newElemId].nC
                connectors['c' + connectorId].enableSelect()
                connectorId++
                components[newElemId].n2 = new Connector('in', 'n2', component.children[0].children[2], components[newElemId]) // R
                components[newElemId].n2.dom.id = 'c' + connectorId
                connIdMap[entry.connectorIds.n2] = 'c' + connectorId
                connectors['c' + connectorId] = components[newElemId].n2
                connectors['c' + connectorId].enableSelect()
                connectorId++
            } else if (t === 'tff') {
                components[newElemId].n1 = new Connector('in', 'n1', component.children[0].children[0], components[newElemId]) // T
                components[newElemId].n1.dom.id = 'c' + connectorId
                connIdMap[entry.connectorIds.n1] = 'c' + connectorId
                connectors['c' + connectorId] = components[newElemId].n1
                connectors['c' + connectorId].enableSelect()
                connectorId++
                components[newElemId].n2 = components[newElemId].n1 // T and K are tied
                components[newElemId].nC = new Connector('in', 'n3', component.children[0].children[1], components[newElemId]) // CLK
                components[newElemId].nC.dom.id = 'c' + connectorId
                connIdMap[entry.connectorIds.nC] = 'c' + connectorId
                connectors['c' + connectorId] = components[newElemId].nC
                connectors['c' + connectorId].enableSelect()
                connectorId++
            } else if (t === 'dff') {
                components[newElemId].n1 = new Connector('in', 'n1', component.children[0].children[0], components[newElemId]) // D
                components[newElemId].n1.dom.id = 'c' + connectorId
                connIdMap[entry.connectorIds.n1] = 'c' + connectorId
                connectors['c' + connectorId] = components[newElemId].n1
                connectors['c' + connectorId].enableSelect()
                connectorId++
                components[newElemId].n2 = components[newElemId].n1 // No n2 for DFF, or tie it, wait flipflop.js doesn't use in2 for DFF
                components[newElemId].nC = new Connector('in', 'n3', component.children[0].children[1], components[newElemId]) // CLK
                components[newElemId].nC.dom.id = 'c' + connectorId
                connIdMap[entry.connectorIds.nC] = 'c' + connectorId
                connectors['c' + connectorId] = components[newElemId].nC
                connectors['c' + connectorId].enableSelect()
                connectorId++
            }
            components[newElemId].nQ = new Connector('out', 'nQ', component.children[2].children[0], components[newElemId])
            components[newElemId].nQ.dom.id = 'c' + connectorId
            connIdMap[entry.connectorIds.nQ] = 'c' + connectorId
            connectors['c' + connectorId] = components[newElemId].nQ
            connectors['c' + connectorId].enableSelect()
            connectorId++
            components[newElemId].nQNot = new Connector('out', 'nQNot', component.children[2].children[1], components[newElemId])
            components[newElemId].nQNot.dom.id = 'c' + connectorId
            connIdMap[entry.connectorIds.nQNot] = 'c' + connectorId
            connectors['c' + connectorId] = components[newElemId].nQNot
            connectors['c' + connectorId].enableSelect()
            connectorId++
            engine.registerComponent(newElemId, components[newElemId])
        }

        // Apply rotation if stored
        if (entry.rotation) {
            components[newElemId].rotation = entry.rotation
            component.style.transform = 'rotate(' + entry.rotation + 'deg)'
            component.style.transformOrigin = 'center center'
        }
        enableComponentDrag(component, newElemId)
        sim.appendChild(component)
        elementId++
    }

    // Rebuild wires
    for (let wEntry of data.wires) {
        let srcId = connIdMap[wEntry.src]
        let dstId = connIdMap[wEntry.dst]
        if (!srcId || !dstId || !connectors[srcId] || !connectors[dstId]) continue
        let s = connectors[srcId]
        let e = connectors[dstId]
        let wId = 'w' + wireId
        wires[wId] = new Wire(wId, s, e, e.parent)
        let sComp = components[s.parent.dom.id]
        if (sComp) sComp.addOut = wires[wId]
        components[e.parent.dom.id]['i' + e.loc] = wires[wId]
        wires[wId].render(scale)
        sim.appendChild(wires[wId].dom)
        engine.registerWire(wId, wires[wId])
        wireId++
    }
    updateMode()
}

// ===== LIBRARY =====
let openLibrary = () => {
    document.getElementById('library-overlay').style.display = 'flex'
}
let closeLibrary = () => {
    document.getElementById('library-overlay').style.display = 'none'
}
function loadLibraryCircuit(filename) {
    fetch('../library/' + filename)
        .then(r => r.json())
        .then(circuitData => {
            let merge = Object.keys(components).length > 0
            if (merge && !confirm('Append this circuit to the current canvas?')) {
                if (!confirm('Replace current circuit?')) return
                merge = false
            }
            loadCircuit(circuitData, merge)
            closeLibrary()
        })
        .catch(e => console.error('Failed to load circuit:', e))
}

let trash = () => {
    if (confirm("Are you sure you want to delete this circuit?")) {
        // Unregister from engine
        for (let id of Object.keys(components)) engine.unregisterComponent(id)
        for (let id of Object.keys(wires)) engine.unregisterWire(id)
        for (let id of Object.keys(connectors)) engine.unregisterConnector(id)
        components = {}; connectors = {}; wires = {}
        elementId = 0; connectorId = 0; wireId = 0
        refresh()
    }
}

let image = () => { }
let help = () => { window.open('../help', '_blank') }

// Helper: remove a wire and clean up references
function removeWire(wire) {
    if (!wire) return
    // Remove from source's output list
    let srcComp = components[wire.n1.parent.dom.id]
    if (srcComp) {
        let cat = categories[srcComp.getType || srcComp.type]
        if (cat === 'flipflop') {
            // Check both qOut and qNotOut
            let qi = srcComp.qOut ? srcComp.qOut.indexOf(wire) : -1
            if (qi >= 0) srcComp.qOut.splice(qi, 1)
            let qni = srcComp.qNotOut ? srcComp.qNotOut.indexOf(wire) : -1
            if (qni >= 0) srcComp.qNotOut.splice(qni, 1)
        } else if (srcComp.out) {
            let idx = srcComp.out.indexOf(wire)
            if (idx >= 0) srcComp.out.splice(idx, 1)
        }
    }
    // Clear destination's input reference
    let dstComp = components[wire.n2.parent.dom.id]
    if (dstComp) {
        // Find which input slot this wire is in
        for (let key of ['in1', 'in2', 'in3', 'in4']) {
            if (dstComp[key] === wire) dstComp[key] = null
        }
    }
    wire.delete()
    engine.unregisterWire(wire.id)
    delete wires[wire.id]
}

// Helper: delete a component and all its wires
function deleteComponent(id) {
    let comp = components[id]
    if (!comp) return
    let cat = categories[comp.getType || comp.type]

    // Collect all wires connected to this component
    let wiresToRemove = []

    // Output wires
    if (cat === 'flipflop') {
        if (comp.qOut) wiresToRemove.push(...comp.qOut)
        if (comp.qNotOut) wiresToRemove.push(...comp.qNotOut)
    } else if (comp.out) {
        wiresToRemove.push(...comp.out)
    }

    // Input wires
    for (let key of ['in1', 'in2', 'in3', 'in4']) {
        if (comp[key] && comp[key] instanceof Wire) {
            wiresToRemove.push(comp[key])
        }
    }

    // Remove all collected wires
    for (let wire of wiresToRemove) {
        removeWire(wire)
    }

    // Clean up connector entries
    let connectorProps = ['n1', 'n2', 'nOut', 'nC', 'nQ', 'nQNot']
    for (let prop of connectorProps) {
        if (comp[prop] && comp[prop].dom && comp[prop].dom.id) {
            delete connectors[comp[prop].dom.id]
        }
    }

    // Remove component
    comp.delete()
    engine.unregisterComponent(id)
    delete components[id]
}

$(function () {
    window.onbeforeunload = function () { return "" }

    // Fix: explicit event parameter
    document.body.addEventListener('keyup', (event) => {
        // Ignore if user is typing in an input field
        if (event.target.tagName.toLowerCase() === 'input' || event.target.tagName.toLowerCase() === 'textarea') return;

        if (event.key === "Delete" || event.key === "Backspace") {
            let toDelete = []
            for (let id of Object.keys(components)) {
                if (components[id].selected) toDelete.push(id)
            }
            for (let id of toDelete) deleteComponent(id)
            updateSettingsPanel()
        }
    })

    window.onkeyup = function (e) { pressedKeys[e.keyCode] = false }
    window.onkeydown = function (e) {
        pressedKeys[e.keyCode] = true
        // Ctrl+S → export
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault()
            save()
        }
    }
    updateMode()
})

let refresh = () => {
    sim.innerHTML = ""
    for (let id of Object.keys(components)) sim.appendChild(components[id].getDom || components[id].dom)
    for (let id of Object.keys(wires)) {
        if (wires[id].dom) sim.appendChild(wires[id].dom)
    }
}

let compSettingsPanel = document.getElementById('comp-settings-panel');
if (compSettingsPanel) {
    compSettingsPanel.addEventListener('pointerdown', (e) => e.stopPropagation());
    compSettingsPanel.addEventListener('pointerup', (e) => e.stopPropagation());
    compSettingsPanel.addEventListener('touchstart', (e) => e.stopPropagation());
    compSettingsPanel.addEventListener('touchend', (e) => e.stopPropagation());
    compSettingsPanel.addEventListener('mousedown', (e) => e.stopPropagation());
    compSettingsPanel.addEventListener('mouseup', (e) => e.stopPropagation());
    compSettingsPanel.addEventListener('click', (e) => e.stopPropagation());
    compSettingsPanel.addEventListener('dblclick', (e) => e.stopPropagation());
}

document.querySelector("#side-panel").addEventListener('pointerdown', () => { instance.pause() })

// Fix: explicit event parameter
document.addEventListener('click', (event) => {
    if (navMode == 0) instance.resume()

    // Skip deselection if we just finished a box-select
    if (justBoxSelected) { justBoxSelected = false; return }

    if (!pressedKeys[17] && event.y > document.querySelector("#navbar").getBoundingClientRect().height) {
        for (let id of Object.keys(components)) {
            let comp = components[id]
            let compDom = comp.getDom || comp.dom
            if (event.target != compDom) {
                comp.deselect()
                let cat = categories[comp.getType || comp.type]
                if (!event.target.classList.value.includes('connector')) {
                    if (cat === 'gate') {
                        if (comp.n1) comp.n1.deselect()
                        if (comp.n2) comp.n2.deselect()
                        if (comp.nOut) comp.nOut.deselect()
                    } else if (cat === 'input' || cat === 'light') {
                        let n = comp.getN || comp.nOut || comp.n1
                        if (n) n.deselect()
                    } else if (cat === 'flipflop') {
                        if (comp.n1) comp.n1.deselect()
                        if (comp.n2 && comp.n2 !== comp.n1) comp.n2.deselect()
                        if (comp.nC) comp.nC.deselect()
                        if (comp.nQ) comp.nQ.deselect()
                        if (comp.nQNot) comp.nQNot.deselect()
                    } else if (comp.type === '7seg') {
                        if (comp.n1) comp.n1.deselect()
                        if (comp.n2) comp.n2.deselect()
                        if (comp.n3) comp.n3.deselect()
                        if (comp.n4) comp.n4.deselect()
                    }
                }
            }
        }
    }

    if (!event.target.classList.value.includes('connector') && navMode == 1) {
        drawWire = false; wireOrigin = null
    }
    else if (event.target.classList.value.includes('connector') && navMode == 1) {
        if (drawWire) {
            let s = null, e = null
            if (connectors[event.target.id].type == 'in') {
                s = connectors[wireOrigin.id]; e = connectors[event.target.id]
            } else {
                s = connectors[event.target.id]; e = connectors[wireOrigin.id]
            }
            if (s != e && s.parent != e.parent && s.type != e.type && e.parent['i' + e.loc] == null) {
                wires['w' + wireId] = new Wire('w' + wireId, s, e, e.parent)
                let sComp = components[s.parent.dom.id]
                sComp.addOut = wires['w' + wireId]
                components[e.parent.dom.id]['i' + e.loc] = wires['w' + wireId]
                wires['w' + wireId].render(scale)
                sim.appendChild(wires['w' + wireId].dom)
                engine.registerWire('w' + wireId, wires['w' + wireId])
                wireId += 1
                wireOrigin = null; drawWire = false
                s.deselect(); e.deselect()
            } else {
                s.deselect(); e.select(); wireOrigin = event.target
            }
        } else {
            drawWire = true; wireOrigin = event.target
        }
        for (let id of Object.keys(components)) components[id].deselect()
    }
    updateSettingsPanel()
})

// Fix: explicit event parameter
dropzone.addEventListener('dragover', (event) => { event.preventDefault() })

dropzone.addEventListener('drop', (event) => {
    event.preventDefault()
    // Recalculate navbar offset dynamically
    yoff = document.querySelector("#navbar").getBoundingClientRect().height
    let rawData = ''
    try { rawData = event.dataTransfer.getData("text/plain") } catch (e) { }
    if (!rawData) try { rawData = event.dataTransfer.getData("text") } catch (e) { }
    if (!rawData) return
    let dropData = JSON.parse(rawData)
    // Normalize: use clientX/clientY (works for both real and synthetic events)
    let ex = event.clientX || event.x || 0
    let ey = event.clientY || event.y || 0

    if (dropData['from'] == 'panel') {
        let cat = categories[dropData['type']]

        if (cat == 'gate') {
            let loc_x = ((ex - sim.getBoundingClientRect().x) / scale) - dropData['xoff'] - 20
            let loc_y = (((ey - yoff) - (sim.getBoundingClientRect().y - yoff)) / scale) - dropData['yoff']
            if (snapToGrid) { loc_x = Math.round(loc_x / 20) * 20; loc_y = Math.round(loc_y / 20) * 20; }
            let component = document.createElement('div')
            component.classList.add(cat)
            component.setAttribute('style', 'top:' + loc_y + 'px;left:' + loc_x + 'px;')
            component.id = elementId
            component.innerHTML = HTML[dropData['type']]
            components[elementId] = new Gate(dropData['type'], loc_x, loc_y, component)
            components[elementId].enableSelect()
            components[elementId].setN1 = new Connector('in', 'n1', component.children[0].children[0], components[elementId])
            components[elementId].getN1.getDom.id = 'c' + connectorId
            connectors['c' + connectorId] = components[elementId].getN1
            connectorId++
            components[elementId].getN1.enableSelect()
            if (dropData["type"] != 'not') {
                components[elementId].setN2 = new Connector('in', 'n2', component.children[0].children[1], components[elementId])
                components[elementId].getN2.getDom.id = 'c' + connectorId
                connectors['c' + connectorId] = components[elementId].getN2
                connectorId++
                components[elementId].getN2.enableSelect()
            } else {
                components[elementId].setN2 = components[elementId].getN1
            }
            components[elementId].setNOut = new Connector('out', 'nOut', component.children[2], components[elementId])
            components[elementId].getNOut.getDom.id = 'c' + connectorId
            connectors['c' + connectorId] = components[elementId].getNOut
            connectorId++
            components[elementId].getNOut.enableSelect()
            engine.registerComponent(elementId, components[elementId])
            enableComponentDrag(component, elementId)
            sim.appendChild(component)
            elementId++
        }
        else if (cat == 'input') {
            let loc_x = ((ex - sim.getBoundingClientRect().x) / scale) - dropData['xoff']
            let loc_y = (((ey - yoff) - (sim.getBoundingClientRect().y - yoff)) / scale) - dropData['yoff']
            if (snapToGrid) { loc_x = Math.round(loc_x / 20) * 20; loc_y = Math.round(loc_y / 20) * 20; }
            let component = document.createElement('div')
            component.classList.add(cat)
            component.setAttribute('style', 'top:' + loc_y + 'px;left:' + loc_x + 'px;')
            component.id = elementId
            component.innerHTML = HTML[dropData['type']]

            if (dropData['type'] === 'clock') {
                components[elementId] = new Clock(loc_x, loc_y, component)
            } else {
                components[elementId] = new Input(dropData['type'], loc_x, loc_y, component)
            }
            components[elementId].enableSelect()
            components[elementId].enablePress()
            components[elementId].setN = new Connector('out', 'nOut', component.children[1], components[elementId])
            components[elementId].getN.getDom.id = 'c' + connectorId
            connectors['c' + connectorId] = components[elementId].getN
            connectorId++
            components[elementId].getN.enableSelect()
            engine.registerComponent(elementId, components[elementId])
            enableComponentDrag(component, elementId)
            sim.appendChild(component)
            elementId++
        }
        else if (cat == 'light') {
            let loc_x = ((ex - sim.getBoundingClientRect().x) / scale) - dropData['xoff']
            let loc_y = (((ey - yoff) - (sim.getBoundingClientRect().y - yoff)) / scale) - dropData['yoff']
            if (snapToGrid) { loc_x = Math.round(loc_x / 20) * 20; loc_y = Math.round(loc_y / 20) * 20; }
            let component = document.createElement('div')
            component.classList.add(cat)
            component.setAttribute('style', 'top:' + loc_y + 'px;left:' + loc_x + 'px;')
            component.id = elementId
            component.innerHTML = HTML[dropData['type']]
            components[elementId] = new Light(loc_x, loc_y, component)
            components[elementId].enableSelect()
            components[elementId].setN = new Connector('in', 'n1', component.children[1], components[elementId])
            components[elementId].getN.getDom.id = 'c' + connectorId
            connectors['c' + connectorId] = components[elementId].getN
            connectorId++
            components[elementId].getN.enableSelect()
            engine.registerComponent(elementId, components[elementId])
            enableComponentDrag(component, elementId)
            sim.appendChild(component)
            elementId++
        }
        else if (dropData['type'] == 'label') {
            let loc_x = ((ex - sim.getBoundingClientRect().x) / scale) - dropData['xoff']
            let loc_y = (((ey - yoff) - (sim.getBoundingClientRect().y - yoff)) / scale) - dropData['yoff']
            if (snapToGrid) { loc_x = Math.round(loc_x / 20) * 20; loc_y = Math.round(loc_y / 20) * 20; }
            let component = document.createElement('div')
            component.classList.add(categories[dropData['type']])
            component.setAttribute('style', 'top:' + loc_y + 'px;left:' + loc_x + 'px;')
            component.id = elementId
            component.innerHTML = HTML[dropData['type']]
            components[elementId] = new Label(loc_x, loc_y, component)
            components[elementId].enableSelect()
            components[elementId].enableEdit()
            enableComponentDrag(component, elementId)
            sim.appendChild(component)
            elementId++
        }
        else if (dropData['type'] == 'seg7') {
            let loc_x = ((ex - sim.getBoundingClientRect().x) / scale) - dropData['xoff'] - 20
            let loc_y = (((ey - yoff) - (sim.getBoundingClientRect().y - yoff)) / scale) - dropData['yoff']
            if (snapToGrid) { loc_x = Math.round(loc_x / 20) * 20; loc_y = Math.round(loc_y / 20) * 20; }
            let component = document.createElement('div')
            component.classList.add(dropData['type'])
            component.setAttribute('style', 'top:' + loc_y + 'px;left:' + loc_x + 'px;')
            component.id = elementId
            component.innerHTML = HTML[dropData['type']]
            components[elementId] = new Seg7(loc_x, loc_y, component)
            components[elementId].enableSelect()
            let pins = ['n1', 'n2', 'n3', 'n4']
            for (let i = 0; i < 4; i++) {
                components[elementId][pins[i]] = new Connector('in', pins[i], component.children[0].children[i], components[elementId])
                components[elementId][pins[i]].dom.id = 'c' + connectorId
                connectors['c' + connectorId] = components[elementId][pins[i]]
                connectors['c' + connectorId].enableSelect()
                connectorId++
            }
            engine.registerComponent(elementId, components[elementId])
            enableComponentDrag(component, elementId)
            sim.appendChild(component)
            elementId++
        }
        else if (cat == 'flipflop') {
            let loc_x = ((ex - sim.getBoundingClientRect().x) / scale) - dropData['xoff'] - 20
            let loc_y = (((ey - yoff) - (sim.getBoundingClientRect().y - yoff)) / scale) - dropData['yoff']
            if (snapToGrid) { loc_x = Math.round(loc_x / 20) * 20; loc_y = Math.round(loc_y / 20) * 20; }
            let component = document.createElement('div')
            component.classList.add(cat)
            component.setAttribute('style', 'top:' + loc_y + 'px;left:' + loc_x + 'px;')
            component.id = elementId
            component.innerHTML = HTML[dropData['type']]
            components[elementId] = new FlipFlop(dropData['type'], loc_x, loc_y, component)
            components[elementId].enableSelect()

            if (dropData['type'] === 'jkff') {
                // J input
                components[elementId].n1 = new Connector('in', 'n1', component.children[0].children[0], components[elementId])
                components[elementId].n1.dom.id = 'c' + connectorId
                connectors['c' + connectorId] = components[elementId].n1
                connectors['c' + connectorId].enableSelect()
                connectorId++
                // Clock input
                components[elementId].nC = new Connector('in', 'n3', component.children[0].children[1], components[elementId])
                components[elementId].nC.dom.id = 'c' + connectorId
                connectors['c' + connectorId] = components[elementId].nC
                connectors['c' + connectorId].enableSelect()
                connectorId++
                // K input
                components[elementId].n2 = new Connector('in', 'n2', component.children[0].children[2], components[elementId])
                components[elementId].n2.dom.id = 'c' + connectorId
                connectors['c' + connectorId] = components[elementId].n2
                connectors['c' + connectorId].enableSelect()
                connectorId++
            } else if (dropData['type'] === 'srff') {
                // S input
                components[elementId].n1 = new Connector('in', 'n1', component.children[0].children[0], components[elementId])
                components[elementId].n1.dom.id = 'c' + connectorId
                connectors['c' + connectorId] = components[elementId].n1
                connectors['c' + connectorId].enableSelect()
                connectorId++
                // Clock input
                components[elementId].nC = new Connector('in', 'n3', component.children[0].children[1], components[elementId])
                components[elementId].nC.dom.id = 'c' + connectorId
                connectors['c' + connectorId] = components[elementId].nC
                connectors['c' + connectorId].enableSelect()
                connectorId++
                // R input
                components[elementId].n2 = new Connector('in', 'n2', component.children[0].children[2], components[elementId])
                components[elementId].n2.dom.id = 'c' + connectorId
                connectors['c' + connectorId] = components[elementId].n2
                connectors['c' + connectorId].enableSelect()
                connectorId++
            } else if (dropData['type'] === 'tff') {
                // T input
                components[elementId].n1 = new Connector('in', 'n1', component.children[0].children[0], components[elementId])
                components[elementId].n1.dom.id = 'c' + connectorId
                connectors['c' + connectorId] = components[elementId].n1
                connectors['c' + connectorId].enableSelect()
                connectorId++
                components[elementId].n2 = components[elementId].n1
                // Clock input
                components[elementId].nC = new Connector('in', 'n3', component.children[0].children[1], components[elementId])
                components[elementId].nC.dom.id = 'c' + connectorId
                connectors['c' + connectorId] = components[elementId].nC
                connectors['c' + connectorId].enableSelect()
                connectorId++
            } else if (dropData['type'] === 'dff') {
                // D input
                components[elementId].n1 = new Connector('in', 'n1', component.children[0].children[0], components[elementId])
                components[elementId].n1.dom.id = 'c' + connectorId
                connectors['c' + connectorId] = components[elementId].n1
                connectors['c' + connectorId].enableSelect()
                connectorId++
                components[elementId].n2 = components[elementId].n1
                // Clock input
                components[elementId].nC = new Connector('in', 'n3', component.children[0].children[1], components[elementId])
                components[elementId].nC.dom.id = 'c' + connectorId
                connectors['c' + connectorId] = components[elementId].nC
                connectors['c' + connectorId].enableSelect()
                connectorId++
            }
            // Q output
            components[elementId].nQ = new Connector('out', 'nQ', component.children[2].children[0], components[elementId])
            components[elementId].nQ.dom.id = 'c' + connectorId
            connectors['c' + connectorId] = components[elementId].nQ
            connectors['c' + connectorId].enableSelect()
            connectorId++
            // Q̄ output
            components[elementId].nQNot = new Connector('out', 'nQNot', component.children[2].children[1], components[elementId])
            components[elementId].nQNot.dom.id = 'c' + connectorId
            connectors['c' + connectorId] = components[elementId].nQNot
            connectors['c' + connectorId].enableSelect()
            connectorId++

            engine.registerComponent(elementId, components[elementId])
            enableComponentDrag(component, elementId)
            sim.appendChild(component)
            elementId++
        }
    }
})

instance.on('transform', () => {
    let transform = instance.getTransform()
    scale = transform.scale
    let pct = Math.round(scale * 100)
    let zoomEl = document.getElementById('status-zoom')
    if (zoomEl) zoomEl.textContent = 'Zoom: ' + pct + '%'
    let sliderEl = document.getElementById('zoom-slider')
    if (sliderEl && document.activeElement !== sliderEl) {
        sliderEl.value = scale
    }
    
    // Update grid on dropwindow
    if (gridEnabled) {
        let dw = document.getElementById('dropwindow')
        let size = 20 * scale
        dw.style.backgroundSize = `${size}px ${size}px`
        dw.style.backgroundPosition = `${transform.x}px ${transform.y}px`
    }
})

let sliderEl = document.getElementById('zoom-slider')
if (sliderEl) {
    sliderEl.addEventListener('pointerdown', (e) => e.stopPropagation())
    sliderEl.addEventListener('touchstart', (e) => e.stopPropagation())
    sliderEl.addEventListener('mousedown', (e) => e.stopPropagation())
    sliderEl.addEventListener('input', (e) => {
        let newScale = parseFloat(e.target.value)
        let rect = dropzone.getBoundingClientRect()
        instance.zoomAbs(rect.width / 2, rect.height / 2, newScale)
    })
}

let statusBarEl = document.getElementById('status-bar')
if (statusBarEl) {
    statusBarEl.addEventListener('pointerdown', (e) => e.stopPropagation())
    statusBarEl.addEventListener('touchstart', (e) => e.stopPropagation())
    statusBarEl.addEventListener('mousedown', (e) => e.stopPropagation())
}

let recenterView = () => {
    instance.moveTo(0, 0)
}

// ===== SETTINGS =====

function closeCompSettings() {
    compSettingsTarget = null
    let overlay = document.getElementById('comp-settings-panel')
    if (overlay) overlay.style.display = 'none'
}

let toggleSettings = () => {
    let overlay = document.getElementById('settings-overlay')
    overlay.style.display = overlay.style.display === 'none' ? 'flex' : 'none'
}

// ===== GRID TOGGLE =====
let gridEnabled = false
let snapToGrid = false

let toggleSnap = (on) => {
    snapToGrid = on
}

let toggleGrid = (on) => {
    gridEnabled = on
    let dw = document.getElementById('dropwindow')
    if (on) {
        applyGridForTheme()
    } else {
        dw.style.backgroundImage = 'none'
    }
}

// Store current theme for grid reapplication
let currentTheme = 'light'

let applyTheme = (theme) => {
    currentTheme = theme
    let dw = document.getElementById('dropwindow')
    if (theme === 'dark') {
        dw.style.backgroundColor = '#1a1d27'
    } else if (theme === 'blueprint') {
        dw.style.backgroundColor = '#1a3a5c'
    } else {
        dw.style.backgroundColor = '#ddd'
    }
    if (gridEnabled) applyGridForTheme()
    else dw.style.backgroundImage = 'none'
}

function applyGridForTheme() {
    let dw = document.getElementById('dropwindow')
    if (currentTheme === 'dark') {
        dw.style.backgroundImage = 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)'
    } else if (currentTheme === 'blueprint') {
        dw.style.backgroundImage = 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)'
    } else {
        dw.style.backgroundImage = 'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)'
    }
    
    // Make sure we apply initial transform sync
    if (typeof instance !== 'undefined') {
        let transform = instance.getTransform()
        let size = 20 * transform.scale
        dw.style.backgroundSize = `${size}px ${size}px`
        dw.style.backgroundPosition = `${transform.x}px ${transform.y}px`
    } else {
        dw.style.backgroundSize = '20px 20px'
    }
}

// ===== ELEMENT DRAGGING (reposition placed components) =====
let dragState = { active: false, compId: null, offsetX: 0, offsetY: 0, lastX: 0, lastY: 0 }

function enableComponentDrag(dom, compId) {
    let body = dom.querySelector('.body') || dom
    body.addEventListener('pointerdown', (e) => {
        if (navMode !== 1) return
        if (e.target.classList.contains('connector')) return
        e.stopPropagation()
        dragState.active = true
        dragState.compId = compId
        let rect = dom.getBoundingClientRect()
        dragState.offsetX = e.clientX - rect.left
        dragState.offsetY = e.clientY - rect.top
        dragState.lastX = e.clientX
        dragState.lastY = e.clientY
        dom.style.zIndex = '500'
    })
}

document.addEventListener('pointermove', (e) => {
    // Element dragging (with group support)
    if (dragState.active && navMode === 1) {
        let dx = (e.clientX - dragState.lastX) / scale
        let dy = (e.clientY - dragState.lastY) / scale
        dragState.lastX = e.clientX
        dragState.lastY = e.clientY

        let draggedComp = components[dragState.compId]
        if (!draggedComp) return

        // Determine which components to move
        let toMove = []
        if (draggedComp.selected) {
            // Move all selected components
            for (let id of Object.keys(components)) {
                if (components[id].selected) toMove.push(id)
            }
        } else {
            toMove.push(dragState.compId)
        }

        for (let id of toMove) {
            let comp = components[id]
            let dom = comp.getDom || comp.dom
            comp.x = (comp.x || 0) + dx
            comp.y = (comp.y || 0) + dy
            let drawX = comp.x
            let drawY = comp.y
            if (snapToGrid) {
                drawX = Math.round(drawX / 20) * 20
                drawY = Math.round(drawY / 20) * 20
            }
            dom.style.left = drawX + 'px'
            dom.style.top = drawY + 'px'
            rerenderWiresForComponent(id)
        }
    }

    // Multi-select box
    if (selectState.active && navMode === 1) {
        let box = document.getElementById('selection-box')
        let x = Math.min(selectState.startX, e.clientX)
        let y = Math.min(selectState.startY, e.clientY)
        let w = Math.abs(e.clientX - selectState.startX)
        let h = Math.abs(e.clientY - selectState.startY)
        box.style.display = 'block'
        box.style.left = x + 'px'
        box.style.top = y + 'px'
        box.style.width = w + 'px'
        box.style.height = h + 'px'
    }
})

document.addEventListener('pointerup', (e) => {
    // End element dragging
    if (dragState.active) {
        let comp = components[dragState.compId]
        if (comp) {
            let dom = comp.getDom || comp.dom
            dom.style.zIndex = ''
        }
        let draggedComp = components[dragState.compId]
        if (draggedComp) {
            let toMove = draggedComp.selected ? Object.keys(components).filter(id => components[id].selected) : [dragState.compId]
            for (let id of toMove) {
                let c = components[id]
                if (snapToGrid && c.x !== undefined && c.y !== undefined) {
                    c.x = Math.round(c.x / 20) * 20
                    c.y = Math.round(c.y / 20) * 20
                }
            }
        }
        dragState.active = false
        dragState.compId = null
    }

    // End multi-select
    if (selectState.active) {
        let box = document.getElementById('selection-box')
        let boxRect = box.getBoundingClientRect()
        // Only apply selection if drag was meaningful (>5px in any direction)
        let dragW = Math.abs(e.clientX - selectState.startX)
        let dragH = Math.abs(e.clientY - selectState.startY)
        let didSelect = false
        if (dragW > 5 || dragH > 5) {
            for (let id of Object.keys(components)) {
                let comp = components[id]
                let dom = comp.getDom || comp.dom
                let rect = dom.getBoundingClientRect()
                if (rectsOverlap(boxRect, rect)) {
                    comp.select()
                    didSelect = true
                }
            }
        }
        box.style.display = 'none'
        selectState.active = false
        if (didSelect) justBoxSelected = true
    }
    updateSettingsPanel()
})

document.addEventListener('dblclick', () => {
    updateSettingsPanel()
})

function rerenderWiresForComponent(compId) {
    let comp = components[compId]
    if (!comp) return
    for (let wid of Object.keys(wires)) {
        let wire = wires[wid]
        if (!wire || !wire.n1 || !wire.n2) continue
        let srcId = wire.n1.parent.dom.id
        let dstId = wire.n2.parent.dom.id
        if (srcId == compId || dstId == compId) {
            let oldDom = wire.dom
            if (oldDom && oldDom.parentElement) oldDom.parentElement.removeChild(oldDom)
            wire.render(scale)
            sim.appendChild(wire.dom)
        }
    }
}

// ===== MULTI-SELECT =====
let selectState = { active: false, startX: 0, startY: 0 }

dropzone.addEventListener('pointerdown', (e) => {
    if (navMode !== 1) return
    // Only start selection if clicking on empty canvas (not on a component or connector)
    if (e.target === dropzone || e.target === sim || e.target.id === 'simulation-window' || e.target.id === 'dropwindow') {
        selectState.active = true
        selectState.startX = e.clientX
        selectState.startY = e.clientY
    }
})

function rectsOverlap(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom)
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
    }
    renderSignalColorPickers()
}

function restoreDefaultColors() {
    applySignalColor('high', '#ff4b4b')
    applySignalColor('low', '#636e7a')
    applySignalColor('float', '#2ecc71')
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
    let cat = categories[comp.getType || comp.type]
    let typeName = (comp.getType || comp.type).toUpperCase()

    let overlay = document.getElementById('comp-settings-panel')
    let title = document.getElementById('comp-settings-title')
    let body = document.getElementById('comp-settings-body')

    title.textContent = typeName + ' — Settings'

    // Build settings form
    let html = ''

    // Position info
    html += '<div class="modal-field">'
    html += '<label class="modal-label">Position</label>'
    html += '<div style="display:flex;gap:10px">'
    html += '<div><label style="font-size:10px;color:#636b7e">X</label><input type="number" class="modal-input" style="width:80px" value="' + Math.round(comp.x || 0) + '" onchange="moveCompTo(\'' + compId + '\',\'x\',+this.value)"></div>'
    html += '<div><label style="font-size:10px;color:#636b7e">Y</label><input type="number" class="modal-input" style="width:80px" value="' + Math.round(comp.y || 0) + '" onchange="moveCompTo(\'' + compId + '\',\'y\',+this.value)"></div>'
    html += '</div></div>'

    // Rotation
    let curRot = comp.rotation || 0
    html += '<div class="modal-field">'
    html += '<label class="modal-label">Rotation</label>'
    html += '<div style="display:flex;align-items:center;gap:8px">'
    html += '<button class="tb-btn" style="border:1px solid rgba(255,255,255,0.15);padding:4px 10px;font-size:12px" onclick="rotateComponent(\'' + compId + '\',-90)">↺ 90°</button>'
    html += '<span id="comp-rot-display" style="font-family:\'JetBrains Mono\',monospace;font-size:13px;color:#e8eaed;min-width:40px;text-align:center">' + curRot + '°</span>'
    html += '<button class="tb-btn" style="border:1px solid rgba(255,255,255,0.15);padding:4px 10px;font-size:12px" onclick="rotateComponent(\'' + compId + '\',90)">↻ 90°</button>'
    html += '<button class="tb-btn" style="border:1px solid rgba(255,255,255,0.15);padding:4px 10px;font-size:11px;margin-left:4px" onclick="rotateComponent(\'' + compId + '\',0,true)">Reset</button>'
    html += '</div></div>'

    // Gate-specific: input/output delays
    if (comp instanceof Gate) {
        html += '<div class="modal-field">'
        html += '<label class="modal-label">Input Delay (ticks)</label>'
        html += '<input type="number" class="modal-input" style="width:80px" min="0" value="' + (comp.inputDelay || 0) + '" onchange="components[\'' + compId + '\'].inputDelay=Math.max(0,+this.value||0)">'
        html += '</div>'
        html += '<div class="modal-field">'
        html += '<label class="modal-label">Output Delay (ticks)</label>'
        html += '<input type="number" class="modal-input" style="width:80px" min="0" value="' + (comp.outputDelay || 0) + '" onchange="components[\'' + compId + '\'].outputDelay=Math.max(0,+this.value||0)">'
        html += '</div>'
    }

    // Flip-flop: no user-configurable delays currently, but show type info
    if (comp instanceof FlipFlop) {
        html += '<div class="modal-field">'
        html += '<label class="modal-label">Flip-Flop Type</label>'
        let ffTypeName = 'Flip-Flop (edge-triggered)'
        if (comp.type === 'jkff') ffTypeName = 'JK Flip-Flop (edge-triggered)'
        if (comp.type === 'tff') ffTypeName = 'T Flip-Flop (edge-triggered)'
        if (comp.type === 'srff') ffTypeName = 'SR Flip-Flop (edge-triggered)'
        if (comp.type === 'dff') ffTypeName = 'D Flip-Flop (edge-triggered)'
        html += '<div style="font-size:13px;color:#e8eaed">' + ffTypeName + '</div>'
        html += '</div>'
        html += '<div class="modal-field">'
        html += '<label class="modal-label">Current Q State</label>'
        html += '<div style="font-size:13px;color:' + (comp.q ? 'var(--signal-high)' : 'var(--signal-low)') + ';font-weight:700">' + (comp.q ? 'HIGH (1)' : 'LOW (0)') + '</div>'
        html += '</div>'
    }

    // Clock: period and running state
    if (comp instanceof Clock) {
        html += '<div class="modal-field">'
        html += '<label class="modal-label">Period (ticks per cycle)</label>'
        html += '<input type="number" class="modal-input" style="width:80px" min="1" value="' + (comp.period || 30) + '" onchange="components[\'' + compId + '\'].period=Math.max(1,+this.value||1)">'
        html += '</div>'
        html += '<div class="modal-field">'
        html += '<label class="modal-check"><input type="checkbox" ' + (comp.running !== false ? 'checked' : '') + ' onchange="components[\'' + compId + '\'].running=this.checked"> Running</label>'
        html += '</div>'
    }

    // LED: light color
    if (comp instanceof Light) {
        let currentColor = comp.lightColor || '#ff4b4b'
        html += '<div class="modal-field">'
        html += '<label class="modal-label">LED Color (when HIGH)</label>'
        html += '<div id="swatches-led">' + generateColorSwatches(currentColor, "setLedColor('" + compId + "', '%COLOR%')") + '</div>'
        html += '</div>'
    }

    // 7Seg: display color
    if (comp instanceof Seg7) {
        let currentColor = comp.displayColor || '#ff4b4b'
        html += '<div class="modal-field">'
        html += '<label class="modal-label">Display Color</label>'
        html += '<div id="swatches-seg7">' + generateColorSwatches(currentColor, "setSeg7Color('" + compId + "', '%COLOR%')") + '</div>'
        html += '</div>'
    }

    // Input type info
    if (comp instanceof Input) {
        html += '<div class="modal-field">'
        html += '<label class="modal-label">Input Type</label>'
        html += '<div style="font-size:13px;color:#e8eaed">' + typeName + '</div>'
        html += '</div>'
    }

    body.innerHTML = html
    overlay.style.display = 'flex'
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
    let dom = comp.getDom || comp.dom
    if (axis === 'x') dom.style.left = value + 'px'
    else dom.style.top = value + 'px'
    rerenderWiresForComponent(compId)
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
    let display = comp.dom.querySelector('.display')
    if (display) display.style.color = color
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
    let dom = comp.getDom || comp.dom
    dom.style.transform = comp.rotation ? 'rotate(' + comp.rotation + 'deg)' : ''
    dom.style.transformOrigin = 'center center'
    // Update the display in the settings modal if open
    let rotDisplay = document.getElementById('comp-rot-display')
    if (rotDisplay) rotDisplay.textContent = comp.rotation + '°'
    // Re-render wires connected to this component
    rerenderWiresForComponent(compId)
}

// ===== RIGHT-CLICK / DOUBLE-TAP → COMPONENT SETTINGS =====
sim.addEventListener('contextmenu', (e) => {
    e.preventDefault()
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

    // ===== TOUCH DRAG-DROP ADAPTER =====
    // On mobile, HTML5 drag-and-drop doesn't work, so we use touch events.
    // When a user touches a draggable in the panel, we create a ghost element
    // that follows their finger. On release, we simulate a drop event.
    ; (function () {
        let ghost = null
        let touchType = ''
        let touchOffX = 0, touchOffY = 0

        function startTouch(e) {
            if (navMode !== 1) return
            let el = e.target
            // Only handle draggables inside the panel
            if (!el.closest('#side-panel')) return
            if (!el.classList.contains('draggable') && !el.closest('.draggable')) return

            e.preventDefault()
            let draggable = el.classList.contains('draggable') ? el : el.closest('.draggable')

            // Determine type
            if (draggable.classList.contains('seg7')) {
                touchType = 'seg7'
            } else if (draggable.classList.contains('label')) {
                touchType = 'label'
            } else {
                touchType = draggable.id || draggable.parentElement.id
            }

            let touch = e.touches[0]
            let rect = draggable.getBoundingClientRect()
            touchOffX = touch.clientX - rect.left
            touchOffY = touch.clientY - rect.top

            // Create ghost
            ghost = draggable.cloneNode(true)
            ghost.style.position = 'fixed'
            ghost.style.zIndex = '99999'
            ghost.style.pointerEvents = 'none'
            ghost.style.opacity = '0.7'
            ghost.style.left = (touch.clientX - touchOffX) + 'px'
            ghost.style.top = (touch.clientY - touchOffY) + 'px'
            document.body.appendChild(ghost)

            // Close drawer
            if (drawerOpen) toggleDrawer()
        }

        function moveTouch(e) {
            if (!ghost) return
            e.preventDefault()
            let touch = e.touches[0]
            ghost.style.left = (touch.clientX - touchOffX) + 'px'
            ghost.style.top = (touch.clientY - touchOffY) + 'px'
        }

        function endTouch(e) {
            if (!ghost) return
            ghost.remove()
            ghost = null

            let touch = e.changedTouches[0]
            // Simulate a drop at this position
            let fakeEvent = {
                preventDefault: () => { },
                x: touch.clientX,
                y: touch.clientY,
                clientX: touch.clientX,
                clientY: touch.clientY,
                dataTransfer: {
                    getData: () => JSON.stringify({
                        from: 'panel',
                        type: touchType,
                        xoff: touchOffX,
                        yoff: touchOffY
                    })
                }
            }
            // Reuse the existing drop handler
            let dropEvent = new Event('drop')
            // Manually call the drop logic
            dropzone.dispatchEvent(Object.assign(dropEvent, {
                preventDefault: () => { },
                dataTransfer: fakeEvent.dataTransfer,
                x: touch.clientX,
                y: touch.clientY,
                clientX: touch.clientX,
                clientY: touch.clientY
            }))
        }

        // Only attach on touch devices
        document.addEventListener('touchstart', startTouch, { passive: false })
        document.addEventListener('touchmove', moveTouch, { passive: false })
        document.addEventListener('touchend', endTouch)
    })()

// Initialize UI pickers
renderSignalColorPickers()