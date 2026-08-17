/**
 * 📜 History Manager - Управление историей действий
 *
 * 🎯 Задача: Хранит все действия пользователя с возможностью отката (Undo/Redo)
 * 💾 Хранение: Каждый шаг - это полная копия состояния сцены в JSON
 *
 */
export class HistoryManager {
    constructor(editor, maxSteps = 50) {
        this.editor = editor;
        this.maxSteps = maxSteps;
        this.history = [];
        this.currentIndex = -1;
        this.isRestoring = false;
        this._isInitializing = false;

        // Группировка
        this.groupStack = [];
        this.isInGroup = false;
        this.groupName = null;

        this.sessionId = null;
        this._listeners = [];
        console.log('📜 HistoryManager initialized (max steps: ' + maxSteps + ')');
    }

    /**
     * Добавляет слушатель изменений истории
     */
    addListener(callback) {
        this._listeners.push(callback);
        return () => {
            this._listeners = this._listeners.filter(cb => cb !== callback);
        };
    }

    /**
     * Уведомляет слушателей об изменении истории
     */
    notifyListeners() {
        const info = this.getInfo();
        this._listeners.forEach(callback => {
            try {
                callback(info);
            } catch (e) {
                console.error('Error in history listener:', e);
            }
        });
    }

    /**
     * Начинает группировку действий
     */
    beginGroup(groupName = 'group') {
        if (this.isInGroup) {
            console.warn('⚠️ Already in a group, ending previous group');
            this.endGroup();
        }
        this.isInGroup = true;
        this.groupName = groupName;
        const state = this.captureState(`group_start_${groupName}`);
        this.groupStack.push(state);
        console.log(`📦 Group started: ${groupName}`);
    }

    /**
     * Завершает группировку действий
     */
    endGroup() {
        if (!this.isInGroup || this.groupStack.length === 0) {
            console.warn('⚠️ No active group to end');
            return;
        }
        const state = this.captureState(`group_end_${this.groupName}`);
        const groupState = {
            type: 'group',
            name: this.groupName,
            startState: this.groupStack[0],
            endState: state,
            timestamp: Date.now()
        };
        this.history.push(groupState);
        this.currentIndex = this.history.length - 1;

        this.groupStack = [];
        this.isInGroup = false;
        console.log(`📦 Group ended: ${this.groupName}`);
        this.groupName = null;
        this.notifyListeners();
    }

    /**
     * Создает снимок текущего состояния сцены
     */
    captureState(actionName = 'unknown') {
        if (this.isRestoring) return null;
        const state = {
            timestamp: Date.now(),
            action: actionName,
            objects: this.captureObjects()
        };
        return state;
    }

    /**
     * Захватывает все объекты сцены в JSON
     */
    captureObjects() {
        const entities = this.editor.sceneManager.getAllEntities();
        return entities.map(entity => this.serializeEntity(entity));
    }

    /**
     * Сериализует один объект в JSON
     */
    serializeEntity(entity) {
        const data = {
            id: entity.userData.id,
            name: entity.userData.name,
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

        if (entity.material && entity.material.color) {
            data.color = entity.material.color.getHex();
        }

        if (entity.material) {
            data.opacity = entity.material.opacity || 1;
            data.transparent = entity.material.transparent || false;
        }

        // Параметры геометрии
        if (entity.type === 'cube') {
            data.width = entity._width !== undefined ? entity._width : entity.width;
            data.height = entity._height !== undefined ? entity._height : entity.height;
            data.depth = entity._depth !== undefined ? entity._depth : entity.depth;
            data.segments = entity._segments !== undefined ? entity._segments : entity.segments || 1;
        } else if (entity.type === 'sphere') {
            data.radius = entity._radius !== undefined ? entity._radius : entity.radius;
            data.widthSegments = entity._widthSegments !== undefined ? entity._widthSegments : entity.widthSegments || 32;
            data.heightSegments = entity._heightSegments !== undefined ? entity._heightSegments : entity.heightSegments || 32;
        } else if (entity.type === 'cylinder') {
            data.radiusTop = entity._radiusTop !== undefined ? entity._radiusTop : entity.radiusTop;
            data.radiusBottom = entity._radiusBottom !== undefined ? entity._radiusBottom : entity.radiusBottom;
            data.height = entity._height !== undefined ? entity._height : entity.height;
            data.radialSegments = entity._radialSegments !== undefined ? entity._radialSegments : entity.radialSegments || 32;
            data.heightSegments = entity._heightSegments !== undefined ? entity._heightSegments : entity.heightSegments || 1;
            data.openEnded = entity._openEnded !== undefined ? entity._openEnded : entity.openEnded || false;
        }

        return data;
    }

    /**
     * Восстанавливает состояние из снимка
     */
    restoreState(state) {
        if (!state) return;

        // Если это группа, восстанавливаем конечное состояние
        if (state.type === 'group') {
            state = state.endState;
        }

        if (!state.objects) return;

        this.isRestoring = true;
        try {
            const currentEntities = this.editor.sceneManager.getAllEntities();
            const currentMap = new Map();
            currentEntities.forEach(entity => {
                currentMap.set(entity.userData.id, entity);
            });

            const newMap = new Map();
            for (const objData of state.objects) {
                newMap.set(objData.id, objData);
            }

            // 1. Обновляем существующие объекты
            for (const [id, entity] of currentMap) {
                const newData = newMap.get(id);
                if (newData) {
                    this.updateEntity(entity, newData);
                    newMap.delete(id);
                } else {
                    this.editor.sceneManager.removeEntity(entity);
                }
            }

            // 2. Создаем новые объекты
            for (const [id, objData] of newMap) {
                this.createEntity(objData);
            }

            // Обновляем счетчик ID
            let maxId = 0;
            for (const objData of state.objects) {
                if (objData.id > maxId) maxId = objData.id;
            }
            this.editor.entityIdCounter = maxId;

            this.editor.selectionManager.clear();
            this.editor.uiManager.updateUI();

            console.log('✅ State restored: ' + state.objects.length + ' objects');
        } catch (error) {
            console.error('❌ Error restoring state:', error);
        } finally {
            this.isRestoring = false;
        }
        this.notifyListeners();
    }

    /**
     * Обновляет существующий объект из данных
     */
    updateEntity(entity, data) {
        const type = entity.userData.type;

        // Обновляем трансформации
        if (data.position) {
            entity.position.set(data.position.x, data.position.y, data.position.z);
        }
        if (data.rotation) {
            entity.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
        }
        if (data.scale) {
            entity.scale.set(data.scale.x, data.scale.y, data.scale.z);
        }

        // Обновляем имя
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

        // Обновляем параметры геометрии
        if (type === 'cube') {
            if (data.width !== undefined) {
                entity._width = data.width;
                entity.width = data.width;
            }
            if (data.height !== undefined) {
                entity._height = data.height;
                entity.height = data.height;
            }
            if (data.depth !== undefined) {
                entity._depth = data.depth;
                entity.depth = data.depth;
            }
            if (data.segments !== undefined) {
                const newSegments = data.segments;
                if (entity._segments !== newSegments) {
                    entity._segments = newSegments;
                    entity.segments = newSegments;
                    entity.rebuildGeometry();
                } else {
                    entity.rebuildGeometry();
                }
            } else {
                entity.rebuildGeometry();
            }
        } else if (type === 'sphere') {
            if (data.radius !== undefined) {
                entity._radius = data.radius;
                entity.radius = data.radius;
            }
            let needsRebuild = false;
            if (data.widthSegments !== undefined && data.widthSegments !== entity._widthSegments) {
                entity._widthSegments = data.widthSegments;
                entity.widthSegments = data.widthSegments;
                needsRebuild = true;
            }
            if (data.heightSegments !== undefined && data.heightSegments !== entity._heightSegments) {
                entity._heightSegments = data.heightSegments;
                entity.heightSegments = data.heightSegments;
                needsRebuild = true;
            }
            if (needsRebuild || data.radius !== undefined) {
                entity.rebuildGeometry();
            }
        } else if (type === 'cylinder') {
            if (data.radiusTop !== undefined) {
                entity._radiusTop = data.radiusTop;
                entity.radiusTop = data.radiusTop;
            }
            if (data.radiusBottom !== undefined) {
                entity._radiusBottom = data.radiusBottom;
                entity.radiusBottom = data.radiusBottom;
            }
            if (data.height !== undefined) {
                entity._height = data.height;
                entity.height = data.height;
            }
            if (data.openEnded !== undefined) {
                entity._openEnded = data.openEnded;
                entity.openEnded = data.openEnded;
            }
            let needsRebuild = false;
            if (data.radialSegments !== undefined && data.radialSegments !== entity._radialSegments) {
                entity._radialSegments = data.radialSegments;
                entity.radialSegments = data.radialSegments;
                needsRebuild = true;
            }
            if (data.heightSegments !== undefined && data.heightSegments !== entity._heightSegments) {
                entity._heightSegments = data.heightSegments;
                entity.heightSegments = data.heightSegments;
                needsRebuild = true;
            }
            if (needsRebuild || data.radiusTop !== undefined || data.radiusBottom !== undefined || data.height !== undefined) {
                entity.rebuildGeometry();
            }
        }
    }

    /**
     * Создает новый объект из данных
     */
    createEntity(data) {
        let entity = null;
        const wasRestoring = this.isRestoring;
        this.isRestoring = true;

        try {
            switch (data.type) {
                case 'cube':
                    entity = this.editor.addCube({
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
                    entity = this.editor.addSphere({
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
                    entity = this.editor.addCylinder({
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
        } finally {
            this.isRestoring = wasRestoring;
        }

        return entity;
    }

    /**
    * Добавляет новый снимок в историю
    */
    push(actionName = 'unknown') {
        console.log(`📝 push() called: ${actionName}, isRestoring=${this.isRestoring}, _isInitializing=${this._isInitializing}`);

        if (this.isRestoring) {
            console.log('⏭️ Skipping push - restoring');
            return;
        }

        if (this._isInitializing) {
            console.log('⏭️ Skipping push - initializing');
            return;
        }

        if (this.isInGroup) {
            console.log(`📝 Adding to group: ${actionName}`);
            return;
        }

        const state = this.captureState(actionName);
        if (!state) {
            console.log('⏭️ No state captured');
            return;
        }

        console.log(`📝 Captured state: ${state.objects.length} objects`);

        // Обрезаем историю до текущего индекса
        this.history = this.history.slice(0, this.currentIndex + 1);
        this.history.push(state);
        this.currentIndex = this.history.length - 1;

        // Ограничиваем размер истории
        if (this.history.length > this.maxSteps) {
            const removeCount = this.history.length - this.maxSteps;
            this.history.splice(0, removeCount);
            this.currentIndex -= removeCount;
        }

        console.log(`📝 History: ${this.history.length} steps, index: ${this.currentIndex}, canUndo: ${this.canUndo()}`);
        this.notifyListeners();
    }

    /**
     * Откат на один шаг назад (Undo)
     */
    undo() {
        if (this.currentIndex <= 0) {
            console.log('⛔ Cannot undo: at beginning of history');
            return;
        }

        if (this.isInGroup) {
            this.endGroup();
        }

        this.currentIndex--;
        const state = this.history[this.currentIndex];
        this.restoreState(state);
        console.log(`⬅️ Undo: step ${this.currentIndex + 1}/${this.history.length}`);
        this.notifyListeners();
    }

    /**
     * Шаг вперед (Redo)
     */
    redo() {
        if (this.currentIndex >= this.history.length - 1) {
            console.log('⛔ Cannot redo: at end of history');
            return;
        }

        this.currentIndex++;
        const state = this.history[this.currentIndex];
        this.restoreState(state);
        console.log(`➡️ Redo: step ${this.currentIndex + 1}/${this.history.length}`);
        this.notifyListeners();
    }

    canUndo() {
        return this.currentIndex > 0;
    }

    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    getInfo() {
        return {
            totalSteps: this.history.length,
            currentStep: this.currentIndex + 1,
            canUndo: this.canUndo(),
            canRedo: this.canRedo()
        };
    }

    /**
     * Экспорт истории
     */
    exportHistory() {
        return {
            version: '1.6',
            createdAt: new Date().toISOString(),
            history: this.history,
            currentIndex: this.currentIndex,
            maxSteps: this.maxSteps
        };
    }

    /**
     * Импорт истории
     */
    importHistory(data) {
        if (!data || !data.history || data.history.length === 0) {
            console.warn('⚠️ No history data to import');
            return;
        }

        this.history = data.history;
        this.currentIndex = data.currentIndex !== undefined ? data.currentIndex : this.history.length - 1;
        this.maxSteps = data.maxSteps || this.maxSteps;

        if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
            this.restoreState(this.history[this.currentIndex]);
        }

        console.log(`📂 History imported: ${this.history.length} steps`);
        this.notifyListeners();
    }

    /**
     * Очищает историю
     */
    clear() {
        this.history = [];
        this.currentIndex = -1;
        this.groupStack = [];
        this.isInGroup = false;
        this.groupName = null;
        console.log('🧹 History cleared');
        this.notifyListeners();
    }

    /**
     * Сохраняет текущее состояние как начальное
     */
    saveInitialState() {
        this.clear();
        this._isInitializing = true;
        this.push('initial');
        this._isInitializing = false;
        console.log('💾 Initial state saved');
        // Убеждаемся, что кнопки обновлены
        setTimeout(() => {
            this.notifyListeners();
        }, 50);
    }

    // В HistoryManager добавляем методы для сериализации/десериализации объектов

    /**
     * Сериализует объект в JSON для сохранения в командах
     */
    serializeEntity(entity) {
        const data = {
            id: entity.userData.id,
            name: entity.userData.name,
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

        if (entity.material && entity.material.color) {
            data.color = entity.material.color.getHex();
        }

        if (entity.material) {
            data.opacity = entity.material.opacity || 1;
            data.transparent = entity.material.transparent || false;
        }

        if (entity.type === 'cube') {
            data.width = entity._width !== undefined ? entity._width : entity.width;
            data.height = entity._height !== undefined ? entity._height : entity.height;
            data.depth = entity._depth !== undefined ? entity._depth : entity.depth;
            data.segments = entity._segments !== undefined ? entity._segments : entity.segments || 1;
        } else if (entity.type === 'sphere') {
            data.radius = entity._radius !== undefined ? entity._radius : entity.radius;
            data.widthSegments = entity._widthSegments !== undefined ? entity._widthSegments : entity.widthSegments || 32;
            data.heightSegments = entity._heightSegments !== undefined ? entity._heightSegments : entity.heightSegments || 32;
        } else if (entity.type === 'cylinder') {
            data.radiusTop = entity._radiusTop !== undefined ? entity._radiusTop : entity.radiusTop;
            data.radiusBottom = entity._radiusBottom !== undefined ? entity._radiusBottom : entity.radiusBottom;
            data.height = entity._height !== undefined ? entity._height : entity.height;
            data.radialSegments = entity._radialSegments !== undefined ? entity._radialSegments : entity.radialSegments || 32;
            data.heightSegments = entity._heightSegments !== undefined ? entity._heightSegments : entity.heightSegments || 1;
            data.openEnded = entity._openEnded !== undefined ? entity._openEnded : entity.openEnded || false;
        }

        return data;
    }

    /**
     * Десериализует объект из JSON и создает его на сцене
     */
    deserializeEntity(data) {
        let entity = null;
        const wasRestoring = this.isRestoring;
        this.isRestoring = true;

        try {
            switch (data.type) {
                case 'cube':
                    entity = this.editor.addCube({
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
                    entity = this.editor.addSphere({
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
                    entity = this.editor.addCylinder({
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
        } finally {
            this.isRestoring = wasRestoring;
        }

        return entity;
    }
}