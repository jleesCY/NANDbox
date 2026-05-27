const fs = require('fs');

let orig = fs.readFileSync('/home/jlees/Code/NANDbox/www/js/index.js', 'utf8');
let scratch = fs.readFileSync('/home/jlees/Code/NANDbox/www/js/scratch_index.js', 'utf8');

let lines = orig.split('\n');

let startHistory = lines.findIndex(l => l.includes('// ===== UNDO / REDO ====='));
let startCopy = lines.findIndex(l => l.includes('// ===== COPY / PASTE / CUT ====='));
let startExport = lines.findIndex(l => l.includes('// ===== EXPORT (save) ====='));
let startImport = lines.findIndex(l => l.includes('// ===== IMPORT (load) ====='));
let startSignal = lines.findIndex(l => l.includes('// ===== SIGNAL COLOR SETTINGS ====='));
let startSettings = lines.findIndex(l => l.includes('// ===== COMPONENT SETTINGS MODAL ====='));
let startRightClick = lines.findIndex(l => l.includes('// ===== RIGHT-CLICK / DOUBLE-TAP → COMPONENT SETTINGS ====='));
let startMobile = lines.findIndex(l => l.includes('// ===== MOBILE DRAWER TOGGLE ====='));
let startTouchAdapter = lines.findIndex(l => l.includes('// ===== TOUCH DRAG-DROP ADAPTER ====='));

let extractBlock = (start, endText) => {
    let end = lines.findIndex((l, i) => i > start && l.includes(endText));
    if (end === -1) end = lines.length;
    return lines.slice(start, end).join('\n');
};

let historyBlock = extractBlock(startHistory, '// ===== COPY');
let copyBlock = extractBlock(startCopy, '// ===== EXPORT');
let exportBlock = extractBlock(startExport, '// ===== IMPORT');
let importBlock = extractBlock(startImport, '// ===== SIGNAL');
let signalBlock = extractBlock(startSignal, '// ===== COMPONENT');
let settingsBlock = extractBlock(startSettings, '// ===== RIGHT-CLICK');
let rightClickBlock = extractBlock(startRightClick, '// ===== MOBILE');
let mobileBlock = extractBlock(startMobile, '// ===== TOUCH');
let touchAdapterBlock = extractBlock(startTouchAdapter, '// Initialize UI pickers');

function patchDomRefs(code) {
    code = code.replace(/comp\.n1 && comp\.n1\.dom/g, 'comp.n1');
    code = code.replace(/comp\.n1\.dom\.id/g, 'comp.n1.id');
    code = code.replace(/comp\.n2 && comp\.n2 !== comp\.n1 && comp\.n2\.dom/g, 'comp.n2 && comp.n2 !== comp.n1');
    code = code.replace(/comp\.n2\.dom\.id/g, 'comp.n2.id');
    code = code.replace(/comp\.n3 && comp\.n3\.dom/g, 'comp.n3');
    code = code.replace(/comp\.n3\.dom\.id/g, 'comp.n3.id');
    code = code.replace(/comp\.n4 && comp\.n4\.dom/g, 'comp.n4');
    code = code.replace(/comp\.n4\.dom\.id/g, 'comp.n4.id');
    code = code.replace(/comp\.nOut && comp\.nOut\.dom/g, 'comp.nOut');
    code = code.replace(/comp\.nOut\.dom\.id/g, 'comp.nOut.id');
    code = code.replace(/comp\.nQ && comp\.nQ\.dom/g, 'comp.nQ');
    code = code.replace(/comp\.nQ\.dom\.id/g, 'comp.nQ.id');
    code = code.replace(/comp\.nQNot && comp\.nQNot\.dom/g, 'comp.nQNot');
    code = code.replace(/comp\.nQNot\.dom\.id/g, 'comp.nQNot.id');
    code = code.replace(/comp\.nC && comp\.nC\.dom/g, 'comp.nC');
    code = code.replace(/comp\.nC\.dom\.id/g, 'comp.nC.id');
    code = code.replace(/w\.n1 \? w\.n1\.dom\.id : null/g, 'w.n1 ? w.n1.id : null');
    code = code.replace(/w\.n2 \? w\.n2\.dom\.id : null/g, 'w.n2 ? w.n2.id : null');
    code = code.replace(/comp\.dom\.innerText/g, 'comp.text');
    code = code.replace(/wire\.n1\.parent\.dom\.id/g, 'wire.n1.parent.id');
    code = code.replace(/wire\.n2\.parent\.dom\.id/g, 'wire.n2.parent.id');
    code = code.replace(/w\.n1\.parent\.dom\.id/g, 'w.n1.parent.id');
    code = code.replace(/w\.n2\.parent\.dom\.id/g, 'w.n2.parent.id');
    code = code.replace(/w\.n1\.dom\.id/g, 'w.n1.id');
    code = code.replace(/w\.n2\.dom\.id/g, 'w.n2.id');
    return code;
}

let patchedExport = patchDomRefs(exportBlock);
let patchedCopy = patchDomRefs(copyBlock);

let newImportBlock = `
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
            
            let wire = new Wire(n1, n2)
            wire.id = newWId
            wire.bends = wData.bends || null
            
            wires[newWId] = wire
            engine.registerWire(newWId, wire)
            n1.parent.addOut = wire
            n2.parent.setIn = wire
        }
    }
    
    syncGlobals()
}
`;

let patchedHistoryBlock = `
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
`;

let patchedSettingsBlock = settingsBlock;
patchedSettingsBlock = patchedSettingsBlock.replace(/comp\.getDom \|\| comp\.dom/g, '{}');
patchedSettingsBlock = patchedSettingsBlock.replace(/dom\.style\.[a-zA-Z]+ = /g, '// ');
patchedSettingsBlock = patchedSettingsBlock.replace(/comp\.dom\.innerText/g, 'comp.text || ""');
patchedSettingsBlock = patchedSettingsBlock.replace(/comp\.dom\.querySelector/g, 'null');
patchedSettingsBlock = patchedSettingsBlock.replace(/let display = null/g, '');
patchedSettingsBlock = patchedSettingsBlock.replace(/if \(display\) display\.style\.color = color/g, '');

scratch = scratch.replace(/\/\/ ----- HISTORY -----\nlet historyStack = \[\]\nlet historyIndex = -1\nlet historyIgnore = false\n\nfunction pushHistory\(\) \{\n    if \(historyIgnore\) return\n    \/\/ Simplified history push\n    let state = \{ components: \{\}, wires: \{\} \}\n    \/\/ Add serialize \/ load logic as needed\n\}/, '');

let finalCode = scratch + '\n\n' + 
    patchedHistoryBlock + '\n\n' + 
    patchedCopy + '\n\n' + 
    patchedExport + '\n\n' + 
    newImportBlock + '\n\n' + 
    signalBlock + '\n\n' + 
    patchedSettingsBlock + '\n\n' + 
    rightClickBlock + '\n\n' + 
    mobileBlock + '\n\n' + 
    'renderSignalColorPickers();\n';

fs.writeFileSync('/home/jlees/Code/NANDbox/www/js/index_refactored.js', finalCode);
console.log('Generated index_refactored.js');
