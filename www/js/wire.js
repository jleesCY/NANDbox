class Wire {
    constructor(id, n1, n2, drives) {
        this.id = id
        this.n1 = n1          // Source connector
        this.n2 = n2          // Destination connector
        this.drives = drives  // Component driven by this wire
        this.value = null
        this.bends = null     // Array of {x, y} points
    }

    //
    // ----- GETTERS -----
    //
    get getValue() {
        return this.value
    }
    get getN1() {
        return this.n1
    }
    get getN2() {
        return this.n2
    }
    get getDrives() {
        return this.drives
    }

    //
    // ----- SETTERS -----
    //
    set setValue(v) {
        this.value = v
    }

    /**
     * Get the signal color based on current value
     */
    _getColor() {
        if (this.value === 'short') return '#e38520' // var(--signal-short)
        if (this.value === null) return '#7a859c'    // var(--signal-float)
        if (this.value) return '#e35050'             // var(--signal-high)
        return '#494f5c'                             // var(--signal-low)
    }

    /**
     * Update wire visual color based on signal value
     */
    updateVisual = () => {
        // No-op for canvas refactor, rendering loop reads _getColor directly
    }

    /**
     * Get center position of a connector
     */
    _getConnectorPos = (connector) => {
        let comp = connector.parent
        let cx = (comp.x || 0) + (connector.localX || 0)
        let cy = (comp.y || 0) + (connector.localY || 0)
        
        if (comp.rotation && typeof getCompDims === 'function') {
            let dims = getCompDims(comp.type);
            let originX = (comp.x || 0) + dims.w / 2;
            let originY = (comp.y || 0) + dims.h / 2;
            let angle = comp.rotation * Math.PI / 180;
            let dx = cx - originX;
            let dy = cy - originY;
            cx = originX + dx * Math.cos(angle) - dy * Math.sin(angle);
            cy = originY + dx * Math.sin(angle) + dy * Math.cos(angle);
        }
        
        // GRID is globally available (usually 10)
        let grid = typeof GRID !== 'undefined' ? GRID : 10;
        return {
            x: Math.round(cx / grid) * grid,
            y: Math.round(cy / grid) * grid
        }
    }

    /**
     * Get the list of points defining the wire's path.
     * Incorporates custom bends if set, otherwise computes standard Manhattan routing.
     */
    getPoints = () => {
        let p1 = this._getConnectorPos(this.n1)
        let p2 = this._getConnectorPos(this.n2)

        if (this.bends && this.bends.length > 0) {
            // Work on copies to avoid mutating stored bends
            let adjusted = this.bends.map(b => ({x: b.x, y: b.y}))

            // Auto-align the first bend to p1 to maintain orthogonal line
            let b0 = adjusted[0]
            if (adjusted.length > 1) {
                let b1 = adjusted[1]
                if (Math.abs(b0.x - b1.x) < 3) {
                    b0.y = p1.y // b0-b1 is vertical, align b0 horizontally to p1
                } else {
                    b0.x = p1.x // b0-b1 is horizontal, align b0 vertically to p1
                }
            }

            // Auto-align the last bend to p2 to maintain orthogonal line
            let bLast = adjusted[adjusted.length - 1]
            if (adjusted.length > 1) {
                let bPrev = adjusted[adjusted.length - 2]
                if (Math.abs(bLast.x - bPrev.x) < 3) {
                    bLast.y = p2.y
                } else {
                    bLast.x = p2.x
                }
            } else if (adjusted.length === 1) {
                 // For a single bend, it forms an L-shape with p1 and p2.
                 // Check which coordinate of the bend matches p2 to determine orientation.
                 if (Math.abs(b0.x - p2.x) < 3) {
                     b0.x = p2.x
                     b0.y = p1.y
                 } else {
                     b0.x = p1.x
                     b0.y = p2.y
                 }
            }

            return [p1, ...adjusted, p2]
        }

        // Default: single 90-degree L-turn (horizontal first, then vertical)
        if (p1.x === p2.x || p1.y === p2.y) {
            // Already aligned — straight line
            return [p1, p2]
        }
        // L-shaped: go horizontal from source, then vertical to destination
        return [p1, { x: p2.x, y: p1.y }, p2]
    }

    updatePath = () => {
        // No-op. Rendering reads getPoints directly.
    }

    render = () => {
        // No-op. Handled by CanvasRenderer.
    }

    select = () => {
        this.selected = true
    }

    deselect = () => {
        this.selected = false
    }

    delete = () => {
        // No DOM manipulation needed
    }
}