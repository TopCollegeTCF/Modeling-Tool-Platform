import * as THREE from 'three';

export class SceneManager {
    constructor() {
        this.scene = null;
        this.entities = new Map();
        this.helpers = [];
        this.gridHelper = null;
        this.axesHelper = null;
        this.showGrid = true;
        this.showAxes = true;
        this.helperSize = 'medium';
    }
    
    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0d0d1a);
        this.createLights();
        this.createHelpers();
    }
    
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
    
    createHelpers() {
        // Сетка
        const gridSize = this.getGridSize();
        const divisions = this.getDivisions();
        this.gridHelper = new THREE.GridHelper(gridSize, divisions, 0x444466, 0x222244);
        this.gridHelper.position.y = 0;
        this.scene.add(this.gridHelper);
        this.helpers.push(this.gridHelper);

        // Оси
        const axesLength = this.getAxesLength();
        this.axesHelper = new THREE.AxesHelper(axesLength);
        this.scene.add(this.axesHelper);
        this.helpers.push(this.axesHelper);
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
        this.updateHelpers();
    }

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
}