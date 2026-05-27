class Label {
    x = 0
    y = 0
    dom = null
    selected = false
    editable = false
    type = 'label'
    constructor(x,y,dom) {
        this.x = x
        this.y = y
        this.dom = dom
        this.selected = false
        this.editable = false
        this.type = 'label'
    }

    //
    // ----- GETTERS -----
    //


    //
    // ----- SETTERS -----
    //


    //
    // ----- OTHER -----
    //
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
    enableEdit = () => {
        this.editable = false
    }
    disableEdit = () => {
        this.editable = false
    }
}