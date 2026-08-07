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
import { PanelService } from '../services/PanelService.js';
import { GizmoService } from '../services/GizmoService.js';
import { StorageManager } from '../storage/StorageManager.js';
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
        this.panelService = null;
        this.gizmoService = null;
        
        // Storage
        this.storage = new StorageManager();
        
        // State
        this.isRunning = false;
        this.entityIdCounter = 0;
        
        // Инициализация
        this.initScene();
        this.initServices();
        this.initGizmo();
        this.initUI();
        this.initEvents();
        
        this.isRunning = true;
        this.animate();
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
        this.panelService = new PanelService(this);
        console.log('✅ Services initialized');
    }

    initGizmo() {
        try {
            if (!this.renderManager || !this.cameraService) {
                console.warn('⚠️ Cannot init Gizmo: RenderManager or CameraService not ready');
                return;
            }

            this.gizmoService = new GizmoService(this);
            this.gizmoService.init(
                this.renderManager.getCamera(),
                this.renderManager.getRenderer()
            );

            if (this.sceneManager && this.sceneManager.getScene()) {
                this.sceneManager.getScene().add(this.gizmoService.getGizmo());
            }

            console.log('✅ GizmoService initialized');
        } catch (error) {
            console.error('❌ Failed to initialize GizmoService:', error);
        }
    }
    
    initUI() {
        this.uiManager.init();
        this.settingsUI = this.uiManager.settings;
        console.log('✅ UI initialized');
    }

    initEvents() {
        const canvas = this.renderManager.getRenderer().domElement;
        // Передаем toolManager в eventManager
        this.eventManager.init(canvas, this.toolManager);
        this.setupEvents();
        console.log('✅ Events initialized');
    }

    
    setupEvents() {
        // Mouse events for camera
        this.eventManager.on('mousedown', (event) => {
            // Не обрабатываем события, если активен Gizmo или FaceEditTool
            const currentTool = this.toolManager.getCurrentTool();
            if (currentTool && (currentTool.name === 'Face Edit' || currentTool.name === 'Move' || 
                currentTool.name === 'Scale' || currentTool.name === 'Rotate')) {
                // Инструменты сами обрабатывают события
                return;
            }

            if (event.button === 2) {
                this.cameraService.startOrbit(event.clientX, event.clientY);
            } else if (event.button === 1 || (event.button === 0 && event.ctrlKey)) {
                this.cameraService.startPan(event.clientX, event.clientY);
            }
        });

        this.eventManager.on('mousemove', (event) => {
            const currentTool = this.toolManager.getCurrentTool();
            if (currentTool && (currentTool.name === 'Face Edit' || currentTool.name === 'Move' || 
                currentTool.name === 'Scale' || currentTool.name === 'Rotate')) {
                return;
            }
            
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

        // Selection click - только для SelectTool
        this.eventManager.on('click', (event) => {
            const currentTool = this.toolManager.getCurrentTool();
            if (currentTool && currentTool.name !== 'Select') {
                return; // Только SelectTool обрабатывает клики для выделения
            }

            if (event.button === 0 && !event.ctrlKey && !event.metaKey) {
                const selected = this.raycastSelect(event);
                if (selected) {
                    this.selectionManager.select(selected);
                    this.uiManager.updateUI();
                    // Обновляем Gizmo для нового выделения
                    if (this.gizmoService) {
                        const currentTool = this.toolManager.getCurrentTool();
                        if (currentTool && currentTool.name !== 'Select') {
                            this.gizmoService.attach(selected);
                        }
                    }
                } else {
                    this.selectionManager.clear();
                    this.uiManager.updateUI();
                    if (this.gizmoService) {
                        this.gizmoService.detach();
                    }
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
        // Обновляем настройки если они открыты
        if (this.settingsUI && this.settingsUI.isOpen) {
            this.settingsUI.render();
        }
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
    
    animate() {
        if (!this.isRunning) return;
        requestAnimationFrame(() => this.animate());
        
        this.toolManager.update();
        if (this.gizmoService) {
            this.gizmoService.update();
        }
        this.renderManager.render();
    }
    
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
    
    getPanelService() {
        return this.panelService;
    }
}