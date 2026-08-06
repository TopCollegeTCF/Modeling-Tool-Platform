import * as THREE from 'three';
import { Entity } from './Entity.js';

export class Cube extends Entity {
    constructor(width = 1, height = 1, depth = 1, options = {}) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({
            color: options.color || 0x4a9eff,
            roughness: options.roughness || 0.3,
            metalness: options.metalness || 0.1,
            emissive: options.emissive || 0x000000,
            emissiveIntensity: options.emissiveIntensity || 0,
        });
        
        super(geometry, material, {
            name: options.name || 'Cube',
            type: 'cube',
            ...options
        });
        
        this.width = width;
        this.height = height;
        this.depth = depth;
    }
    
    setSize(width, height, depth) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        
        const newGeometry = new THREE.BoxGeometry(width, height, depth);
        this.geometry.dispose();
        this.geometry = newGeometry;
    }
}