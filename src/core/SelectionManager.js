export class SelectionManager {
    constructor() {
        this.selected = null;
        this.previous = null;
        this.listeners = [];
    }
    
    select(entity) {
        // Отменяем выделение предыдущего
        if (this.selected) {
            this.selected.deselect?.();
        }
        
        this.previous = this.selected;
        this.selected = entity;
        
        // Выделяем новый
        if (this.selected) {
            this.selected.select?.();
        }
        
        this.notifyListeners();
    }
    
    getSelected() {
        return this.selected;
    }
    
    clear() {
        if (this.selected) {
            this.selected.deselect?.();
        }
        this.selected = null;
        this.notifyListeners();
    }
    
    hasSelection() {
        return this.selected !== null;
    }
    
    addListener(callback) {
        this.listeners.push(callback);
    }
    
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.selected));
    }
}