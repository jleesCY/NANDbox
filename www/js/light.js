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
        let val = null
        if (this.in1 !== null) {
            val = this.in1.getValue
        }
        // Update connector value
        if (this.n1) {
            this.n1.value = val
        }
        // Update LED body
        if (val === null) {
            this._setFloat()
        } else if (val) {
            this._setOn()
        } else {
            this._setOff()
        }
    }

    /**
     * Update visuals: connector and LED
     */
    updateVisuals() {
        if (this.n1) {
            this.n1.updateVisual()
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
    // ----- VISUAL HELPERS -----
    //
    _setOn() {
        this.dom.children[0].classList.remove('low', 'float')
        this.dom.children[0].classList.add('high')
        if (this.lightColor) {
            this.dom.children[0].style.backgroundColor = this.lightColor
        } else {
            this.dom.children[0].style.backgroundColor = ''
        }
    }
    _setOff() {
        this.dom.children[0].classList.remove('high', 'float')
        this.dom.children[0].classList.add('low')
        this.dom.children[0].style.backgroundColor = ''
    }
    _setFloat() {
        this.dom.children[0].classList.remove('high', 'low')
        this.dom.children[0].classList.add('float')
    }

    // Legacy on/off/float methods (still used by some code paths)
    on = () => {
        this._setOn()
        if (this.n1) this.n1.on()
    }
    off = () => {
        this._setOff()
        if (this.n1) this.n1.off()
    }
    float = () => {
        this._setFloat()
        if (this.n1) this.n1.float()
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