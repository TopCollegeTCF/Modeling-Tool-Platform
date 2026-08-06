import * as THREE from 'three';

export class SceneManager {
    constructor() {
        this.scene = null;
        this.entities = new Map();
        this.helpers = [];
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
        const grid = new THREE.GridHelper(20, 20, 0x444466, 0x222244);
        this.scene.add(grid);
        this.helpers.push(grid);
        
        const axes = new THREE.AxesHelper(3);
        this.scene.add(axes);
        this.helpers.push(axes);
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