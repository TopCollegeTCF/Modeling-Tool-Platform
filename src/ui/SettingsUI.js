/**
 * ⚙️ SettingsUI - Панель настроек приложения
 *
 * 📋 ОПИСАНИЕ:
 * Предоставляет интерфейс для настройки различных параметров приложения:
 * - Тема оформления (темная/светлая)
 * - Отображение хелперов (сетка, оси, размер, толщина)
 * - Масштаб интерфейса
 * - Настройки камеры
 * - Режим спавна
 * - Видимость дополнительных кнопок
 * - Позиции и видимость панелей с визуальной сеткой
 *
 * @version 1.0.6
 * @author Gabryelf
 * @since 0.1.0
 */
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
                 backdrop-filter: blur(4px);
             `,
             events: {
                 click: () => this.close(),
             },
         });
 
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
                 min-width: 360px;
                 max-width: 480px;
                 max-height: 80vh;
                 overflow-y: auto;
                 display: none;
             `,
         });
 
         this.element.style.cssText += `
             &::-webkit-scrollbar { width: 4px; }
             &::-webkit-scrollbar-track { background: transparent; }
             &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
             &::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }
         `;
 
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
 
     getPanelIcon(name) {
         const icons = {
             'properties': '📐',
             'sceneTree': '📦',
             'tools': '🔧',
             'spawn': '➕',
         };
         return icons[name] || '📄';
     }
 
     createPositionGridWithOccupants(panelName, currentPos) {
         const panelService = this.editor.panelService;
         if (!panelService) return '';
 
         const grid = panelService.getPositionGrid();
         const occupied = panelService.getOccupiedPositions();
         const restrictions = panelService.getRestrictedPositions(panelName) || [];
         const panelIcon = this.getPanelIcon(panelName);
 
         let html = `
             <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px;
                         max-width: 160px; margin: 4px auto; background: rgba(255,255,255,0.02);
                         padding: 4px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
         `;
 
         for (const row of grid) {
             for (const pos of row) {
                 const isCurrent = pos === currentPos;
                 const isRestricted = restrictions.includes(pos);
                 const occupant = this.findOccupant(pos, panelName, occupied);
                 const posIcon = panelService.getPositionIcon(pos) || '•';
                 const isCenter = pos === 'center';
 
                 let bgColor = 'rgba(255,255,255,0.03)';
                 let borderColor = 'rgba(255,255,255,0.06)';
                 let label = '';
                 let labelColor = '#444';
                 let tooltip = '';
 
                 if (isCurrent) {
                     bgColor = 'rgba(74,158,255,0.25)';
                     borderColor = '#4a9eff';
                     label = '✓';
                     labelColor = '#4a9eff';
                     tooltip = 'Current position';
                 } else if (occupant) {
                     const occIcon = this.getPanelIcon(occupant);
                     bgColor = 'rgba(81,207,102,0.12)';
                     borderColor = 'rgba(81,207,102,0.4)';
                     label = occIcon;
                     labelColor = '#51cf66';
                     tooltip = `Occupied by ${occupant}`;
                 } else if (isRestricted) {
                     bgColor = 'rgba(255,80,80,0.05)';
                     borderColor = 'rgba(255,80,80,0.15)';
                     label = '✕';
                     labelColor = '#ff6b6b';
                     tooltip = 'Position is restricted for this panel';
                 } else {
                     bgColor = 'rgba(255,255,255,0.03)';
                     borderColor = 'rgba(255,255,255,0.06)';
                     label = '○';
                     labelColor = '#333';
                     tooltip = 'Click to move here';
                 }
 
                 const isClickable = !isCurrent && !occupant && !isRestricted;
                 const cursor = isClickable ? 'pointer' : 'default';
                 const clickHandler = isClickable 
                     ? `window.editor.panelService.setPanelPosition('${panelName}', '${pos}'); window.editor.settingsUI.render();`
                     : '';
 
                 html += `
                     <div onclick="${clickHandler}"
                          title="${tooltip}"
                          style="padding: 6px 2px; border: 2px solid ${borderColor}; border-radius: 4px;
                                 background: ${bgColor}; text-align: center; cursor: ${cursor};
                                 transition: all 0.2s ease; user-select: none;
                                 ${isCurrent ? 'box-shadow: 0 0 12px rgba(74,158,255,0.15);' : ''}
                                 ${isClickable ? 'hover: background: rgba(255,255,255,0.08);' : ''}
                                 display: flex; flex-direction: column; align-items: center; justify-content: center;
                                 min-height: 32px;">
                         <div style="font-size: ${isCenter ? '14px' : '16px'}; line-height: 1.2;">
                             ${isCenter ? '⊞' : posIcon}
                         </div>
                         <div style="font-size: 10px; color: ${labelColor}; margin-top: 1px; font-weight: ${isCurrent ? '600' : '400'};">
                             ${label}
                         </div>
                     </div>
                 `;
             }
         }
 
         html += '</div>';
         return html;
     }
 
     findOccupant(position, excludePanel, occupied) {
         for (const [name, pos] of occupied) {
             if (name !== excludePanel && pos === position) {
                 return name;
             }
         }
         return null;
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
         const spawnService = this.editor.spawnService;
         const mode = spawnService ? spawnService.getMode() : 'center';
         const cameraService = this.editor.cameraService;
         const allowBelowFloor = cameraService ? cameraService.getAllowBelowFloor() : false;
         const flyModeEnabled = cameraService ? cameraService.flyModeEnabled || false : false;
 
         let html = renderTemplate(UI_TEMPLATES.settings.header, {
             icon: this.createIconHTML(ICONS.settings, 20),
         });
 
         // ==================== DISPLAY SECTION ====================
         let displayContent = '';
 
         displayContent += renderTemplate(UI_TEMPLATES.settings.displaySection.theme, {
             activeBorder: currentTheme === 'dark' ? '#4a9eff' : 'rgba(255,255,255,0.08)',
             activeBg: currentTheme === 'dark' ? 'rgba(74,158,255,0.15)' : 'transparent',
             activeColor: currentTheme === 'dark' ? '#4a9eff' : '#888',
             inactiveBorder: currentTheme === 'light' ? '#4a9eff' : 'rgba(255,255,255,0.08)',
             inactiveBg: currentTheme === 'light' ? 'rgba(74,158,255,0.15)' : 'transparent',
             inactiveColor: currentTheme === 'light' ? '#4a9eff' : '#888',
         });
 
         displayContent += renderTemplate(UI_TEMPLATES.settings.displaySection.toggle, {
             label: 'Show Grid',
             onClick: 'toggleGrid',
             border: showGrid ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.08)',
             bg: showGrid ? 'rgba(74,158,255,0.15)' : 'transparent',
             color: showGrid ? '#4a9eff' : '#888',
             status: showGrid ? '✅ On' : '❌ Off',
         });
 
         displayContent += renderTemplate(UI_TEMPLATES.settings.displaySection.toggle, {
             label: 'Show Axes',
             onClick: 'toggleAxes',
             border: showAxes ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.08)',
             bg: showAxes ? 'rgba(74,158,255,0.15)' : 'transparent',
             color: showAxes ? '#4a9eff' : '#888',
             status: showAxes ? '✅ On' : '❌ Off',
         });
 
         const sizeButtons = ['small', 'medium', 'large'].map(size => `
             <button onclick="window.editor.settingsUI.setHelperSize('${size}')"
                     style="padding: 4px 10px; border: 1px solid ${helperSize === size ? '#4a9eff' : 'rgba(255,255,255,0.08)'};
                            border-radius: 4px; background: ${helperSize === size ? 'rgba(74,158,255,0.15)' : 'transparent'};
                            color: ${helperSize === size ? '#4a9eff' : '#888'}; cursor: pointer; font-size: 10px;
                            transition: all 0.2s;">
                 ${size.charAt(0).toUpperCase() + size.slice(1)}
             </button>
         `).join('');
         displayContent += renderTemplate(UI_TEMPLATES.settings.displaySection.helperSize, {
             buttons: sizeButtons,
         });
 
         // Thickness slider
         const currentThickness = this.getHelperThickness();
         displayContent += `
             <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                 <span style="color: #aaa; font-size: 11px;">Line Thickness</span>
                 <div style="display: flex; align-items: center; gap: 8px;">
                     <input type="range" id="helper-thickness" min="1" max="4" step="0.5" value="${currentThickness}"
                            style="width: 80px; height: 3px; background: rgba(255,255,255,0.1);
                                   border-radius: 2px; -webkit-appearance: none; appearance: none; cursor: pointer;
                                   outline: none;"
                            oninput="window.editor.settingsUI.setHelperThickness(parseFloat(this.value)); document.getElementById('thickness-value').textContent = this.value;">
                     <span id="thickness-value" style="color: #888; font-size: 10px; min-width: 20px; text-align: center;">${currentThickness}</span>
                 </div>
             </div>
         `;
 
         const scaleButtons = [1, 1.5, 2].map(scale => `
             <button onclick="window.editor.settingsUI.setUIScale(${scale})"
                     style="padding: 4px 10px; border: 1px solid ${uiScale === scale ? '#4a9eff' : 'rgba(255,255,255,0.08)'};
                            border-radius: 4px; background: ${uiScale === scale ? 'rgba(74,158,255,0.15)' : 'transparent'};
                            color: ${uiScale === scale ? '#4a9eff' : '#888'}; cursor: pointer; font-size: 10px;
                            transition: all 0.2s;">
                 ${scale}x
             </button>
         `).join('');
         displayContent += renderTemplate(UI_TEMPLATES.settings.displaySection.uiScale, {
             buttons: scaleButtons,
         });
 
         html += renderTemplate(UI_TEMPLATES.settings.displaySection.container, {
             content: displayContent,
         });
 
         // ==================== CAMERA SECTION ====================
         html += renderTemplate(UI_TEMPLATES.settings.cameraSection, {
             border: allowBelowFloor ? 'rgba(255,212,59,0.3)' : 'rgba(255,255,255,0.08)',
             bg: allowBelowFloor ? 'rgba(255,212,59,0.15)' : 'transparent',
             color: allowBelowFloor ? '#ffd43b' : '#888',
             status: allowBelowFloor ? '✅ Unlimited' : '🔒 Limited',
             description: allowBelowFloor
                 ? 'Camera can move below floor level (Y < 1)'
                 : 'Camera is constrained above floor level (Y ≥ 1)',
         });
 
         // ==================== SPAWN SECTION ====================
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
 
         // ==================== SECONDARY TOOLBAR BUTTONS ====================
         html += `
             <div style="margin-bottom: 16px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 6px;">
                 <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                     <span style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
                         🔧 Additional Buttons
                     </span>
                     <span style="font-size: 9px; color: #555;">Top toolbar</span>
                 </div>
                 ${this.renderSecondaryToolbarButtons()}
             </div>
         `;
 
         // ==================== PANELS SECTION ====================
         let panelsHtml = '';
         ALL_PANELS.forEach(name => {
             const currentPos = panelService.getPanelPosition(name);
             const isVisible = panelService.getPanelVisibility(name);
             const title = PANEL_NAMES[name] || name;
             const icon = this.getPanelIcon(name);
             const restrictions = panelService.getRestrictedPositions(name) || [];
             
             const positionGrid = this.createPositionGridWithOccupants(name, currentPos);
 
             panelsHtml += `
                 <div style="margin-bottom: 10px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 6px; border: 1px solid rgba(255,255,255,0.04);">
                     <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                         <div style="display: flex; align-items: center; gap: 6px;">
                             <span style="font-size: 14px;">${icon}</span>
                             <span style="color: #aaa; font-size: 12px; font-weight: 500;">${title}</span>
                             ${restrictions.length > 0 ? `<span style="font-size: 8px; color: #ff6b6b; background: rgba(255,80,80,0.1); padding: 1px 6px; border-radius: 8px;">⚠️ restricted</span>` : ''}
                         </div>
                         <button onclick="window.editor.panelService.togglePanel('${name}'); window.editor.settingsUI.render();"
                                 style="padding: 3px 10px; border: 1px solid ${isVisible ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.08)'};
                                        border-radius: 4px; background: ${isVisible ? 'rgba(74,158,255,0.15)' : 'transparent'};
                                        color: ${isVisible ? '#4a9eff' : '#555'}; cursor: pointer; font-size: 9px;
                                        transition: all 0.2s;">
                             ${isVisible ? '👁 Visible' : '🔒 Hidden'}
                         </button>
                     </div>
                     ${positionGrid}
                     <div style="font-size: 8px; color: #444; text-align: center; margin-top: 4px;">
                         ${isVisible ? `📍 ${currentPos.replace('-', ' ')}` : 'Hidden'}
                     </div>
                 </div>
             `;
         });
 
         html += renderTemplate(UI_TEMPLATES.settings.panelsSection, {
             panels: panelsHtml,
         });
 
         html += UI_TEMPLATES.settings.resetButton;
 
         this.element.innerHTML = html;
     }
 
     renderSecondaryToolbarButtons() {
         const secondaryToolbar = this.editor.uiManager?.secondaryToolbar;
         if (!secondaryToolbar) {
             return '<div style="color:#555; font-size:11px; text-align:center; padding:8px 0;">Secondary toolbar not available</div>';
         }
 
         const buttons = secondaryToolbar.getButtons();
         if (buttons.length === 0) {
             return '<div style="color:#555; font-size:11px; text-align:center; padding:8px 0;">No additional buttons</div>';
         }
 
         const systemButtons = buttons.filter(b => b.isSystem);
         const extraButtons = buttons.filter(b => !b.isSystem);
 
         let html = '';
 
         if (systemButtons.length > 0) {
             html += `
                 <div style="margin-bottom: 6px;">
                     <div style="font-size: 8px; color: #555; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">System</div>
             `;
             systemButtons.forEach(btn => {
                 html += this.renderButtonToggle(btn);
             });
             html += `</div>`;
         }
 
         if (extraButtons.length > 0) {
             if (systemButtons.length > 0) {
                 html += `<div style="border-top: 1px solid rgba(255,255,255,0.04); margin: 4px 0;"></div>`;
             }
             html += `
                 <div>
                     <div style="font-size: 8px; color: #555; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Additional</div>
             `;
             extraButtons.forEach(btn => {
                 html += this.renderButtonToggle(btn);
             });
             html += `</div>`;
         }
 
         return html;
     }
 
     renderButtonToggle(btn) {
         const isActive = btn.id === 'cameraFly' && this.editor.cameraService?.flyModeEnabled;
         return `
             <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;
                         border-bottom: 1px solid rgba(255,255,255,0.03);">
                 <div style="display: flex; align-items: center; gap: 6px;">
                     <span style="font-size: 14px;">${btn.icon || '🔧'}</span>
                     <span style="color: #aaa; font-size: 11px;">${btn.title || btn.id}</span>
                     ${isActive ? `<span style="font-size: 8px; color: #4a9eff; background: rgba(74,158,255,0.1); padding: 1px 6px; border-radius: 8px;">active</span>` : ''}
                 </div>
                 <button onclick="window.editor.uiManager.secondaryToolbar.setButtonVisible('${btn.id}', !window.editor.uiManager.secondaryToolbar.isButtonVisible('${btn.id}')); window.editor.settingsUI.render();"
                         style="padding: 2px 10px; border: 1px solid ${btn.visible ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.08)'};
                                border-radius: 4px; background: ${btn.visible ? 'rgba(74,158,255,0.15)' : 'transparent'};
                                color: ${btn.visible ? '#4a9eff' : '#555'}; cursor: pointer; font-size: 9px;
                                transition: all 0.2s;">
                     ${btn.visible ? '👁 Show' : '🔒 Hide'}
                 </button>
             </div>
         `;
     }
 
     // ==================== НАСТРОЙКИ ОТОБРАЖЕНИЯ ====================
 
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
 
     getHelperThickness() {
         return parseFloat(localStorage.getItem('editor_helper_thickness') || '1');
     }
 
     setHelperThickness(thickness) {
         localStorage.setItem('editor_helper_thickness', String(thickness));
         if (this.editor.sceneManager) {
             this.editor.sceneManager.setHelperThickness(thickness);
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
 }