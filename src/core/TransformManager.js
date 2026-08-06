import * as THREE from 'three';

export class TransformManager {
    constructor() {
        this.mode = 'move'; // 'move' | 'scale' | 'rotate'
        this.axis = 'all'; // 'x' | 'y' | 'z' | 'all'
        this.snap = 0.1;
        this.snapEnabled = false;
    }
    
    setMode(mode) {
        this.mode = mode;
    }
    
    setAxis(axis) {
        this.axis = axis;
    }
    
    transform(entity, delta, mode = null) {
        if (!entity) return;
        
        const transformMode = mode || this.mode;
        
        switch (transformMode) {
            case 'move':
                this.move(entity, delta);
                break;
            case 'scale':
                this.scale(entity, delta);
                break;
            case 'rotate':
                this.rotate(entity, delta);
                break;
        }
    }
    
    move(entity, delta) {
        const d = this.applySnap(delta);
        if (this.axis === 'x' || this.axis === 'all') entity.position.x += d.x;
        if (this.axis === 'y' || this.axis === 'all') entity.position.y += d.y;
        if (this.axis === 'z' || this.axis === 'all') entity.position.z += d.z;
    }
    
    scale(entity, delta) {
        const d = this.applySnap(delta);
        const factor = 1 + d.x * 0.1;
        if (this.axis === 'x' || this.axis === 'all') entity.scale.x = Math.max(0.01, entity.scale.x * factor);
        if (this.axis === 'y' || this.axis === 'all') entity.scale.y = Math.max(0.01, entity.scale.y * factor);
        if (this.axis === 'z' || this.axis === 'all') entity.scale.z = Math.max(0.01, entity.scale.z * factor);
    }
    
    rotate(entity, delta) {
        const d = this.applySnap(delta);
        const angle = d.x * 0.02;
        if (this.axis === 'x' || this.axis === 'all') entity.rotation.x += angle;
        if (this.axis === 'y' || this.axis === 'all') entity.rotation.y += angle;
        if (this.axis === 'z' || this.axis === 'all') entity.rotation.z += angle;
    }
    
    applySnap(delta) {
        if (!this.snapEnabled) return delta;
        
        return {
            x: Math.round(delta.x / this.snap) * this.snap,
            y: Math.round(delta.y / this.snap) * this.snap,
            z: Math.round(delta.z / this.snap) * this.snap
        };
    }
}