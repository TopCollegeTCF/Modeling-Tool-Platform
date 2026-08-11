import { TEMPLATES, createElement, applyStyles } from '../configs/templates.js';
import { ICONS } from '../configs/icons.js';
import { PANEL_NAMES, ALL_PANELS } from '../configs/panels.js';
import { COLORS } from '../configs/colors.js';
import { UI_TEMPLATES, renderTemplate } from '../configs/ui-templates.js';

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
        const flyModeEnabled = cameraService ? cameraService.flyModeEnabled || false : false;

        // Собираем HTML через шаблоны
        let html = renderTemplate(UI_TEMPLATES.settings.header, {
            icon: this.createIconHTML(ICONS.settings, 20),
        });

        // Display Section
        let displayContent = '';

        // Theme
        displayContent += renderTemplate(UI_TEMPLATES.settings.displaySection.theme, {
            activeBorder: currentTheme === 'dark' ? '#4a9eff' : 'rgba(255,255,255,0.08)',
            activeBg: currentTheme === 'dark' ? 'rgba(74,158,255,0.15)' : 'transparent',
            activeColor: currentTheme === 'dark' ? '#4a9eff' : '#888',
            inactiveBorder: currentTheme === 'light' ? '#4a9eff' : 'rgba(255,255,255,0.08)',
            inactiveBg: currentTheme === 'light' ? 'rgba(74,158,255,0.15)' : 'transparent',
            inactiveColor: currentTheme === 'light' ? '#4a9eff' : '#888',
        });

        // Grid toggle
        displayContent += renderTemplate(UI_TEMPLATES.settings.displaySection.toggle, {
            label: 'Show Grid',
            onClick: 'toggleGrid',
            border: showGrid ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.08)',
            bg: showGrid ? 'rgba(74,158,255,0.15)' : 'transparent',
            color: showGrid ? '#4a9eff' : '#888',
            status: showGrid ? '✅ On' : '❌ Off',
        });

        // Axes toggle
        displayContent += renderTemplate(UI_TEMPLATES.settings.displaySection.toggle, {
            label: 'Show Axes',
            onClick: 'toggleAxes',
            border: showAxes ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.08)',
            bg: showAxes ? 'rgba(74,158,255,0.15)' : 'transparent',
            color: showAxes ? '#4a9eff' : '#888',
            status: showAxes ? '✅ On' : '❌ Off',
        });

        // Helper Size
        const sizeButtons = ['small', 'medium', 'large'].map(size => `
            <button onclick="window.editor.settingsUI.setHelperSize('${size}')"
                    style="padding: 4px 10px; border: 1px solid ${helperSize === size ? '#4a9eff' : 'rgba(255,255,255,0.08)'};
                           border-radius: 4px; background: ${helperSize === size ? 'rgba(74,158,255,0.15)' : 'transparent'};
                           color: ${helperSize === size ? '#4a9eff' : '#888'}; cursor: pointer; font-size: 10px;">
                ${size.charAt(0).toUpperCase() + size.slice(1)}
            </button>
        `).join('');
        displayContent += renderTemplate(UI_TEMPLATES.settings.displaySection.helperSize, {
            buttons: sizeButtons,
        });

        // UI Scale
        const scaleButtons = [1, 1.5, 2].map(scale => `
            <button onclick="window.editor.settingsUI.setUIScale(${scale})"
                    style="padding: 4px 10px; border: 1px solid ${uiScale === scale ? '#4a9eff' : 'rgba(255,255,255,0.08)'};
                           border-radius: 4px; background: ${uiScale === scale ? 'rgba(74,158,255,0.15)' : 'transparent'};
                           color: ${uiScale === scale ? '#4a9eff' : '#888'}; cursor: pointer; font-size: 10px;">
                ${scale}x
            </button>
        `).join('');
        displayContent += renderTemplate(UI_TEMPLATES.settings.displaySection.uiScale, {
            buttons: scaleButtons,
        });

        html += renderTemplate(UI_TEMPLATES.settings.displaySection.container, {
            content: displayContent,
        });

        // Camera Section
        html += renderTemplate(UI_TEMPLATES.settings.cameraSection, {
            border: allowBelowFloor ? 'rgba(255,212,59,0.3)' : 'rgba(255,255,255,0.08)',
            bg: allowBelowFloor ? 'rgba(255,212,59,0.15)' : 'transparent',
            color: allowBelowFloor ? '#ffd43b' : '#888',
            status: allowBelowFloor ? '✅ Unlimited' : '🔒 Limited',
            description: allowBelowFloor 
                ? 'Camera can move below floor level (Y < 1)' 
                : 'Camera is constrained above floor level (Y ≥ 1)',
        });

        // Spawn Section
        html += renderTemplate(UI_TEMPLATES.settings.spawnSection, {
            icon: this.createIconHTML(ICONS.marker, 14),
            border: mode === 'marker' ? '#ffd43b' : 'rgba(255,255,255,0.08)',
            bg: mode === 'marker' ? 'rgba(255,212,59,0.15)' : 'transparent',
            color: mode === 'marker' ? '#ffd43b' : '#888',
            status: mode === 'marker' ? '📍 Marker' : '🎯 Center',
            description: mode === 'marker' 
                ? 'Objects spawn at marker position' 
                : 'Objects spawn in sequence',
        });

        // Secondary Toolbar Buttons Section
        html += `
            <div style="margin-bottom: 16px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 6px;">
                <div style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                    🔧 Additional Buttons
                </div>
                ${this.renderSecondaryToolbarButtons()}
            </div>
        `;

        // Panels Section
        let panelsHtml = '';
        ALL_PANELS.forEach(name => {
            const currentPos = panelService.getPanelPosition(name);
            const isVisible = panelService.getPanelVisibility(name);
            const title = PANEL_NAMES[name] || name;
            const icon = this.getPanelIcon(name);

            const positionButtons = positions.map(pos => {
                const isActive = pos === currentPos;
                return renderTemplate(UI_TEMPLATES.settings.positionButton, {
                    panelName: name,
                    pos: pos,
                    border: isActive ? '#4a9eff' : 'rgba(255,255,255,0.06)',
                    bg: isActive ? 'rgba(74,158,255,0.15)' : 'transparent',
                    color: isActive ? '#4a9eff' : '#555',
                    label: panelService.getPositionLabel(pos),
                });
            }).join('');

            panelsHtml += renderTemplate(UI_TEMPLATES.settings.panelItem, {
                icon: icon,
                title: title,
                name: name,
                border: isVisible ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.08)',
                bg: isVisible ? 'rgba(74,158,255,0.15)' : 'transparent',
                color: isVisible ? '#4a9eff' : '#555',
                status: isVisible ? '👁 Visible' : '🔒 Hidden',
                positions: positionButtons,
            });
        });

        html += renderTemplate(UI_TEMPLATES.settings.panelsSection, {
            panels: panelsHtml,
        });

        html += UI_TEMPLATES.settings.resetButton;

        this.element.innerHTML = html;
    }

    renderSecondaryToolbarButtons() {
        const secondaryToolbar = this.editor.uiManager?.secondaryToolbar;
        if (!secondaryToolbar) return '<div style="color:#555; font-size:11px;">Secondary toolbar not available</div>';

        const buttons = secondaryToolbar.getButtons();
        if (buttons.length === 0) {
            return '<div style="color:#555; font-size:11px;">No additional buttons</div>';
        }

        return buttons.map(btn => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.04);">
                <span style="color: #aaa; font-size: 11px;">${btn.icon || '🔧'} ${btn.title || btn.id}</span>
                <button onclick="window.editor.uiManager.secondaryToolbar.setButtonVisible('${btn.id}', !window.editor.uiManager.secondaryToolbar.isButtonVisible('${btn.id}')); window.editor.settingsUI.render();"
                        style="padding: 2px 8px; border: 1px solid ${btn.visible ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.08)'};
                               border-radius: 3px; background: ${btn.visible ? 'rgba(74,158,255,0.15)' : 'transparent'};
                               color: ${btn.visible ? '#4a9eff' : '#555'}; cursor: pointer; font-size: 9px;">
                    ${btn.visible ? '👁 Show' : '🔒 Hide'}
                </button>
            </div>
        `).join('');
    }

    // === ОСТАЛЬНЫЕ МЕТОДЫ ОСТАЮТСЯ БЕЗ ИЗМЕНЕНИЙ ===

    toggleCameraFloorLimit() {
        const cameraService = this.editor.cameraService;
        if (!cameraService) return;
        const current = cameraService.getAllowBelowFloor();
        cameraService.setAllowBelowFloor(!current);
        try {
            localStorage.setItem('editor_camera_allow_below_floor', JSON.stringify(!current));
        } catch (e) {}
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
        if (this.editor.sceneManager) {
            this.editor.sceneManager.setBackgroundTheme(theme);
        }
        document.querySelectorAll('.panel, [data-panel]').forEach(el => {
            el.style.background = colors.surface;
            el.style.borderColor = colors.border;
            el.style.color = colors.text.primary;
        });
        document.querySelectorAll('input, .prop-input').forEach(el => {
            el.style.background = colors.input.background;
            el.style.borderColor = colors.input.border;
            el.style.color = colors.input.color;
        });
        document.querySelectorAll('label, .prop-label').forEach(el => {
            el.style.color = colors.input.label;
        });
        if (this.editor.uiManager && this.editor.uiManager.properties) {
            this.editor.uiManager.properties.update();
        }
        if (this.editor.uiManager && this.editor.uiManager.sceneTree) {
            this.editor.uiManager.sceneTree.update();
        }
        localStorage.setItem('editor_theme', theme);
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
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        document.querySelectorAll('.panel, [data-panel]').forEach(el => {
            const rect = el.getBoundingClientRect();
            const originalWidth = rect.width;
            const originalHeight = rect.height;
            const maxScaleX = (vw * 0.9) / originalWidth;
            const maxScaleY = (vh * 0.9) / originalHeight;
            const finalScale = Math.min(scale, maxScaleX, maxScaleY);
            el.style.transform = `scale(${finalScale})`;
            el.style.transformOrigin = 'top left';
            const offsetX = (originalWidth * (finalScale - 1)) / 2;
            const offsetY = (originalHeight * (finalScale - 1)) / 2;
            el.style.marginLeft = `-${offsetX}px`;
            el.style.marginTop = `-${offsetY}px`;
        });
    }
}