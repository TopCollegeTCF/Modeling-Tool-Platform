/**
 * 📜 History Manager - Управление историей действий
 *
 * 🎯 Задача: Хранит все действия пользователя с возможностью отката (Undo/Redo)
 * 💾 Хранение: Каждый шаг - это полная копия состояния сцены в JSON
 * 🔮 Будущее: При подключении БД, история будет сохраняться в базу данных
 *
 * @version 1.1.0
 * @author Gabryelf
 * @since 0.0.8
 */
 export class HistoryManager {
    constructor(editor, maxSteps = 50) {
        this.editor = editor;
        this.maxSteps = maxSteps;
        this.history = [];
        this.currentIndex = -1;
        this.isRestoring = false;

        // 🔥 Новые поля для группировки
        this.groupStack = [];
        this.isInGroup = false;
        this.groupName = null;

        this.sessionId = null;
        console.log('📜 HistoryManager initialized (max steps: ' + maxSteps + ')');
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

        if (entity.type === 'cube') {
            data.width = entity.width;
            data.height = entity.height;
            data.depth = entity.depth;
        } else if (entity.type === 'sphere') {
            data.radius = entity.radius;
        } else if (entity.type === 'cylinder') {
            data.radiusTop = entity.radiusTop;
            data.radiusBottom = entity.radiusBottom;
            data.height = entity.height;
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

        this.isRestoring = true;
        try {
            const entities = this.editor.sceneManager.getAllEntities();
            entities.forEach(entity => {
                this.editor.sceneManager.removeEntity(entity);
            });

            this.editor.entityIdCounter = 0;

            if (state.objects && state.objects.length > 0) {
                state.objects.forEach(objData => {
                    this.deserializeEntity(objData);
                });
            }

            this.editor.selectionManager.clear();
            this.editor.uiManager.updateUI();

            console.log('✅ State restored: ' + state.objects?.length + ' objects');
        } catch (error) {
            console.error('❌ Error restoring state:', error);
        } finally {
            this.isRestoring = false;
        }
    }

    /**
     * Десериализует объект из JSON и добавляет на сцену
     */
    deserializeEntity(data) {
        let entity = null;

        switch (data.type) {
            case 'cube':
                entity = this.editor.addCube({
                    width: data.width || 1,
                    height: data.height || 1,
                    depth: data.depth || 1,
                    name: data.name || 'Cube',
                    color: data.color || 0x4a9eff
                });
                break;
            case 'sphere':
                entity = this.editor.addSphere({
                    radius: data.radius || 0.5,
                    name: data.name || 'Sphere',
                    color: data.color || 0xff6b6b
                });
                break;
            case 'cylinder':
                entity = this.editor.addCylinder({
                    radiusTop: data.radiusTop || 0.5,
                    radiusBottom: data.radiusBottom || 0.5,
                    height: data.height || 1,
                    name: data.name || 'Cylinder',
                    color: data.color || 0x51cf66
                });
                break;
            default:
                console.warn('Unknown entity type:', data.type);
                return null;
        }

        if (!entity) return null;

        if (data.position) {
            entity.position.set(data.position.x, data.position.y, data.position.z);
        }
        if (data.rotation) {
            entity.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
        }
        if (data.scale) {
            entity.scale.set(data.scale.x, data.scale.y, data.scale.z);
        }

        if (entity.material && data.opacity !== undefined) {
            entity.material.transparent = data.transparent !== undefined ? data.transparent : data.opacity < 1;
            entity.material.opacity = data.opacity;
            entity.material.needsUpdate = true;
        }

        if (data.id) {
            entity.userData.id = data.id;
            this.editor.entityIdCounter = Math.max(this.editor.entityIdCounter, data.id);
        }

        return entity;
    }

    /**
     * Добавляет новый снимок в историю
     */
    push(actionName = 'unknown') {
        if (this.isRestoring) return;

        // Если мы в группе, не создаем отдельные снимки
        if (this.isInGroup) {
            console.log(`📝 Adding to group: ${actionName}`);
            return;
        }

        const state = this.captureState(actionName);
        if (!state) return;

        this.history = this.history.slice(0, this.currentIndex + 1);
        this.history.push(state);
        this.currentIndex = this.history.length - 1;

        if (this.history.length > this.maxSteps) {
            const removeCount = this.history.length - this.maxSteps;
            this.history.splice(0, removeCount);
            this.currentIndex -= removeCount;
        }

        console.log(`📝 History: ${this.history.length} steps (${actionName})`);
    }

    /**
     * Откат на один шаг назад (Undo)
     */
    undo() {
        if (this.currentIndex <= 0) {
            console.log('⛔ Cannot undo: at beginning of history');
            return;
        }

        // Если мы в группе, выходим из нее
        if (this.isInGroup) {
            this.endGroup();
        }

        this.currentIndex--;
        const state = this.history[this.currentIndex];
        this.restoreState(state);
        console.log(`⬅️ Undo: step ${this.currentIndex + 1}/${this.history.length}`);
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
            version: '1.1',
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
    }

    /**
     * Сохраняет текущее состояние как начальное
     */
    saveInitialState() {
        this.clear();
        this.push('initial');
        console.log('💾 Initial state saved');
    }
}