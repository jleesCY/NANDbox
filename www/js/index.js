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
    'and': '<div class="in-2"><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div></div><div class="body gate-body and-shape" tabindex="1"></div><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div>',
    'or': '<div class="in-2"><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div></div><div class="body gate-body or-shape" tabindex="1"></div><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div>',
    'not': '<div class="in-1"><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div></div><div class="body gate-body not-shape" tabindex="1"><div class="gate-bubble"></div></div><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div>',
    'nand': '<div class="in-2"><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div></div><div class="body gate-body and-shape" tabindex="1"><div class="gate-bubble"></div></div><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div>',
    'nor': '<div class="in-2"><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div></div><div class="body gate-body or-shape" tabindex="1"><div class="gate-bubble"></div></div><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div>',
    'xor': '<div class="in-2"><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div></div><div class="body gate-body xor-shape" tabindex="1"></div><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div>',
    'xnor': '<div class="in-2"><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div></div><div class="body gate-body xor-shape" tabindex="1"><div class="gate-bubble"></div></div><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div>',
    'button': '<div class="body button low" tabindex="1"></div><div class="connector off" tabindex="1"><div class="connector-bridge"></div></div>',
    'switch': '<div class="body switch low" tabindex="1"><div class="top"></div><div class="bottom"></div></div><div class="connector off" tabindex="1"><div class="connector-bridge"></div></div>',
    'gnd': '<div class="body const low" tabindex="1">0</div><div class="connector off" tabindex="1"><div class="connector-bridge"></div></div>',
    'vcc': '<div class="body const high" tabindex="1">1</div><div class="connector on" tabindex="1"><div class="connector-bridge"></div></div>',
    'clock': '<div class="body clock-body low" tabindex="1"><span class="clock-pulse">▼</span><span class="clock-label">CLK</span></div><div class="connector off" tabindex="1"><div class="connector-bridge"></div></div>',
    'led': '<div class="body led float" tabindex="1"></div><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div>',
    'seg7': '<div class="in-4"><div class="connector float"><div class="connector-bridge"></div></div><div class="connector float"><div class="connector-bridge"></div></div><div class="connector float"><div class="connector-bridge"></div></div><div class="connector float"><div class="connector-bridge"></div></div></div><div class="display">0</div>',
    'label': 'NANDlabel',
    'jkff': '<div class="in-3"><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div></div><div class="body ff-body" tabindex="1"><div class="ff-pin left">J</div><div class="ff-pin right">Q</div><div class="ff-pin left"><div class="ff-clk-triangle"></div></div><div class="ff-pin right"></div><div class="ff-pin left">K</div><div class="ff-pin right overline">Q</div></div><div class="out-2"><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div></div>',
    'tff': '<div class="in-2"><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div></div><div class="body ff-body" tabindex="1"><div class="ff-pin left">T</div><div class="ff-pin right">Q</div><div class="ff-pin left"></div><div class="ff-pin right"></div><div class="ff-pin left"><div class="ff-clk-triangle"></div></div><div class="ff-pin right overline">Q</div></div><div class="out-2"><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div></div>',
    'dff': '<div class="in-2"><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div></div><div class="body ff-body" tabindex="1"><div class="ff-pin left">D</div><div class="ff-pin right">Q</div><div class="ff-pin left"></div><div class="ff-pin right"></div><div class="ff-pin left"><div class="ff-clk-triangle"></div></div><div class="ff-pin right overline">Q</div></div><div class="out-2"><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div></div>',
    'srff': '<div class="in-3"><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div></div><div class="body ff-body" tabindex="1"><div class="ff-pin left">S</div><div class="ff-pin right">Q</div><div class="ff-pin left"><div class="ff-clk-triangle"></div></div><div class="ff-pin right"></div><div class="ff-pin left">R</div><div class="ff-pin right overline">Q</div></div><div class="out-2"><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div><div class="connector float" tabindex="1"><div class="connector-bridge"></div></div></div>',
    'junc3': '<svg class="body junc-body" width="40" height="40" viewBox="0 0 40 40" style="position:absolute;left:5px;top:5px;pointer-events:auto;z-index:0;"><rect width="40" height="40" fill="transparent" style="pointer-events:all;"/><path d="M0,20 L40,20 M20,20 L20,40" stroke="#000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" style="pointer-events:none;"/><circle cx="20" cy="20" r="6" fill="#000" stroke="#000" stroke-width="1" style="pointer-events:auto;"/></svg><div class="connector float" tabindex="1" style="position:absolute;left:0px;top:20px;z-index:10;"><div class="connector-bridge" style="left:auto; right:-10px;"></div></div><div class="connector float" tabindex="1" style="position:absolute;left:40px;top:20px;z-index:10;"><div class="connector-bridge" style="left:-10px;"></div></div><div class="connector float" tabindex="1" style="position:absolute;left:20px;top:40px;z-index:10;"><div class="connector-bridge" style="width:3px; height:10px; top:-10px; left:50%; transform:translateX(-50%);"></div></div>',
    'junc4': '<svg class="body junc-body" width="40" height="40" viewBox="0 0 40 40" style="position:absolute;left:5px;top:5px;pointer-events:auto;z-index:0;"><rect width="40" height="40" fill="transparent" style="pointer-events:all;"/><path d="M0,20 L40,20 M20,0 L20,40" stroke="#000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" style="pointer-events:none;"/><circle cx="20" cy="20" r="6" fill="#000" stroke="#000" stroke-width="1" style="pointer-events:auto;"/></svg><div class="connector float" tabindex="1" style="position:absolute;left:0px;top:20px;z-index:10;"><div class="connector-bridge" style="left:auto; right:-10px;"></div></div><div class="connector float" tabindex="1" style="position:absolute;left:40px;top:20px;z-index:10;"><div class="connector-bridge" style="left:-10px;"></div></div><div class="connector float" tabindex="1" style="position:absolute;left:20px;top:0px;z-index:10;"><div class="connector-bridge" style="width:3px; height:10px; top:auto; bottom:-10px; left:50%; transform:translateX(-50%);"></div></div><div class="connector float" tabindex="1" style="position:absolute;left:20px;top:40px;z-index:10;"><div class="connector-bridge" style="width:3px; height:10px; top:-10px; left:50%; transform:translateX(-50%);"></div></div>'
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
    'tff': connTypes[3], 'jkff': connTypes[3], 'dff': connTypes[3], 'srff': connTypes[3],
    'junction': 'junction',
    'junc3': 'junction',
    'junc4': 'junction'
}

// Fix: use let for globals
let zoom = 0.065
let yoff = document.querySelector("#navbar").getBoundingClientRect().height
let elementId = 0
let connectorId = 0
let wireId = 0
let scale = 1
let GRID = 10  // Universal grid size — all coordinates snap to this
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
let justDragged = false      // prevents click from deselecting after drag

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
    ghost.style.opacity = '0.5'
    ghost.style.pointerEvents = 'none'
    ghost.style.zIndex = '1000'
    ghost.style.visibility = 'hidden'
    sim.appendChild(ghost)

    // Store drag preview info globally
    window.dropPreviewData = {
        type: t,
        cat: cat,
        xoff: mx,
        yoff: my,
        dom: ghost
    }

    // Hide the native browser drag ghost by using an empty 1x1 image
    let emptyImg = new Image()
    emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    event.dataTransfer.setDragImage(emptyImg, 0, 0)
}

let panelDragend = (event) => {
    if (window.dropPreviewData && window.dropPreviewData.dom) {
        window.dropPreviewData.dom.remove()
        window.dropPreviewData = null
    }
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
            elem.removeEventListener('dragend', panelDragend)
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
            elem.addEventListener('dragend', panelDragend)
            elem.setAttribute('draggable', 'true')
        }
    }
}

// ===== UNDO / REDO =====
let historyStack = []
let historyIndex = -1
let historyMax = 50
let historyIgnore = false  // flag to prevent snapshot when restoring

function pushHistory() {
    if (historyIgnore) return
    let snapshot = JSON.stringify(serializeCircuit())
    // Trim future states if we're not at the end
    historyStack = historyStack.slice(0, historyIndex + 1)
    historyStack.push(snapshot)
    if (historyStack.length > historyMax) historyStack.shift()
    historyIndex = historyStack.length - 1
}

function restoreHistory(snapshot) {
    historyIgnore = true
    // Clear current circuit
    for (let id of Object.keys(components)) engine.unregisterComponent(id)
    for (let id of Object.keys(wires)) engine.unregisterWire(id)
    for (let id of Object.keys(connectors)) engine.unregisterConnector(id)
    components = {}; connectors = {}; wires = {}
    elementId = 0; connectorId = 0; wireId = 0
    sim.innerHTML = ''
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
        if (comp instanceof Gate) {
            entry.inputDelay = comp.inputDelay || 0
            entry.outputDelay = comp.outputDelay || 0
        }
        if (comp instanceof Clock) {
            entry.period = comp.period
            entry.running = comp.running
        }
        if (comp instanceof Light && comp.lightColor) entry.lightColor = comp.lightColor
        if (comp instanceof Seg7 && comp.displayColor) entry.displayColor = comp.displayColor
        if (comp instanceof Label) entry.text = comp.dom.innerText
        entry.connectorIds = {}
        if (comp.n1 && comp.n1.dom) entry.connectorIds.n1 = comp.n1.dom.id
        if (comp.n2 && comp.n2 !== comp.n1 && comp.n2.dom) entry.connectorIds.n2 = comp.n2.dom.id
        if (comp.nOut && comp.nOut.dom) entry.connectorIds.nOut = comp.nOut.dom.id
        if (comp.nQ && comp.nQ.dom) entry.connectorIds.nQ = comp.nQ.dom.id
        if (comp.nQNot && comp.nQNot.dom) entry.connectorIds.nQNot = comp.nQNot.dom.id
        if (comp.nC && comp.nC.dom) entry.connectorIds.nC = comp.nC.dom.id
        if (entry.type === 'seg7' || entry.type === 'junc3' || entry.type === 'junc4') {
            entry.connectorIds.n1 = comp.n1 ? comp.n1.dom.id : null
            entry.connectorIds.n2 = comp.n2 ? comp.n2.dom.id : null
            entry.connectorIds.n3 = comp.n3 ? comp.n3.dom.id : null
            entry.connectorIds.n4 = comp.n4 ? comp.n4.dom.id : null
        }
        compArr.push(entry)
    }

    // Only include wires where BOTH endpoints are in the selection
    let wireArr = []
    for (let wid of Object.keys(wires)) {
        let w = wires[wid]
        if (!w || !w.n1 || !w.n2) continue
        let srcCompId = String(w.n1.parent.dom.id)
        let dstCompId = String(w.n2.parent.dom.id)
        if (selectedSet.has(srcCompId) && selectedSet.has(dstCompId)) {
            wireArr.push({
                id: wid,
                src: w.n1.dom.id,
                dst: w.n2.dom.id,
                bends: w.bends ? JSON.parse(JSON.stringify(w.bends)) : null
            })
        }
    }

    clipboard = { version: '0.2.0', components: compArr, wires: wireArr }
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
        if (entry.type === 'seg7' || entry.type === 'junc3' || entry.type === 'junc4') {
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
            dst: w.n2 ? w.n2.dom.id : null,
            bends: w.bends || null
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
    let newCompIds = []  // Track new component IDs for auto-selection on import
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
        } else if (cat === 'junction') {
            components[newElemId] = new Junction(t, lx, ly, component)
            components[newElemId].enableSelect()
            
            // Input connector (Left)
            components[newElemId].n1 = new Connector('in', 'n1', component.children[1], components[newElemId])
            components[newElemId].n1.dom.id = 'c' + connectorId
            connIdMap[entry.connectorIds.n1] = 'c' + connectorId
            connectors['c' + connectorId] = components[newElemId].n1
            connectors['c' + connectorId].enableSelect()
            connectorId++
            
            // Output connector 1 (Right)
            components[newElemId].n2 = new Connector('in', 'n2', component.children[2], components[newElemId])
            components[newElemId].n2.dom.id = 'c' + connectorId
            connIdMap[entry.connectorIds.n2] = 'c' + connectorId
            connectors['c' + connectorId] = components[newElemId].n2
            connectors['c' + connectorId].enableSelect()
            connectorId++

            if (t === 'junc3') {
                // Output connector 2 (Bottom)
                components[newElemId].n3 = new Connector('in', 'n3', component.children[3], components[newElemId])
                components[newElemId].n3.dom.id = 'c' + connectorId
                connIdMap[entry.connectorIds.n3] = 'c' + connectorId
                connectors['c' + connectorId] = components[newElemId].n3
                connectors['c' + connectorId].enableSelect()
                connectorId++
            } else if (t === 'junc4') {
                // Output connector 2 (Top)
                components[newElemId].n3 = new Connector('in', 'n3', component.children[3], components[newElemId])
                components[newElemId].n3.dom.id = 'c' + connectorId
                connIdMap[entry.connectorIds.n3] = 'c' + connectorId
                connectors['c' + connectorId] = components[newElemId].n3
                connectors['c' + connectorId].enableSelect()
                connectorId++
                // Output connector 3 (Bottom)
                components[newElemId].n4 = new Connector('in', 'n4', component.children[4], components[newElemId])
                components[newElemId].n4.dom.id = 'c' + connectorId
                connIdMap[entry.connectorIds.n4] = 'c' + connectorId
                connectors['c' + connectorId] = components[newElemId].n4
                connectors['c' + connectorId].enableSelect()
                connectorId++
            }
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
        newCompIds.push(newElemId)
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
        if (wEntry.bends) {
            wires[wId].bends = wEntry.bends.map(b => ({
                x: b.x + offsetX,
                y: b.y + offsetY
            }))
        }
        wires[wId].render(scale)
        sim.appendChild(wires[wId].dom)
        engine.registerWire(wId, wires[wId])
        wireId++
    }
    // Select all newly imported components for easy repositioning
    if (append) {
        for (let id of newCompIds) {
            if (components[id]) components[id].select()
        }
    }
    updateMode()
    pushHistory()
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
        pushHistory()
    }
}

let image = () => { }
let help = () => { window.open('../help', '_blank') }

// Helper: remove a wire and clean up references
function removeWire(wire) {
    if (!wire) return
    wire.delete()
    engine.unregisterWire(wire.id)
    delete wires[wire.id]
}

// Helper: delete a component and all its wires
function deleteComponent(id) {
    let comp = components[id]
    if (!comp) return
    let cat = categories[comp.getType || comp.type]

    // Collect all wires connected to this component's connectors
    let wiresToRemove = []
    let compConns = new Set()
    let props = ['n1', 'n2', 'n3', 'n4', 'nOut', 'nC', 'nQ', 'nQNot', 'n']
    for (let key of props) {
        if (comp[key] && comp[key].dom && comp[key].dom.id) {
            compConns.add(comp[key].dom.id)
        }
    }
    // Also include .getN for legacy references if any
    if (comp.getN && comp.getN.dom && comp.getN.dom.id) {
        compConns.add(comp.getN.dom.id)
    }

    for (let wId in wires) {
        let w = wires[wId]
        if ((w.n1 && compConns.has(w.n1.dom.id)) || (w.n2 && compConns.has(w.n2.dom.id))) {
            wiresToRemove.push(w)
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

            if (toDelete.length > 0) pushHistory()
            updateSettingsPanel()
        }
    })

    window.onkeyup = function (e) { pressedKeys[e.keyCode] = false }
    window.onkeydown = function (e) {
        pressedKeys[e.keyCode] = true
        // Ignore shortcuts if typing in input
        if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'textarea') return
        // Ctrl+S → export
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault()
            save()
        }
        // Ctrl+Z → undo, Ctrl+Shift+Z / Ctrl+Y → redo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault()
            undo()
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'Z' || e.key === 'y')) {
            e.preventDefault()
            redo()
        }
        // Ctrl+C → copy, Ctrl+V → paste
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
            e.preventDefault()
            copySelection()
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
            e.preventDefault()
            pasteSelection()
        }
        // Ctrl+X → cut
        if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
            e.preventDefault()
            cutSelection()
        }
        // Ctrl+A → select all
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            e.preventDefault()
            for (let id of Object.keys(components)) components[id].select()
        }
    }
    updateMode()
    // Push initial empty state for undo
    pushHistory()
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

    // Skip deselection if we just finished a box-select or a drag
    if (justBoxSelected) { justBoxSelected = false; return }
    if (justDragged) { justDragged = false; return }

    if (!pressedKeys[17] && event.y > document.querySelector("#navbar").getBoundingClientRect().height) {
        // Check if click is on any selected component — if so, keep selection
        let clickedOnSelected = false
        for (let id of Object.keys(components)) {
            let comp = components[id]
            let compDom = comp.getDom || comp.dom
            if (comp.selected && compDom.contains(event.target)) {
                clickedOnSelected = true
                break
            }
        }
        if (!clickedOnSelected) {
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
                        } else if (cat === 'junction') {
                            if (comp.n1) comp.n1.deselect()
                            if (comp.n2) comp.n2.deselect()
                            if (comp.n3) comp.n3.deselect()
                            if (comp.n4) comp.n4.deselect()
                        }
                    }
                }
            }
        }
    }

    if (!event.target.classList.value.includes('connector') && navMode == 1) {
        drawWire = false; wireOrigin = null
    }
    else if (event.target.classList.value.includes('connector') && navMode == 1) {
        // Skip if wire was just completed via drag-to-connect
        if (justDragged) return
        if (drawWire) {
            let s = connectors[wireOrigin.id];
            let e = connectors[event.target.id];
            
            if (s && e && s != e) {
                if (createWireConnection(s, e)) {
                    wireOrigin = null; drawWire = false
                    s.deselect(); e.deselect()
                    pushHistory()
                }
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

dropzone.addEventListener('dragover', (event) => { 
    event.preventDefault() 
    event.dataTransfer.dropEffect = 'move'
    if (window.dropPreviewData && window.dropPreviewData.dom) {
        let dropData = window.dropPreviewData
        let ex = event.clientX || event.x || 0
        let ey = event.clientY || event.y || 0
        let yoff = document.querySelector("#navbar").getBoundingClientRect().height
        
        let cat = dropData.cat
        let loc_x = ((ex - sim.getBoundingClientRect().x) / scale) - dropData.xoff - (cat === 'gate' || cat === 'flipflop' || dropData.type === 'seg7' ? 20 : 0)
        let loc_y = (((ey - yoff) - (sim.getBoundingClientRect().y - yoff)) / scale) - dropData.yoff
        
        loc_x = Math.round(loc_x / GRID) * GRID
        loc_y = Math.round(loc_y / GRID) * GRID
        
        dropData.dom.style.left = loc_x + 'px'
        dropData.dom.style.top = loc_y + 'px'
        dropData.dom.style.visibility = 'visible'
    }
})

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
            loc_x = Math.round(loc_x / GRID) * GRID; loc_y = Math.round(loc_y / GRID) * GRID;
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
            loc_x = Math.round(loc_x / GRID) * GRID; loc_y = Math.round(loc_y / GRID) * GRID;
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
            loc_x = Math.round(loc_x / GRID) * GRID; loc_y = Math.round(loc_y / GRID) * GRID;
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
            loc_x = Math.round(loc_x / GRID) * GRID; loc_y = Math.round(loc_y / GRID) * GRID;
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
            loc_x = Math.round(loc_x / GRID) * GRID; loc_y = Math.round(loc_y / GRID) * GRID;
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
            loc_x = Math.round(loc_x / GRID) * GRID; loc_y = Math.round(loc_y / GRID) * GRID;
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
        else if (dropData['type'] === 'junc3' || dropData['type'] === 'junc4') {
            let loc_x = ((ex - sim.getBoundingClientRect().x) / scale) - dropData['xoff']
            let loc_y = (((ey - yoff) - (sim.getBoundingClientRect().y - yoff)) / scale) - dropData['yoff']
            loc_x = Math.round(loc_x / GRID) * GRID; loc_y = Math.round(loc_y / GRID) * GRID;
            let component = document.createElement('div')
            component.classList.add(categories[dropData['type']])
            component.setAttribute('style', 'top:' + loc_y + 'px;left:' + loc_x + 'px;')
            component.id = elementId
            component.innerHTML = HTML[dropData['type']]
            components[elementId] = new Junction(dropData['type'], loc_x, loc_y, component)
            components[elementId].enableSelect()
            
            // Input connector (Left)
            components[elementId].n1 = new Connector('in', 'n1', component.children[1], components[elementId])
            components[elementId].n1.dom.id = 'c' + connectorId
            connectors['c' + connectorId] = components[elementId].n1
            connectors['c' + connectorId].enableSelect()
            connectorId++
            
            // Output connector 1 (Right)
            components[elementId].n2 = new Connector('in', 'n2', component.children[2], components[elementId])
            components[elementId].n2.dom.id = 'c' + connectorId
            connectors['c' + connectorId] = components[elementId].n2
            connectors['c' + connectorId].enableSelect()
            connectorId++

            if (dropData['type'] === 'junc3') {
                // Output connector 2 (Bottom)
                components[elementId].n3 = new Connector('in', 'n3', component.children[3], components[elementId])
                components[elementId].n3.dom.id = 'c' + connectorId
                connectors['c' + connectorId] = components[elementId].n3
                connectors['c' + connectorId].enableSelect()
                connectorId++
            } else if (dropData['type'] === 'junc4') {
                // Output connector 2 (Top)
                components[elementId].n3 = new Connector('in', 'n3', component.children[3], components[elementId])
                components[elementId].n3.dom.id = 'c' + connectorId
                connectors['c' + connectorId] = components[elementId].n3
                connectors['c' + connectorId].enableSelect()
                connectorId++
                // Output connector 3 (Bottom)
                components[elementId].n4 = new Connector('in', 'n4', component.children[4], components[elementId])
                components[elementId].n4.dom.id = 'c' + connectorId
                connectors['c' + connectorId] = components[elementId].n4
                connectors['c' + connectorId].enableSelect()
                connectorId++
            }

            engine.registerComponent(elementId, components[elementId])
            enableComponentDrag(component, elementId)
            sim.appendChild(component)
            elementId++
        }
    }
    pushHistory()
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
let gridEnabled = true
let snapToGrid = true

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

toggleGrid(true)

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
        let size = GRID * transform.scale
        dw.style.backgroundSize = `${size}px ${size}px`
        dw.style.backgroundPosition = `${transform.x}px ${transform.y}px`
    } else {
        dw.style.backgroundSize = GRID + 'px ' + GRID + 'px'
    }
}

// ===== ELEMENT DRAGGING (reposition placed components) =====
let dragState = { active: false, compId: null, offsetX: 0, offsetY: 0, lastX: 0, lastY: 0 }
let wireDragState = { active: false, wireId: null, segIndex: -1, isHorizontal: false, startX: 0, startY: 0, originalBends: null }
let wireDrawState = { active: false, sourceConnId: null, previewSvg: null }

function createWirePreview() {
    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('style', 'position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:999;')
    svg.setAttribute('viewBox', '0 0 10000 10000')
    let line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('stroke', '#2ecc71')
    line.setAttribute('stroke-width', '2')
    line.setAttribute('stroke-dasharray', '6 4')
    line.setAttribute('opacity', '0.8')
    svg.appendChild(line)
    sim.appendChild(svg)
    return svg
}

function updateWirePreview(svg, x1, y1, x2, y2) {
    let line = svg.querySelector('line')
    if (line) {
        line.setAttribute('x1', x1)
        line.setAttribute('y1', y1)
        line.setAttribute('x2', x2)
        line.setAttribute('y2', y2)
    }
}

function removeWirePreview() {
    if (wireDrawState.previewSvg && wireDrawState.previewSvg.parentElement) {
        wireDrawState.previewSvg.remove()
    }
    wireDrawState.previewSvg = null
    wireDrawState.active = false
    wireDrawState.sourceConnId = null
}

// Create a wire connection between source and end connectors (shared logic)
function createWireConnection(s, e) {
    if (s === e) return false
    wires['w' + wireId] = new Wire('w' + wireId, s, e, e.parent)
    wires['w' + wireId].render(scale)
    sim.appendChild(wires['w' + wireId].dom)
    engine.registerWire('w' + wireId, wires['w' + wireId])
    wireId += 1
    return true
}

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

document.addEventListener('pointerdown', (e) => {
    if (navMode !== 1) return
    // Start wire drawing from connector via drag
    if (e.target.classList && e.target.classList.contains('connector')) {
        let connId = e.target.id
        if (connId && connectors[connId]) {
            e.stopPropagation()
            wireDrawState.active = true
            wireDrawState.sourceConnId = connId
            wireDrawState.previewSvg = createWirePreview()
            let simRect = sim.getBoundingClientRect()
            let cRect = e.target.getBoundingClientRect()
            let cx = (cRect.left + cRect.width/2 - simRect.left) / scale
            let cy = (cRect.top + cRect.height/2 - simRect.top) / scale
            wireDrawState.startX = cx
            wireDrawState.startY = cy
            wireDrawState.pointerStartX = e.clientX
            wireDrawState.pointerStartY = e.clientY
            return
        }
    }
    if (e.target.classList && e.target.classList.contains('wire-hit')) {
        e.stopPropagation()
        let wireId = e.target.dataset.wireId
        let wire = wires[wireId]
        if (!wire) return

        let rect = sim.getBoundingClientRect()
        let mx = (e.clientX - rect.left) / scale
        let my = (e.clientY - rect.top) / scale
        
        let pts = wire.getPoints(scale)
        if (!wire.bends || wire.bends.length === 0) {
            // Reconstruct bends from default route
            wire.bends = pts.slice(1, pts.length - 1)
        }
        
        // Find closest segment
        let minDist = Infinity
        let segIndex = -1
        let isHoriz = false
        
        for (let i = 0; i < pts.length - 1; i++) {
            let A = pts[i], B = pts[i+1]
            let dist = Infinity
            let horiz = Math.abs(A.y - B.y) < Math.abs(A.x - B.x)
            if (horiz) {
                if (mx >= Math.min(A.x, B.x) - 15 && mx <= Math.max(A.x, B.x) + 15) {
                    dist = Math.abs(my - A.y)
                }
            } else {
                if (my >= Math.min(A.y, B.y) - 15 && my <= Math.max(A.y, B.y) + 15) {
                    dist = Math.abs(mx - A.x)
                }
            }
            if (dist < minDist) {
                minDist = dist
                segIndex = i
                isHoriz = horiz
            }
        }
        
        if (segIndex !== -1) {
            wireDragState = {
                active: true,
                wireId: wireId,
                segIndex: segIndex,
                isHorizontal: isHoriz,
                startX: mx,
                startY: my,
                originalBends: JSON.parse(JSON.stringify(wire.bends)),
                isHold: true,
                holdTimeout: setTimeout(() => {
                    if (wireDragState.active && wireDragState.isHold && wireDragState.wireId === wireId) {
                        wire.bends = null;
                        if (wire.dom && wire.dom.parentElement) {
                            wire.updatePath(scale);
                        } else {
                            wire.render(scale);
                            sim.appendChild(wire.dom);
                        }
                        wireDragState.active = false;
                        wireDragState.wireId = null;
                    }
                }, 500)
            }
        }
    }
})

document.addEventListener('pointermove', (e) => {
    // Wire drawing preview
    if (wireDrawState.active && navMode === 1 && wireDrawState.previewSvg) {
        let simRect = sim.getBoundingClientRect()
        let mx = (e.clientX - simRect.left) / scale
        let my = (e.clientY - simRect.top) / scale
        updateWirePreview(wireDrawState.previewSvg, wireDrawState.startX, wireDrawState.startY, mx, my)
    }

    // Wire dragging
    if (wireDragState.active && navMode === 1) {
        let wire = wires[wireDragState.wireId]
        if (!wire) return
        
        let rect = sim.getBoundingClientRect()
        let mx = (e.clientX - rect.left) / scale
        let my = (e.clientY - rect.top) / scale
        
        mx = Math.round(mx / GRID) * GRID
        my = Math.round(my / GRID) * GRID
        
        let origBends = wireDragState.originalBends
        let newBends = JSON.parse(JSON.stringify(origBends))
        let i = wireDragState.segIndex

        if (wireDragState.isHold) {
            if (Math.abs(mx - wireDragState.startX) > 5 || Math.abs(my - wireDragState.startY) > 5) {
                wireDragState.isHold = false;
                clearTimeout(wireDragState.holdTimeout);
            } else {
                return; // Wait until moved enough
            }
        }
        
        let p1 = wire._getConnectorPos(wire.n1.dom, scale)
        let p2 = wire._getConnectorPos(wire.n2.dom, scale)
        let ptsCount = origBends.length + 2
        
        if (wireDragState.isHorizontal) {
            let newY = my

            if (i === 0) {
                newBends.unshift({x: p1.x, y: newY})
                if (newBends.length > 1) newBends[1].y = newY
                if (i + 1 === ptsCount - 1) newBends.push({x: p2.x, y: newY})
            } else if (i + 1 === ptsCount - 1) {
                newBends[i - 1].y = newY
                newBends.push({x: p2.x, y: newY})
            } else {
                newBends[i - 1].y = newY
                newBends[i].y = newY
            }
        } else {
            let newX = mx

            if (i === 0) {
                newBends.unshift({x: newX, y: p1.y})
                if (newBends.length > 1) newBends[1].x = newX
                if (i + 1 === ptsCount - 1) newBends.push({x: newX, y: p2.y})
            } else if (i + 1 === ptsCount - 1) {
                newBends[i - 1].x = newX
                newBends.push({x: newX, y: p2.y})
            } else {
                newBends[i - 1].x = newX
                newBends[i].x = newX
            }
        }
        
        wire.bends = newBends
        wire.updatePath(scale)

        // Move connected junctions when the segment touching them is dragged
        let srcComp = components[wire.n1.parent.dom.id]
        let dstComp = components[wire.n2.parent.dom.id]
        let updatedPts = wire.getPoints(scale)

    }

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
            let drawX = Math.round(comp.x / GRID) * GRID
            let drawY = Math.round(comp.y / GRID) * GRID
            dom.style.left = drawX + 'px'
            dom.style.top = drawY + 'px'
        }

        let toMoveSet = new Set(toMove.map(id => String(id)))
        let wiresToUpdate = new Set()
        
        for (let wid of Object.keys(wires)) {
            let wire = wires[wid]
            if (!wire || !wire.n1 || !wire.n2) continue
            let srcId = String(wire.n1.parent.dom.id)
            let dstId = String(wire.n2.parent.dom.id)
            
            let moveSrc = toMoveSet.has(srcId)
            let moveDst = toMoveSet.has(dstId)
            
            if (moveSrc || moveDst) {
                wiresToUpdate.add(wid)
                // Translate bends only if BOTH endpoints are moving
                if (moveSrc && moveDst && wire.bends && wire.bends.length > 0) {
                    for (let bend of wire.bends) {
                        bend.x += dx
                        bend.y += dy
                    }
                }
            }
        }

        for (let wid of wiresToUpdate) {
            let wire = wires[wid]
            if (wireDragState.active && wid === wireDragState.wireId) continue
            if (wire.dom && wire.dom.parentElement) {
                wire.updatePath(scale)
            } else {
                wire.render(scale)
                sim.appendChild(wire.dom)
            }
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
    // End wire drawing (drag-to-connect)
    if (wireDrawState.active) {
        let sourceConn = connectors[wireDrawState.sourceConnId]
        removeWirePreview()
        
        let dx = e.clientX - wireDrawState.pointerStartX
        let dy = e.clientY - wireDrawState.pointerStartY
        let dist = Math.hypot(dx, dy)
        let wasDrag = dist > 5 // if mouse moved more than 5px, it's a drag
        let didConnect = false
        
        if (sourceConn) {
            if (e.target.classList && e.target.classList.contains('connector')) {
                let targetConn = connectors[e.target.id]
                if (targetConn) {
                    let s = sourceConn, en = targetConn;
                    if (s && en && s !== en && createWireConnection(s, en)) {
                        s.deselect(); en.deselect()
                        pushHistory()
                        didConnect = true
                    }
                }
            }
        }
        
        justDragged = wasDrag || didConnect // prevent click handler if dragged or connected
        wireDrawState.active = false
    }

    // End wire dragging
    if (wireDragState.active) {
        if (wireDragState.isHold) {
            clearTimeout(wireDragState.holdTimeout)
        }
        let wire = wires[wireDragState.wireId]
        if (wire && wire.bends && wire.bends.length > 0) {
            let p1 = wire._getConnectorPos(wire.n1.dom, scale)
            let p2 = wire._getConnectorPos(wire.n2.dom, scale)
            let fullPts = [p1, ...wire.bends, p2]
            let cleanedPts = [fullPts[0]]
            for (let j = 1; j < fullPts.length - 1; j++) {
                let prev = cleanedPts[cleanedPts.length - 1]
                let curr = fullPts[j]
                let next = fullPts[j + 1]
                let isCollinear = (Math.abs(prev.x - curr.x) < 1 && Math.abs(curr.x - next.x) < 1) || 
                                  (Math.abs(prev.y - curr.y) < 1 && Math.abs(curr.y - next.y) < 1)
                let isDuplicate = (Math.abs(prev.x - curr.x) < 1 && Math.abs(prev.y - curr.y) < 1)
                if (!isCollinear && !isDuplicate) {
                    cleanedPts.push(curr)
                }
            }
            let lastPrev = cleanedPts[cleanedPts.length - 1]
            let lastCurr = fullPts[fullPts.length - 1]
            if (!(Math.abs(lastPrev.x - lastCurr.x) < 1 && Math.abs(lastPrev.y - lastCurr.y) < 1)) {
                cleanedPts.push(lastCurr)
            }
            wire.bends = cleanedPts.length > 2 ? cleanedPts.slice(1, cleanedPts.length - 1) : null
            if (wire.dom && wire.dom.parentElement) {
                wire.updatePath(scale)
            }
        }
        wireDragState.active = false
        wireDragState.wireId = null
        pushHistory()
    }

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
                if (c.x !== undefined && c.y !== undefined) {
                    c.x = Math.round(c.x / GRID) * GRID
                    c.y = Math.round(c.y / GRID) * GRID
                }
            }
            
            // Snap the translated bends for wires where both endpoints were moved
            let toMoveSet = new Set(toMove.map(id => String(id)))
            for (let wid of Object.keys(wires)) {
                let wire = wires[wid]
                if (!wire || !wire.bends || wire.bends.length === 0) continue
                if (!wire.n1 || !wire.n2) continue
                let srcId = String(wire.n1.parent.dom.id)
                let dstId = String(wire.n2.parent.dom.id)
                if (toMoveSet.has(srcId) && toMoveSet.has(dstId)) {
                    for (let bend of wire.bends) {
                        bend.x = Math.round(bend.x / GRID) * GRID
                        bend.y = Math.round(bend.y / GRID) * GRID
                    }
                    if (wire.dom && wire.dom.parentElement) {
                        wire.updatePath(scale)
                    }
                }
            }
        }
        justDragged = true
        dragState.active = false
        dragState.compId = null
        pushHistory()
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

document.addEventListener('dblclick', (e) => {
    if (navMode === 1 && e.target.classList && e.target.classList.contains('wire-hit')) {
        // Cancel any pending drag or hold state
        if (wireDragState.active) {
            if (wireDragState.isHold) clearTimeout(wireDragState.holdTimeout)
            wireDragState.active = false
            wireDragState.wireId = null
        }

        let wireId = e.target.dataset.wireId
        let wire = wires[wireId]
        if (wire) {
            let rect = sim.getBoundingClientRect()
            let mx = (e.clientX - rect.left) / scale
            let my = (e.clientY - rect.top) / scale
            
            let pts = wire.getPoints(scale)
            if (!wire.bends || wire.bends.length === 0) {
                wire.bends = pts.slice(1, pts.length - 1)
            }
            
            // Find closest segment
            let minDist = Infinity
            let segIndex = -1
            let isHoriz = false
            
            for (let i = 0; i < pts.length - 1; i++) {
                let A = pts[i], B = pts[i+1]
                let dist = Infinity
                let horiz = Math.abs(A.y - B.y) < Math.abs(A.x - B.x)
                if (horiz) {
                    if (mx >= Math.min(A.x, B.x) - 15 && mx <= Math.max(A.x, B.x) + 15) {
                        dist = Math.abs(my - A.y)
                    }
                } else {
                    if (my >= Math.min(A.y, B.y) - 15 && my <= Math.max(A.y, B.y) + 15) {
                        dist = Math.abs(mx - A.x)
                    }
                }
                if (dist < minDist) {
                    minDist = dist
                    segIndex = i
                    isHoriz = horiz
                }
            }
            
            if (segIndex !== -1) {
                let newBends = []
                let p1 = wire._getConnectorPos(wire.n1.dom, scale)
                let p2 = wire._getConnectorPos(wire.n2.dom, scale)
                if (isHoriz) {
                    let segmentY = pts[segIndex].y
                    newBends = [
                        {x: p1.x, y: segmentY},
                        {x: p2.x, y: segmentY}
                    ]
                } else {
                    let segmentX = pts[segIndex].x
                    newBends = [
                        {x: segmentX, y: p1.y},
                        {x: segmentX, y: p2.y}
                    ]
                }
                wire.bends = newBends
                if (wire.dom && wire.dom.parentElement) {
                    wire.updatePath(scale)
                } else {
                    wire.render(scale)
                    sim.appendChild(wire.dom)
                }
            }
        }
        return
    }
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
            // Skip the wire currently being dragged to avoid fighting with the drag handler
            if (wireDragState.active && wid === wireDragState.wireId) continue
            if (wire.dom && wire.dom.parentElement) {
                wire.updatePath(scale)
            } else {
                wire.render(scale)
                sim.appendChild(wire.dom)
            }
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
    pushHistory()
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