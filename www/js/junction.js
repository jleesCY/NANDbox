/*
    Junction Component
    A pass-through node that forwards input signal to output.
    Visually appears as a small dot on the canvas.
    Used where wires branch/merge.
*/

class Junction {
    constructor(x, y, dom) {
        this.type = 'junction'
        this.dom = dom
        this.x = x
        this.y = y
        this.out = []
        this.nOut = null   // output connector
        this.n1 = null     // input connector (alias for compatibility)
        this.in1 = null    // input wire
        this.selected = false
        this.rotation = 0
        this.value = null
    }

    // ----- GETTERS -----
    get getType() { return this.type }
    get getOut() { return this.out }
    get getN() { return this.nOut }
    get getX() { return this.x }
    get getY() { return this.y }
    get getDom() { return this.dom }

    // ----- SETTERS -----
    set setOut(wires) { this.out = wires }
    set addOut(wire) { this.out.push(wire) }
    set setN(n) { this.nOut = n }
    set setX(x) { this.x = x }
    set setY(y) { this.y = y }

    // Input wire property (i + loc pattern)
    get i1() { return this.in1 }
    set i1(wire) { this.in1 = wire }

    // ----- ENGINE INTERFACE -----
    evaluate() {
        // Read value from input wire
        if (this.in1) {
            this.value = this.in1.value
        } else {
            this.value = null
        }
        // Write to output connector
        if (this.nOut) {
            this.nOut.value = this.value
        }
        // Write to output wires
        for (let wire of this.out) {
            wire.value = this.value
        }
    }

    updateVisuals() {
        if (this.nOut) {
            this.nOut.updateVisual()
        }
        // Update dot color based on signal
        let dot = this.dom.querySelector('.junction-body')
        if (dot) {
            if (this.value === null) {
                dot.style.background = '#2ecc71'
            } else if (this.value) {
                dot.style.background = '#ff4b4b'
            } else {
                dot.style.background = '#636e7a'
            }
        }
    }

    // ----- INTERACTION -----
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
    enablePress = () => { }
    disablePress = () => { }
    enableEdit = () => { }
}
