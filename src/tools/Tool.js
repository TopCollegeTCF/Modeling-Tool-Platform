export class Tool {
    constructor(editor) {
        this.editor = editor;
        this.isActive = false;
        this.name = 'tool';
        this.icon = '🔧';
        this.shortcut = '';
    }
    
    activate() {
        this.isActive = true;
        this.onActivate();
    }
    
    deactivate() {
        this.isActive = false;
        this.onDeactivate();
    }
    
    update() {
        if (this.isActive) {
            this.onUpdate();
        }
    }
    
    // Хуки для переопределения
    onActivate() {}
    onDeactivate() {}
    onUpdate() {}
    
    // События
    onMouseDown(event) {}
    onMouseMove(event) {}
    onMouseUp(event) {}
    onKeyDown(event) {}
    onKeyUp(event) {}
}