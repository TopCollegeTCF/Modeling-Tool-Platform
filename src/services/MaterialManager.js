/**
 * 🎨 MaterialManager - Управление материалами объектов
 *
 * 📋 ОПИСАНИЕ:
 * Отвечает за создание и управление материалами для объектов.
 * Поддерживает различные типы материалов и текстуры.
 *
 * @version 1.1.0
 */
import * as THREE from 'three';

export const MATERIAL_TYPES = {
    STANDARD: 'standard',
    BASIC: 'basic',
    PHONG: 'phong',
    LAMBERT: 'lambert',
    TOON: 'toon',
    WIREFRAME: 'wireframe',
    CUSTOM: 'custom'
};

export class MaterialManager {
    constructor(editor) {
        this.editor = editor;
        this.materials = new Map();
        this.textures = new Map();
        this.currentTextures = [];
        this._isInitialized = false;
    }

    init() {
        this._isInitialized = true;
        this.createProceduralTextures();
        console.log('🎨 MaterialManager initialized with procedural textures');
    }

    /**
     * Создает процедурные текстуры вместо загрузки из файлов
     */
    createProceduralTextures() {
        const canvasSize = 256;

        // Wood texture
        this.textures.set('wood', this._createWoodTexture(canvasSize));
        this.currentTextures.push('wood');

        // Metal texture
        this.textures.set('metal', this._createMetalTexture(canvasSize));
        this.currentTextures.push('metal');

        // Stone texture
        this.textures.set('stone', this._createStoneTexture(canvasSize));
        this.currentTextures.push('stone');

        // Brick texture
        this.textures.set('brick', this._createBrickTexture(canvasSize));
        this.currentTextures.push('brick');

        // Marble texture
        this.textures.set('marble', this._createMarbleTexture(canvasSize));
        this.currentTextures.push('marble');

        // Rough texture
        this.textures.set('rough', this._createRoughTexture(canvasSize));
        this.currentTextures.push('rough');

        console.log(`✅ Created ${this.currentTextures.length} procedural textures`);
    }

    _createWoodTexture(size) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Base color
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(0, 0, size, size);

        // Wood grain
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const width = 2 + Math.random() * 6;
            const alpha = 0.2 + Math.random() * 0.3;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.bezierCurveTo(
                x + Math.random() * 40 - 20,
                y + Math.random() * 10 - 5,
                x + Math.random() * 40 - 20,
                y + Math.random() * 10 - 5 + 30,
                x + Math.random() * 20 - 10,
                y + 60 + Math.random() * 20
            );
            ctx.strokeStyle = `rgba(60, 40, 20, ${alpha})`;
            ctx.lineWidth = width;
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        texture.name = 'wood';
        return texture;
    }

    _createMetalTexture(size) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Base metallic color
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, '#888899');
        gradient.addColorStop(0.3, '#aaaabb');
        gradient.addColorStop(0.6, '#666677');
        gradient.addColorStop(1, '#9999aa');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // Scratches and marks
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const len = 2 + Math.random() * 15;
            const angle = Math.random() * Math.PI * 2;
            const alpha = 0.1 + Math.random() * 0.2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
            ctx.strokeStyle = `rgba(200, 200, 220, ${alpha})`;
            ctx.lineWidth = 0.5 + Math.random();
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        texture.name = 'metal';
        return texture;
    }

    _createStoneTexture(size) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Base
        ctx.fillStyle = '#8a8a8a';
        ctx.fillRect(0, 0, size, size);

        // Stone spots
        for (let i = 0; i < 80; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const r = 2 + Math.random() * 15;
            const brightness = 80 + Math.random() * 80;
            const alpha = 0.1 + Math.random() * 0.3;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
            grad.addColorStop(0, `rgba(${brightness}, ${brightness}, ${brightness}, ${alpha})`);
            grad.addColorStop(1, `rgba(${brightness}, ${brightness}, ${brightness}, 0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        texture.name = 'stone';
        return texture;
    }

    _createBrickTexture(size) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const brickW = size / 4;
        const brickH = size / 6;
        ctx.fillStyle = '#b87333';
        ctx.fillRect(0, 0, size, size);

        for (let row = 0; row < 6; row++) {
            const offset = row % 2 === 0 ? 0 : brickW / 2;
            for (let col = -1; col < 5; col++) {
                const x = col * brickW + offset;
                const y = row * brickH;
                const color = 150 + Math.random() * 60;
                ctx.fillStyle = `rgb(${color}, ${color * 0.7}, ${color * 0.4})`;
                ctx.fillRect(x + 1, y + 1, brickW - 2, brickH - 2);
                // Brick border
                ctx.strokeStyle = 'rgba(80, 50, 20, 0.3)';
                ctx.lineWidth = 0.5;
                ctx.strokeRect(x + 1, y + 1, brickW - 2, brickH - 2);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        texture.name = 'brick';
        return texture;
    }

    _createMarbleTexture(size) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Base
        ctx.fillStyle = '#f5f0e8';
        ctx.fillRect(0, 0, size, size);

        // Veins
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const width = 1 + Math.random() * 4;
            const alpha = 0.1 + Math.random() * 0.3;
            ctx.beginPath();
            ctx.moveTo(x, y);
            for (let j = 0; j < 5; j++) {
                ctx.quadraticCurveTo(
                    x + Math.random() * 60 - 30,
                    y + Math.random() * 40 - 20 + j * 20,
                    x + Math.random() * 60 - 30,
                    y + j * 20 + 20
                );
            }
            const gray = 100 + Math.random() * 100;
            ctx.strokeStyle = `rgba(${gray}, ${gray}, ${gray}, ${alpha})`;
            ctx.lineWidth = width;
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1.5, 1.5);
        texture.name = 'marble';
        return texture;
    }

    _createRoughTexture(size) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Noise
        const imageData = ctx.createImageData(size, size);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const val = 50 + Math.random() * 155;
            data[i] = val;
            data[i + 1] = val;
            data[i + 2] = val;
            data[i + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(3, 3);
        texture.name = 'rough';
        return texture;
    }

    /**
     * Создает материал по типу
     */
    createMaterial(type, options = {}) {
        let material;
        const color = options.color || 0x4a9eff;
        const roughness = options.roughness || 0.3;
        const metalness = options.metalness || 0.1;
        const transparent = options.transparent || false;
        const opacity = options.opacity || 1;

        switch (type) {
            case MATERIAL_TYPES.STANDARD:
                material = new THREE.MeshStandardMaterial({
                    color,
                    roughness,
                    metalness,
                    transparent,
                    opacity,
                    emissive: options.emissive || 0x000000,
                    emissiveIntensity: options.emissiveIntensity || 0,
                });
                break;

            case MATERIAL_TYPES.BASIC:
                material = new THREE.MeshBasicMaterial({
                    color,
                    transparent,
                    opacity,
                });
                break;

            case MATERIAL_TYPES.PHONG:
                material = new THREE.MeshPhongMaterial({
                    color,
                    specular: options.specular || 0x222222,
                    shininess: options.shininess || 30,
                    transparent,
                    opacity,
                });
                break;

            case MATERIAL_TYPES.LAMBERT:
                material = new THREE.MeshLambertMaterial({
                    color,
                    transparent,
                    opacity,
                    emissive: options.emissive || 0x000000,
                });
                break;

            case MATERIAL_TYPES.TOON:
                material = new THREE.MeshToonMaterial({
                    color,
                    transparent,
                    opacity,
                });
                break;

            case MATERIAL_TYPES.WIREFRAME:
                material = new THREE.MeshStandardMaterial({
                    color,
                    wireframe: true,
                    transparent,
                    opacity,
                });
                break;

            default:
                material = new THREE.MeshStandardMaterial({
                    color,
                    roughness,
                    metalness,
                    transparent,
                    opacity,
                });
        }

        // Применяем текстуру если указана
        if (options.texture && this.textures.has(options.texture)) {
            const texture = this.textures.get(options.texture);
            material.map = texture;
            material.needsUpdate = true;
        }

        return material;
    }

    /**
     * Применяет материал к объекту
     */
    applyMaterial(entity, materialType, options = {}) {
        if (!entity) return;

        const material = this.createMaterial(materialType, {
            color: entity.material?.color?.getHex() || options.color || 0x4a9eff,
            roughness: entity.material?.roughness || options.roughness || 0.3,
            metalness: entity.material?.metalness || options.metalness || 0.1,
            transparent: entity.material?.transparent || options.transparent || false,
            opacity: entity.material?.opacity || options.opacity || 1,
            texture: options.texture || null,
            ...options
        });

        const oldMaterial = entity.material;
        entity.material = material;
        entity.material.needsUpdate = true;
        entity.userData.materialType = materialType;
        if (options.texture) {
            entity.userData.texture = options.texture;
        } else {
            delete entity.userData.texture;
        }

        if (oldMaterial && oldMaterial !== material && oldMaterial.dispose) {
            oldMaterial.dispose();
        }

        return material;
    }

    /**
     * Получает список доступных текстур
     */
    getAvailableTextures() {
        return [...this.currentTextures];
    }

    /**
     * Получает текстуру по имени
     */
    getTexture(name) {
        return this.textures.get(name) || null;
    }

    /**
     * Получает список типов материалов
     */
    getMaterialTypes() {
        return Object.values(MATERIAL_TYPES);
    }

    /**
     * Получает название типа материала
     */
    getMaterialTypeLabel(type) {
        const labels = {
            [MATERIAL_TYPES.STANDARD]: 'Standard',
            [MATERIAL_TYPES.BASIC]: 'Basic (No Lighting)',
            [MATERIAL_TYPES.PHONG]: 'Phong (Shiny)',
            [MATERIAL_TYPES.LAMBERT]: 'Lambert (Matte)',
            [MATERIAL_TYPES.TOON]: 'Toon (Cartoon)',
            [MATERIAL_TYPES.WIREFRAME]: 'Wireframe',
            [MATERIAL_TYPES.CUSTOM]: 'Custom'
        };
        return labels[type] || type;
    }
}