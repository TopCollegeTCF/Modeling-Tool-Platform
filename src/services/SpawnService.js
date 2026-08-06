import * as THREE from 'three';
import { DEFAULTS } from '../configs/defaults.js';

export class SpawnService {
    constructor(editor) {
        this.editor = editor;
        this.mode = DEFAULTS.spawn.mode;
        this.position = new THREE.Vector3(
            DEFAULTS.spawn.position.x,
            DEFAULTS.spawn.position.y,
            DEFAULTS.spawn.position.z
        );
        this.marker = null;
    }
    
    setMode(mode) {
        this.mode = mode;
        if (mode === 'marker') {
            this.showMarker();
        } else {
            this.hideMarker();
        }
    }
    
    setPosition(position) {
        this.position.copy(position);
        if (this.marker) {
            this.marker.position.copy(position);
        }
    }
    
    showMarker() {
        if (!this.marker) {
            this.createMarker();
        }
        this.marker.visible = true;
    }
    
    hideMarker() {
        if (this.marker) {
            this.marker.visible = false;
        }
    }
    
    createMarker() {
        const geometry = new THREE.RingGeometry(0.3, 0.5, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffd43b,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8,
        });
        
        this.marker = new THREE.Mesh(geometry, material);
        this.marker.position.copy(this.position);
        this.marker.rotation.x = -Math.PI / 2;
        this.marker.userData.isMarker = true;
        
        // Добавляем вертикальную линию
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0.5, 0),
        ]);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xffd43b,
            transparent: true,
            opacity: 0.5,
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        this.marker.add(line);
        
        // Добавляем точку наверху
        const dotGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const dotMaterial = new THREE.MeshBasicMaterial({
            color: 0xffd43b,
        });
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        dot.position.y = 0.5;
        this.marker.add(dot);
        
        this.editor.getScene().add(this.marker);
    }
    
    getSpawnPosition() {
        if (this.mode === 'marker' && this.marker && this.marker.visible) {
            return this.marker.position.clone();
        }
        
        // Режим center
        const count = this.editor.sceneManager.getAllEntities().length;
        return new THREE.Vector3(
            count * DEFAULTS.spawn.offset,
            DEFAULTS.spawn.position.y,
            0
        );
    }
    
    getMode() {
        return this.mode;
    }
}