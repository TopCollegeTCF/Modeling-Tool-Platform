import { Tool } from './Tool.js';
import * as THREE from 'three';

export class RotateTool extends Tool {
    constructor(editor) {
        super(editor);
        this.name = 'Rotate';
        this.icon = '🔄';
        this.shortcut = '4';
        
        this.isDragging = false;
        this.startAngle = 0;
        this.startPoint = new THREE.Vector3();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }
    
    onActivate() {
        this.editor.getRenderer().domElement.style.cursor = 'pointer';
    }
    
    onMouseDown(event) {
        const selected = this.editor.selectionManager.getSelected();
        if (!selected) return;
        
        const renderer = this.editor.getRenderer();
        const camera = this.editor.getCamera();
        const rect = renderer.domElement.getBoundingClientRect();
        
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, camera);
        
        // Плоскость на уровне объекта
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), selected.position.y);
        const point = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(plane, point);
        
        if (point) {
            this.isDragging = true;
            this.startPoint.copy(point);
            this.startAngle = selected.rotation.y;
        }
    }
    
    onMouseMove(event) {
        if (!this.isDragging) return;
        
        const selected = this.editor.selectionManager.getSelected();
        if (!selected) return;
        
        const renderer = this.editor.getRenderer();
        const camera = this.editor.getCamera();
        const rect = renderer.domElement.getBoundingClientRect();
        
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, camera);
        
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), selected.position.y);
        const point = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(plane, point);
        
        if (point) {
            const delta = point.x - this.startPoint.x;
            selected.rotation.y = this.startAngle + delta * 0.02;
            this.editor.uiManager.updateUI();
        }
    }
    
    onMouseUp(event) {
        this.isDragging = false;
    }
}