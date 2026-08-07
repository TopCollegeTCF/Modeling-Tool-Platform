import { Tool } from './Tool.js';
import * as THREE from 'three';

export class SelectTool extends Tool {
    constructor(editor) {
        super(editor);
        this.name = 'Select';
        this.icon = '⬆';
        this.shortcut = '1';
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Для box selection
        this.isBoxSelecting = false;
        this.startPoint = new THREE.Vector2();
        this.selectionBox = null;
    }

    onActivate() {
        this.editor.getRenderer().domElement.style.cursor = 'default';
        
        // Если активен Gizmo, отключаем его
        if (this.editor.gizmoService) {
            this.editor.gizmoService.detach();
        }
    }

    onDeactivate() {
        this.editor.getRenderer().domElement.style.cursor = 'default';
    }

    onMouseDown(event) {
        const renderer = this.editor.getRenderer();
        const camera = this.editor.getCamera();
        const rect = renderer.domElement.getBoundingClientRect();
        
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Начинаем box selection если зажат shift
        if (event.shiftKey) {
            this.isBoxSelecting = true;
            this.startPoint.set(event.clientX, event.clientY);
            this.createSelectionBox();
            return;
        }
        
        this.raycaster.setFromCamera(this.mouse, camera);
        
        // Исключаем хелперы и вспомогательные объекты
        const objects = this.editor.sceneManager.getAllEntities().filter(obj => {
            return !obj.userData.isHelper && obj.userData.isSelectable !== false;
        });
        
        const intersects = this.raycaster.intersectObjects(objects);
        
        if (intersects.length > 0) {
            const selected = intersects[0].object;
            this.editor.selectionManager.select(selected);
            
            // Если активен Gizmo, прикрепляем его
            if (this.editor.gizmoService) {
                this.editor.gizmoService.attach(selected);
            }
            
            this.editor.uiManager.updateUI();
        } else {
            this.editor.selectionManager.clear();
            if (this.editor.gizmoService) {
                this.editor.gizmoService.detach();
            }
            this.editor.uiManager.updateUI();
        }
    }

    onMouseMove(event) {
        if (!this.isBoxSelecting) return;
        
        // Обновляем box selection
        const currentPoint = new THREE.Vector2(event.clientX, event.clientY);
        const minX = Math.min(this.startPoint.x, currentPoint.x);
        const minY = Math.min(this.startPoint.y, currentPoint.y);
        const maxX = Math.max(this.startPoint.x, currentPoint.x);
        const maxY = Math.max(this.startPoint.y, currentPoint.y);
        
        if (this.selectionBox) {
            this.selectionBox.style.left = minX + 'px';
            this.selectionBox.style.top = minY + 'px';
            this.selectionBox.style.width = (maxX - minX) + 'px';
            this.selectionBox.style.height = (maxY - minY) + 'px';
        }
    }

    onMouseUp(event) {
        if (this.isBoxSelecting) {
            this.isBoxSelecting = false;
            this.removeSelectionBox();
            
            // Выделяем объекты в области
            this.selectInBox();
        }
    }

    createSelectionBox() {
        this.removeSelectionBox();
        
        this.selectionBox = document.createElement('div');
        this.selectionBox.style.cssText = `
            position: fixed;
            border: 1px solid #4a9eff;
            background: rgba(74, 158, 255, 0.1);
            pointer-events: none;
            z-index: 9999;
            display: none;
        `;
        
        document.body.appendChild(this.selectionBox);
        this.selectionBox.style.display = 'block';
    }

    removeSelectionBox() {
        if (this.selectionBox) {
            this.selectionBox.remove();
            this.selectionBox = null;
        }
    }

    selectInBox() {
        // TODO: Реализовать выделение в области
        // Для простоты пока пропускаем
        console.log('📦 Box selection completed');
    }
}