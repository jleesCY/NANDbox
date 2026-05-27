/*
    Input Component (Button, Switch, VCC, GND)
    Implements evaluate/updateVisuals pattern for the tick-based engine.
*/

class Input {
    constructor(type, x, y, dom) {
        this.type = type
        this.dom = dom
        this.x = x
        this.y = y
        this.out = []
        this.nOut = null
        this.selected = false
        this.value = false
        if (this.type == 'vcc') {
            this.value = true
        }
    }

    //
    // ----- GETTERS -----
    //
    get getType() {
        return this.type
    }
    get getOut() {
        return this.out
    }
    get getN() {
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
        return this.dom.children[0]
    }

    //
    // ----- SETTERS -----
    //
    set setOut(wires) {
        this.out = wires
    }
    set addOut(wire) {
        this.out.push(wire)
    }
    set setN(n) {
        this.nOut = n
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

    /**
     * Evaluate: write current value to output connector
     */
    evaluate() {
        if (this.nOut) {
            this.nOut.value = this.value
        }
    }

    /**
     * Update visuals: apply current state to DOM
     */
    updateVisuals() {
        // No-op for canvas refactor
    }

    //
    // ----- INTERACTION -----
    //
    select = () => {
        this.selected = true
    }
    deselect = () => {
        this.selected = false
    }
    delete = () => {
        // No-op
    }
    enableSelect = () => {
        // No-op
    }
    disableSelect = () => {
        // No-op
    }
    enablePress = () => {
        // No-op
    }
    disablePress = () => {
        // No-op
    }
    on = () => {
        this.value = true
        if (this.nOut) {
            this.nOut.value = true
        }
    }
    off = () => {
        this.value = false
        if (this.nOut) {
            this.nOut.value = false
        }
    }
    toggle = () => {
        if (this.value) {
            this.off()
        }
        else {
            this.on()
        }
    }
}