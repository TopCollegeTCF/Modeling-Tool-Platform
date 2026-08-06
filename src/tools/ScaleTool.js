import { Tool } from './Tool.js';
import * as THREE from 'three';

export class ScaleTool extends Tool {
    constructor(editor) {
        super(editor);
        this.name = 'Scale';
        this.icon = '⬛';
        this.shortcut = '3';
        
        this.isDragging = false;
        this.startScale = new THREE.Vector3(1, 1, 1);
        this.startPoint = new THREE.Vector3();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
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
        
        const point = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(this.plane, point);
        
        if (point) {
            this.isDragging = true;
            this.startPoint.copy(point);
            this.startScale.copy(selected.scale);
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
            const delta = point.distanceTo(this.startPoint) * 0.02;
            const factor = 1 + delta;
            const scale = Math.max(0.01, this.startScale.x * factor);
            selected.scale.set(scale, scale, scale);
            this.editor.uiManager.updateUI();
        }
    }
    
    onMouseUp(event) {
        this.isDragging = false;
    }
}