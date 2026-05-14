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
     * Evaluate: write current value to output connector and wires
     */
    evaluate() {
        if (this.nOut) {
            this.nOut.value = this.value
        }
        for (let wire of this.out) {
            wire.value = this.value
        }
    }

    /**
     * Update visuals: apply current state to DOM
     */
    updateVisuals() {
        if (this.nOut) {
            this.nOut.updateVisual()
        }
        // Update body visual
        if (this.value) {
            this.dom.children[0].classList.remove('low')
            this.dom.children[0].classList.add('high')
        } else {
            this.dom.children[0].classList.remove('high')
            this.dom.children[0].classList.add('low')
        }
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
    enablePress = () => {
        if (this.type == 'switch') {
            this.dom.children[0].addEventListener('pointerup', this.toggle)
        }
        else if (this.type == 'button') {
            this.dom.children[0].addEventListener('pointerdown', this.on)
            this.dom.children[0].addEventListener('pointerup', this.off)
        }
    }
    disablePress = () => {
        if (this.type == 'switch') {
            this.dom.children[0].removeEventListener('pointerup', this.toggle)
        }
        else if (this.type == 'button') {
            this.dom.children[0].removeEventListener('pointerdown', this.on)
            this.dom.children[0].removeEventListener('pointerup', this.off)
        }
    }
    on = () => {
        this.value = true
        // Visuals handled by engine tick, but update immediately for responsiveness
        this.dom.children[0].classList.remove('low')
        this.dom.children[0].classList.add('high')
        if (this.nOut) {
            this.nOut.value = true
            this.nOut.on()
        }
    }
    off = () => {
        this.value = false
        this.dom.children[0].classList.remove('high')
        this.dom.children[0].classList.add('low')
        if (this.nOut) {
            this.nOut.value = false
            this.nOut.off()
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