import * as THREE from 'three';
import { SceneManager } from './SceneManager.js';
import { RenderManager } from './RenderManager.js';
import { SelectionManager } from './SelectionManager.js';
import { TransformManager } from './TransformManager.js';
import { EventManager } from './EventManager.js';
import { ToolManager } from '../tools/ToolManager.js';
import { UIManager } from '../ui/UIManager.js';
import { CameraService } from '../services/CameraService.js';
import { SpawnService } from '../services/SpawnService.js';
import { SceneService } from '../services/SceneService.js';
import { Cube } from '../entities/Cube.js';
import { Sphere } from '../entities/Sphere.js';
import { Cylinder } from '../entities/Cylinder.js';

export class Editor {
    constructor() {
        // Core managers
        this.sceneManager = new SceneManager();
        this.renderManager = new RenderManager();
        this.selectionManager = new SelectionManager();
        this.transformManager = new TransformManager();
        this.eventManager = new EventManager();
        this.toolManager = new ToolManager(this);
        this.uiManager = new UIManager(this);
        
        // Services
        this.cameraService = null;
        this.spawnService = null;
        this.sceneService = null;
        
        // State
        this.isRunning = false;
        this.entityIdCounter = 0;
        
        this.initUI();
        this.initScene();
        this.initServices();
        this.initEvents();
        
        this.isRunning = true;
        this.animate();
    }
    
    initUI() {
        this.uiManager.init();
        console.log('✅ UI initialized');
    }
    
    initScene() {
        this.sceneManager.init();
        this.renderManager.init(this.sceneManager.getScene());
        this.toolManager.init();
        console.log('✅ Scene initialized');
    }
    
    initServices() {
        this.cameraService = new CameraService(this.renderManager.getCamera());
        this.spawnService = new SpawnService(this);
        this.sceneService = new SceneService(this);
        console.log('✅ Services initialized');
    }
    
    initEvents() {
        const canvas = this.renderManager.getRenderer().domElement;
        this.eventManager.init(canvas);
        this.setupEvents();
        console.log('✅ Events initialized');
    }
    
    setupEvents() {
        // Mouse events for camera
        this.eventManager.on('mousedown', (event) => {
            if (event.button === 2) {
                // Right click - orbit
                this.cameraService.startOrbit(event.clientX, event.clientY);
            } else if (event.button === 1 || (event.button === 0 && event.ctrlKey)) {
                // Middle click or Ctrl+click - pan
                this.cameraService.startPan(event.clientX, event.clientY);
            }
        });
        
        this.eventManager.on('mousemove', (event) => {
            this.cameraService.orbit(event.clientX, event.clientY);
            this.cameraService.pan(event.clientX, event.clientY);
        });
        
        this.eventManager.on('mouseup', () => {
            this.cameraService.stopOrbit();
            this.cameraService.stopPan();
        });
        
        this.eventManager.on('wheel', (event) => {
            event.preventDefault();
            this.cameraService.zoom(event.deltaY > 0 ? 1 : -1);
        });
        
        this.eventManager.on('contextmenu', (event) => {
            event.preventDefault();
        });
        
        // Selection click
        this.eventManager.on('click', (event) => {
            if (event.button === 0 && !event.ctrlKey && !event.metaKey) {
                const selected = this.raycastSelect(event);
                if (selected) {
                    this.selectionManager.select(selected);
                    this.uiManager.updateUI();
                } else {
                    this.selectionManager.clear();
                    this.uiManager.updateUI();
                }
            }
        });
        
        // Keyboard events
        this.eventManager.on('keydown', (event) => {
            if (event.key === 'Delete' || event.key === 'Backspace') {
                this.deleteSelected();
            }
            if (event.key === '1') this.toolManager.switchTool('select');
            if (event.key === '2') this.toolManager.switchTool('move');
            if (event.key === '3') this.toolManager.switchTool('scale');
            if (event.key === '4') this.toolManager.switchTool('rotate');
            if (event.key === '5') this.toolManager.switchTool('face-edit');
            if (event.key === 'r' || event.key === 'R') {
                this.cameraService.reset();
            }
            if (event.key === 'm' || event.key === 'M') {
                this.toggleSpawnMode();
            }
        });
    }
    
    toggleSpawnMode() {
        const modes = ['center', 'marker'];
        const current = this.spawnService.getMode();
        const next = current === 'center' ? 'marker' : 'center';
        this.spawnService.setMode(next);
        this.uiManager.updateUI();
        console.log(`📍 Spawn mode: ${next}`);
    }
    
    raycastSelect(event) {
        const renderer = this.renderManager.getRenderer();
        const camera = this.renderManager.getCamera();
        const rect = renderer.domElement.getBoundingClientRect();
        
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        );
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        
        const objects = this.sceneManager.getAllEntities();
        const intersects = raycaster.intersectObjects(objects);
        
        if (intersects.length > 0) {
            return intersects[0].object;
        }
        return null;
    }
    
    // ========== Фабрика сущностей ==========
    
    addCube(options = {}) {
        this.entityIdCounter++;
        const cube = new Cube(1, 1, 1, options);
        cube.userData.id = this.entityIdCounter;
        const pos = this.spawnService.getSpawnPosition();
        cube.position.copy(pos);
        this.sceneManager.addEntity(cube);
        this.selectionManager.select(cube);
        this.uiManager.updateUI();
        console.log(`✅ Cube created (id: ${this.entityIdCounter})`);
        return cube;
    }
    
    addSphere(options = {}) {
        this.entityIdCounter++;
        const sphere = new Sphere(0.5, options);
        sphere.userData.id = this.entityIdCounter;
        const pos = this.spawnService.getSpawnPosition();
        sphere.position.copy(pos);
        this.sceneManager.addEntity(sphere);
        this.selectionManager.select(sphere);
        this.uiManager.updateUI();
        console.log(`✅ Sphere created (id: ${this.entityIdCounter})`);
        return sphere;
    }
    
    addCylinder(options = {}) {
        this.entityIdCounter++;
        const cylinder = new Cylinder(0.5, 0.5, 1, options);
        cylinder.userData.id = this.entityIdCounter;
        const pos = this.spawnService.getSpawnPosition();
        cylinder.position.copy(pos);
        this.sceneManager.addEntity(cylinder);
        this.selectionManager.select(cylinder);
        this.uiManager.updateUI();
        console.log(`✅ Cylinder created (id: ${this.entityIdCounter})`);
        return cylinder;
    }
    
    deleteSelected() {
        const entity = this.selectionManager.getSelected();
        if (entity) {
            this.sceneManager.removeEntity(entity);
            this.selectionManager.clear();
            this.uiManager.updateUI();
        }
    }
    
    // ========== Цикл анимации ==========
    
    animate() {
        if (!this.isRunning) return;
        requestAnimationFrame(() => this.animate());
        
        this.toolManager.update();
        this.renderManager.render();
    }
    
    // ========== Геттеры ==========
    
    getScene() {
        return this.sceneManager.getScene();
    }
    
    getCamera() {
        return this.renderManager.getCamera();
    }
    
    getRenderer() {
        return this.renderManager.getRenderer();
    }
    
    getSpawnService() {
        return this.spawnService;
    }
}