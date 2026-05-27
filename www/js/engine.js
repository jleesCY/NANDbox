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
        this._netsDirty = true
        this.cachedNets = {} // Map of root ID -> { drivers: [], receivers: [], wires: [] }
    }

    /**
     * Register a component with the engine
     */
    registerComponent(id, component) {
        this.components[id] = component
        // Auto-register all known connector properties from the component
        const cProps = ['n1', 'n2', 'n3', 'n4', 'nC', 'nOut', 'nQ', 'nQNot', 'n']
        for (let prop of cProps) {
            if (component[prop]) {
                this.registerConnector(component[prop].id, component[prop])
            }
        }
    }

    /**
     * Unregister a component
     */
    unregisterComponent(id) {
        let component = this.components[id]
        if (component) {
            const cProps = ['n1', 'n2', 'n3', 'n4', 'nC', 'nOut', 'nQ', 'nQNot', 'n']
            for (let prop of cProps) {
                if (component[prop]) {
                    this.unregisterConnector(component[prop].id)
                }
            }
        }
        delete this.components[id]
    }

    /**
     * Register a connector
     */
    registerConnector(id, connector) {
        this.connectors[id] = connector
        this._netsDirty = true
    }

    /**
     * Unregister a connector
     */
    unregisterConnector(id) {
        delete this.connectors[id]
        this._netsDirty = true
    }

    /**
     * Register a wire with the engine
     */
    registerWire(id, wire) {
        this.wires[id] = wire
        this._netsDirty = true
    }

    /**
     * Unregister a wire
     */
    unregisterWire(id) {
        delete this.wires[id]
        this._netsDirty = true
    }

    /**
     * Rebuild the topological nets cache
     */
    _rebuildNets() {
        let parent = {}
        function find(i) {
            if (parent[i] === undefined) return i;
            if (parent[i] === i) return i;
            return parent[i] = find(parent[i]);
        }
        function union(i, j) {
            let rootI = find(i);
            let rootJ = find(j);
            if (rootI !== rootJ) parent[rootI] = rootJ;
        }

        // Connect wire endpoints
        for (let wId in this.wires) {
            let wire = this.wires[wId];
            if (wire && wire.n1 && wire.n2) {
                union(wire.n1.id, wire.n2.id);
            }
        }

        // Connect junction points internally
        for (let id of Object.keys(this.components)) {
            let comp = this.components[id];
            if (comp && (comp.type === 'junction' || comp.type === 'junc3' || comp.type === 'junc4')) {
                if (comp.n1 && comp.n2) union(comp.n1.id, comp.n2.id);
                if (comp.n1 && comp.n3) union(comp.n1.id, comp.n3.id);
                if (comp.n1 && comp.n4) union(comp.n1.id, comp.n4.id);
            }
        }

        this.cachedNets = {}
        for (let cId in this.connectors) {
            let conn = this.connectors[cId];
            if (conn) {
                let root = find(cId);
                if (!this.cachedNets[root]) {
                    this.cachedNets[root] = { drivers: [], receivers: [], wires: [] };
                }
                if (conn.type === 'out') {
                    this.cachedNets[root].drivers.push(conn);
                }
                // All connectors are technically receivers of the net value
                this.cachedNets[root].receivers.push(conn);
            }
        }

        for (let wId in this.wires) {
            let wire = this.wires[wId];
            if (wire && wire.n1) {
                let root = find(wire.n1.id);
                if (!this.cachedNets[root]) {
                    this.cachedNets[root] = { drivers: [], receivers: [], wires: [] };
                }
                this.cachedNets[root].wires.push(wire);
            }
        }
    }

    /**
     * Perform a single simulation tick:
     * 1. Propagate wire values from source connectors using a net-based solver
     * 2. Evaluate all components (compute new outputs from current inputs)
     * 3. Update all component visuals
     */
    tick() {
        // Phase 1: Resolve Nets
        if (this._netsDirty) {
            this._rebuildNets();
            this._netsDirty = false;
        }

        for (let root in this.cachedNets) {
            let net = this.cachedNets[root];
            let hasHigh = false;
            let hasLow = false;
            let hasShort = false;
            let isDriven = false;

            for (let driver of net.drivers) {
                if (driver.value !== null && driver.value !== undefined) {
                    isDriven = true;
                    if (driver.value === 'short') hasShort = true;
                    else if (driver.value === true) hasHigh = true;
                    else if (driver.value === false) hasLow = true;
                }
            }

            let netValue = null;
            if (isDriven) {
                if (hasShort || (hasHigh && hasLow)) netValue = 'short';
                else if (hasHigh) netValue = true;
                else netValue = false;
            }

            for (let receiver of net.receivers) {
                receiver.value = netValue;
            }
            for (let wire of net.wires) {
                wire.value = netValue;
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
        this._netsDirty = true
        this.cachedNets = {}
    }
}
