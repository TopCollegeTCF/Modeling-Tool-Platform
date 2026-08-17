/**
 * 📜 CommandManager - Управление командами (действиями пользователя)
 *
 * 🎯 ЗАДАЧА:
 * - Хранит все действия пользователя как отдельные команды
 * - Каждая команда имеет execute() и undo() методы
 * - При Undo вызывается undo() последней команды
 * - При Redo вызывается execute() следующей команды
 * - При сохранении проекта сериализует все команды в JSON
 *
 * @version 1.0.0
 * @author Gabryelf
 */
 export class CommandManager {
    constructor(editor, maxCommands = 100) {
        this.editor = editor;
        this.maxCommands = maxCommands;
        this.commands = [];
        this.currentIndex = -1;
        this.isExecuting = false;
        this._listeners = [];
        
        console.log('📜 CommandManager initialized (max: ' + maxCommands + ')');
    }

    /**
     * Добавляет слушатель изменений
     */
    addListener(callback) {
        this._listeners.push(callback);
        return () => {
            this._listeners = this._listeners.filter(cb => cb !== callback);
        };
    }

    /**
     * Уведомляет слушателей
     */
    notifyListeners() {
        const info = this.getInfo();
        this._listeners.forEach(cb => {
            try { cb(info); } catch (e) {}
        });
    }

    /**
     * Выполняет команду и добавляет в историю
     */
    execute(command) {
        if (this.isExecuting) return;
        this.isExecuting = true;

        try {
            // Выполняем команду
            command.execute();
            
            // Обрезаем историю после текущего индекса
            this.commands = this.commands.slice(0, this.currentIndex + 1);
            
            // Добавляем команду
            this.commands.push(command);
            this.currentIndex = this.commands.length - 1;
            
            // Ограничиваем размер
            if (this.commands.length > this.maxCommands) {
                const removeCount = this.commands.length - this.maxCommands;
                this.commands.splice(0, removeCount);
                this.currentIndex -= removeCount;
            }
            
            console.log(`✅ Command executed: ${command.type} (${this.commands.length} total)`);
            this.notifyListeners();
        } catch (error) {
            console.error('❌ Error executing command:', error);
        } finally {
            this.isExecuting = false;
        }
    }

    /**
     * Откат последней команды (Undo)
     */
    undo() {
        if (this.currentIndex < 0) {
            console.log('⛔ No commands to undo');
            return;
        }

        this.isExecuting = true;
        try {
            const command = this.commands[this.currentIndex];
            command.undo();
            this.currentIndex--;
            console.log(`⬅️ Undo: ${command.type}`);
            this.notifyListeners();
        } catch (error) {
            console.error('❌ Error undoing command:', error);
        } finally {
            this.isExecuting = false;
        }
    }

    /**
     * Повтор команды (Redo)
     */
    redo() {
        if (this.currentIndex >= this.commands.length - 1) {
            console.log('⛔ No commands to redo');
            return;
        }

        this.isExecuting = true;
        try {
            this.currentIndex++;
            const command = this.commands[this.currentIndex];
            command.execute();
            console.log(`➡️ Redo: ${command.type}`);
            this.notifyListeners();
        } catch (error) {
            console.error('❌ Error redoing command:', error);
        } finally {
            this.isExecuting = false;
        }
    }

    canUndo() {
        return this.currentIndex >= 0;
    }

    canRedo() {
        return this.currentIndex < this.commands.length - 1;
    }

    getInfo() {
        return {
            totalCommands: this.commands.length,
            currentIndex: this.currentIndex,
            canUndo: this.canUndo(),
            canRedo: this.canRedo()
        };
    }

    /**
     * Сериализует все команды в JSON
     */
    serialize() {
        return {
            version: '1.0',
            timestamp: Date.now(),
            commands: this.commands.map(cmd => cmd.serialize()),
            currentIndex: this.currentIndex
        };
    }

    /**
     * Десериализует команды из JSON
     */
    deserialize(data) {
        if (!data || !data.commands) return;
        
        this.isExecuting = true;
        try {
            // Очищаем текущую историю
            this.commands = [];
            this.currentIndex = -1;
            
            // Восстанавливаем команды
            for (const cmdData of data.commands) {
                const command = this.createCommandFromData(cmdData);
                if (command) {
                    this.commands.push(command);
                }
            }
            
            this.currentIndex = data.currentIndex !== undefined ? data.currentIndex : this.commands.length - 1;
            
            // Восстанавливаем состояние, выполняя все команды до текущего индекса
            for (let i = 0; i <= this.currentIndex; i++) {
                this.commands[i].execute();
            }
            
            console.log(`📂 Commands restored: ${this.commands.length}`);
            this.notifyListeners();
        } catch (error) {
            console.error('❌ Error deserializing commands:', error);
        } finally {
            this.isExecuting = false;
        }
    }

    /**
     * Создает команду из данных
     */
    createCommandFromData(data) {
        switch (data.type) {
            case 'addCube':
                return new AddCubeCommand(this.editor, data.params);
            case 'addSphere':
                return new AddSphereCommand(this.editor, data.params);
            case 'addCylinder':
                return new AddCylinderCommand(this.editor, data.params);
            case 'delete':
                return new DeleteCommand(this.editor, data.params);
            case 'move':
                return new MoveCommand(this.editor, data.params);
            case 'rotate':
                return new RotateCommand(this.editor, data.params);
            case 'scale':
                return new ScaleCommand(this.editor, data.params);
            case 'changeColor':
                return new ChangeColorCommand(this.editor, data.params);
            case 'changeOpacity':
                return new ChangeOpacityCommand(this.editor, data.params);
            case 'changeName':
                return new ChangeNameCommand(this.editor, data.params);
            case 'segmentsChange':
                return new SegmentsChangeCommand(this.editor, data.params);
            case 'duplicate':
                return new DuplicateCommand(this.editor, data.params);
            default:
                console.warn('Unknown command type:', data.type);
                return null;
        }
    }

    /**
     * Очищает историю
     */
    clear() {
        this.commands = [];
        this.currentIndex = -1;
        console.log('🧹 Commands cleared');
        this.notifyListeners();
    }
}

// ============================================
// КОМАНДЫ
// ============================================

// --- БАЗОВАЯ КОМАНДА ---
class BaseCommand {
    constructor(editor, params = {}) {
        this.editor = editor;
        this.params = params;
        this.type = 'base';
    }

    execute() {}
    undo() {}
    serialize() {
        return {
            type: this.type,
            params: this.params
        };
    }
}

// --- СОЗДАНИЕ КУБА ---
export class AddCubeCommand extends BaseCommand {
    constructor(editor, params = {}) {
        super(editor, params);
        this.type = 'addCube';
        this.entityId = null;
        this.entityData = null;
    }

    execute() {
        const cube = this.editor.addCube(this.params);
        if (cube) {
            this.entityId = cube.userData.id;
            this.entityData = this.editor.historyManager.serializeEntity(cube);
        }
    }

    undo() {
        if (this.entityId !== null) {
            const entity = this.editor.sceneManager.getEntity(this.entityId);
            if (entity) {
                this.editor.sceneManager.removeEntity(entity);
                this.editor.selectionManager.clear();
                this.editor.uiManager.updateUI();
            }
        }
    }

    serialize() {
        return {
            type: this.type,
            params: this.params,
            entityId: this.entityId,
            entityData: this.entityData
        };
    }
}

// --- СОЗДАНИЕ СФЕРЫ ---
export class AddSphereCommand extends BaseCommand {
    constructor(editor, params = {}) {
        super(editor, params);
        this.type = 'addSphere';
        this.entityId = null;
        this.entityData = null;
    }

    execute() {
        const sphere = this.editor.addSphere(this.params);
        if (sphere) {
            this.entityId = sphere.userData.id;
            this.entityData = this.editor.historyManager.serializeEntity(sphere);
        }
    }

    undo() {
        if (this.entityId !== null) {
            const entity = this.editor.sceneManager.getEntity(this.entityId);
            if (entity) {
                this.editor.sceneManager.removeEntity(entity);
                this.editor.selectionManager.clear();
                this.editor.uiManager.updateUI();
            }
        }
    }

    serialize() {
        return {
            type: this.type,
            params: this.params,
            entityId: this.entityId,
            entityData: this.entityData
        };
    }
}

// --- СОЗДАНИЕ ЦИЛИНДРА ---
export class AddCylinderCommand extends BaseCommand {
    constructor(editor, params = {}) {
        super(editor, params);
        this.type = 'addCylinder';
        this.entityId = null;
        this.entityData = null;
    }

    execute() {
        const cylinder = this.editor.addCylinder(this.params);
        if (cylinder) {
            this.entityId = cylinder.userData.id;
            this.entityData = this.editor.historyManager.serializeEntity(cylinder);
        }
    }

    undo() {
        if (this.entityId !== null) {
            const entity = this.editor.sceneManager.getEntity(this.entityId);
            if (entity) {
                this.editor.sceneManager.removeEntity(entity);
                this.editor.selectionManager.clear();
                this.editor.uiManager.updateUI();
            }
        }
    }

    serialize() {
        return {
            type: this.type,
            params: this.params,
            entityId: this.entityId,
            entityData: this.entityData
        };
    }
}

// --- УДАЛЕНИЕ ---
export class DeleteCommand extends BaseCommand {
    constructor(editor, params = {}) {
        super(editor, params);
        this.type = 'delete';
        this.entityId = params.entityId;
        this.entityData = params.entityData;
        this.entityName = params.entityName;
    }

    execute() {
        if (this.entityId !== null) {
            const entity = this.editor.sceneManager.getEntity(this.entityId);
            if (entity) {
                this.editor.sceneManager.removeEntity(entity);
                this.editor.selectionManager.clear();
                this.editor.uiManager.updateUI();
            }
        }
    }

    undo() {
        if (this.entityData) {
            const entity = this.editor.historyManager.deserializeEntity(this.entityData);
            if (entity) {
                this.editor.sceneManager.addEntity(entity);
                this.editor.selectionManager.select(entity);
                this.editor.uiManager.updateUI();
            }
        }
    }

    serialize() {
        return {
            type: this.type,
            params: {
                entityId: this.entityId,
                entityData: this.entityData,
                entityName: this.entityName
            }
        };
    }
}

// --- ПЕРЕМЕЩЕНИЕ ---
export class MoveCommand extends BaseCommand {
    constructor(editor, params = {}) {
        super(editor, params);
        this.type = 'move';
        this.entityId = params.entityId;
        this.oldPosition = params.oldPosition;
        this.newPosition = params.newPosition;
    }

    execute() {
        if (this.entityId !== null) {
            const entity = this.editor.sceneManager.getEntity(this.entityId);
            if (entity && this.newPosition) {
                entity.position.set(this.newPosition.x, this.newPosition.y, this.newPosition.z);
                this.editor.uiManager.updateUI();
            }
        }
    }

    undo() {
        if (this.entityId !== null) {
            const entity = this.editor.sceneManager.getEntity(this.entityId);
            if (entity && this.oldPosition) {
                entity.position.set(this.oldPosition.x, this.oldPosition.y, this.oldPosition.z);
                this.editor.uiManager.updateUI();
            }
        }
    }

    serialize() {
        return {
            type: this.type,
            params: {
                entityId: this.entityId,
                oldPosition: this.oldPosition,
                newPosition: this.newPosition
            }
        };
    }
}

// --- ВРАЩЕНИЕ ---
export class RotateCommand extends BaseCommand {
    constructor(editor, params = {}) {
        super(editor, params);
        this.type = 'rotate';
        this.entityId = params.entityId;
        this.oldRotation = params.oldRotation;
        this.newRotation = params.newRotation;
    }

    execute() {
        if (this.entityId !== null) {
            const entity = this.editor.sceneManager.getEntity(this.entityId);
            if (entity && this.newRotation) {
                entity.rotation.set(this.newRotation.x, this.newRotation.y, this.newRotation.z);
                this.editor.uiManager.updateUI();
            }
        }
    }

    undo() {
        if (this.entityId !== null) {
            const entity = this.editor.sceneManager.getEntity(this.entityId);
            if (entity && this.oldRotation) {
                entity.rotation.set(this.oldRotation.x, this.oldRotation.y, this.oldRotation.z);
                this.editor.uiManager.updateUI();
            }
        }
    }

    serialize() {
        return {
            type: this.type,
            params: {
                entityId: this.entityId,
                oldRotation: this.oldRotation,
                newRotation: this.newRotation
            }
        };
    }
}

// --- МАСШТАБИРОВАНИЕ ---
export class ScaleCommand extends BaseCommand {
    constructor(editor, params = {}) {
        super(editor, params);
        this.type = 'scale';
        this.entityId = params.entityId;
        this.oldScale = params.oldScale;
        this.newScale = params.newScale;
    }

    execute() {
        if (this.entityId !== null) {
            const entity = this.editor.sceneManager.getEntity(this.entityId);
            if (entity && this.newScale) {
                entity.scale.set(this.newScale.x, this.newScale.y, this.newScale.z);
                this.editor.uiManager.updateUI();
            }
        }
    }

    undo() {
        if (this.entityId !== null) {
            const entity = this.editor.sceneManager.getEntity(this.entityId);
            if (entity && this.oldScale) {
                entity.scale.set(this.oldScale.x, this.oldScale.y, this.oldScale.z);
                this.editor.uiManager.updateUI();
            }
        }
    }

    serialize() {
        return {
            type: this.type,
            params: {
                entityId: this.entityId,
                oldScale: this.oldScale,
                newScale: this.newScale
            }
        };
    }
}

// --- ИЗМЕНЕНИЕ ЦВЕТА ---
export class ChangeColorCommand extends BaseCommand {
    constructor(editor, params = {}) {
        super(editor, params);
        this.type = 'changeColor';
        this.entityId = params.entityId;
        this.oldColor = params.oldColor;
        this.newColor = params.newColor;
    }

    execute() {
        if (this.entityId !== null) {
            const entity = this.editor.sceneManager.getEntity(this.entityId);
            if (entity && entity.material && this.newColor !== undefined) {
                entity.material.color.setHex(this.newColor);
                entity.material.needsUpdate = true;
                this.editor.uiManager.updateUI();
            }
        }
    }

    undo() {
        if (this.entityId !== null) {
            const entity = this.editor.sceneManager.getEntity(this.entityId);
            if (entity && entity.material && this.oldColor !== undefined) {
                entity.material.color.setHex(this.oldColor);
                entity.material.needsUpdate = true;
                this.editor.uiManager.updateUI();
            }
        }
    }

    serialize() {
        return {
            type: this.type,
            params: {
                entityId: this.entityId,
                oldColor: this.oldColor,
                newColor: this.newColor
            }
        };
    }
}

// --- ИЗМЕНЕНИЕ ПРОЗРАЧНОСТИ ---
export class ChangeOpacityCommand extends BaseCommand {
    constructor(editor, params = {}) {
        super(editor, params);
        this.type = 'changeOpacity';
        this.entityId = params.entityId;
        this.oldOpacity = params.oldOpacity;
        this.newOpacity = params.newOpacity;
    }

    execute() {
        if (this.entityId !== null) {
            const entity = this.editor.sceneManager.getEntity(this.entityId);
            if (entity && entity.material && this.newOpacity !== undefined) {
                entity.material.transparent = true;
                entity.material.opacity = this.newOpacity;
                entity.material.needsUpdate = true;
                this.editor.uiManager.updateUI();
            }
        }
    }

    undo() {
        if (this.entityId !== null) {
            const entity = this.editor.sceneManager.getEntity(this.entityId);
            if (entity && entity.material && this.oldOpacity !== undefined) {
                entity.material.opacity = this.oldOpacity;
                entity.material.needsUpdate = true;
                this.editor.uiManager.updateUI();
            }
        }
    }

    serialize() {
        return {
            type: this.type,
            params: {
                entityId: this.entityId,
                oldOpacity: this.oldOpacity,
                newOpacity: this.newOpacity
            }
        };
    }
}

// --- ИЗМЕНЕНИЕ ИМЕНИ ---
export class ChangeNameCommand extends BaseCommand {
    constructor(editor, params = {}) {
        super(editor, params);
        this.type = 'changeName';
        this.entityId = params.entityId;
        this.oldName = params.oldName;
        this.newName = params.newName;
    }

    execute() {
        if (this.entityId !== null) {
            const entity = this.editor.sceneManager.getEntity(this.entityId);
            if (entity) {
                entity.userData.name = this.newName;
                this.editor.uiManager.updateUI();
            }
        }
    }

    undo() {
        if (this.entityId !== null) {
            const entity = this.editor.sceneManager.getEntity(this.entityId);
            if (entity) {
                entity.userData.name = this.oldName;
                this.editor.uiManager.updateUI();
            }
        }
    }

    serialize() {
        return {
            type: this.type,
            params: {
                entityId: this.entityId,
                oldName: this.oldName,
                newName: this.newName
            }
        };
    }
}

// --- ИЗМЕНЕНИЕ СЕГМЕНТОВ ---
export class SegmentsChangeCommand extends BaseCommand {
    constructor(editor, params = {}) {
        super(editor, params);
        this.type = 'segmentsChange';
        this.entityId = params.entityId;
        this.oldSegments = params.oldSegments;
        this.newSegments = params.newSegments;
        this.entityType = params.entityType;
    }

    execute() {
        if (this.entityId !== null) {
            const entity = this.editor.sceneManager.getEntity(this.entityId);
            if (entity && typeof entity.setSegments === 'function') {
                if (this.entityType === 'cube') {
                    entity.setSegments(this.newSegments);
                } else if (this.entityType === 'sphere') {
                    entity.setSegments(this.newSegments.width, this.newSegments.height);
                } else if (this.entityType === 'cylinder') {
                    entity.setSegments(this.newSegments.radial, this.newSegments.height);
                }
                this.editor.uiManager.updateUI();
            }
        }
    }

    undo() {
        if (this.entityId !== null) {
            const entity = this.editor.sceneManager.getEntity(this.entityId);
            if (entity && typeof entity.setSegments === 'function') {
                if (this.entityType === 'cube') {
                    entity.setSegments(this.oldSegments);
                } else if (this.entityType === 'sphere') {
                    entity.setSegments(this.oldSegments.width, this.oldSegments.height);
                } else if (this.entityType === 'cylinder') {
                    entity.setSegments(this.oldSegments.radial, this.oldSegments.height);
                }
                this.editor.uiManager.updateUI();
            }
        }
    }

    serialize() {
        return {
            type: this.type,
            params: {
                entityId: this.entityId,
                oldSegments: this.oldSegments,
                newSegments: this.newSegments,
                entityType: this.entityType
            }
        };
    }
}

// --- ДУБЛИРОВАНИЕ ---
export class DuplicateCommand extends BaseCommand {
    constructor(editor, params = {}) {
        super(editor, params);
        this.type = 'duplicate';
        this.sourceId = params.sourceId;
        this.newEntityId = null;
        this.newEntityData = null;
    }

    execute() {
        const source = this.editor.sceneManager.getEntity(this.sourceId);
        if (source) {
            const duplicateTool = this.editor.toolManager.getTool('duplicate');
            if (duplicateTool) {
                duplicateTool.duplicateObject(source);
                // Получаем созданную копию
                const entities = this.editor.sceneManager.getAllEntities();
                const lastEntity = entities[entities.length - 1];
                if (lastEntity) {
                    this.newEntityId = lastEntity.userData.id;
                    this.newEntityData = this.editor.historyManager.serializeEntity(lastEntity);
                }
            }
        }
    }

    undo() {
        if (this.newEntityId !== null) {
            const entity = this.editor.sceneManager.getEntity(this.newEntityId);
            if (entity) {
                this.editor.sceneManager.removeEntity(entity);
                this.editor.selectionManager.clear();
                this.editor.uiManager.updateUI();
            }
        }
    }

    serialize() {
        return {
            type: this.type,
            params: {
                sourceId: this.sourceId,
                newEntityId: this.newEntityId,
                newEntityData: this.newEntityData
            }
        };
    }
}