import { SelectTool } from './SelectTool.js';
import { MoveTool } from './MoveTool.js';
import { ScaleTool } from './ScaleTool.js';
import { RotateTool } from './RotateTool.js';
import { DuplicateTool } from './DuplicateTool.js';
import { StencilTool } from './StencilTool.js';

export class ToolManager {
    constructor(editor) {
        this.editor = editor;
        this.tools = new Map();
        this.currentTool = null;
        this.previousTool = null;
    }

    init() {
        // Регистрируем все инструменты
        this.registerTool('select', new SelectTool(this.editor));
        this.registerTool('move', new MoveTool(this.editor));
        this.registerTool('scale', new ScaleTool(this.editor));
        this.registerTool('rotate', new RotateTool(this.editor));
        this.registerTool('duplicate', new DuplicateTool(this.editor));
        this.registerTool('stencil', new StencilTool(this.editor));

        // Активируем select по умолчанию
        this.switchTool('select');

        // Подписываемся на изменения выделения
        this.editor.selectionManager.addListener((entity) => {
            if (this.currentTool && this.currentTool.onSelectionChanged) {
                this.currentTool.onSelectionChanged(entity);
            }
        });

        console.log('✅ ToolManager initialized with Duplicate support');
    }

    registerTool(name, tool) {
        tool.name = name;
        this.tools.set(name, tool);
    }

    switchTool(name) {
        // Сохраняем предыдущий инструмент
        this.previousTool = this.currentTool;

        // Деактивируем текущий
        if (this.currentTool) {
            this.currentTool.deactivate();
        }

        // Активируем новый
        const tool = this.tools.get(name);
        if (tool) {
            this.currentTool = tool;
            tool.activate();
            console.log(`🔧 Tool: ${name}`);
        } else {
            console.warn(`Tool "${name}" not found`);
        }
    }

    getCurrentTool() {
        return this.currentTool;
    }

    getTool(name) {
        return this.tools.get(name);
    }

    update() {
        if (this.currentTool) {
            this.currentTool.onUpdate();
        }
    }

    // Прокси событий к текущему инструменту
    handleEvent(event, type) {
        if (!this.currentTool) return;
        
        switch (type) {
            case 'mousedown':
                this.currentTool.onMouseDown(event);
                break;
            case 'mousemove':
                this.currentTool.onMouseMove(event);
                break;
            case 'mouseup':
                this.currentTool.onMouseUp(event);
                break;
            case 'keydown':
                this.currentTool.onKeyDown(event);
                break;
            case 'keyup':
                this.currentTool.onKeyUp(event);
                break;
        }
    }
}