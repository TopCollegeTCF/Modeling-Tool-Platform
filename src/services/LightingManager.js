/**
 * 💡 LightingManager - Управление освещением сцены
 *
 * 📋 ОПИСАНИЕ:
 * Отвечает за создание и управление освещением в сцене.
 * Поддерживает различные типы освещения и их настройку.
 *
 * @version 1.0.0
 */
import * as THREE from 'three';

export const LIGHT_TYPES = {
    STANDARD: 'standard',
    STUDIO: 'studio',
    DRAMATIC: 'dramatic',
    SOFT: 'soft',
    NEON: 'neon',
    CUSTOM: 'custom'
};

export class LightingManager {
    constructor(editor) {
        this.editor = editor;
        this.lights = [];
        this.currentType = LIGHT_TYPES.STANDARD;
        this.config = this.getDefaultConfig();
        this._isInitialized = false;
    }

    getDefaultConfig() {
        return {
            ambient: {
                color: 0x404060,
                intensity: 0.4
            },
            main: {
                color: 0xffffff,
                intensity: 1.2,
                position: { x: 10, y: 15, z: 10 }
            },
            fill: {
                color: 0x4488ff,
                intensity: 0.4,
                position: { x: -5, y: 0, z: -5 }
            },
            rim: {
                color: 0xff8844,
                intensity: 0.3,
                position: { x: -5, y: 5, z: 10 }
            },
            // Дополнительные источники для сложных схем
            extra: []
        };
    }

    init(scene) {
        this.scene = scene;
        this._isInitialized = true;
        this.setupLights(LIGHT_TYPES.STANDARD);
        console.log('💡 LightingManager initialized');
    }

    setupLights(type) {
        if (!this._isInitialized || !this.scene) {
            console.warn('⚠️ LightingManager not initialized');
            return;
        }

        // Удаляем старые источники света
        this.clearLights();

        this.currentType = type;
        const config = this.getLightConfig(type);
        this.config = config;

        // Ambient light
        const ambient = new THREE.AmbientLight(config.ambient.color, config.ambient.intensity);
        this.scene.add(ambient);
        this.lights.push(ambient);

        // Main light (Directional)
        const main = new THREE.DirectionalLight(config.main.color, config.main.intensity);
        main.position.set(config.main.position.x, config.main.position.y, config.main.position.z);
        main.castShadow = true;
        this.scene.add(main);
        this.lights.push(main);

        // Fill light
        const fill = new THREE.DirectionalLight(config.fill.color, config.fill.intensity);
        fill.position.set(config.fill.position.x, config.fill.position.y, config.fill.position.z);
        this.scene.add(fill);
        this.lights.push(fill);

        // Rim light
        const rim = new THREE.DirectionalLight(config.rim.color, config.rim.intensity);
        rim.position.set(config.rim.position.x, config.rim.position.y, config.rim.position.z);
        this.scene.add(rim);
        this.lights.push(rim);

        // Extra lights
        if (config.extra) {
            config.extra.forEach(extraConfig => {
                const light = new THREE[extraConfig.type](
                    extraConfig.color || 0xffffff,
                    extraConfig.intensity || 0.5
                );
                if (light.position) {
                    light.position.set(
                        extraConfig.position?.x || 0,
                        extraConfig.position?.y || 0,
                        extraConfig.position?.z || 0
                    );
                }
                this.scene.add(light);
                this.lights.push(light);
            });
        }

        console.log(`💡 Lights setup: ${type}`);
    }

    getLightConfig(type) {
        const configs = {
            [LIGHT_TYPES.STANDARD]: {
                ambient: { color: 0x404060, intensity: 0.4 },
                main: { color: 0xffffff, intensity: 1.2, position: { x: 10, y: 15, z: 10 } },
                fill: { color: 0x4488ff, intensity: 0.4, position: { x: -5, y: 0, z: -5 } },
                rim: { color: 0xff8844, intensity: 0.3, position: { x: -5, y: 5, z: 10 } },
                extra: []
            },
            [LIGHT_TYPES.STUDIO]: {
                ambient: { color: 0x8888aa, intensity: 0.3 },
                main: { color: 0xffeedd, intensity: 1.8, position: { x: 5, y: 10, z: 8 } },
                fill: { color: 0x4488ff, intensity: 0.6, position: { x: -8, y: 0, z: -3 } },
                rim: { color: 0xff8844, intensity: 0.5, position: { x: -3, y: 8, z: 12 } },
                extra: [
                    { type: 'DirectionalLight', color: 0x88ccff, intensity: 0.3, position: { x: 0, y: 12, z: -5 } }
                ]
            },
            [LIGHT_TYPES.DRAMATIC]: {
                ambient: { color: 0x222244, intensity: 0.2 },
                main: { color: 0xffaa55, intensity: 2.0, position: { x: 8, y: 12, z: 5 } },
                fill: { color: 0x4466ff, intensity: 0.3, position: { x: -10, y: -2, z: -8 } },
                rim: { color: 0xff4400, intensity: 0.4, position: { x: -5, y: 3, z: 15 } },
                extra: []
            },
            [LIGHT_TYPES.SOFT]: {
                ambient: { color: 0x8888cc, intensity: 0.6 },
                main: { color: 0xffffff, intensity: 0.8, position: { x: 3, y: 8, z: 5 } },
                fill: { color: 0x99ccff, intensity: 0.5, position: { x: -3, y: 4, z: -5 } },
                rim: { color: 0xffccaa, intensity: 0.3, position: { x: 0, y: 6, z: 12 } },
                extra: [
                    { type: 'HemisphereLight', color: 0x4488ff, intensity: 0.4 }
                ]
            },
            [LIGHT_TYPES.NEON]: {
                ambient: { color: 0x111133, intensity: 0.15 },
                main: { color: 0xff00ff, intensity: 0.8, position: { x: 5, y: 5, z: 5 } },
                fill: { color: 0x00ffff, intensity: 0.6, position: { x: -5, y: 3, z: -5 } },
                rim: { color: 0xffff00, intensity: 0.4, position: { x: 0, y: 8, z: 10 } },
                extra: [
                    { type: 'PointLight', color: 0xff00ff, intensity: 0.5, position: { x: 3, y: 2, z: 3 } },
                    { type: 'PointLight', color: 0x00ffff, intensity: 0.5, position: { x: -3, y: 2, z: -3 } }
                ]
            }
        };

        return configs[type] || configs[LIGHT_TYPES.STANDARD];
    }

    clearLights() {
        this.lights.forEach(light => {
            this.scene.remove(light);
            if (light.dispose) light.dispose();
        });
        this.lights = [];
    }

    setType(type) {
        if (this.currentType === type) return;
        this.setupLights(type);
        this.saveSettings();
    }

    getType() {
        return this.currentType;
    }

    getTypes() {
        return Object.values(LIGHT_TYPES);
    }

    getTypeLabel(type) {
        const labels = {
            [LIGHT_TYPES.STANDARD]: 'Standard',
            [LIGHT_TYPES.STUDIO]: 'Studio',
            [LIGHT_TYPES.DRAMATIC]: 'Dramatic',
            [LIGHT_TYPES.SOFT]: 'Soft',
            [LIGHT_TYPES.NEON]: 'Neon',
            [LIGHT_TYPES.CUSTOM]: 'Custom'
        };
        return labels[type] || type;
    }

    saveSettings() {
        try {
            localStorage.setItem('editor_lighting_type', this.currentType);
        } catch (e) { }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('editor_lighting_type');
            if (saved && Object.values(LIGHT_TYPES).includes(saved)) {
                this.currentType = saved;
                if (this._isInitialized) {
                    this.setupLights(saved);
                }
                return true;
            }
        } catch (e) { }
        return false;
    }
}