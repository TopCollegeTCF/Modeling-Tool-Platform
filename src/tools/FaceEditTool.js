import { Tool } from './Tool.js';
import * as THREE from 'three';

export class FaceEditTool extends Tool {
    constructor(editor) {
        super(editor);
        this.name = 'Face Edit';
        this.icon = '▦';
        this.shortcut = '5';
        
        this.selectedFace = null;
        this.isDragging = false;
        this.startPoint = new THREE.Vector3();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.faceHelpers = [];
    }
    
    onActivate() {
        this.editor.getRenderer().domElement.style.cursor = 'pointer';
        this.showFaceHelpers();
    }
    
    onDeactivate() {
        this.hideFaceHelpers();
    }
    
    showFaceHelpers() {
        const selected = this.editor.selectionManager.getSelected();
        if (!selected || selected.type !== 'cube') return;
        
        this.hideFaceHelpers();
        
        const geometry = selected.geometry;
        const position = geometry.getAttribute('position');
        const faces = [];
        
        // Собираем грани
        for (let i = 0; i < position.count; i += 3) {
            const a = new THREE.Vector3(position.getX(i), position.getY(i), position.getZ(i));
            const b = new THREE.Vector3(position.getX(i+1), position.getY(i+1), position.getZ(i+1));
            const c = new THREE.Vector3(position.getX(i+2), position.getY(i+2), position.getZ(i+2));
            
            const center = new THREE.Vector3().add(a).add(b).add(c).divideScalar(3);
            const normal = new THREE.Vector3();
            const edge1 = new THREE.Vector3().copy(b).sub(a);
            const edge2 = new THREE.Vector3().copy(c).sub(a);
            normal.crossVectors(edge1, edge2).normalize();
            
            faces.push({ center, normal, vertices: [a, b, c] });
        }
        
        // Создаем хелперы для граней
        faces.forEach((face, index) => {
            const helper = new THREE.Mesh(
                new THREE.PlaneGeometry(0.3, 0.3),
                new THREE.MeshBasicMaterial({
                    color: 0x4a9eff,
                    transparent: true,
                    opacity: 0.5,
                    side: THREE.DoubleSide
                })
            );
            helper.position.copy(face.center);
            helper.lookAt(face.center.clone().add(face.normal));
            helper.userData.faceIndex = index;
            helper.userData.faceData = face;
            
            this.faceHelpers.push(helper);
            this.editor.getScene().add(helper);
        });
    }
    
    hideFaceHelpers() {
        this.faceHelpers.forEach(helper => {
            this.editor.getScene().remove(helper);
        });
        this.faceHelpers = [];
    }
    
    onMouseDown(event) {
        const renderer = this.editor.getRenderer();
        const camera = this.editor.getCamera();
        const rect = renderer.domElement.getBoundingClientRect();
        
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, camera);
        
        const intersects = this.raycaster.intersectObjects(this.faceHelpers);
        
        if (intersects.length > 0) {
            this.selectedFace = intersects[0].object;
            this.isDragging = true;
            this.startPoint.copy(this.selectedFace.position);
            
            // Подсветка выбранной грани
            this.selectedFace.material.color.setHex(0xff6b6b);
            this.selectedFace.material.opacity = 0.8;
        }
    }
    
    onMouseMove(event) {
        if (!this.isDragging || !this.selectedFace) return;
        
        const renderer = this.editor.getRenderer();
        const camera = this.editor.getCamera();
        const rect = renderer.domElement.getBoundingClientRect();
        
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, camera);
        
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const point = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(plane, point);
        
        if (point) {
            const delta = point.clone().sub(this.startPoint);
            this.selectedFace.position.add(delta);
            this.startPoint.copy(point);
            
            // Обновляем геометрию куба
            this.updateCubeFace();
            this.editor.uiManager.updateUI();
        }
    }
    
    onMouseUp(event) {
        this.isDragging = false;
        if (this.selectedFace) {
            this.selectedFace.material.color.setHex(0x4a9eff);
            this.selectedFace.material.opacity = 0.5;
            this.selectedFace = null;
        }
        // Обновляем хелперы
        this.showFaceHelpers();
    }
    
    updateCubeFace() {
        // Здесь логика обновления геометрии куба при перемещении грани
        // Для простоты оставляем заглушку
        console.log('Face moved');
    }
}