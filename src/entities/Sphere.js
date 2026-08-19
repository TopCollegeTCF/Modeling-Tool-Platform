import * as THREE from 'three';
import { Entity } from './Entity.js';

export class Sphere extends Entity {
    constructor(radius = 0.5, options = {}) {
        const widthSegments = options.widthSegments || 32;
        const heightSegments = options.heightSegments || 32;
        
        const geometry = new THREE.SphereGeometry(
            radius,
            widthSegments,
            heightSegments
        );
        
        const material = new THREE.MeshStandardMaterial({
            color: options.color || 0xff6b6b,
            roughness: options.roughness || 0.3,
            metalness: options.metalness || 0.1,
            transparent: options.transparent || false,
            opacity: options.opacity || 1,
        });
        
        super(geometry, material, {
            name: options.name || 'Sphere',
            type: 'sphere',
            ...options
        });
        
        // Инициализация свойств ПОСЛЕ super()
        this._radius = radius;
        this._widthSegments = widthSegments;
        this._heightSegments = heightSegments;
        
        this.radius = radius;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;
        this._minSegments = 4;
        this._maxSegments = 64;
    }
    
    /**
     * Устанавливает количество сегментов по ширине
     * @param {number} segments - Количество сегментов (4-64)
     */
    setWidthSegments(segments) {
        const clamped = Math.max(this._minSegments, Math.min(this._maxSegments, Math.round(segments)));
        if (this._widthSegments === clamped) return;
        
        this._widthSegments = clamped;
        this.widthSegments = this._widthSegments;
        this.rebuildGeometry();
        return this;
    }
    
    /**
     * Устанавливает количество сегментов по высоте
     * @param {number} segments - Количество сегментов (4-64)
     */
    setHeightSegments(segments) {
        const clamped = Math.max(this._minSegments, Math.min(this._maxSegments, Math.round(segments)));
        if (this._heightSegments === clamped) return;
        
        this._heightSegments = clamped;
        this.heightSegments = this._heightSegments;
        this.rebuildGeometry();
        return this;
    }
    
    /**
     * Обновляет оба параметра сегментации
     * @param {number} widthSeg - Сегменты по ширине
     * @param {number} heightSeg - Сегменты по высоте
     */
    setSegments(widthSeg, heightSeg) {
        const w = Math.max(this._minSegments, Math.min(this._maxSegments, Math.round(widthSeg || this._widthSegments)));
        const h = Math.max(this._minSegments, Math.min(this._maxSegments, Math.round(heightSeg || this._heightSegments)));
        
        if (this._widthSegments === w && this._heightSegments === h) return;
        
        this._widthSegments = w;
        this._heightSegments = h;
        this.widthSegments = this._widthSegments;
        this.heightSegments = this._heightSegments;
        this.rebuildGeometry();
        return this;
    }
    
    /**
     * Получает текущие параметры сегментации
     */
    getSegments() {
        return {
            width: this._widthSegments,
            height: this._heightSegments
        };
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
        const newGeometry = new THREE.SphereGeometry(
            this._radius,
            this._widthSegments,
            this._heightSegments
        );
        this.geometry.dispose();
        this.geometry = newGeometry;
        this.geometry.computeVertexNormals();
        if (this.geometry.attributes.position) {
            this.geometry.attributes.position.needsUpdate = true;
        }
    }
    
    /**
     * Устанавливает радиус сферы
     */
    setRadius(radius) {
        this._radius = radius;
        this.radius = radius;
        this.rebuildGeometry();
        return this;
    }
    
    /**
     * Клонирует сферу с опциями
     */
    clone(options = {}) {
        return new Sphere(
            options.radius || this._radius,
            {
                name: options.name || this.userData.name + ' (clone)',
                color: options.color || this.material.color.getHex(),
                roughness: options.roughness || this.material.roughness,
                metalness: options.metalness || this.material.metalness,
                widthSegments: options.widthSegments || this._widthSegments,
                heightSegments: options.heightSegments || this._heightSegments,
                transparent: options.transparent !== undefined ? options.transparent : this.material.transparent,
                opacity: options.opacity !== undefined ? options.opacity : this.material.opacity,
            }
        );
    }
    
    /**
     * Сериализует сферу в JSON
     */
    toJSON() {
        const json = super.toJSON ? super.toJSON() : {};
        return {
            ...json,
            radius: this._radius,
            widthSegments: this._widthSegments,
            heightSegments: this._heightSegments,
        };
    }
}