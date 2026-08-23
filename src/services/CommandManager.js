/**
 * 📜 CommandManager - Сервис управления историей команд
 *
 * 🎯 ЗАДАЧА:
 * - Отслеживает все действия пользователя
 * - Создает полные снимки состояния сцены
 * - Управляет Undo/Redo через HistoryManager
 *
 */
 export class CommandManager {
    constructor(editor, maxCommands = 100) {
        this.editor = editor;
        this.maxCommands = maxCommands;
        this.history = [];
        this.currentIndex = -1;
        this.isExecuting = false;
        this.isRestoring = false;
        this._listeners = [];
        this._pendingPush = null;
        this._pushTimeout = null;
        
        // Группировка для непрерывных действий
        this._isInGroup = false;
        this._groupName = null;
        this._groupStartState = null;
        
        console.log('📜 CommandManager v8.1 initialized (max: ' + maxCommands + ')');
    }

    addListener(callback) {
        this._listeners.push(callback);
        return () => {
            this._listeners = this._listeners.filter(cb => cb !== callback);
        };
    }

    notifyListeners() {
        const info = this.getInfo();
        this._listeners.forEach(cb => {
            try { cb(info); } catch (e) {}
        });
    }

    /**
     * Создает полный снимок состояния сцены
     */
    captureState(actionName = 'unknown') {
        const entities = this.editor.sceneManager.getAllEntities();
        const objects = entities.map(entity => this._serializeEntity(entity));
        return {
            timestamp: Date.now(),
            action: actionName,
            objects: objects,
            selectionId: this.editor.selectionManager.getSelected()?.userData?.id || null,
        };
    }

    /**
     * Сериализует один объект
     */
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
            // Сохраняем тип материала
            data.materialType = entity.userData.materialType || 'standard';
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

    /**
     * Восстанавливает состояние сцены из снимка
     */
    restoreState(state) {
        if (!state || !state.objects) {
            console.warn('⚠️ Invalid state to restore');
            return;
        }

        this.isRestoring = true;
        try {
            const existingEntities = this.editor.sceneManager.getAllEntities();
            const existingMap = new Map();
            existingEntities.forEach(entity => {
                existingMap.set(entity.userData.id, entity);
            });

            const newMap = new Map();
            state.objects.forEach(objData => {
                newMap.set(objData.id, objData);
            });

            // 1. Удаляем объекты, которых нет в снимке
            for (const [id, entity] of existingMap) {
                if (!newMap.has(id)) {
                    this.editor.sceneManager.removeEntity(entity);
                }
            }

            // 2. Обновляем существующие и создаем новые
            for (const [id, objData] of newMap) {
                const existing = existingMap.get(id);
                if (existing) {
                    this._updateEntity(existing, objData);
                } else {
                    this._createEntity(objData);
                }
            }

            // 3. Восстанавливаем выделение
            if (state.selectionId !== null) {
                const selected = this.editor.sceneManager.getEntity(state.selectionId);
                if (selected) {
                    this.editor.selectionManager.select(selected);
                } else {
                    this.editor.selectionManager.clear();
                }
            } else {
                this.editor.selectionManager.clear();
            }

            this.editor.uiManager.updateUI();
            console.log(`✅ State restored: ${state.objects.length} objects, action: ${state.action}`);

        } catch (error) {
            console.error('❌ Error restoring state:', error);
        } finally {
            this.isRestoring = false;
        }
    }

    /**
     * Обновляет существующий объект
     */
    _updateEntity(entity, data) {
        if (data.position) {
            entity.position.set(data.position.x, data.position.y, data.position.z);
        }
        if (data.rotation) {
            entity.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
        }
        if (data.scale) {
            entity.scale.set(data.scale.x, data.scale.y, data.scale.z);
        }
        if (data.name) {
            entity.userData.name = data.name;
        }

        // Обновляем материал
        if (entity.material) {
            if (data.color !== undefined) {
                entity.material.color.setHex(data.color);
                if (entity._originalColor) {
                    entity._originalColor.setHex(data.color);
                }
            }
            if (data.opacity !== undefined) {
                entity.material.transparent = data.transparent !== undefined ? data.transparent : data.opacity < 1;
                entity.material.opacity = data.opacity;
                entity.material.needsUpdate = true;
            }
        }

        // Параметры геометрии
        const type = entity.userData.type;
        if (type === 'cube' && typeof entity.setSegments === 'function') {
            if (data.width !== undefined) entity._width = data.width;
            if (data.height !== undefined) entity._height = data.height;
            if (data.depth !== undefined) entity._depth = data.depth;
            if (data.segments !== undefined && data.segments !== entity._segments) {
                entity._segments = data.segments;
                entity.rebuildGeometry();
            }
        } else if (type === 'sphere' && typeof entity.setSegments === 'function') {
            if (data.radius !== undefined) entity._radius = data.radius;
            let needRebuild = false;
            if (data.widthSegments !== undefined && data.widthSegments !== entity._widthSegments) {
                entity._widthSegments = data.widthSegments;
                needRebuild = true;
            }
            if (data.heightSegments !== undefined && data.heightSegments !== entity._heightSegments) {
                entity._heightSegments = data.heightSegments;
                needRebuild = true;
            }
            if (needRebuild || data.radius !== undefined) {
                entity.rebuildGeometry();
            }
        } else if (type === 'cylinder' && typeof entity.setSegments === 'function') {
            if (data.radiusTop !== undefined) entity._radiusTop = data.radiusTop;
            if (data.radiusBottom !== undefined) entity._radiusBottom = data.radiusBottom;
            if (data.height !== undefined) entity._height = data.height;
            if (data.openEnded !== undefined) entity._openEnded = data.openEnded;
            let needRebuild = false;
            if (data.radialSegments !== undefined && data.radialSegments !== entity._radialSegments) {
                entity._radialSegments = data.radialSegments;
                needRebuild = true;
            }
            if (data.heightSegments !== undefined && data.heightSegments !== entity._heightSegments) {
                entity._heightSegments = data.heightSegments;
                needRebuild = true;
            }
            if (needRebuild || data.radiusTop !== undefined || data.radiusBottom !== undefined || data.height !== undefined) {
                entity.rebuildGeometry();
            }
        }
    }

    /**
     * Создает новый объект
     */
    _createEntity(data) {
        let entity = null;
        switch (data.type) {
            case 'cube':
                entity = this.editor.shapeManager.createCube({
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
                entity = this.editor.shapeManager.createSphere({
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
                entity = this.editor.shapeManager.createCylinder({
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
        return entity;
    }

    /**
     * Начинает группировку действий
     */
    beginGroup(groupName = 'group') {
        if (this._isInGroup) {
            console.warn('⚠️ Already in a group, ending previous group');
            this.endGroup();
        }
        this._isInGroup = true;
        this._groupName = groupName;
        this._groupStartState = this.captureState(`group_start_${groupName}`);
        console.log(`📦 Group started: ${groupName}`);
    }

    /**
     * Завершает группировку действий
     */
    endGroup() {
        if (!this._isInGroup || !this._groupStartState) {
            this._isInGroup = false;
            this._groupName = null;
            this._groupStartState = null;
            console.log('📦 Group ended (empty)');
            return;
        }

        const endState = this.captureState(`group_end_${this._groupName}`);
        
        if (this._statesEqual(this._groupStartState, endState)) {
            console.log('📦 No changes in group, skipping');
            this._isInGroup = false;
            this._groupName = null;
            this._groupStartState = null;
            return;
        }

        this._pushState(endState, this._groupName);

        this._isInGroup = false;
        this._groupName = null;
        this._groupStartState = null;
        console.log(`📦 Group ended: ${this._groupName}`);
    }

    /**
     * Сравнивает два состояния
     */
    _statesEqual(state1, state2) {
        if (!state1 || !state2) return false;
        if (state1.objects.length !== state2.objects.length) return false;
        for (let i = 0; i < state1.objects.length; i++) {
            const obj1 = state1.objects[i];
            const obj2 = state2.objects[i];
            if (!this._objectsEqual(obj1, obj2)) return false;
        }
        return true;
    }

    /**
     * Сравнивает два объекта
     */
    _objectsEqual(obj1, obj2) {
        if (!obj1 || !obj2) return false;
        if (obj1.id !== obj2.id) return false;
        if (obj1.type !== obj2.type) return false;
        
        const eps = 0.0001;
        const pos1 = obj1.position, pos2 = obj2.position;
        if (Math.abs(pos1.x - pos2.x) > eps || Math.abs(pos1.y - pos2.y) > eps || Math.abs(pos1.z - pos2.z) > eps) return false;
        
        const rot1 = obj1.rotation, rot2 = obj2.rotation;
        if (Math.abs(rot1.x - rot2.x) > eps || Math.abs(rot1.y - rot2.y) > eps || Math.abs(rot1.z - rot2.z) > eps) return false;
        
        const scale1 = obj1.scale, scale2 = obj2.scale;
        if (Math.abs(scale1.x - scale2.x) > eps || Math.abs(scale1.y - scale2.y) > eps || Math.abs(scale1.z - scale2.z) > eps) return false;
        
        if (obj1.color !== undefined && obj2.color !== undefined && obj1.color !== obj2.color) return false;
        if (obj1.opacity !== undefined && obj2.opacity !== undefined && Math.abs(obj1.opacity - obj2.opacity) > eps) return false;
        
        return true;
    }

    /**
     * Сохраняет состояние в историю
     */
    _pushState(state, actionName = 'unknown') {
        if (this.isRestoring) {
            console.log('⏭️ Skipping push - restoring');
            return;
        }
        if (this.isExecuting) {
            console.log('⏭️ Skipping push - executing');
            return;
        }
        if (!state) {
            console.log('⏭️ No state to push');
            return;
        }

        this.history = this.history.slice(0, this.currentIndex + 1);
        this.history.push(state);
        this.currentIndex = this.history.length - 1;

        if (this.history.length > this.maxCommands) {
            const removeCount = this.history.length - this.maxCommands;
            this.history.splice(0, removeCount);
            this.currentIndex -= removeCount;
        }

        console.log(`📝 History: ${this.history.length} steps, index: ${this.currentIndex}, action: ${actionName}`);
        this.notifyListeners();
    }

    /**
     * Записывает действие в историю с принудительным сохранением
     */
    push(actionName = 'unknown', force = false) {
        if (this.isRestoring) return;
        if (this._isInGroup) {
            console.log(`📝 Adding to group: ${actionName}`);
            return;
        }
        
        // Если force=true, записываем сразу
        if (force) {
            const state = this.captureState(actionName);
            this._pushState(state, actionName);
            return;
        }
        
        // Иначе с небольшой задержкой (чтобы захватить все изменения)
        if (this._pushTimeout) {
            clearTimeout(this._pushTimeout);
        }
        
        this._pendingPush = actionName;
        this._pushTimeout = setTimeout(() => {
            if (this._pendingPush) {
                const state = this.captureState(this._pendingPush);
                this._pushState(state, this._pendingPush);
                this._pendingPush = null;
            }
            this._pushTimeout = null;
        }, 50);
    }

    /**
     * Принудительно сохраняет текущее состояние (для сохранения проекта)
     */
    flush() {
        if (this._pushTimeout) {
            clearTimeout(this._pushTimeout);
            this._pushTimeout = null;
        }
        if (this._pendingPush) {
            const state = this.captureState(this._pendingPush);
            this._pushState(state, this._pendingPush);
            this._pendingPush = null;
        }
        // Также завершаем группу, если она активна
        if (this._isInGroup) {
            this.endGroup();
        }
    }

    /**
     * Откат на один шаг назад (Undo)
     */
    undo() {
        this.flush(); // Принудительно сохраняем перед откатом
        if (this.isExecuting) return false;
        if (this._isInGroup) {
            console.warn('⚠️ Cannot undo while in group');
            return false;
        }
        if (this.currentIndex <= 0) {
            console.log('⛔ No commands to undo');
            return false;
        }

        this.isExecuting = true;
        try {
            this.currentIndex--;
            const state = this.history[this.currentIndex];
            this.restoreState(state);
            console.log(`⬅️ Undo: step ${this.currentIndex + 1}/${this.history.length}`);
            this.notifyListeners();
            return true;
        } catch (error) {
            console.error('❌ Error undoing command:', error);
            return false;
        } finally {
            this.isExecuting = false;
        }
    }

    /**
     * Повтор команды (Redo)
     */
    redo() {
        this.flush(); // Принудительно сохраняем перед повтором
        if (this.isExecuting) return false;
        if (this._isInGroup) {
            console.warn('⚠️ Cannot redo while in group');
            return false;
        }
        if (this.currentIndex >= this.history.length - 1) {
            console.log('⛔ No commands to redo');
            return false;
        }

        this.isExecuting = true;
        try {
            this.currentIndex++;
            const state = this.history[this.currentIndex];
            this.restoreState(state);
            console.log(`➡️ Redo: step ${this.currentIndex + 1}/${this.history.length}`);
            this.notifyListeners();
            return true;
        } catch (error) {
            console.error('❌ Error redoing command:', error);
            return false;
        } finally {
            this.isExecuting = false;
        }
    }

    canUndo() {
        return this.currentIndex > 0 && !this._isInGroup;
    }

    canRedo() {
        return this.currentIndex < this.history.length - 1 && !this._isInGroup;
    }

    getInfo() {
        return {
            totalCommands: this.history.length,
            currentIndex: this.currentIndex,
            canUndo: this.canUndo(),
            canRedo: this.canRedo()
        };
    }

    clear() {
        this.history = [];
        this.currentIndex = -1;
        this._isInGroup = false;
        this._groupName = null;
        this._groupStartState = null;
        if (this._pushTimeout) {
            clearTimeout(this._pushTimeout);
            this._pushTimeout = null;
        }
        this._pendingPush = null;
        console.log('🧹 History cleared');
        this.notifyListeners();
    }

    saveInitialState() {
        this.clear();
        const state = this.captureState('initial');
        this.history.push(state);
        this.currentIndex = 0;
        console.log('💾 Initial state saved');
        this.notifyListeners();
    }

    serialize() {
        this.flush(); // Принудительно сохраняем перед сериализацией
        return {
            version: '8.1',
            timestamp: Date.now(),
            history: this.history,
            currentIndex: this.currentIndex
        };
    }

    deserialize(data) {
        if (!data || !data.history) return;
        this.isRestoring = true;
        try {
            this.history = data.history;
            this.currentIndex = data.currentIndex !== undefined ? data.currentIndex : this.history.length - 1;
            if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
                this.restoreState(this.history[this.currentIndex]);
            }
            console.log(`📂 History restored: ${this.history.length} steps`);
            this.notifyListeners();
        } catch (error) {
            console.error('❌ Error deserializing history:', error);
        } finally {
            this.isRestoring = false;
        }
    }
}