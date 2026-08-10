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
 * 
 * 🏗️ АРХИТЕКТУРА:
 * - Сцена (Scene) — контейнер для всех объектов
 * - Освещение — Ambient + Directional lights
 * - Хелперы — GridHelper и AxesHelper
 * - Сущности — Map с пользовательскими объектами
 * 
 * 🔄 ПОТОК ДАННЫХ:
 * Editor → SceneManager → Three.js Scene → RenderManager
 * 
 * @version 1.0.0
 * @author 3D Modeling Editor Team
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
        
        /** @type {string} - Текущая тема: 'dark' | 'light' */
        this.currentTheme = 'dark';
    }

    /**
     * Инициализирует сцену
     * @description Создает сцену, добавляет освещение и вспомогательные элементы
     * @emits Scene#init
     */
    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0d0d1a);
        this.createLights();
        this.createHelpers();
        console.log('🎬 Scene initialized');
    }

    /**
     * Создает освещение сцены
     * @private
     * @description Ambient light + три Directional lights для красивого освещения
     */
    createLights() {
        // Ambient light - базовое освещение
        const ambient = new THREE.AmbientLight(0x404060);
        this.scene.add(ambient);

        // Main light - основной источник света
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
        mainLight.position.set(10, 15, 10);
        mainLight.castShadow = true;
        this.scene.add(mainLight);

        // Fill light - заполняющий свет
        const fillLight = new THREE.DirectionalLight(0x4488ff, 0.4);
        fillLight.position.set(-5, 0, -5);
        this.scene.add(fillLight);

        // Rim light - контровой свет
        const rimLight = new THREE.DirectionalLight(0xff8844, 0.3);
        rimLight.position.set(-5, 5, 10);
        this.scene.add(rimLight);
    }

    /**
     * Создает вспомогательные элементы (сетка и оси)
     * @private
     */
    createHelpers() {
        // Сетка
        const gridSize = this.getGridSize();
        const divisions = this.getDivisions();
        const colors = this.currentTheme === 'light' ? COLORS.light : COLORS.dark;
        
        this.gridHelper = new THREE.GridHelper(gridSize, divisions, colors.grid.main, colors.grid.sub);
        this.gridHelper.position.y = 0;
        this.scene.add(this.gridHelper);
        this.helpers.push(this.gridHelper);

        // Оси координат
        const axesLength = this.getAxesLength();
        this.axesHelper = new THREE.AxesHelper(axesLength);
        this.scene.add(this.axesHelper);
        this.helpers.push(this.axesHelper);
    }

    /**
     * Получает размер сетки в зависимости от размера хелперов
     * @returns {number} Размер сетки
     */
    getGridSize() {
        const sizes = { small: 10, medium: 20, large: 30 };
        return sizes[this.helperSize] || 20;
    }

    /**
     * Получает количество делений сетки
     * @returns {number} Количество делений
     */
    getDivisions() {
        const divisions = { small: 10, medium: 20, large: 30 };
        return divisions[this.helperSize] || 20;
    }

    /**
     * Получает длину осей координат
     * @returns {number} Длина осей
     */
    getAxesLength() {
        const lengths = { small: 1.5, medium: 3, large: 5 };
        return lengths[this.helperSize] || 3;
    }

    /**
     * Устанавливает размер вспомогательных элементов
     * @param {string} size - 'small' | 'medium' | 'large'
     */
    setHelperSize(size) {
        this.helperSize = size;
        this.updateHelpers();
    }

    /**
     * Обновляет вспомогательные элементы
     * @private
     */
    updateHelpers() {
        // Удаляем старые хелперы
        if (this.gridHelper) {
            this.scene.remove(this.gridHelper);
            this.gridHelper.dispose();
        }
        if (this.axesHelper) {
            this.scene.remove(this.axesHelper);
            this.axesHelper.dispose();
        }

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

    /**
     * Включает/выключает отображение сетки
     * @param {boolean} show - показывать сетку
     */
    toggleGrid(show) {
        this.showGrid = show;
        if (this.gridHelper) {
            this.gridHelper.visible = show;
        }
    }

    /**
     * Включает/выключает отображение осей
     * @param {boolean} show - показывать оси
     */
    toggleAxes(show) {
        this.showAxes = show;
        if (this.axesHelper) {
            this.axesHelper.visible = show;
        }
    }

    /**
     * Обновляет цвета сетки
     * @param {Object} colors - объект с цветами { main, sub }
     */
    updateGridColors(colors) {
        if (this.gridHelper) {
            // Three.js GridHelper не поддерживает обновление цветов напрямую
            // Пересоздаем сетку с новыми цветами
            const gridSize = this.getGridSize();
            const divisions = this.getDivisions();
            this.scene.remove(this.gridHelper);
            this.gridHelper.dispose();
            this.gridHelper = new THREE.GridHelper(gridSize, divisions, colors.main, colors.sub);
            this.gridHelper.position.y = 0;
            this.gridHelper.visible = this.showGrid;
            this.scene.add(this.gridHelper);
        }
    }

    /**
     * Устанавливает тему фона сцены
     * @param {string} theme - 'dark' или 'light'
     * @description Меняет цвет фона и обновляет цвета вспомогательных элементов
     */
    setBackgroundTheme(theme) {
        if (!this.scene) return;
        
        this.currentTheme = theme;
        const bgColor = theme === 'light' ? 0xf0f0f5 : 0x0d0d1a;
        this.scene.background = new THREE.Color(bgColor);
        
        // Обновляем цвета сетки
        const colors = theme === 'light' ? COLORS.light : COLORS.dark;
        this.updateGridColors(colors.grid);
        
        console.log(`🎨 Scene background: ${theme}`);
    }

    /**
     * Добавляет сущность на сцену
     * @param {Entity} entity - объект для добавления
     */
    addEntity(entity) {
        this.entities.set(entity.userData.id, entity);
        this.scene.add(entity);
        console.log(`✅ Entity added: ${entity.userData.name} (id: ${entity.userData.id})`);
    }

    /**
     * Удаляет сущность со сцены
     * @param {Entity} entity - объект для удаления
     */
    removeEntity(entity) {
        this.entities.delete(entity.userData.id);
        this.scene.remove(entity);
        if (entity.dispose) entity.dispose();
        console.log(`🗑 Entity removed: ${entity.userData.name}`);
    }

    /**
     * Получает сущность по ID
     * @param {number} id - ID объекта
     * @returns {Entity|null} Найденный объект или null
     */
    getEntity(id) {
        return this.entities.get(id);
    }

    /**
     * Получает все сущности на сцене
     * @returns {Array<Entity>} Массив всех объектов
     */
    getAllEntities() {
        return Array.from(this.entities.values());
    }

    /**
     * Получает 3D сцену Three.js
     * @returns {THREE.Scene} Сцена
     */
    getScene() {
        return this.scene;
    }

    /**
     * Очищает сцену (удаляет все объекты)
     */
    clear() {
        const entities = this.getAllEntities();
        entities.forEach(entity => {
            this.removeEntity(entity);
        });
        this.entities.clear();
        console.log('🧹 Scene cleared');
    }
}