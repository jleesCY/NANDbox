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
        this.running = true
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
        if (this.running) {
            this.tickCounter++
            if (this.tickCounter >= this.period) {
                this.tickCounter = 0
                this.value = !this.value
            }
        }

        if (this.nOut) {
            this.nOut.value = this.value
        }
    }

    /**
     * Update visuals
     */
    updateVisuals() {
        if (this.nOut) {
            this.nOut.updateVisual()
        }
        // Update body visual
        let body = this.dom.children[0]
        if (this.value) {
            body.classList.remove('low')
            body.classList.add('high')
        } else {
            body.classList.remove('high')
            body.classList.add('low')
        }
        // Update pulse indicator
        let indicator = body.querySelector('.clock-pulse')
        if (indicator) {
            indicator.textContent = this.value ? '▲' : '▼'
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
        // Click to toggle running state
        this.dom.children[0].addEventListener('pointerup', this.toggleRunning)
    }
    disablePress = () => {
        this.dom.children[0].removeEventListener('pointerup', this.toggleRunning)
    }
    toggleRunning = () => {
        this.running = !this.running
        let body = this.dom.children[0]
        if (this.running) {
            body.classList.remove('paused')
        } else {
            body.classList.add('paused')
        }
    }
    on = () => {
        this.value = true
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
}
