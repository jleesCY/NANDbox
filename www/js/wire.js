class Wire {
    constructor(id, n1, n2, drives) {
        this.id = id
        this.n1 = n1          // Source connector
        this.n2 = n2          // Destination connector
        this.drives = drives  // Component driven by this wire
        this.value = null
        this.dom = null       // SVG element
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
        if (this.value === null) return '#2ecc71'   // Green for floating
        if (this.value) return '#ff4b4b'            // Red for high
        return '#636e7a'                            // Gray for low
    }

    /**
     * Update wire visual color based on signal value
     */
    updateVisual = () => {
        if (!this.dom) return
        // The visual path is the one with class 'wire-path'
        let path = this.dom.querySelector('.wire-path')
        // Fallback for older saved wires before class was added
        if (!path) {
            let paths = this.dom.querySelectorAll('path')
            path = paths.length > 1 ? paths[1] : paths[0]
        }
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
     * Get the list of points defining the wire's path.
     * Incorporates custom bends if set, otherwise computes standard Manhattan routing.
     */
    getPoints = (scale) => {
        let p1 = this._getConnectorPos(this.n1.dom, scale)
        let p2 = this._getConnectorPos(this.n2.dom, scale)

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
                 // For a single bend, ensure it maintains a right angle
                 if (Math.abs(b0.x - p1.x) < 3) b0.y = p2.y
                 else b0.x = p2.x
            }

            return [p1, ...adjusted, p2]
        }

        let dx = p2.x - p1.x
        let dy = p2.y - p1.y
        let snapDist = 10

        if (Math.abs(dy) < snapDist) {
            return [p1, { x: p2.x, y: p1.y }, p2]
        }

        if (Math.abs(dx) < snapDist) {
            return [p1, { x: p1.x, y: p2.y }, p2]
        }

        let midX = p1.x + dx / 2
        return [p1, { x: midX, y: p1.y }, { x: midX, y: p2.y }, p2]
    }

    /**
     * Update the visual path and bounding box without recreating the DOM elements.
     * Prevents flickering during drag operations.
     */
    updatePath = (scale) => {
        if (!this.dom) return
        
        let pts = this.getPoints(scale)
        let pathD = `M ${pts[0].x} ${pts[0].y}`
        let minX = pts[0].x, minY = pts[0].y, maxX = pts[0].x, maxY = pts[0].y

        for (let i = 1; i < pts.length; i++) {
            pathD += ` L ${pts[i].x} ${pts[i].y}`
            minX = Math.min(minX, pts[i].x)
            minY = Math.min(minY, pts[i].y)
            maxX = Math.max(maxX, pts[i].x)
            maxY = Math.max(maxY, pts[i].y)
        }

        minX -= 15; minY -= 15; maxX += 15; maxY += 15
        let w = maxX - minX
        let h = maxY - minY

        this.dom.setAttribute('style',
            'position:absolute;' +
            'left:' + minX + 'px;' +
            'top:' + minY + 'px;' +
            'width:' + w + 'px;' +
            'height:' + h + 'px;' +
            'overflow:visible;' +
            'pointer-events:none;' +
            'z-index:1;')
        this.dom.setAttribute('viewBox', minX + ' ' + minY + ' ' + w + ' ' + h)

        let paths = this.dom.querySelectorAll('path')
        if (paths.length >= 2) {
            paths[0].setAttribute('d', pathD)
            paths[1].setAttribute('d', pathD)
        } else if (paths.length === 1) {
            paths[0].setAttribute('d', pathD)
        }
    }

    /**
     * Render the wire as an SVG element with a right-angle path
     */
    render = (scale) => {
        let pts = this.getPoints(scale)
        let color = this._getColor()

        let pathD = `M ${pts[0].x} ${pts[0].y}`
        let minX = pts[0].x, minY = pts[0].y, maxX = pts[0].x, maxY = pts[0].y

        for (let i = 1; i < pts.length; i++) {
            pathD += ` L ${pts[i].x} ${pts[i].y}`
            minX = Math.min(minX, pts[i].x)
            minY = Math.min(minY, pts[i].y)
            maxX = Math.max(maxX, pts[i].x)
            maxY = Math.max(maxY, pts[i].y)
        }

        // Calculate SVG viewBox bounds with extra padding for hit area
        minX -= 15; minY -= 15; maxX += 15; maxY += 15
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

        let hitPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        hitPath.setAttribute('d', pathD)
        hitPath.setAttribute('stroke', 'rgba(255, 255, 255, 0)') // Use rgba with 0 alpha to prevent color bleed
        hitPath.setAttribute('stroke-width', '15')
        hitPath.setAttribute('fill', 'none')
        hitPath.style.pointerEvents = 'stroke'
        hitPath.style.cursor = 'pointer'
        hitPath.classList.add('wire-hit')
        hitPath.dataset.wireId = this.id

        let path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttribute('d', pathD)
        path.setAttribute('stroke', color)
        path.setAttribute('stroke-width', '3')
        path.setAttribute('fill', 'none')
        path.setAttribute('stroke-linejoin', 'round')
        path.setAttribute('stroke-linecap', 'round')
        path.style.transition = 'stroke 0.15s ease'
        path.style.pointerEvents = 'none'
        path.classList.add('wire-path')

        svg.appendChild(hitPath)
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