/**
 * 📄 EDITOR - движок для создания проекта и его компонентов
 *
 * 📋 ОПИСАНИЕ:
 * Содержит связь со всеми важными менеджерами и сервисами
 * Запускается одним из первых и создает пространство и окружение.
 *
 */
import * as THREE from 'three';
import { SceneManager } from './SceneManager.js';
import { RenderManager } from './RenderManager.js';
import { SelectionManager } from './SelectionManager.js';
import { TransformManager } from './TransformManager.js';
import { EventManager } from './EventManager.js';
import { ShapeManager } from './ShapeManager.js';
import { ToolManager } from '../tools/ToolManager.js';
import { UIManager } from '../ui/UIManager.js';
import { CameraService } from '../services/CameraService.js';
import { SpawnService } from '../services/SpawnService.js';
import { SceneService } from '../services/SceneService.js';
import { PanelService } from '../services/PanelService.js';
import { GizmoService } from '../services/GizmoService.js';
import { StorageManager } from '../storage/StorageManager.js';
import { HistoryManager } from './HistoryManager.js';
import { CommandManager } from './CommandManager.js';
import {
    AddCubeCommand,
    AddSphereCommand,
    AddCylinderCommand,
    DeleteCommand,
    MoveCommand,
    RotateCommand,
    ScaleCommand,
    ChangeColorCommand,
    ChangeOpacityCommand,
    ChangeNameCommand,
    SegmentsChangeCommand,
    DuplicateCommand
} from './CommandManager.js';

export class Editor {
    constructor() {
        // Core managers
        this.sceneManager = new SceneManager();
        this.renderManager = new RenderManager();
        this.selectionManager = new SelectionManager();
        this.transformManager = new TransformManager();
        this.eventManager = new EventManager();
        this.shapeManager = new ShapeManager(this);
        this.toolManager = new ToolManager(this);
        this.uiManager = new UIManager(this);
        this.historyManager = new HistoryManager(this, 50);
        this.commandManager = new CommandManager(this, 100);

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

        setTimeout(() => {
            this.commandManager.clear();
        }, 200);
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

            this.gizmoService.addListener((event, value) => {
                if (event === 'dragging' && !value) {
                    // Для перемещения через Gizmo создаем команду
                    const selected = this.selectionManager.getSelected();
                    if (selected) {
                        // Создаем команду Move
                        const pos = selected.position.clone();
                        const command = new MoveCommand(this, {
                            entityId: selected.userData.id,
                            oldPosition: this._lastGizmoPosition || pos.clone(),
                            newPosition: pos
                        });
                        this.commandManager.execute(command);
                        this._lastGizmoPosition = pos.clone();
                    }
                }
            });

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
        this.eventManager.init(canvas, this.toolManager);
        this.setupEvents();
        console.log('✅ Events initialized');
    }

    setupEvents() {
        // Mouse events for camera
        this.eventManager.on('mousedown', (event) => {
            const currentTool = this.toolManager.getCurrentTool();
            if (currentTool && (currentTool.name === 'Face Edit' || currentTool.name === 'Move' ||
                currentTool.name === 'Scale' || currentTool.name === 'Rotate')) {
                return;
            }

            if (this.cameraService && this.cameraService.flyModeEnabled) {
                this.cameraService.setFlyMode(false);
                if (this.uiManager.secondaryToolbar) {
                    this.uiManager.secondaryToolbar.update();
                }
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

        // Selection click
        this.eventManager.on('click', (event) => {
            const currentTool = this.toolManager.getCurrentTool();
            if (currentTool && currentTool.name !== 'Select') {
                return;
            }

            if (event.button === 0 && !event.ctrlKey && !event.metaKey) {
                const selected = this.raycastSelect(event);
                if (selected) {
                    this.selectionManager.select(selected);
                    this.uiManager.updateUI();
                    if (this.gizmoService) {
                        const currentTool = this.toolManager.getCurrentTool();
                        if (currentTool && currentTool.name !== 'Select') {
                            this.gizmoService.attach(selected);
                            // Сохраняем начальную позицию для Gizmo
                            if (selected) {
                                this._lastGizmoPosition = selected.position.clone();
                            }
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
            if (event.key === 'Escape') {
                if (this.cameraService && this.cameraService.flyModeEnabled) {
                    this.cameraService.setFlyMode(false);
                    if (this.uiManager.secondaryToolbar) {
                        this.uiManager.secondaryToolbar.update();
                    }
                    return;
                }
            }

            if (event.key === 'Delete' || event.key === 'Backspace') {
                this.deleteSelected();
            }

            if (event.ctrlKey && event.key === 'z') {
                event.preventDefault();
                this.undo();
            }

            if (event.ctrlKey && event.key === 'y') {
                event.preventDefault();
                this.redo();
            }

            if (event.ctrlKey && event.shiftKey && event.key === 'F') {
                event.preventDefault();
                this.toggleCameraFloorLimit();
            }

            if (event.key === '1') this.toolManager.switchTool('select');
            if (event.key === '2') this.toolManager.switchTool('move');
            if (event.key === '3') this.toolManager.switchTool('scale');
            if (event.key === '4') this.toolManager.switchTool('rotate');
            if (event.key === '5') this.toolManager.switchTool('duplicate');
            if (event.key === 'r' || event.key === 'R') {
                this.cameraService.reset();
            }
            if (event.key === 'm' || event.key === 'M') {
                this.toggleSpawnMode();
            }
        });
    }

    // === МЕТОДЫ ДЛЯ СОЗДАНИЯ ФИГУР С КОМАНДАМИ ===
    addCube(options = {}) {
        const command = new AddCubeCommand(this, options);
        this.commandManager.execute(command);
        const entity = this.sceneManager.getEntity(command.entityId);
        console.log('📦 Cube created with command');
        return entity;
    }

    addSphere(options = {}) {
        const command = new AddSphereCommand(this, options);
        this.commandManager.execute(command);
        const entity = this.sceneManager.getEntity(command.entityId);
        console.log('⚪ Sphere created with command');
        return entity;
    }

    addCylinder(options = {}) {
        const command = new AddCylinderCommand(this, options);
        this.commandManager.execute(command);
        const entity = this.sceneManager.getEntity(command.entityId);
        console.log('📐 Cylinder created with command');
        return entity;
    }

    // === УДАЛЕНИЕ С КОМАНДОЙ ===
    deleteSelected() {
        const entity = this.selectionManager.getSelected();
        if (!entity) return;

        const entityData = this.historyManager.serializeEntity(entity);
        const command = new DeleteCommand(this, {
            entityId: entity.userData.id,
            entityData: entityData,
            entityName: entity.userData.name
        });
        this.commandManager.execute(command);
        console.log('🗑️ Delete command executed');
    }

    // === ДУБЛИРОВАНИЕ С КОМАНДОЙ ===
    duplicateSelected() {
        const entity = this.selectionManager.getSelected();
        if (!entity) return;

        const command = new DuplicateCommand(this, {
            sourceId: entity.userData.id
        });
        this.commandManager.execute(command);
        console.log('📋 Duplicate command executed');
    }

    // === UNDO / REDO ===
    undo() {
        this.commandManager.undo();
    }

    redo() {
        this.commandManager.redo();
    }

    // === ЭКСПОРТ / ИМПОРТ ===
    exportScene() {
        return this.commandManager.serialize();
    }

    importScene(data) {
        this.commandManager.deserialize(data);
    }

    // === ОСТАЛЬНЫЕ МЕТОДЫ ===
    toggleSpawnMode() {
        const modes = ['center', 'marker'];
        const current = this.spawnService.getMode();
        const next = current === 'center' ? 'marker' : 'center';
        this.spawnService.setMode(next);
        this.uiManager.updateUI();
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

    toggleCameraFloorLimit() {
        if (this.cameraService) {
            this.cameraService.setAllowBelowFloor(!this.cameraService.getAllowBelowFloor());
            if (this.settingsUI && this.settingsUI.isOpen) {
                this.settingsUI.render();
            }
            console.log(`📷 Camera floor limit toggled via hotkey`);
        }
    }

    animate() {
        if (!this.isRunning) return;
        requestAnimationFrame(() => this.animate());

        if (this.cameraService && this.cameraService.flyModeEnabled) {
            this.cameraService.updateFlyMode();
        }

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