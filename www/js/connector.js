class Connector {
    constructor(type, loc, dom, parent) {
        this.type = type        // 'in' or 'out'
        this.loc = loc          // e.g. 'n1', 'n2', 'nOut', 'nQ', 'nQNot'
        this.dom = dom
        this.parent = parent
        this.selected = false
        this.value = null       // true = high, false = low, null = floating
        this.lastVisualState = undefined // Cached visual state
        this.localX = undefined
        this.localY = undefined
    }

    /**
     * Cache the connector's position relative to its parent component's top-left origin.
     * This avoids costly layout thrashing during drag operations.
     */
    updateLocalOffset() {
        if (!this.dom || !this.parent || !this.parent.dom) return;
        let cRect = this.dom.getBoundingClientRect();
        let pRect = this.parent.dom.getBoundingClientRect();
        // Since getBoundingClientRect returns scaled pixels, we must unscale them
        let transform = typeof instance !== 'undefined' ? instance.getTransform() : { scale: 1 };
        let scale = transform.scale;
        
        this.localX = (cRect.left + cRect.width / 2 - pRect.left) / scale;
        this.localY = (cRect.top + cRect.height / 2 - pRect.top) / scale;
    }

    //
    // ----- GETTERS -----
    //
    get getDom() {
        return this.dom
    }

    //
    // ----- SETTERS -----
    //
    set setDom(d) {
        this.dom = d
    }

    //
    // ----- STATE -----
    //
    /**
     * Update the visual state of this connector based on its value
     */
    updateVisual() {
        if (this.value === this.lastVisualState) return;
        this.lastVisualState = this.value;

        if (this.value === 'short') {
            this.short()
        } else if (this.value === null) {
            this.float()
        } else if (this.value) {
            this.on()
        } else {
            this.off()
        }
    }

    //
    // ----- OTHER -----
    //
    select = () => {
        this.dom.classList.add('selected')
        this.selected = true
    }
    enlarge = () => {
        this.dom.style.transition = "0.075s"
        this.dom.style.boxShadow = "0 0 0 2px #000"
    }
    unenlarge = () => {
        this.dom.style.boxShadow = "none"
    }
    deselect = () => {
        this.dom.classList.remove('selected')
        this.selected = false
    }
    enableSelect = () => {
        this.dom.addEventListener('click', this.select)
        this.dom.addEventListener('mouseover', this.enlarge)
        this.dom.addEventListener('mouseout', this.unenlarge)
    }
    disableSelect = () => {
        this.dom.removeEventListener('click', this.select)
        this.dom.removeEventListener('mouseover', this.enlarge)
        this.dom.removeEventListener('mouseout', this.unenlarge)
    }
    on = () => {
        this.dom.classList.remove('off', 'float', 'short')
        this.dom.classList.add('on')
    }
    off = () => {
        this.dom.classList.remove('on', 'float', 'short')
        this.dom.classList.add('off')
    }
    float = () => {
        this.dom.classList.remove('on', 'off', 'short')
        this.dom.classList.add('float')
    }
    short = () => {
        this.dom.classList.remove('on', 'off', 'float')
        this.dom.classList.add('short')
    }
}