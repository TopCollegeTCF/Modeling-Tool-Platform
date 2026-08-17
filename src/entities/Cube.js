import * as THREE from 'three';
import { Entity } from './Entity.js';

export class Cube extends Entity {
    constructor(width = 1, height = 1, depth = 1, options = {}) {
        // Сначала создаем геометрию и материал ДЛЯ super()
        const segments = options.segments || 1;
        const geometry = new THREE.BoxGeometry(
            width, 
            height, 
            depth, 
            segments, 
            segments, 
            segments
        );
        
        const material = new THREE.MeshStandardMaterial({
            color: options.color || 0x4a9eff,
            roughness: options.roughness || 0.3,
            metalness: options.metalness || 0.1,
            emissive: options.emissive || 0x000000,
            emissiveIntensity: options.emissiveIntensity || 0,
            transparent: options.transparent || false,
            opacity: options.opacity || 1,
        });
        
        // ТОЛЬКО ПОСЛЕ super() можно использовать this
        super(geometry, material, {
            name: options.name || 'Cube',
            type: 'cube',
            ...options
        });
        
        // Теперь можно инициализировать свойства
        this._width = width;
        this._height = height;
        this._depth = depth;
        this._segments = segments;
        
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.segments = segments;
        this._minSegments = 1;
        this._maxSegments = 32;
    }
    
    /**
     * Устанавливает количество сегментов куба
     * @param {number} segments - Количество сегментов (1-32)
     */
    setSegments(segments) {
        const clamped = Math.max(this._minSegments, Math.min(this._maxSegments, Math.round(segments)));
        if (this._segments === clamped) return;
        
        this._segments = clamped;
        this.segments = this._segments;
        this.rebuildGeometry();
        return this;
    }
    
    /**
     * Получает текущее количество сегментов
     */
    getSegments() {
        return this._segments;
    }
    
    /**
     * Получает диапазон сегментов
     */
    getSegmentsRange() {
        return { min: this._minSegments, max: this._maxSegments };
    }
    
    /**
     * Перестраивает геометрию с текущими параметрами
     */
    rebuildGeometry() {
        const newGeometry = new THREE.BoxGeometry(
            this._width,
            this._height,
            this._depth,
            this._segments,
            this._segments,
            this._segments
        );
        this.geometry.dispose();
        this.geometry = newGeometry;
        this.geometry.computeVertexNormals();
        if (this.geometry.attributes.position) {
            this.geometry.attributes.position.needsUpdate = true;
        }
    }
    
    /**
     * Устанавливает размеры куба
     */
    setSize(width, height, depth) {
        this._width = width;
        this._height = height;
        this._depth = depth;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.rebuildGeometry();
        return this;
    }
    
    /**
     * Клонирует куб с опциями
     */
    clone(options = {}) {
        return new Cube(
            options.width || this._width,
            options.height || this._height,
            options.depth || this._depth,
            {
                name: options.name || this.userData.name + ' (clone)',
                color: options.color || this.material.color.getHex(),
                roughness: options.roughness || this.material.roughness,
                metalness: options.metalness || this.material.metalness,
                segments: options.segments || this._segments,
                transparent: options.transparent !== undefined ? options.transparent : this.material.transparent,
                opacity: options.opacity !== undefined ? options.opacity : this.material.opacity,
            }
        );
    }
    
    /**
     * Сериализует куб в JSON
     */
    toJSON() {
        const json = super.toJSON ? super.toJSON() : {};
        return {
            ...json,
            width: this._width,
            height: this._height,
            depth: this._depth,
            segments: this._segments,
        };
    }
}