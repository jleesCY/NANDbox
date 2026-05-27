/*
    Junction Components
    Passes a single input signal to multiple output paths.
    Junction3: 1 In, 2 Out (T-shape)
    Junction4: 1 In, 3 Out (Plus-shape)
*/

class Junction {
    constructor(type, x, y, dom) {
        this.type = type
        this.dom = dom
        this.x = x
        this.y = y
        
        // Input wire
        this.in1 = null

        // Connectors
        this.n1 = null // Input
        this.n2 = null // Output 1
        this.n3 = null // Output 2
        this.n4 = null // Output 3 (only for junc4)

        // Output wire arrays
        this.out2 = []
        this.out3 = []
        this.out4 = []

        this.selected = false
        this.value = null
    }

    // ----- GETTERS -----
    get getType() { return this.type }
    get getX() { return this.x }
    get getY() { return this.y }
    get getDom() { return this.dom }
    get getN1() { return this.n1 }
    get getNOut() { return this.n2 }

    // Input wire property
    get i1() { return this.in1 }
    set i1(wire) { this.in1 = wire }

    // ----- SETTERS -----
    set setX(x) { this.x = x }
    set setY(y) { this.y = y }
    
    set addOut(wire) {
        if (wire.n1 === this.n3) {
            this.out3.push(wire)
        } else if (wire.n1 === this.n4) {
            this.out4.push(wire)
        } else {
            this.out2.push(wire)
        }
    }

    // ----- ENGINE INTERFACE -----
    evaluate() {
        // Handled by the engine's net solver
    }

    updateVisuals() {
        // No-op
    }

    // ----- INTERACTION -----
    select = () => {
        this.selected = true
    }
    deselect = () => {
        this.selected = false
    }
    delete = () => {
        // No-op
    }
    enableSelect = () => {
        // No-op
    }
    disableSelect = () => {
        // No-op
    }
    enablePress = () => { }
    disablePress = () => { }
    enableEdit = () => { }
}
