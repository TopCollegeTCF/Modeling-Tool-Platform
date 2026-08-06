import { TEMPLATES, createElement, applyStyles } from '../configs/templates.js';
import { ICONS } from '../configs/icons.js';
import { PANEL_NAMES, ALL_PANELS } from '../configs/panels.js';

export class SettingsUI {
    constructor(editor) {
        this.editor = editor;
        this.element = null;
        this.overlay = null;
        this.isOpen = false;
    }
    
    init() {
        // Кнопка создается в ToolbarUI, не дублируем!
        
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
        
        const positions = panelService.getAvailablePositions();
        const spawnService = this.editor.spawnService;
        const mode = spawnService ? spawnService.getMode() : 'center';
        
        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h2 style="color:#fff; font-weight:400; font-size:18px; margin:0;">${this.createIconHTML(ICONS.settings, 20)} Settings</h2>
                <button onclick="window.editor.settingsUI.close()" 
                        style="background:transparent; border:none; color:#666; font-size:20px; cursor:pointer; padding:4px 8px;">
                    ✕
                </button>
            </div>
            
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
    
    getPanelIcon(name) {
        const icons = {
            'properties': '📐',
            'sceneTree': '📦',
            'tools': '🔧',
            'spawn': '➕',
        };
        return icons[name] || '📄';
    }
}