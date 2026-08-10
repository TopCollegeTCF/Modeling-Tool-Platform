import { TEMPLATES, createElement, applyStyles } from '../configs/templates.js';
import { ICONS } from '../configs/icons.js';
import { PANEL_NAMES, ALL_PANELS } from '../configs/panels.js';
import { COLORS } from '../configs/colors.js';

export class SettingsUI {
    constructor(editor) {
        this.editor = editor;
        this.element = null;
        this.overlay = null;
        this.isOpen = false;
    }

    init() {
        this.element = createElement('div', {
            id: 'settings-panel',
            styles: `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 2000;
                background: rgba(16, 16, 32, 0.98);
                backdrop-filter: blur(20px);
                padding: 24px;
                border-radius: 12px;
                border: 1px solid rgba(255,255,255,0.1);
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
                min-width: 320px;
                max-width: 420px;
                max-height: 80vh;
                overflow-y: auto;
                display: none;
            `,
        });

        this.overlay = createElement('div', {
            id: 'settings-overlay',
            styles: `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                z-index: 1999;
                display: none;
                cursor: pointer;
            `,
            events: {
                click: () => this.close(),
            },
        });

        document.body.appendChild(this.overlay);
        document.body.appendChild(this.element);

        // Сохраняем ссылку на себя в редакторе
        this.editor.settingsUI = this;

        console.log('✅ SettingsUI initialized');
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.isOpen = true;
        this.element.style.display = 'block';
        this.overlay.style.display = 'block';
        this.render();
    }

    close() {
        this.isOpen = false;
        this.element.style.display = 'none';
        this.overlay.style.display = 'none';
    }

    createIconHTML(iconPath, size = 16) {
        return `<img src="${iconPath}" style="width:${size}px; height:${size}px; filter: invert(0.5); vertical-align: middle;" onerror="this.style.display='none'">`;
    }

    render() {
        if (!this.element) return;

        const panelService = this.editor.panelService;
        if (!panelService) {
            this.element.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <h2 style="color:#fff; font-weight:400; font-size:18px; margin:0;">${this.createIconHTML(ICONS.settings, 20)} Settings</h2>
                    <button onclick="window.editor.settingsUI.close()"
                            style="background:transparent; border:none; color:#666; font-size:20px; cursor:pointer; padding:4px 8px;">
                        ✕
                    </button>
                </div>
                <div style="color:#555; text-align:center; padding:20px 0;">
                    Loading settings...
                </div>
            `;
            return;
        }

        // НАСТРОЙКИ ДО СОЗДАНИЯ HTML
        const currentTheme = this.getCurrentTheme();
        const showGrid = this.getShowGrid();
        const showAxes = this.getShowAxes();
        const helperSize = this.getHelperSize();
        const uiScale = this.getUIScale();
        const positions = panelService.getAvailablePositions();
        const spawnService = this.editor.spawnService;
        const mode = spawnService ? spawnService.getMode() : 'center';
        const cameraService = this.editor.cameraService;
        const allowBelowFloor = cameraService ? cameraService.getAllowBelowFloor() : false;

        // СОЗДАЕМ HTML СТРОКУ С НАЧАЛА
        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h2 style="color:#fff; font-weight:400; font-size:18px; margin:0;">${this.createIconHTML(ICONS.settings, 20)} Settings</h2>
                <button onclick="window.editor.settingsUI.close()"
                        style="background:transparent; border:none; color:#666; font-size:20px; cursor:pointer; padding:4px 8px;">
                    ✕
                </button>
            </div>

            <!-- 🎨 НАСТРОЙКИ ОТОБРАЖЕНИЯ -->
            <div style="margin-bottom:16px; padding:12px; background:rgba(255,255,255,0.03); border-radius:6px;">
                <div style="color:#888; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">
                    🎨 Display Settings
                </div>

                <!-- Тема -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="color:#aaa; font-size:11px;">Theme</span>
                    <div style="display:flex; gap:4px;">
                        <button onclick="window.editor.settingsUI.setTheme('dark')"
                                style="padding:4px 12px; border:1px solid ${currentTheme === 'dark' ? '#4a9eff' : 'rgba(255,255,255,0.08)'};
                                       border-radius:4px; background:${currentTheme === 'dark' ? 'rgba(74,158,255,0.15)' : 'transparent'};
                                       color:${currentTheme === 'dark' ? '#4a9eff' : '#888'}; cursor:pointer; font-size:11px;">
                            🌙 Dark
                        </button>
                        <button onclick="window.editor.settingsUI.setTheme('light')"
                                style="padding:4px 12px; border:1px solid ${currentTheme === 'light' ? '#4a9eff' : 'rgba(255,255,255,0.08)'};
                                       border-radius:4px; background:${currentTheme === 'light' ? 'rgba(74,158,255,0.15)' : 'transparent'};
                                       color:${currentTheme === 'light' ? '#4a9eff' : '#888'}; cursor:pointer; font-size:11px;">
                            ☀️ Light
                        </button>
                    </div>
                </div>

                <!-- Хелперы -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="color:#aaa; font-size:11px;">Show Grid</span>
                    <button onclick="window.editor.settingsUI.toggleGrid()"
                            style="padding:4px 12px; border:1px solid ${showGrid ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.08)'};
                                   border-radius:4px; background:${showGrid ? 'rgba(74,158,255,0.15)' : 'transparent'};
                                   color:${showGrid ? '#4a9eff' : '#888'}; cursor:pointer; font-size:11px;">
                        ${showGrid ? '✅ On' : '❌ Off'}
                    </button>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="color:#aaa; font-size:11px;">Show Axes</span>
                    <button onclick="window.editor.settingsUI.toggleAxes()"
                            style="padding:4px 12px; border:1px solid ${showAxes ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.08)'};
                                   border-radius:4px; background:${showAxes ? 'rgba(74,158,255,0.15)' : 'transparent'};
                                   color:${showAxes ? '#4a9eff' : '#888'}; cursor:pointer; font-size:11px;">
                        ${showAxes ? '✅ On' : '❌ Off'}
                    </button>
                </div>

                <!-- Размер хелперов -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="color:#aaa; font-size:11px;">Helper Size</span>
                    <div style="display:flex; gap:4px;">
                        <button onclick="window.editor.settingsUI.setHelperSize('small')"
                                style="padding:4px 10px; border:1px solid ${helperSize === 'small' ? '#4a9eff' : 'rgba(255,255,255,0.08)'};
                                       border-radius:4px; background:${helperSize === 'small' ? 'rgba(74,158,255,0.15)' : 'transparent'};
                                       color:${helperSize === 'small' ? '#4a9eff' : '#888'}; cursor:pointer; font-size:10px;">
                            Small
                        </button>
                        <button onclick="window.editor.settingsUI.setHelperSize('medium')"
                                style="padding:4px 10px; border:1px solid ${helperSize === 'medium' ? '#4a9eff' : 'rgba(255,255,255,0.08)'};
                                       border-radius:4px; background:${helperSize === 'medium' ? 'rgba(74,158,255,0.15)' : 'transparent'};
                                       color:${helperSize === 'medium' ? '#4a9eff' : '#888'}; cursor:pointer; font-size:10px;">
                            Medium
                        </button>
                        <button onclick="window.editor.settingsUI.setHelperSize('large')"
                                style="padding:4px 10px; border:1px solid ${helperSize === 'large' ? '#4a9eff' : 'rgba(255,255,255,0.08)'};
                                       border-radius:4px; background:${helperSize === 'large' ? 'rgba(74,158,255,0.15)' : 'transparent'};
                                       color:${helperSize === 'large' ? '#4a9eff' : '#888'}; cursor:pointer; font-size:10px;">
                            Large
                        </button>
                    </div>
                </div>

                <!-- Масштаб UI -->
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:#aaa; font-size:11px;">UI Scale</span>
                    <div style="display:flex; gap:4px;">
                        <button onclick="window.editor.settingsUI.setUIScale(1)"
                                style="padding:4px 10px; border:1px solid ${uiScale === 1 ? '#4a9eff' : 'rgba(255,255,255,0.08)'};
                                       border-radius:4px; background:${uiScale === 1 ? 'rgba(74,158,255,0.15)' : 'transparent'};
                                       color:${uiScale === 1 ? '#4a9eff' : '#888'}; cursor:pointer; font-size:10px;">
                            1x
                        </button>
                        <button onclick="window.editor.settingsUI.setUIScale(1.5)"
                                style="padding:4px 10px; border:1px solid ${uiScale === 1.5 ? '#4a9eff' : 'rgba(255,255,255,0.08)'};
                                       border-radius:4px; background:${uiScale === 1.5 ? 'rgba(74,158,255,0.15)' : 'transparent'};
                                       color:${uiScale === 1.5 ? '#4a9eff' : '#888'}; cursor:pointer; font-size:10px;">
                            1.5x
                        </button>
                        <button onclick="window.editor.settingsUI.setUIScale(2)"
                                style="padding:4px 10px; border:1px solid ${uiScale === 2 ? '#4a9eff' : 'rgba(255,255,255,0.08)'};
                                       border-radius:4px; background:${uiScale === 2 ? 'rgba(74,158,255,0.15)' : 'transparent'};
                                       color:${uiScale === 2 ? '#4a9eff' : '#888'}; cursor:pointer; font-size:10px;">
                            2x
                        </button>
                    </div>
                </div>
            </div>

            <!-- 📷 НАСТРОЙКИ КАМЕРЫ -->
            <div style="margin-bottom:16px; padding:12px; background:rgba(255,255,255,0.03); border-radius:6px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <span style="color:#888; font-size:12px;">📷 Camera Settings</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0;">
                    <span style="color:#aaa; font-size:11px;">Allow camera below floor</span>
                    <button onclick="window.editor.settingsUI.toggleCameraFloorLimit()"
                            style="padding:4px 12px; border:1px solid ${allowBelowFloor ? 'rgba(255,212,59,0.3)' : 'rgba(255,255,255,0.08)'};
                                   border-radius:4px; background:${allowBelowFloor ? 'rgba(255,212,59,0.15)' : 'transparent'};
                                   color:${allowBelowFloor ? '#ffd43b' : '#888'}; cursor:pointer; font-size:11px;
                                   transition:all 0.2s;">
                        ${allowBelowFloor ? '✅ Unlimited' : '🔒 Limited'}
                    </button>
                </div>
                <div style="font-size:10px; color:#555; margin-top:4px;">
                    ${allowBelowFloor ? 'Camera can move below floor level (Y < 1)' : 'Camera is constrained above floor level (Y ≥ 1)'}
                </div>
            </div>

            <!-- 📍 НАСТРОЙКИ СПАВНА -->
            <div style="margin-bottom:16px; padding:12px; background:rgba(255,255,255,0.03); border-radius:6px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="color:#888; font-size:12px;">${this.createIconHTML(ICONS.marker, 14)} Spawn Mode</span>
                    <button onclick="window.editor.toggleSpawnMode(); window.editor.settingsUI.render();"
                            style="padding:4px 12px; border:1px solid ${mode === 'marker' ? '#ffd43b' : 'rgba(255,255,255,0.08)'};
                                   border-radius:4px; background:${mode === 'marker' ? 'rgba(255,212,59,0.15)' : 'transparent'};
                                   color:${mode === 'marker' ? '#ffd43b' : '#888'}; cursor:pointer; font-size:11px;">
                        ${mode === 'marker' ? '📍 Marker' : '🎯 Center'}
                    </button>
                </div>
                <div style="font-size:11px; color:#555;">
                    ${mode === 'marker' ? 'Objects spawn at marker position' : 'Objects spawn in sequence'}
                </div>
            </div>

            <!-- 📐 НАСТРОЙКИ ПАНЕЛЕЙ -->
            <div style="margin-bottom:12px;">
                <div style="color:#888; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">
                    Panel Positions
                </div>
        `;

        ALL_PANELS.forEach(name => {
            const currentPos = panelService.getPanelPosition(name);
            const isVisible = panelService.getPanelVisibility(name);
            const title = PANEL_NAMES[name] || name;
            const icon = this.getPanelIcon(name);
            
            html += `
                <div style="margin-bottom:8px; padding:8px; background:rgba(255,255,255,0.03); border-radius:4px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <span style="color:#aaa; font-size:12px;">${icon} ${title}</span>
                        <div style="display:flex; gap:4px; align-items:center;">
                            <button onclick="window.editor.panelService.togglePanel('${name}'); window.editor.settingsUI.render();"
                                    style="padding:2px 8px; border:1px solid ${isVisible ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.08)'};
                                           border-radius:3px; background:${isVisible ? 'rgba(74,158,255,0.15)' : 'transparent'};
                                           color:${isVisible ? '#4a9eff' : '#555'}; cursor:pointer; font-size:9px;">
                                ${isVisible ? '👁 Visible' : '🔒 Hidden'}
                            </button>
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:2px;">
                        ${positions.map(pos => {
                            const isActive = pos === currentPos;
                            return `
                                <button onclick="window.editor.panelService.setPanelPosition('${name}', '${pos}'); window.editor.settingsUI.render();"
                                        style="padding:2px 4px; border:1px solid ${isActive ? '#4a9eff' : 'rgba(255,255,255,0.06)'};
                                               border-radius:2px; background:${isActive ? 'rgba(74,158,255,0.15)' : 'transparent'};
                                               color:${isActive ? '#4a9eff' : '#555'}; cursor:pointer; font-size:8px;
                                               transition:all 0.2s;">
                                    ${panelService.getPositionLabel(pos)}
                                </button>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        });

        html += `
            </div>
            <button onclick="window.editor.panelService.reset(); window.editor.settingsUI.render();"
                    style="width:100%; padding:8px; border:1px solid rgba(255,80,80,0.2);
                           border-radius:4px; background:rgba(255,80,80,0.1); color:#ff6b6b;
                           cursor:pointer; font-size:11px; transition:all 0.2s;">
                🔄 Reset All Panel Settings
            </button>
        `;

        this.element.innerHTML = html;
    }

    // переключение ограничения камеры
    toggleCameraFloorLimit() {
        const cameraService = this.editor.cameraService;
        if (!cameraService) return;

        const current = cameraService.getAllowBelowFloor();
        cameraService.setAllowBelowFloor(!current);
        
        try {
            localStorage.setItem('editor_camera_allow_below_floor', JSON.stringify(!current));
        } catch (e) {
            // Ignore
        }
        
        this.render();
        console.log(`📷 Camera floor limit toggled: ${!current ? 'OFF (can go below)' : 'ON (constrained)'}`);
    }

    getPanelIcon(name) {
        const icons = {
            'properties': '📐',
            'sceneTree': '📦',
            'tools': '🔧',
            'spawn': '➕',
        };
        return icons[name] || '📄';
    }

    // Методы управления настройками отображения
    getCurrentTheme() {
        return localStorage.getItem('editor_theme') || 'dark';
    }

    setTheme(theme) {
        localStorage.setItem('editor_theme', theme);
        this.applyTheme(theme);
        this.render();
    }

    applyTheme(theme) {
        const colors = theme === 'light' ? COLORS.light : COLORS.dark;
        document.body.style.background = colors.background;
        
        document.querySelectorAll('.panel, [data-panel]').forEach(el => {
            el.style.background = colors.surface;
            el.style.borderColor = colors.border;
        });
        
        if (this.editor.sceneManager) {
            this.editor.sceneManager.updateGridColors(colors.grid);
        }
    }

    getShowGrid() {
        return localStorage.getItem('editor_show_grid') !== 'false';
    }

    toggleGrid() {
        const current = this.getShowGrid();
        localStorage.setItem('editor_show_grid', String(!current));
        if (this.editor.sceneManager) {
            this.editor.sceneManager.toggleGrid(!current);
        }
        this.render();
    }

    getShowAxes() {
        return localStorage.getItem('editor_show_axes') !== 'false';
    }

    toggleAxes() {
        const current = this.getShowAxes();
        localStorage.setItem('editor_show_axes', String(!current));
        if (this.editor.sceneManager) {
            this.editor.sceneManager.toggleAxes(!current);
        }
        this.render();
    }

    getHelperSize() {
        return localStorage.getItem('editor_helper_size') || 'medium';
    }

    setHelperSize(size) {
        localStorage.setItem('editor_helper_size', size);
        if (this.editor.sceneManager) {
            this.editor.sceneManager.setHelperSize(size);
        }
        this.render();
    }

    getUIScale() {
        return parseFloat(localStorage.getItem('editor_ui_scale') || '1');
    }

    setUIScale(scale) {
        localStorage.setItem('editor_ui_scale', String(scale));
        this.applyUIScale(scale);
        this.render();
    }

    applyUIScale(scale) {
        const root = document.documentElement;
        root.style.setProperty('--ui-scale', scale);
        
        document.querySelectorAll('.panel, [data-panel]').forEach(el => {
            el.style.transform = `scale(${scale})`;
            el.style.transformOrigin = 'top left';
        });
    }
}