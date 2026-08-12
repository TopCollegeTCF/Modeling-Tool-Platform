import * as THREE from 'three';
import { COLORS } from '../configs/colors.js';

/**
 * 🎬 SceneManager - Управление 3D сценой
 *
 * 📋 ОПИСАНИЕ:
 * Отвечает за создание и управление 3D сценой:
 * - Инициализация сцены с освещением
 * - Управление объектами (добавление, удаление)
 * - Вспомогательные элементы (сетка, оси)
 * - Поддержка темной и светлой темы
 * - Настройка толщины линий хелперов
 *
 * 🏗️ АРХИТЕКТУРА:
 * - Сцена (Scene) — контейнер для всех объектов
 * - Освещение — Ambient + Directional lights
 * - Хелперы — GridHelper и AxesHelper
 * - Сущности — Map с пользовательскими объектами
 *
 * @version 1.1.0
 * @author Gabryelf
 * @since 0.0.1
 */
export class SceneManager {
    constructor() {
        /** @type {THREE.Scene|null} - 3D сцена */
        this.scene = null;
        /** @type {Map<number, Entity>} - Карта объектов на сцене */
        this.entities = new Map();
        /** @type {Array} - Массив вспомогательных объектов */
        this.helpers = [];
        /** @type {THREE.GridHelper|null} - Сетка */
        this.gridHelper = null;
        /** @type {THREE.AxesHelper|null} - Оси координат */
        this.axesHelper = null;
        /** @type {boolean} - Показывать сетку */
        this.showGrid = true;
        /** @type {boolean} - Показывать оси */
        this.showAxes = true;
        /** @type {string} - Размер хелперов: 'small' | 'medium' | 'large' */
        this.helperSize = 'medium';
        /** @type {number} - Толщина линий хелперов */
        this.helperThickness = 1;
        /** @type {string} - Текущая тема: 'dark' | 'light' */
        this.currentTheme = 'dark';
    }

    /**
     * Инициализирует сцену
     */
    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0d0d1a);
        this.createLights();
        this.createHelpers();
        this.loadSettings();
        console.log('🎬 Scene initialized');
    }

    loadSettings() {
        try {
            const thickness = localStorage.getItem('editor_helper_thickness');
            if (thickness !== null) {
                this.helperThickness = parseFloat(thickness);
                this.updateHelperThickness();
            }
        } catch (e) {
            // Ignore
        }
    }

    /**
     * Создает освещение сцены
     * @private
     */
    createLights() {
        const ambient = new THREE.AmbientLight(0x404060);
        this.scene.add(ambient);

        const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
        mainLight.position.set(10, 15, 10);
        mainLight.castShadow = true;
        this.scene.add(mainLight);

        const fillLight = new THREE.DirectionalLight(0x4488ff, 0.4);
        fillLight.position.set(-5, 0, -5);
        this.scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xff8844, 0.3);
        rimLight.position.set(-5, 5, 10);
        this.scene.add(rimLight);
    }

    /**
     * Создает вспомогательные элементы (сетка и оси)
     * @private
     */
    createHelpers() {
        const gridSize = this.getGridSize();
        const divisions = this.getDivisions();
        const colors = this.currentTheme === 'light' ? COLORS.light : COLORS.dark;

        // Создаем сетку с учетом толщины
        this.gridHelper = new THREE.GridHelper(gridSize, divisions, colors.grid.main, colors.grid.sub);
        this.gridHelper.position.y = 0;
        
        // Применяем толщину линий
        this.gridHelper.material.linewidth = this.helperThickness;
        
        this.scene.add(this.gridHelper);
        this.helpers.push(this.gridHelper);

        // Создаем оси с учетом толщины
        const axesLength = this.getAxesLength();
        this.axesHelper = new THREE.AxesHelper(axesLength);
        
        // Применяем толщину линий для осей
        this.axesHelper.material.linewidth = this.helperThickness;
        
        this.scene.add(this.axesHelper);
        this.helpers.push(this.axesHelper);
    }

    /**
     * Обновляет толщину линий хелперов
     * @param {number} thickness - Новая толщина
     */
    setHelperThickness(thickness) {
        this.helperThickness = thickness;
        this.updateHelperThickness();
        try {
            localStorage.setItem('editor_helper_thickness', String(thickness));
        } catch (e) {
            // Ignore
        }
        console.log(`📐 Helper thickness set to: ${thickness}`);
    }

    /**
     * Применяет толщину к существующим хелперам
     * @private
     */
    updateHelperThickness() {
        if (this.gridHelper) {
            this.gridHelper.material.linewidth = this.helperThickness;
        }
        if (this.axesHelper) {
            this.axesHelper.material.linewidth = this.helperThickness;
        }
    }

    getGridSize() {
        const sizes = { small: 10, medium: 20, large: 30 };
        return sizes[this.helperSize] || 20;
    }

    getDivisions() {
        const divisions = { small: 10, medium: 20, large: 30 };
        return divisions[this.helperSize] || 20;
    }

    getAxesLength() {
        const lengths = { small: 1.5, medium: 3, large: 5 };
        return lengths[this.helperSize] || 3;
    }

    setHelperSize(size) {
        this.helperSize = size;
        this.recreateHelpers();
    }

    /**
     * Пересоздает хелперы с новыми параметрами
     * @private
     */
    recreateHelpers() {
        // Удаляем старые хелперы
        if (this.gridHelper) {
            this.scene.remove(this.gridHelper);
            this.gridHelper.dispose();
        }
        if (this.axesHelper) {
            this.scene.remove(this.axesHelper);
            this.axesHelper.dispose();
        }
        this.helpers = [];

        // Создаем новые
        this.createHelpers();

        // Применяем видимость
        if (!this.showGrid && this.gridHelper) {
            this.gridHelper.visible = false;
        }
        if (!this.showAxes && this.axesHelper) {
            this.axesHelper.visible = false;
        }
    }

    toggleGrid(show) {
        this.showGrid = show;
        if (this.gridHelper) {
            this.gridHelper.visible = show;
        }
    }

    toggleAxes(show) {
        this.showAxes = show;
        if (this.axesHelper) {
            this.axesHelper.visible = show;
        }
    }

    updateGridColors(colors) {
        if (this.gridHelper) {
            const gridSize = this.getGridSize();
            const divisions = this.getDivisions();
            this.scene.remove(this.gridHelper);
            this.gridHelper.dispose();
            this.gridHelper = new THREE.GridHelper(gridSize, divisions, colors.main, colors.sub);
            this.gridHelper.position.y = 0;
            this.gridHelper.visible = this.showGrid;
            this.gridHelper.material.linewidth = this.helperThickness;
            this.scene.add(this.gridHelper);
        }
    }

    setBackgroundTheme(theme) {
        if (!this.scene) return;
        this.currentTheme = theme;
        const bgColor = theme === 'light' ? 0xf0f0f5 : 0x0d0d1a;
        this.scene.background = new THREE.Color(bgColor);
        const colors = theme === 'light' ? COLORS.light : COLORS.dark;
        this.updateGridColors(colors.grid);
        console.log(`🎨 Scene background: ${theme}`);
    }

    addEntity(entity) {
        this.entities.set(entity.userData.id, entity);
        this.scene.add(entity);
        console.log(`✅ Entity added: ${entity.userData.name} (id: ${entity.userData.id})`);
    }

    removeEntity(entity) {
        this.entities.delete(entity.userData.id);
        this.scene.remove(entity);
        if (entity.dispose) entity.dispose();
        console.log(`🗑 Entity removed: ${entity.userData.name}`);
    }

    getEntity(id) {
        return this.entities.get(id);
    }

    getAllEntities() {
        return Array.from(this.entities.values());
    }

    getScene() {
        return this.scene;
    }

    clear() {
        const entities = this.getAllEntities();
        entities.forEach(entity => {
            this.removeEntity(entity);
        });
        this.entities.clear();
        console.log('🧹 Scene cleared');
    }
}