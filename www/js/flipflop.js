/*
    Flip-Flop Component
    Supports JK and T flip-flops with proper edge-triggered behavior.
    Implements evaluate/updateVisuals pattern for the tick-based engine.
*/

class FlipFlop {
    constructor(type, x, y, dom) {
        this.type = type
        this.dom = dom
        this.x = x
        this.y = y

        // Input wires
        this.in1 = null         // J (for JK) or T (for T)
        this.in2 = null         // K (for JK) — same as in1 for T
        this.in3 = null         // Clock

        // Output wire arrays
        this.qOut = []          // Wires from Q output
        this.qNotOut = []       // Wires from Q̄ output

        // Connectors
        this.n1 = null          // J / T input connector
        this.n2 = null          // K input connector (JK only)
        this.nC = null          // Clock input connector
        this.nQ = null          // Q output connector
        this.nQNot = null       // Q̄ output connector

        // Internal state
        this.q = false          // Current Q state
        this.prevClock = null   // Previous clock value for edge detection
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
        return this.dom.children[1].children[0]
    }
    get getN1() {
        return this.n1
    }
    get getN2() {
        return this.n2
    }
    get getNOut() {
        // For compatibility — returns Q connector
        return this.nQ
    }
    get getOut() {
        return this.qOut
    }

    //
    // ----- SETTERS -----
    //
    set addOut(wire) {
        // Determine which output the wire is connected to
        // by checking the wire's source connector
        if (wire.n1 === this.nQNot) {
            this.qNotOut.push(wire)
        } else {
            this.qOut.push(wire)
        }
    }

    //
    // ----- ENGINE INTERFACE -----
    //

    /**
     * Evaluate: compute next Q state based on inputs and clock edge
     */
    evaluate() {
        // Read input values
        let clockVal = (this.in3 !== null) ? this.in3.getValue : null

        // Detect rising edge of clock
        let risingEdge = (this.prevClock === false && clockVal === true)
        this.prevClock = clockVal

        if (this.type === 'jkff') {
            let j = (this.in1 !== null) ? this.in1.getValue : null
            let k = (this.in2 !== null) ? this.in2.getValue : null

            if (risingEdge && j !== null && k !== null) {
                if (j && !k) {
                    this.q = true           // Set
                } else if (!j && k) {
                    this.q = false          // Reset
                } else if (j && k) {
                    this.q = !this.q        // Toggle
                }
                // j=0, k=0 → Hold (no change)
            }
        } else if (this.type === 'tff') {
            let t = (this.in1 !== null) ? this.in1.getValue : null

            if (risingEdge && t !== null) {
                if (t) {
                    this.q = !this.q        // Toggle
                }
                // t=0 → Hold (no change)
            }
        } else if (this.type === 'srff') {
            let s = (this.in1 !== null) ? this.in1.getValue : null
            let r = (this.in2 !== null) ? this.in2.getValue : null

            if (risingEdge && s !== null && r !== null) {
                if (s && !r) {
                    this.q = true           // Set
                } else if (!s && r) {
                    this.q = false          // Reset
                } else if (s && r) {
                    this.q = false          // Invalid state (strict SR: both 0 or handle error, we default to reset)
                }
                // s=0, r=0 → Hold
            }
        } else if (this.type === 'dff') {
            let d = (this.in1 !== null) ? this.in1.getValue : null

            if (risingEdge && d !== null) {
                this.q = d                  // Q follows D
            }
        }

        // Write Q and Q̄ to output connectors
        let qVal = this.q
        let qNotVal = !this.q

        // If clock has never been connected, outputs are floating
        if (clockVal === null) {
            qVal = null
            qNotVal = null
        }

        if (this.nQ) {
            this.nQ.value = qVal
        }
        if (this.nQNot) {
            this.nQNot.value = qNotVal
        }

        // Propagate to output wires
        for (let wire of this.qOut) {
            wire.value = qVal
        }
        for (let wire of this.qNotOut) {
            wire.value = qNotVal
        }
    }

    /**
     * Update visuals: apply current state to DOM
     */
    updateVisuals() {
        // Input connectors
        if (this.n1) {
            this.n1.value = (this.in1 !== null) ? this.in1.getValue : null
            this.n1.updateVisual()
        }
        if ((this.type === 'jkff' || this.type === 'srff') && this.n2 && this.n2 !== this.n1) {
            this.n2.value = (this.in2 !== null) ? this.in2.getValue : null
            this.n2.updateVisual()
        }
        if (this.nC) {
            this.nC.value = (this.in3 !== null) ? this.in3.getValue : null
            this.nC.updateVisual()
        }
        // Output connectors
        if (this.nQ) {
            this.nQ.updateVisual()
        }
        if (this.nQNot) {
            this.nQNot.updateVisual()
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