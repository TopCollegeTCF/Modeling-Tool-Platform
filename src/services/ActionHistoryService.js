/**
 * 📜 ActionHistoryService - Сервис для автоматического отслеживания всех действий пользователя
 *
 * 📋 ОПИСАНИЕ:
 * Этот сервис является прослойкой между компонентами приложения и HistoryManager.
 * Он автоматически создает снимки состояния перед любым действием пользователя,
 * что позволяет откатывать (Undo/Redo) любые изменения, а не только создание объектов.
 *
 * 🎯 ЗАДАЧИ:
 * - Автоматический перехват всех действий пользователя
 * - Создание снимков состояния перед изменениями
 * - Группировка последовательных действий (например, перемещение)
 * - Предотвращение дублирования снимков
 *
 */


export class ActionHistoryService {
    constructor(editor) {
        this.editor = editor;
        this.historyManager = editor.historyManager;
        this.isRecording = true;
        this.isBulkAction = false;
        this.bulkActionName = null;
        this.bulkStarted = false;
        this.lastActionTime = 0;
        this.actionCooldown = 500;

        console.log('📜 ActionHistoryService initialized');
    }

    /**
     * Начинает запись действия
     */
    beginAction(actionName, context = {}) {
        if (!this.isRecording) {
            return () => {};
        }

        const shouldCapture = this.shouldCaptureAction(actionName);
        if (!shouldCapture) {
            return () => {};
        }

        // 🔥 СОХРАНЯЕМ СОСТОЯНИЕ ДО ИЗМЕНЕНИЯ
        const stateBefore = this.historyManager.captureState(`before_${actionName}`);
        console.log(`📝 Action started: ${actionName}`, { stateBefore: stateBefore?.objects?.length || 0 });

        const now = Date.now();
        if (now - this.lastActionTime < this.actionCooldown && !this.bulkStarted) {
            this.startBulkAction(actionName);
        }
        this.lastActionTime = now;

        return (result) => {
            this.endAction(actionName, stateBefore, result, context);
        };
    }

    /**
     * Завершает запись действия
     */
    endAction(actionName, stateBefore, result = null, context = {}) {
        if (!this.isRecording || !stateBefore) {
            console.log(`⏭️ Skipping endAction: recording=${this.isRecording}, stateBefore=${!!stateBefore}`);
            return;
        }

        // 🔥 СОХРАНЯЕМ СОСТОЯНИЕ ПОСЛЕ ИЗМЕНЕНИЯ
        const stateAfter = this.historyManager.captureState(`after_${actionName}`);
        console.log(`📝 Action ended: ${actionName}`, { 
            before: stateBefore?.objects?.length || 0, 
            after: stateAfter?.objects?.length || 0 
        });

        if (this.isStateChanged(stateBefore, stateAfter)) {
            // 🔥 СОЗДАЕМ ШАГ В ИСТОРИИ
            this.historyManager.push(actionName);
            console.log(`✅ Action recorded: ${actionName}`);
        } else {
            console.log(`⏭️ Skipping action ${actionName} (no changes)`);
        }

        if (this.bulkStarted) {
            this.endBulkAction();
        }
    }

    isStateChanged(before, after) {
        if (!before || !after) return true;
        if (before.objects?.length !== after.objects?.length) return true;

        const beforeMap = new Map();
        before.objects?.forEach(obj => {
            beforeMap.set(obj.id, obj);
        });

        for (const afterObj of after.objects || []) {
            const beforeObj = beforeMap.get(afterObj.id);
            if (!beforeObj) return true;
            
            if (this.hasPositionChanged(beforeObj.position, afterObj.position)) return true;
            if (this.hasRotationChanged(beforeObj.rotation, afterObj.rotation)) return true;
            if (this.hasScaleChanged(beforeObj.scale, afterObj.scale)) return true;
            if (beforeObj.color !== afterObj.color) return true;
        }

        return false;
    }

    hasPositionChanged(pos1, pos2) {
        if (!pos1 || !pos2) return true;
        const eps = 0.001;
        return Math.abs(pos1.x - pos2.x) > eps ||
               Math.abs(pos1.y - pos2.y) > eps ||
               Math.abs(pos1.z - pos2.z) > eps;
    }

    hasRotationChanged(rot1, rot2) {
        if (!rot1 || !rot2) return true;
        const eps = 0.001;
        return Math.abs(rot1.x - rot2.x) > eps ||
               Math.abs(rot1.y - rot2.y) > eps ||
               Math.abs(rot1.z - rot2.z) > eps;
    }

    hasScaleChanged(scale1, scale2) {
        if (!scale1 || !scale2) return true;
        const eps = 0.001;
        return Math.abs(scale1.x - scale2.x) > eps ||
               Math.abs(scale1.y - scale2.y) > eps ||
               Math.abs(scale1.z - scale2.z) > eps;
    }

    shouldCaptureAction(actionName) {
        if (!this.isRecording) return false;
        if (actionName === 'select') return false;
        if (actionName === 'update') return false;
        return true;
    }

    startBulkAction(name) {
        if (this.bulkStarted) return;
        this.bulkStarted = true;
        this.bulkActionName = name;
        console.log(`📦 Bulk action started: ${name}`);
    }

    endBulkAction() {
        if (!this.bulkStarted) return;
        this.bulkStarted = false;
        console.log(`📦 Bulk action ended: ${this.bulkActionName}`);
        if (this.bulkActionName) {
            this.historyManager.push(`bulk_${this.bulkActionName}`);
        }
        this.bulkActionName = null;
    }

    setRecording(enabled) {
        this.isRecording = enabled;
        console.log(`📜 Recording ${enabled ? 'enabled' : 'disabled'}`);
    }

    wrap(fn, actionName, context = {}) {
        return (...args) => {
            const endAction = this.beginAction(actionName, context);
            try {
                const result = fn(...args);
                endAction(result);
                return result;
            } catch (error) {
                console.error(`Error in action ${actionName}:`, error);
                endAction(null);
                throw error;
            }
        };
    }

    wrapAsync(fn, actionName, context = {}) {
        return async (...args) => {
            const endAction = this.beginAction(actionName, context);
            try {
                const result = await fn(...args);
                endAction(result);
                return result;
            } catch (error) {
                console.error(`Error in async action ${actionName}:`, error);
                endAction(null);
                throw error;
            }
        };
    }

    getStats() {
        const info = this.historyManager.getInfo();
        return {
            ...info,
            isRecording: this.isRecording,
            isBulkAction: this.bulkStarted,
            bulkActionName: this.bulkActionName,
            lastActionTime: this.lastActionTime ? new Date(this.lastActionTime).toISOString() : null
        };
    }
}