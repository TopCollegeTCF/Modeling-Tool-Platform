import * as THREE from 'three';
import { Entity } from './Entity.js';

export class Cylinder extends Entity {
    constructor(radiusTop = 0.5, radiusBottom = 0.5, height = 1, options = {}) {
        const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 32);
        const material = new THREE.MeshStandardMaterial({
            color: options.color || 0x51cf66,
            roughness: options.roughness || 0.3,
            metalness: options.metalness || 0.1,
        });
        
        super(geometry, material, {
            name: options.name || 'Cylinder',
            type: 'cylinder',
            ...options
        });
        
        this.radiusTop = radiusTop;
        this.radiusBottom = radiusBottom;
        this.height = height;
    }
}