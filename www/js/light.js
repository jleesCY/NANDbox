/*
    Light (LED) Component
    Implements evaluate/updateVisuals pattern for the tick-based engine.
*/

class Light {
    constructor(x, y, dom) {
        this.type = 'led'
        this.dom = dom
        this.x = x
        this.y = y
        this.in1 = null
        this.n1 = null
        this.selected = false
    }

    //
    // ----- GETTERS -----
    //
    get getType() {
        return this.type
    }
    get getIn() {
        return this.in1
    }
    get getN() {
        return this.n1
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
    set setIn(i) {
        this.in1 = i    // Fixed: was "this.i = i"
    }
    set setN(n) {
        this.n1 = n
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
     * Evaluate: read input wire value and update visual state
     */
    evaluate() {
        this.value = this.n1 ? this.n1.value : null;
    }

    /**
     * Update visuals: connector and LED
     */
    updateVisuals() {
        // No-op
    }

    //
    // ----- LEGACY COMPATIBILITY -----
    //
    calcOutput() {
        this.evaluate()
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
}