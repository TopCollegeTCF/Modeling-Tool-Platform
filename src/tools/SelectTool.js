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
    }
    
    onActivate() {
        // Смена курсора
        this.editor.getRenderer().domElement.style.cursor = 'default';
    }
    
    onMouseDown(event) {
        const renderer = this.editor.getRenderer();
        const camera = this.editor.getCamera();
        const rect = renderer.domElement.getBoundingClientRect();
        
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, camera);
        
        const objects = this.editor.sceneManager.getAllEntities();
        const intersects = this.raycaster.intersectObjects(objects);
        
        if (intersects.length > 0) {
            const selected = intersects[0].object;
            this.editor.selectionManager.select(selected);
            this.editor.uiManager.updateUI();
        } else {
            this.editor.selectionManager.clear();
            this.editor.uiManager.updateUI();
        }
    }
}