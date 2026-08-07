export class EventManager {
    constructor() {
        this.events = {};
        this.target = null;
        this.toolManager = null; // Добавляем ссылку на ToolManager
    }

    init(target, toolManager) {
        this.target = target;
        this.toolManager = toolManager; // Сохраняем ссылку

        // Mouse events - теперь передаем в инструменты
        target.addEventListener('mousedown', (e) => {
            this.emit('mousedown', e);
            // Передаем событие в текущий инструмент
            if (this.toolManager) {
                this.toolManager.handleEvent(e, 'mousedown');
            }
        });
        
        target.addEventListener('mousemove', (e) => {
            this.emit('mousemove', e);
            if (this.toolManager) {
                this.toolManager.handleEvent(e, 'mousemove');
            }
        });
        
        target.addEventListener('mouseup', (e) => {
            this.emit('mouseup', e);
            if (this.toolManager) {
                this.toolManager.handleEvent(e, 'mouseup');
            }
        });
        
        target.addEventListener('click', (e) => {
            this.emit('click', e);
        });
        
        target.addEventListener('dblclick', (e) => {
            this.emit('dblclick', e);
        });
        
        target.addEventListener('wheel', (e) => {
            this.emit('wheel', e);
        });
        
        target.addEventListener('contextmenu', (e) => {
            this.emit('contextmenu', e);
        });

        // Keyboard events
        window.addEventListener('keydown', (e) => {
            this.emit('keydown', e);
            if (this.toolManager) {
                this.toolManager.handleEvent(e, 'keydown');
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.emit('keyup', e);
            if (this.toolManager) {
                this.toolManager.handleEvent(e, 'keyup');
            }
        });

        // Window events
        window.addEventListener('resize', (e) => {
            this.emit('resize', e);
        });
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }

    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event ${event}:`, error);
            }
        });
    }

    once(event, callback) {
        const wrapper = (data) => {
            callback(data);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }
}