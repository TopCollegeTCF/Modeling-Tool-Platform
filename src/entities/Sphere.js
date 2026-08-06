import * as THREE from 'three';
import { Entity } from './Entity.js';

export class Sphere extends Entity {
    constructor(radius = 0.5, options = {}) {
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: options.color || 0xff6b6b,
            roughness: options.roughness || 0.3,
            metalness: options.metalness || 0.1,
        });
        
        super(geometry, material, {
            name: options.name || 'Sphere',
            type: 'sphere',
            ...options
        });
        
        this.radius = radius;
    }
}