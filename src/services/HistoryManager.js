/**
 * 📜 HistoryManager - Упрощенный менеджер истории
 *
 * 🎯 ЗАДАЧА:
 * - Предоставляет интерфейс совместимости со старым кодом
 * - Вся логика теперь в CommandManager
 *
 */
 export class HistoryManager {
    constructor(editor) {
        this.editor = editor;
        console.log('📜 HistoryManager v2.0 initialized (compatibility layer)');
    }

    // Проксируем все методы в CommandManager
    addListener(callback) {
        return this.editor.commandManager.addListener(callback);
    }

    beginGroup(name) {
        this.editor.commandManager.beginGroup(name);
    }

    endGroup() {
        this.editor.commandManager.endGroup();
    }

    push(actionName, force = false) {
        this.editor.commandManager.push(actionName, force);
    }

    undo() {
        return this.editor.commandManager.undo();
    }

    redo() {
        return this.editor.commandManager.redo();
    }

    canUndo() {
        return this.editor.commandManager.canUndo();
    }

    canRedo() {
        return this.editor.commandManager.canRedo();
    }

    getInfo() {
        return this.editor.commandManager.getInfo();
    }

    clear() {
        this.editor.commandManager.clear();
    }

    saveInitialState() {
        this.editor.commandManager.saveInitialState();
    }

    captureState(actionName) {
        return this.editor.commandManager.captureState(actionName);
    }

    restoreState(state) {
        this.editor.commandManager.restoreState(state);
    }

    serialize() {
        return this.editor.commandManager.serialize();
    }

    deserialize(data) {
        this.editor.commandManager.deserialize(data);
    }

    flush() {
        this.editor.commandManager.flush();
    }
}