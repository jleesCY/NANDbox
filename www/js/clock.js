/*
    Clock Component
    Auto-toggling input that cycles between high and low at a configurable rate.
    Essential for driving flip-flops.
*/

class Clock {
    constructor(x, y, dom) {
        this.type = 'clock'
        this.dom = dom
        this.x = x
        this.y = y
        this.out = []
        this.nOut = null
        this.selected = false
        this.value = false
        this.period = 30        // Toggle every N engine ticks (30 = ~0.5s at 60Hz)
        this.tickCounter = 0
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

    //
    // ----- ENGINE INTERFACE -----
    //

    /**
     * Evaluate: auto-toggle and write to output
     */
    evaluate() {
        this.tickCounter++
        if (this.tickCounter >= this.period) {
            this.tickCounter = 0
            this.value = !this.value
        }

        if (this.nOut) {
            this.nOut.value = this.value
        }
    }

    /**
     * Update visuals
     */
    updateVisuals() {
        // No-op
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
    enablePress = () => {}
    disablePress = () => {}
    toggleRunning = () => {}
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
}
