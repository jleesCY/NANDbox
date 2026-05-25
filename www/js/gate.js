/*
    Gate Component
    Uses a truth-table lookup instead of per-type code duplication.
    Implements evaluate/updateVisuals pattern for the tick-based engine.
*/

// Truth table functions for each gate type
const GATE_FUNCTIONS = {
    'not':  (a, b) => a !== null ? !a : null,
    'and':  (a, b) => {
        if (a === null && b === null) return null
        if ((a === null && b === false) || (a === false && b === null)) return false
        if (a !== null && b !== null) return a && b
        return null
    },
    'or':   (a, b) => {
        if (a === null && b === null) return null
        if ((a === null && b === true) || (a === true && b === null)) return true
        if (a !== null && b !== null) return a || b
        return null
    },
    'nand': (a, b) => {
        if (a === null && b === null) return null
        if ((a === null && b === false) || (a === false && b === null)) return true
        if (a !== null && b !== null) return !(a && b)
        return null
    },
    'nor':  (a, b) => {
        if (a === null && b === null) return null
        if ((a === null && b === true) || (a === true && b === null)) return false
        if (a !== null && b !== null) return !(a || b)
        return null
    },
    'xor':  (a, b) => {
        if (a === null || b === null) return null
        return !!(a ^ b)
    },
    'xnor': (a, b) => {
        if (a === null || b === null) return null
        return !(a ^ b)
    }
}

class Gate {
    constructor(type, x, y, dom) {
        this.type = type
        this.dom = dom
        this.x = x
        this.y = y
        this.in1 = null         // Wire connected to input 1
        this.in2 = null         // Wire connected to input 2
        this.out = []           // Wires connected to output
        this.n1 = null          // Input 1 connector
        this.n2 = null          // Input 2 connector
        this.nOut = null        // Output connector
        this.selected = false
        this._computedOutput = null
    }

    //
    // ----- GETTERS -----
    //
    get getType() {
        return this.type
    }
    get getIn1() {
        return this.in1
    }
    get getIn2() {
        return this.in2
    }
    get getOut() {
        return this.out
    }
    get getN1() {
        return this.n1
    }
    get getN2() {
        return this.n2
    }
    get getNOut() {
        return this.nOut
    }
    get getX() {
        return this.x
    }
    get getY() {
        return this.y
    }
    get getDom() {
        return this.dom
    }
    get getBody() {
        return this.dom.children[1].children[0]
    }

    //
    // ----- SETTERS -----
    //
    set setIn1(wire) {
        this.in1 = wire
        if (this.type == 'not') {
            this.in2 = wire
        }
    }
    set setIn2(wire) {
        this.in2 = wire
    }
    set setOut(wires) {
        this.out = wires
    }
    set setN1(n) {
        this.n1 = n
    }
    set setN2(n) {
        this.n2 = n
    }
    set setNOut(n) {
        this.nOut = n
    }
    set addOut(wire) {
        this.out.push(wire)
    }
    set setX(x) {
        this.x = x
    }
    set setY(y) {
        this.y = y
    }
    set setDom(d) {
        this.dom = d
    }

    //
    // ----- ENGINE INTERFACE -----
    //

    evaluate() {
        let v1 = (this.n1 !== null) ? this.n1.value : null
        let v2 = (this.n2 !== null) ? this.n2.value : null

        // Compute gate output immediately
        let gateFn = GATE_FUNCTIONS[this.type]
        this._computedOutput = gateFn ? gateFn(v1, v2) : null

        // Update output connector
        if (this.nOut) {
            this.nOut.value = this._computedOutput
        }
    }

    /**
     * Update visuals: apply current state to DOM
     */
    updateVisuals() {
        // Update input connector visuals
        if (this.n1) {
            this.n1.updateVisual()
        }
        if (this.type !== 'not' && this.n2) {
            this.n2.updateVisual()
        }
        // Update output connector visual
        if (this.nOut) {
            this.nOut.updateVisual()
        }
    }

    //
    // ----- LEGACY COMPATIBILITY -----
    //
    calcOutput() {
        this.evaluate()
        this.updateVisuals()
    }

    //
    // ----- INTERACTION -----
    //
    select = () => {
        this.dom.classList.add('selected')
        this.selected = true
    }
    deselect = () => {
        this.dom.classList.remove('selected')
        this.selected = false
    }
    delete = () => {
        if (this.dom && this.dom.parentElement) {
            this.dom.parentElement.removeChild(this.dom)
        }
    }
    enableSelect = () => {
        this.dom.addEventListener('dblclick', this.select)
    }
    disableSelect = () => {
        this.dom.removeEventListener('dblclick', this.select)
    }
}