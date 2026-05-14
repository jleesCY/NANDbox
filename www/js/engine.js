/*
    Simulation Engine
    Tick-based evaluation loop that replaces recursive signal propagation.
    All components are evaluated in dependency order each tick.
*/

class SimulationEngine {
    constructor() {
        this.components = {}      // All registered components by ID
        this.wires = {}           // All registered wires by ID
        this.connectors = {}      // All registered connectors by ID
        this.running = false
        this.tickRate = 60        // Ticks per second
        this.tickCount = 0
        this._frameId = null
        this._lastTime = 0
        this._accumulator = 0
    }

    /**
     * Register a component with the engine
     */
    registerComponent(id, component) {
        this.components[id] = component
    }

    /**
     * Unregister a component
     */
    unregisterComponent(id) {
        delete this.components[id]
    }

    /**
     * Register a wire with the engine
     */
    registerWire(id, wire) {
        this.wires[id] = wire
    }

    /**
     * Unregister a wire
     */
    unregisterWire(id) {
        delete this.wires[id]
    }

    /**
     * Register a connector
     */
    registerConnector(id, connector) {
        this.connectors[id] = connector
    }

    /**
     * Unregister a connector
     */
    unregisterConnector(id) {
        delete this.connectors[id]
    }

    /**
     * Perform a single simulation tick:
     * 1. Propagate wire values from source connectors
     * 2. Evaluate all components (compute new outputs from current inputs)
     * 3. Update all component visuals
     */
    tick() {
        // Phase 1: Propagate wire values — each wire reads from its source connector
        for (let id of Object.keys(this.wires)) {
            let wire = this.wires[id]
            if (wire && wire.n1) {
                wire.value = wire.n1.value
            }
        }

        // Phase 2: Evaluate all components
        for (let id of Object.keys(this.components)) {
            let comp = this.components[id]
            if (comp && typeof comp.evaluate === 'function') {
                comp.evaluate()
            }
        }

        // Phase 3: Update visuals for all components
        for (let id of Object.keys(this.components)) {
            let comp = this.components[id]
            if (comp && typeof comp.updateVisuals === 'function') {
                comp.updateVisuals()
            }
        }

        // Phase 4: Update wire visuals
        for (let id of Object.keys(this.wires)) {
            let wire = this.wires[id]
            if (wire && typeof wire.updateVisual === 'function') {
                wire.updateVisual()
            }
        }

        this.tickCount++
    }

    /**
     * Start the simulation loop
     */
    start() {
        if (this.running) return
        this.running = true
        this._lastTime = performance.now()
        this._accumulator = 0
        this._loop()
    }

    /**
     * Stop the simulation loop
     */
    stop() {
        this.running = false
        if (this._frameId) {
            cancelAnimationFrame(this._frameId)
            this._frameId = null
        }
    }

    /**
     * Execute a single step (for debugging / manual mode)
     */
    step() {
        this.tick()
    }

    /**
     * Internal animation loop
     */
    _loop() {
        if (!this.running) return

        const now = performance.now()
        const dt = now - this._lastTime
        this._lastTime = now
        this._accumulator += dt

        const tickInterval = 1000 / this.tickRate

        // Process accumulated ticks (cap to prevent spiral of death)
        let maxTicks = 4
        while (this._accumulator >= tickInterval && maxTicks > 0) {
            this.tick()
            this._accumulator -= tickInterval
            maxTicks--
        }

        this._frameId = requestAnimationFrame(() => this._loop())
    }

    /**
     * Clear all registered entities
     */
    clear() {
        this.components = {}
        this.wires = {}
        this.connectors = {}
        this.tickCount = 0
    }
}
