import { Tool } from './Tool.js';
import * as THREE from 'three';

export class MoveTool extends Tool {
    constructor(editor) {
        super(editor);
        this.name = 'Move';
        this.icon = '✚';
        this.shortcut = '2';
        
        this.isDragging = false;
        this.startPoint = new THREE.Vector3();
        this.offset = new THREE.Vector3();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }
    
    onActivate() {
        this.editor.getRenderer().domElement.style.cursor = 'move';
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
        
        // Находим точку пересечения с плоскостью
        const point = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.plane, point);
        
        if (point) {
            this.isDragging = true;
            this.startPoint.copy(point);
            this.offset.copy(selected.position).sub(point);
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
        
        const point = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.plane, point);
        
        if (point) {
            selected.position.copy(point.add(this.offset));
            this.editor.uiManager.updateUI();
        }
    }
    
    onMouseUp(event) {
        this.isDragging = false;
    }
}