import * as THREE from 'three';

export class Entity extends THREE.Mesh {
    constructor(geometry, material, options = {}) {
        super(geometry, material);
        
        this.userData = this.userData || {};
        this.userData.id = options.id || 0;
        this.userData.name = options.name || 'Entity';
        this.userData.type = options.type || 'entity';
        this.userData.isSelectable = options.isSelectable !== false;
        this.userData.isEntity = true;
        
        this._originalColor = material.color ? material.color.clone() : new THREE.Color(0xffffff);
        this.highlightColor = options.highlightColor || new THREE.Color(0x4a9eff);
        this.highlightIntensity = options.highlightIntensity || 0.3;
    }
    
    select() {
        if (this.material.emissive) {
            this.material.emissive.copy(this.highlightColor);
            this.material.emissiveIntensity = this.highlightIntensity;
        }
    }
    
    deselect() {
        if (this.material.emissive) {
            this.material.emissive.setHex(0x000000);
            this.material.emissiveIntensity = 0;
        }
    }
    
    setColor(color) {
        if (this.material.color) {
            this.material.color.copy(color);
            this._originalColor.copy(color);
        }
    }
    
    getColor() {
        return this.material.color ? this.material.color.clone() : null;
    }
    
    dispose() {
        this.geometry.dispose();
        this.material.dispose();
    }
    
    toJSON() {
        return {
            id: this.userData.id,
            name: this.userData.name,
            type: this.userData.type,
            position: this.position.toJSON(),
            rotation: this.rotation.toJSON(),
            scale: this.scale.toJSON(),
            color: this.getColor()?.toJSON()
        };
    }
}