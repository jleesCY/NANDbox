class Wire {
    constructor(id, n1, n2, drives) {
        this.id = id
        this.n1 = n1          // Source connector
        this.n2 = n2          // Destination connector
        this.drives = drives  // Component driven by this wire
        this.value = null
        this.dom = null       // SVG element
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
        if (this.value === null) return '#2ecc71'   // Green for floating
        if (this.value) return '#ff4b4b'            // Red for high
        return '#636e7a'                            // Gray for low
    }

    /**
     * Update wire visual color based on signal value
     */
    updateVisual = () => {
        if (!this.dom) return
        let path = this.dom.querySelector('path')
        if (path) {
            path.setAttribute('stroke', this._getColor())
        }
    }

    /**
     * Get center position of a connector relative to the simulation window
     */
    _getConnectorPos = (el, scale) => {
        let simRect = sim.getBoundingClientRect()
        let rect = el.getBoundingClientRect()
        return {
            x: (rect.left + rect.width / 2 - simRect.left) / scale,
            y: (rect.top + rect.height / 2 - simRect.top) / scale
        }
    }

    /**
     * Build an SVG path string with right-angle (Manhattan) routing.
     * Goes horizontal from source, then vertical, then horizontal to dest.
     */
    _buildPath = (x1, y1, x2, y2) => {
        // Determine midpoint for the horizontal-vertical-horizontal route
        let dx = x2 - x1
        let dy = y2 - y1

        // If nearly horizontal or vertical, just do a simple L-shape
        if (Math.abs(dy) < 3) {
            // Nearly horizontal — straight line
            return `M ${x1} ${y1} L ${x2} ${y2}`
        }
        if (Math.abs(dx) < 3) {
            // Nearly vertical — straight line
            return `M ${x1} ${y1} L ${x2} ${y2}`
        }

        // Standard routing: go right from source, turn vertically, then turn to destination
        // Use a midpoint X between source and dest
        let midX = x1 + dx / 2

        return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`
    }

    /**
     * Render the wire as an SVG element with a right-angle path
     */
    render = (scale) => {
        let p1 = this._getConnectorPos(this.n1.dom, scale)
        let p2 = this._getConnectorPos(this.n2.dom, scale)

        let color = this._getColor()
        let pathD = this._buildPath(p1.x, p1.y, p2.x, p2.y)

        // Calculate SVG viewBox bounds with padding
        let minX = Math.min(p1.x, p2.x) - 10
        let minY = Math.min(p1.y, p2.y) - 10
        let maxX = Math.max(p1.x, p2.x) + 10
        let maxY = Math.max(p1.y, p2.y) + 10
        let w = maxX - minX
        let h = maxY - minY

        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('class', 'wire')
        svg.setAttribute('style',
            'position:absolute;' +
            'left:' + minX + 'px;' +
            'top:' + minY + 'px;' +
            'width:' + w + 'px;' +
            'height:' + h + 'px;' +
            'overflow:visible;' +
            'pointer-events:none;' +
            'z-index:1;')
        svg.setAttribute('viewBox', minX + ' ' + minY + ' ' + w + ' ' + h)

        let path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttribute('d', pathD)
        path.setAttribute('stroke', color)
        path.setAttribute('stroke-width', '3')
        path.setAttribute('fill', 'none')
        path.setAttribute('stroke-linejoin', 'round')
        path.setAttribute('stroke-linecap', 'round')
        path.style.transition = 'stroke 0.15s ease'

        svg.appendChild(path)
        this.dom = svg
        this.dom.id = this.id
    }

    delete = () => {
        if (this.dom && this.dom.parentElement) {
            this.dom.parentElement.removeChild(this.dom)
        }
    }
}