/*
    7-Segment Display Component
    Implements evaluate/updateVisuals pattern for the tick-based engine.
*/

class Seg7 {
    constructor(x, y, dom) {
        this.type = '7seg'
        this.dom = dom
        this.x = x
        this.y = y
        this.in1 = null
        this.in2 = null
        this.in3 = null
        this.in4 = null
        this.n1 = null
        this.n2 = null
        this.n3 = null
        this.n4 = null
        this.selected = false
    }

    //
    // ----- GETTERS -----
    //
    get getType() {
        return this.type
    }
    get getDom() {
        return this.dom
    }
    get getBody() {
        return this.dom.children[0]
    }

    //
    // ----- ENGINE INTERFACE -----
    //

    /**
     * Evaluate: read 4 input wires and compute hex display value
     */
    evaluate() {
        let v1 = '0', v2 = '0', v3 = '0', v4 = '0'

        if (this.n1 && this.n1.value) v1 = '1'
        if (this.n2 && this.n2.value) v2 = '1'
        if (this.n3 && this.n3.value) v3 = '1'
        if (this.n4 && this.n4.value) v4 = '1'

        this.dom.children[1].innerHTML = parseInt(v4 + v3 + v2 + v1, 2).toString(16).toUpperCase()
    }

    /**
     * Update visuals
     */
    updateVisuals() {
        if (this.n1) this.n1.updateVisual()
        if (this.n2) this.n2.updateVisual()
        if (this.n3) this.n3.updateVisual()
        if (this.n4) this.n4.updateVisual()
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