class Connector {
    constructor(type, loc, dom, parent) {
        this.type = type        // 'in' or 'out'
        this.loc = loc          // e.g. 'n1', 'n2', 'nOut', 'nQ', 'nQNot'
        this.dom = dom
        this.parent = parent
        this.selected = false
        this.value = null       // true = high, false = low, null = floating
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
        if (this.value === null) {
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
        this.dom.style.transform = "scale(1.3)"
    }
    unenlarge = () => {
        this.dom.style.transform = "scale(1)"
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
        this.dom.classList.remove('off')
        this.dom.classList.remove('float')
        this.dom.classList.add('on')
    }
    off = () => {
        this.dom.classList.remove('on')
        this.dom.classList.remove('float')
        this.dom.classList.add('off')
    }
    float = () => {
        this.dom.classList.remove('on')
        this.dom.classList.remove('off')
        this.dom.classList.add('float')
    }
}