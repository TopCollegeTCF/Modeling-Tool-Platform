import * as THREE from 'three';
import { Entity } from './Entity.js';

export class Cylinder extends Entity {
    constructor(radiusTop = 0.5, radiusBottom = 0.5, height = 1, options = {}) {
        const radialSegments = options.radialSegments || 32;
        const heightSegments = options.heightSegments || 1;
        const openEnded = options.openEnded || false;
        
        const geometry = new THREE.CylinderGeometry(
            radiusTop,
            radiusBottom,
            height,
            radialSegments,
            heightSegments,
            openEnded
        );
        
        const material = new THREE.MeshStandardMaterial({
            color: options.color || 0x51cf66,
            roughness: options.roughness || 0.3,
            metalness: options.metalness || 0.1,
            transparent: options.transparent || false,
            opacity: options.opacity || 1,
        });
        
        super(geometry, material, {
            name: options.name || 'Cylinder',
            type: 'cylinder',
            ...options
        });
        
        // Инициализация свойств ПОСЛЕ super()
        this._radiusTop = radiusTop;
        this._radiusBottom = radiusBottom;
        this._height = height;
        this._radialSegments = radialSegments;
        this._heightSegments = heightSegments;
        this._openEnded = openEnded;
        
        this.radiusTop = radiusTop;
        this.radiusBottom = radiusBottom;
        this.height = height;
        this.radialSegments = radialSegments;
        this.heightSegments = heightSegments;
        this.openEnded = openEnded;
        this._minRadialSegments = 3;
        this._maxRadialSegments = 64;
        this._minHeightSegments = 1;
        this._maxHeightSegments = 32;
    }
    
    /**
     * Устанавливает количество радиальных сегментов
     * @param {number} segments - Количество сегментов (3-64)
     */
    setRadialSegments(segments) {
        const clamped = Math.max(this._minRadialSegments, Math.min(this._maxRadialSegments, Math.round(segments)));
        if (this._radialSegments === clamped) return;
        
        this._radialSegments = clamped;
        this.radialSegments = this._radialSegments;
        this.rebuildGeometry();
        return this;
    }
    
    /**
     * Устанавливает количество сегментов по высоте
     * @param {number} segments - Количество сегментов (1-32)
     */
    setHeightSegments(segments) {
        const clamped = Math.max(this._minHeightSegments, Math.min(this._maxHeightSegments, Math.round(segments)));
        if (this._heightSegments === clamped) return;
        
        this._heightSegments = clamped;
        this.heightSegments = this._heightSegments;
        this.rebuildGeometry();
        return this;
    }
    
    /**
     * Обновляет оба параметра сегментации
     * @param {number} radial - Радиальные сегменты
     * @param {number} height - Сегменты по высоте
     */
    setSegments(radial, height) {
        const r = Math.max(this._minRadialSegments, Math.min(this._maxRadialSegments, Math.round(radial || this._radialSegments)));
        const h = Math.max(this._minHeightSegments, Math.min(this._maxHeightSegments, Math.round(height || this._heightSegments)));
        
        if (this._radialSegments === r && this._heightSegments === h) return;
        
        this._radialSegments = r;
        this._heightSegments = h;
        this.radialSegments = this._radialSegments;
        this.heightSegments = this._heightSegments;
        this.rebuildGeometry();
        return this;
    }
    
    /**
     * Получает текущие параметры сегментации
     */
    getSegments() {
        return {
            radial: this._radialSegments,
            height: this._heightSegments
        };
    }
    
    /**
     * Получает диапазон сегментов
     */
    getSegmentsRange() {
        return {
            radial: { min: this._minRadialSegments, max: this._maxRadialSegments },
            height: { min: this._minHeightSegments, max: this._maxHeightSegments }
        };
    }
    
    /**
     * Перестраивает геометрию с текущими параметрами
     */
    rebuildGeometry() {
        const newGeometry = new THREE.CylinderGeometry(
            this._radiusTop,
            this._radiusBottom,
            this._height,
            this._radialSegments,
            this._heightSegments,
            this._openEnded
        );
        this.geometry.dispose();
        this.geometry = newGeometry;
        this.geometry.computeVertexNormals();
        if (this.geometry.attributes.position) {
            this.geometry.attributes.position.needsUpdate = true;
        }
    }
    
    /**
     * Устанавливает размеры цилиндра
     */
    setSize(radiusTop, radiusBottom, height) {
        this._radiusTop = radiusTop;
        this._radiusBottom = radiusBottom;
        this._height = height;
        this.radiusTop = radiusTop;
        this.radiusBottom = radiusBottom;
        this.height = height;
        this.rebuildGeometry();
        return this;
    }
    
    /**
     * Клонирует цилиндр с опциями
     */
    clone(options = {}) {
        return new Cylinder(
            options.radiusTop || this._radiusTop,
            options.radiusBottom || this._radiusBottom,
            options.height || this._height,
            {
                name: options.name || this.userData.name + ' (clone)',
                color: options.color || this.material.color.getHex(),
                roughness: options.roughness || this.material.roughness,
                metalness: options.metalness || this.material.metalness,
                radialSegments: options.radialSegments || this._radialSegments,
                heightSegments: options.heightSegments || this._heightSegments,
                openEnded: options.openEnded !== undefined ? options.openEnded : this._openEnded,
                transparent: options.transparent !== undefined ? options.transparent : this.material.transparent,
                opacity: options.opacity !== undefined ? options.opacity : this.material.opacity,
            }
        );
    }
    
    /**
     * Сериализует цилиндр в JSON
     */
    toJSON() {
        const json = super.toJSON ? super.toJSON() : {};
        return {
            ...json,
            radiusTop: this._radiusTop,
            radiusBottom: this._radiusBottom,
            height: this._height,
            radialSegments: this._radialSegments,
            heightSegments: this._heightSegments,
            openEnded: this._openEnded,
        };
    }
}