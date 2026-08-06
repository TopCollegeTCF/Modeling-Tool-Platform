import { StorageManager } from '../storage/StorageManager.js';
import { PANEL_DEFAULTS, PANEL_POSITIONS, PANEL_POSITION_STYLES, ALL_PANELS } from '../configs/panels.js';

export class PanelService {
    constructor(editor) {
        this.editor = editor;
        this.storage = new StorageManager();
        this.storage.setNamespace('panels');
        this.panels = {};
        this.settings = {};
        this.listeners = [];
        
        this.loadSettings();
    }
    
    async loadSettings() {
        const saved = await this.storage.load('settings');
        if (saved) {
            this.settings = saved;
        } else {
            this.settings = this.getDefaultSettings();
            await this.saveSettings();
        }
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
    }
    
    registerPanel(name, element) {
        if (!element) return this;
        
        this.panels[name] = element;
        
        // Убеждаемся, что настройки для этой панели существуют
        if (!this.settings[name]) {
            this.settings[name] = {
                position: PANEL_DEFAULTS[name]?.position || PANEL_POSITIONS.TOP_RIGHT,
                visible: PANEL_DEFAULTS[name]?.visible !== false,
            };
        }
        
        this.applyPosition(name);
        this.applyVisibility(name);
        return this;
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
        
        const position = setting.position || PANEL_DEFAULTS[name]?.position || PANEL_POSITIONS.TOP_RIGHT;
        const styles = PANEL_POSITION_STYLES[position];
        
        if (styles) {
            Object.entries(styles).forEach(([key, value]) => {
                element.style[key] = value;
            });
        }
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
    }
    
    setPanelPosition(name, position) {
        if (!PANEL_POSITION_STYLES[position]) return;
        
        // Убеждаемся, что настройки для этой панели существуют
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
        // Убеждаемся, что настройки для этой панели существуют
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
            'top-left': 'Top Left',
            'top-center': 'Top Center',
            'top-right': 'Top Right',
            'middle-left': 'Middle Left',
            'middle-right': 'Middle Right',
            'bottom-left': 'Bottom Left',
            'bottom-center': 'Bottom Center',
            'bottom-right': 'Bottom Right',
        };
        return labels[position] || position;
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
        
        ALL_PANELS.forEach(name => {
            this.applyPosition(name);
            this.applyVisibility(name);
        });
        
        this.notifyListeners('reset', null, null);
    }
}