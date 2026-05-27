class Connector {
    constructor(type, loc, parent) {
        this.type = type        // 'in' or 'out'
        this.loc = loc          // e.g. 'n1', 'n2', 'nOut', 'nQ', 'nQNot'
        this.parent = parent
        this.selected = false
        this.value = null       // true = high, false = low, null = floating
        this.localX = 0         // Default, needs to be set by parent
        this.localY = 0
    }

    //
    // ----- GETTERS -----
    //
    get getDom() {
        return null // Legacy support
    }

    //
    // ----- SETTERS -----
    //
    set setDom(d) {
        // No-op for legacy support
    }

    //
    // ----- STATE -----
    //
    updateVisual() {
        // No-op. Rendering reads value directly.
    }

    select = () => {
        this.selected = true
    }
    
    deselect = () => {
        this.selected = false
    }
}