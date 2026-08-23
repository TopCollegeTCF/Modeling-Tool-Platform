/**
 * 📄 EDITOR - движок для создания проекта и его компонентов
 *
 * 📋 ОПИСАНИЕ:
 * Содержит связь со всеми важными менеджерами и сервисами
 * Запускается одним из первых и создает пространство и окружение.
 *
 * @version 3.0.0
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
 import { CommandManager } from '../services/CommandManager.js';
 import { HistoryManager } from '../services/HistoryManager.js';
 import { MaterialManager } from '../services/MaterialManager.js';
 
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
         
         // Services - история теперь через CommandManager
         this.commandManager = new CommandManager(this, 100);
         this.historyManager = new HistoryManager(this); // Для совместимости

         this.materialManager = new MaterialManager(this);
         
         // Другие сервисы
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
         this._isInitialized = false;
         
         // Инициализация
         this.initScene();
         this.initServices();
         this.initGizmo();
         this.initUI();
         this.initEvents();
         
         this.isRunning = true;
         this._isInitialized = true;
         this.animate();
         
         // Сохраняем начальное состояние истории
         setTimeout(() => {
             this.commandManager.saveInitialState();
             console.log('💾 Initial state saved');
         }, 200);
         
         console.log('✅ Editor initialized');
         console.log('📦 Commands:');
         console.log('  - editor.addCube()');
         console.log('  - editor.addSphere()');
         console.log('  - editor.addCylinder()');
         console.log('  - editor.undo() / editor.redo()');
         console.log('  - editor.toggleSpawnMode()');
         console.log('  - editor.cameraService.reset()');
         console.log('🎮 Controls:');
         console.log('  - Right click + drag: Orbit');
         console.log('  - Middle click + drag: Pan');
         console.log('  - Scroll: Zoom');
         console.log('  - R: Reset camera');
         console.log('  - M: Toggle spawn mode');
         console.log('  - Ctrl+Z: Undo');
         console.log('  - Ctrl+Y: Redo');
         console.log('  - Delete/Backspace: Delete selected');
         console.log('  - 1-5: Switch tools');
         console.log('  - Ctrl+Shift+F: Toggle camera floor limit');
     }
 
     initScene() {
         this.sceneManager.init();
         this.renderManager.init(this.sceneManager.getScene());
         this.toolManager.init();
         this.materialManager.init();
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
                 console.warn('⚠️ Cannot init Gizmo');
                 return;
             }
             
             this.gizmoService = new GizmoService(this);
             this.gizmoService.init(
                 this.renderManager.getCamera(),
                 this.renderManager.getRenderer()
             );
             
             // Добавляем слушатель для автоматической записи в историю
             this.gizmoService.addListener((event, value) => {
                 if (event === 'dragging') {
                     if (value) {
                         // Начало перетаскивания - начинаем группу
                         const currentTool = this.toolManager.getCurrentTool();
                         if (currentTool) {
                             const toolName = currentTool.name.toLowerCase();
                             this.commandManager.beginGroup(toolName);
                             console.log(`📦 ${toolName} group started via Gizmo`);
                         }
                     } else {
                         // Конец перетаскивания - завершаем группу
                         this.commandManager.endGroup();
                         console.log(`📦 Group ended via Gizmo`);
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
         // Mouse events
         this.eventManager.on('mousedown', (event) => {
             const currentTool = this.toolManager.getCurrentTool();
             if (currentTool && (currentTool.name === 'Move' ||
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
             if (currentTool && (currentTool.name === 'Move' ||
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
             // Escape - выход из режимов
             if (event.key === 'Escape') {
                 if (this.cameraService && this.cameraService.flyModeEnabled) {
                     this.cameraService.setFlyMode(false);
                     if (this.uiManager.secondaryToolbar) {
                         this.uiManager.secondaryToolbar.update();
                     }
                     return;
                 }
                 // Снимаем выделение
                 this.selectionManager.clear();
                 this.uiManager.updateUI();
                 if (this.gizmoService) {
                     this.gizmoService.detach();
                 }
                 return;
             }
 
             // Delete / Backspace
             if (event.key === 'Delete' || event.key === 'Backspace') {
                 event.preventDefault();
                 this.deleteSelected();
                 return;
             }
 
             // Undo / Redo
             if (event.ctrlKey && event.key === 'z') {
                 event.preventDefault();
                 this.undo();
                 return;
             }
             if (event.ctrlKey && event.key === 'y') {
                 event.preventDefault();
                 this.redo();
                 return;
             }
 
             // Camera floor limit toggle
             if (event.ctrlKey && event.shiftKey && event.key === 'F') {
                 event.preventDefault();
                 this.toggleCameraFloorLimit();
                 return;
             }
 
             // Tool shortcuts
             if (event.key === '1') { this.toolManager.switchTool('select'); return; }
             if (event.key === '2') { this.toolManager.switchTool('move'); return; }
             if (event.key === '3') { this.toolManager.switchTool('scale'); return; }
             if (event.key === '4') { this.toolManager.switchTool('rotate'); return; }
             if (event.key === '5') { this.toolManager.switchTool('duplicate'); return; }
 
             // Reset camera
             if (event.key === 'r' || event.key === 'R') {
                 this.cameraService.reset();
                 return;
             }
 
             // Toggle spawn mode
             if (event.key === 'm' || event.key === 'M') {
                 this.toggleSpawnMode();
                 return;
             }
         });
     }
 
     // === МЕТОДЫ ДЛЯ СОЗДАНИЯ ФИГУР ===
     addCube(options = {}) {
         const cube = this.shapeManager.createCube(options);
         if (cube) {
             // Записываем в историю
             this.commandManager.push('addCube');
             console.log('📦 Cube created with ID:', cube.userData.id);
         }
         return cube;
     }
 
     addSphere(options = {}) {
         const sphere = this.shapeManager.createSphere(options);
         if (sphere) {
             this.commandManager.push('addSphere');
             console.log('⚪ Sphere created with ID:', sphere.userData.id);
         }
         return sphere;
     }
 
     addCylinder(options = {}) {
         const cylinder = this.shapeManager.createCylinder(options);
         if (cylinder) {
             this.commandManager.push('addCylinder');
             console.log('📐 Cylinder created with ID:', cylinder.userData.id);
         }
         return cylinder;
     }
 
     // === УДАЛЕНИЕ ===
     deleteSelected() {
         const entity = this.selectionManager.getSelected();
         if (!entity) {
             console.log('⛔ No entity selected to delete');
             return;
         }
         
         // Удаляем и записываем в историю
         this.sceneManager.removeEntity(entity);
         this.selectionManager.clear();
         this.uiManager.updateUI();
         this.commandManager.push('delete');
         console.log(`🗑️ Deleted: ${entity.userData.name || entity.userData.type}`);
     }
 
     // === UNDO / REDO ===
     undo() {
         console.log('🔄 Undo called');
         const result = this.commandManager.undo();
         console.log('🔄 Undo result:', result);
         return result;
     }
 
     redo() {
         console.log('🔄 Redo called');
         const result = this.commandManager.redo();
         console.log('🔄 Redo result:', result);
         return result;
     }
 
     // === ЭКСПОРТ / ИМПОРТ ===
     exportScene() {
         return this.commandManager.serialize();
     }
 
     importScene(data) {
         this.commandManager.deserialize(data);
     }
 
     // === СЕРИАЛИЗАЦИЯ ОБЪЕКТОВ ===
     _serializeEntity(entity) {
         if (!entity) return null;
         
         const data = {
             id: entity.userData.id,
             name: entity.userData.name || entity.userData.type,
             type: entity.userData.type,
             position: {
                 x: entity.position.x,
                 y: entity.position.y,
                 z: entity.position.z
             },
             rotation: {
                 x: entity.rotation.x,
                 y: entity.rotation.y,
                 z: entity.rotation.z
             },
             scale: {
                 x: entity.scale.x,
                 y: entity.scale.y,
                 z: entity.scale.z
             }
         };
 
         if (entity.material) {
             if (entity.material.color) {
                 data.color = entity.material.color.getHex();
             }
             data.opacity = entity.material.opacity || 1;
             data.transparent = entity.material.transparent || false;
         }
 
         // Параметры геометрии
         if (entity.type === 'cube') {
             data.width = entity._width !== undefined ? entity._width : entity.geometry.parameters?.width || 1;
             data.height = entity._height !== undefined ? entity._height : entity.geometry.parameters?.height || 1;
             data.depth = entity._depth !== undefined ? entity._depth : entity.geometry.parameters?.depth || 1;
             data.segments = entity._segments !== undefined ? entity._segments : entity.geometry.parameters?.widthSegments || 1;
         } else if (entity.type === 'sphere') {
             data.radius = entity._radius !== undefined ? entity._radius : entity.geometry.parameters?.radius || 0.5;
             data.widthSegments = entity._widthSegments !== undefined ? entity._widthSegments : entity.geometry.parameters?.widthSegments || 32;
             data.heightSegments = entity._heightSegments !== undefined ? entity._heightSegments : entity.geometry.parameters?.heightSegments || 32;
         } else if (entity.type === 'cylinder') {
             data.radiusTop = entity._radiusTop !== undefined ? entity._radiusTop : entity.geometry.parameters?.radiusTop || 0.5;
             data.radiusBottom = entity._radiusBottom !== undefined ? entity._radiusBottom : entity.geometry.parameters?.radiusBottom || 0.5;
             data.height = entity._height !== undefined ? entity._height : entity.geometry.parameters?.height || 1;
             data.radialSegments = entity._radialSegments !== undefined ? entity._radialSegments : entity.geometry.parameters?.radialSegments || 32;
             data.heightSegments = entity._heightSegments !== undefined ? entity._heightSegments : entity.geometry.parameters?.heightSegments || 1;
             data.openEnded = entity._openEnded !== undefined ? entity._openEnded : entity.geometry.parameters?.openEnded || false;
         }
 
         return data;
     }
 
     _deserializeEntity(data) {
         if (!data) return null;
         
         let entity = null;
         
         switch (data.type) {
             case 'cube':
                 entity = this.shapeManager.createCube({
                     width: data.width || 1,
                     height: data.height || 1,
                     depth: data.depth || 1,
                     name: data.name || 'Cube',
                     color: data.color || 0x4a9eff,
                     segments: data.segments || 1,
                     transparent: data.transparent || false,
                     opacity: data.opacity || 1,
                 });
                 break;
             case 'sphere':
                 entity = this.shapeManager.createSphere({
                     radius: data.radius || 0.5,
                     name: data.name || 'Sphere',
                     color: data.color || 0xff6b6b,
                     widthSegments: data.widthSegments || 32,
                     heightSegments: data.heightSegments || 32,
                     transparent: data.transparent || false,
                     opacity: data.opacity || 1,
                 });
                 break;
             case 'cylinder':
                 entity = this.shapeManager.createCylinder({
                     radiusTop: data.radiusTop || 0.5,
                     radiusBottom: data.radiusBottom || 0.5,
                     height: data.height || 1,
                     name: data.name || 'Cylinder',
                     color: data.color || 0x51cf66,
                     radialSegments: data.radialSegments || 32,
                     heightSegments: data.heightSegments || 1,
                     openEnded: data.openEnded || false,
                     transparent: data.transparent || false,
                     opacity: data.opacity || 1,
                 });
                 break;
             default:
                 console.warn('Unknown entity type:', data.type);
                 return null;
         }
 
         if (entity && data.id) {
             entity.userData.id = data.id;
         }
 
         // Восстанавливаем трансформации
         if (entity && data.position) {
             entity.position.set(data.position.x, data.position.y, data.position.z);
         }
         if (entity && data.rotation) {
             entity.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
         }
         if (entity && data.scale) {
             entity.scale.set(data.scale.x, data.scale.y, data.scale.z);
         }
 
         return entity;
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
             console.log(`📷 Camera floor limit toggled`);
         }
     }
 
     /**
      * Очищает сцену и историю для новой сцены
      */
     clearScene() {
         // Очищаем историю
         this.commandManager.clear();
         
         // Удаляем все объекты
         const entities = this.sceneManager.getAllEntities();
         entities.forEach(entity => {
             this.sceneManager.removeEntity(entity);
         });
         
         // Очищаем выделение
         this.selectionManager.clear();
         
         // Обновляем UI
         this.uiManager.updateUI();
         
         // Сбрасываем камеру
         if (this.cameraService) {
             this.cameraService.reset();
         }
         
         // Сбрасываем счетчик ID
         this.entityIdCounter = 0;
         
         // Сохраняем начальное состояние
         this.commandManager.saveInitialState();
         
         console.log('🧹 Scene cleared, history reset');
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
 
     // === GETTERS ===
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
 
     /**
      * Генерирует новый ID для сущности
      */
     generateEntityId() {
         this.entityIdCounter++;
         return this.entityIdCounter;
     }
 }
 
 // Экспорт для использования в других файлах
 export default Editor;