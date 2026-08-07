import { Tool } from './Tool.js';

export class MoveTool extends Tool {
    constructor(editor) {
        super(editor);
        this.name = 'Move';
        this.icon = '✚';
        this.shortcut = '2';
        this.gizmoService = null;
        this.snapDistance = 0.1;
    }

    onActivate() {
        console.log('🔧 Move Tool activated');
        this.editor.getRenderer().domElement.style.cursor = 'move';
        
        if (!this.gizmoService) {
            this.gizmoService = this.editor.gizmoService;
        }

        if (!this.gizmoService) {
            console.error('❌ GizmoService not found');
            return;
        }

        // Устанавливаем режим Move с привязкой
        this.gizmoService.setMode('translate');
        this.gizmoService.setTranslationSnap(this.snapDistance);

        const selected = this.editor.selectionManager.getSelected();
        if (selected) {
            this.gizmoService.attach(selected);
        } else {
            this.gizmoService.detach();
        }
    }

    onDeactivate() {
        console.log('🔧 Move Tool deactivated');
        if (this.gizmoService) {
            this.gizmoService.detach();
        }
        this.editor.getRenderer().domElement.style.cursor = 'default';
    }

    onUpdate() {
        if (this.gizmoService) {
            this.gizmoService.update();
        }
    }

    onSelectionChanged(entity) {
        if (!this.isActive) return;
        
        if (entity) {
            this.gizmoService?.attach(entity);
            this.gizmoService?.setTranslationSnap(this.snapDistance);
        } else {
            this.gizmoService?.detach();
        }
    }

    setSnapDistance(value) {
        this.snapDistance = value;
        if (this.gizmoService) {
            this.gizmoService.setTranslationSnap(value);
        }
    }
}