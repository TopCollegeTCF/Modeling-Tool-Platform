import { StorageManager } from '../storage/StorageManager.js';
import {
    PANEL_DEFAULTS,
    PANEL_POSITIONS,
    PANEL_POSITION_STYLES,
    PANEL_POSITION_ICONS,
    PANEL_POSITION_GRID,
    ALL_PANELS,
    PANEL_RESTRICTIONS
} from '../configs/panels.js';

export class PanelService {
    constructor(editor) {
        this.editor = editor;
        this.storage = new StorageManager();
        this.storage.setNamespace('panels');
        this.panels = {};
        this.settings = {};
        this.listeners = [];
        this.occupiedPositions = new Map();
        this._dimensions = {};
        this._initPromise = this.loadSettings();
    }

    async loadSettings() {
        const saved = await this.storage.load('settings');
        if (saved && Object.keys(saved).length > 0) {
            this.settings = saved;
        } else {
            this.settings = this.getDefaultSettings();
            await this.saveSettings();
        }
        
        // Восстанавливаем occupiedPositions из настроек
        this.occupiedPositions.clear();
        for (const [name, setting] of Object.entries(this.settings)) {
            if (setting.visible !== false) {
                const pos = setting.position || this.getDefaultPosition(name);
                this.occupiedPositions.set(name, pos);
            }
        }
        
        console.log('📋 PanelService settings loaded:', this.settings);
    }

    getDefaultSettings() {
        const settings = {};
        ALL_PANELS.forEach(name => {
            settings[name] = {
                position: PANEL_DEFAULTS[name]?.position || PANEL_POSITIONS.TOP_RIGHT,
                visible: PANEL_DEFAULTS[name]?.visible !== false,
            };
        });
        return settings;
    }

    async saveSettings() {
        await this.storage.save('settings', this.settings);
        console.log('💾 PanelService settings saved');
    }

    registerPanel(name, element) {
        if (!element) return this;
        this.panels[name] = element;
        
        if (!this.settings[name]) {
            this.settings[name] = {
                position: PANEL_DEFAULTS[name]?.position || PANEL_POSITIONS.TOP_RIGHT,
                visible: PANEL_DEFAULTS[name]?.visible !== false,
            };
        }
        
        this._savePanelDimensions(name, element);
        this.applyPosition(name);
        this.applyVisibility(name);
        return this;
    }

    _savePanelDimensions(name, element) {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        
        // Сохраняем минимальные размеры для панелей
        const minSizes = {
            properties: { width: 220, height: 320 },
            sceneTree: { width: 180, height: 280 },
            tools: { width: 50, height: 260 },
            spawn: { width: 180, height: 160 },
        };

        const minSize = minSizes[name] || { width: 180, height: 200 };
        
        this._dimensions[name] = {
            width: Math.max(rect.width || parseInt(style.width) || minSize.width, minSize.width),
            height: Math.max(rect.height || parseInt(style.height) || minSize.height, minSize.height),
            minWidth: minSize.width,
            minHeight: minSize.height,
        };
    }

    applyPosition(name) {
        const element = this.panels[name];
        if (!element) return;

        const setting = this.settings[name];
        if (!setting) {
            this.settings[name] = {
                position: PANEL_DEFAULTS[name]?.position || PANEL_POSITIONS.TOP_RIGHT,
                visible: PANEL_DEFAULTS[name]?.visible !== false,
            };
            return;
        }

        let position = setting.position || PANEL_DEFAULTS[name]?.position || PANEL_POSITIONS.TOP_RIGHT;
        
        // Проверяем ограничения
        const restrictions = PANEL_RESTRICTIONS[name] || [];
        if (restrictions.includes(position)) {
            const defaultPos = PANEL_DEFAULTS[name]?.position || PANEL_POSITIONS.BOTTOM_LEFT;
            position = defaultPos;
            setting.position = position;
            this.saveSettings();
        }

        // Проверяем конфликт с другими панелями (кроме самой себя)
        const occupant = this.isPositionOccupied(position, name);
        if (occupant) {
            // Если позиция занята, меняемся местами
            this.swapPanels(name, occupant, position);
            return;
        }

        // Сохраняем размеры
        const dims = this._dimensions[name] || { width: 200, height: 200 };
        const currentWidth = element.style.width || dims.width + 'px';
        const currentHeight = element.style.height || dims.height + 'px';

        // Применяем позицию
        const styles = PANEL_POSITION_STYLES[position];
        if (styles) {
            // Сбрасываем все позиционные стили
            ['top', 'bottom', 'left', 'right', 'transform'].forEach(key => {
                element.style[key] = '';
            });
            
            // Применяем новые
            Object.entries(styles).forEach(([key, value]) => {
                element.style[key] = value;
            });
        }

        // Восстанавливаем размеры с учетом минимальных
        const minWidth = dims.minWidth || 180;
        const minHeight = dims.minHeight || 200;
        
        const width = parseInt(currentWidth);
        const height = parseInt(currentHeight);
        
        element.style.width = Math.max(width || minWidth, minWidth) + 'px';
        element.style.height = Math.max(height || minHeight, minHeight) + 'px';
        element.style.minWidth = minWidth + 'px';
        element.style.minHeight = minHeight + 'px';

        // Обновляем occupiedPositions
        if (setting.visible !== false) {
            this.occupiedPositions.set(name, position);
        } else {
            this.occupiedPositions.delete(name);
        }
        
        // Обновляем список занятых позиций для всех панелей
        this._updateAllOccupied();
    }

    _updateAllOccupied() {
        // Пересчитываем все занятые позиции
        const newOccupied = new Map();
        for (const [name, setting] of Object.entries(this.settings)) {
            if (setting.visible !== false) {
                const pos = setting.position || this.getDefaultPosition(name);
                // Проверяем ограничения
                const restrictions = PANEL_RESTRICTIONS[name] || [];
                const finalPos = restrictions.includes(pos) 
                    ? (PANEL_DEFAULTS[name]?.position || PANEL_POSITIONS.BOTTOM_LEFT)
                    : pos;
                newOccupied.set(name, finalPos);
            }
        }
        this.occupiedPositions = newOccupied;
    }

    swapPanels(panelA, panelB, position) {
        const posB = this.settings[panelB]?.position || this.getDefaultPosition(panelB);
        const posA = position;
        
        // Меняем позиции в настройках
        if (this.settings[panelA]) {
            this.settings[panelA].position = posA;
        }
        if (this.settings[panelB]) {
            this.settings[panelB].position = posB;
        }
        
        // Применяем изменения
        this.applyPosition(panelA);
        this.applyPosition(panelB);
        this.saveSettings();
        
        console.log(`🔄 Swapped panels: ${panelA} (${posA}) ↔ ${panelB} (${posB})`);
        this.notifyListeners('swap', { panelA, panelB, posA, posB });
    }

    isPositionOccupied(position, excludePanel = null) {
        // Проверяем занятость позиции с учетом ограничений
        for (const [name, pos] of this.occupiedPositions) {
            if (name === excludePanel) continue;
            
            // Проверяем, может ли панель занимать эту позицию
            const restrictions = PANEL_RESTRICTIONS[name] || [];
            if (restrictions.includes(position)) continue;
            
            if (pos === position) {
                return name;
            }
        }
        return null;
    }

    getDefaultPosition(name) {
        return PANEL_DEFAULTS[name]?.position || PANEL_POSITIONS.BOTTOM_LEFT;
    }

    getOccupiedPositions() {
        return new Map(this.occupiedPositions);
    }

    applyVisibility(name) {
        const element = this.panels[name];
        if (!element) return;

        const setting = this.settings[name];
        if (!setting) {
            this.settings[name] = {
                position: PANEL_DEFAULTS[name]?.position || PANEL_POSITIONS.TOP_RIGHT,
                visible: PANEL_DEFAULTS[name]?.visible !== false,
            };
            return;
        }

        const visible = setting.visible !== undefined ? setting.visible : PANEL_DEFAULTS[name]?.visible !== false;
        element.style.display = visible ? 'block' : 'none';
        
        if (visible) {
            this.occupiedPositions.set(name, setting.position);
        } else {
            this.occupiedPositions.delete(name);
        }
    }

    setPanelPosition(name, position) {
        if (!PANEL_POSITION_STYLES[position]) return;
        
        // Проверяем ограничения для этой панели
        const restrictions = PANEL_RESTRICTIONS[name] || [];
        if (restrictions.includes(position)) {
            console.warn(`⚠️ Position "${position}" is restricted for panel "${name}"`);
            return;
        }

        // Проверяем, не занята ли позиция другой панелью
        const occupant = this.isPositionOccupied(position, name);
        if (occupant) {
            this.swapPanels(name, occupant, position);
            return;
        }

        if (!this.settings[name] || typeof this.settings[name] !== 'object') {
            this.settings[name] = {
                position: PANEL_DEFAULTS[name]?.position || PANEL_POSITIONS.TOP_RIGHT,
                visible: PANEL_DEFAULTS[name]?.visible !== false,
            };
        }

        this.settings[name].position = position;
        this.applyPosition(name);
        this.saveSettings();
        this.notifyListeners(name, 'position', position);
    }

    setPanelVisibility(name, visible) {
        if (!this.settings[name] || typeof this.settings[name] !== 'object') {
            this.settings[name] = {
                position: PANEL_DEFAULTS[name]?.position || PANEL_POSITIONS.TOP_RIGHT,
                visible: PANEL_DEFAULTS[name]?.visible !== false,
            };
        }

        this.settings[name].visible = visible;
        this.applyVisibility(name);
        this.saveSettings();
        this.notifyListeners(name, 'visibility', visible);
    }

    togglePanel(name) {
        const setting = this.settings[name];
        if (!setting || typeof setting !== 'object') {
            this.settings[name] = {
                position: PANEL_DEFAULTS[name]?.position || PANEL_POSITIONS.TOP_RIGHT,
                visible: PANEL_DEFAULTS[name]?.visible !== false,
            };
        }
        const current = this.settings[name].visible !== undefined ? this.settings[name].visible : true;
        this.setPanelVisibility(name, !current);
        return !current;
    }

    getPanelPosition(name) {
        const setting = this.settings[name];
        if (!setting || typeof setting !== 'object') {
            return PANEL_DEFAULTS[name]?.position || PANEL_POSITIONS.TOP_RIGHT;
        }
        return setting.position || PANEL_DEFAULTS[name]?.position || PANEL_POSITIONS.TOP_RIGHT;
    }

    getPanelVisibility(name) {
        const setting = this.settings[name];
        if (!setting || typeof setting !== 'object') {
            return PANEL_DEFAULTS[name]?.visible !== false;
        }
        return setting.visible !== undefined ? setting.visible : PANEL_DEFAULTS[name]?.visible !== false;
    }

    getAvailablePositions() {
        return Object.keys(PANEL_POSITION_STYLES);
    }

    getPositionLabel(position) {
        const labels = {
            'top-left': '↖ Top Left',
            'top-center': '↑ Top Center',
            'top-right': '↗ Top Right',
            'middle-left': '← Middle Left',
            'middle-right': '→ Middle Right',
            'bottom-left': '↙ Bottom Left',
            'bottom-center': '↓ Bottom Center',
            'bottom-right': '↘ Bottom Right',
        };
        return labels[position] || position;
    }

    getPositionIcon(position) {
        return PANEL_POSITION_ICONS[position] || '•';
    }

    getPositionGrid() {
        return PANEL_POSITION_GRID;
    }

    getRestrictedPositions(name) {
        return PANEL_RESTRICTIONS[name] || [];
    }

    getPanelDimensions(name) {
        return this._dimensions[name] || { width: 200, height: 200 };
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    notifyListeners(name, key, value) {
        this.listeners.forEach(callback => callback(name, key, value));
    }

    getAllSettings() {
        return { ...this.settings };
    }

    async reset() {
        this.settings = this.getDefaultSettings();
        await this.saveSettings();
        this.occupiedPositions.clear();
        ALL_PANELS.forEach(name => {
            this.applyPosition(name);
            this.applyVisibility(name);
        });
        this.notifyListeners('reset', null, null);
    }

    // Метод для принудительного обновления всех панелей
    refreshAllPanels() {
        ALL_PANELS.forEach(name => {
            if (this.panels[name]) {
                this.applyPosition(name);
                this.applyVisibility(name);
            }
        });
    }
}