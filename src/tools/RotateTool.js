import { Tool } from './Tool.js';

export class RotateTool extends Tool {
    constructor(editor) {
        super(editor);
        this.name = 'Rotate';
        this.icon = '🔄';
        this.shortcut = '4';
        this.gizmoService = null;
        this.snapAngle = Math.PI / 8; // 22.5 градусов по умолчанию
    }

    onActivate() {
        console.log('🔧 Rotate Tool activated');
        this.editor.getRenderer().domElement.style.cursor = 'pointer';
        
        if (!this.gizmoService) {
            this.gizmoService = this.editor.gizmoService;
        }

        if (!this.gizmoService) {
            console.error('❌ GizmoService not found');
            return;
        }

        // Устанавливаем режим Rotate с привязкой
        this.gizmoService.setMode('rotate');
        this.gizmoService.setRotationSnap(this.snapAngle);

        const selected = this.editor.selectionManager.getSelected();
        if (selected) {
            this.gizmoService.attach(selected);
        } else {
            this.gizmoService.detach();
        }
    }

    onDeactivate() {
        console.log('🔧 Rotate Tool deactivated');
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
            // Восстанавливаем привязку
            this.gizmoService?.setRotationSnap(this.snapAngle);
        } else {
            this.gizmoService?.detach();
        }
    }

    // Установка привязки углов
    setSnapAngle(degrees) {
        this.snapAngle = degrees * Math.PI / 180;
        if (this.gizmoService) {
            this.gizmoService.setRotationSnap(this.snapAngle);
        }
    }
}