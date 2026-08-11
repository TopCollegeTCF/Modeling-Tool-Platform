/**
 * ⚙️ SettingsUI - Панель настроек приложения
 *
 * 📋 ОПИСАНИЕ:
 * Предоставляет интерфейс для настройки различных параметров приложения:
 * - Тема оформления (темная/светлая)
 * - Отображение хелперов (сетка, оси, размер)
 * - Масштаб интерфейса
 * - Настройки камеры
 * - Режим спавна
 * - Видимость дополнительных кнопок
 * - Позиции и видимость панелей с визуальной сеткой
 *
 * 🏗️ АРХИТЕКТУРА:
 * - Модальное окно с затемнением
 * - Использование UI_TEMPLATES для HTML шаблонов
 * - Сохранение настроек в localStorage
 * - Интеграция с PanelService и SecondaryToolbar
 *
 * @version 1.0.5
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
 
     /**
      * Инициализирует панель настроек
      */
     init() {
         // Создаем затемнение
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
 
         // Создаем основную панель
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
                 max-width: 440px;
                 max-height: 80vh;
                 overflow-y: auto;
                 display: none;
             `,
         });
 
         // Добавляем стили скролла
         this.element.style.cssText += `
             &::-webkit-scrollbar { width: 4px; }
             &::-webkit-scrollbar-track { background: transparent; }
             &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
             &::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }
         `;
 
         document.body.appendChild(this.overlay);
         document.body.appendChild(this.element);
 
         // Сохраняем ссылку на себя в редакторе
         this.editor.settingsUI = this;
 
         console.log('✅ SettingsUI initialized');
     }
 
     /**
      * Переключает состояние панели
      */
     toggle() {
         this.isOpen ? this.close() : this.open();
     }
 
     /**
      * Открывает панель настроек
      */
     open() {
         this.isOpen = true;
         this.element.style.display = 'block';
         this.overlay.style.display = 'block';
         this.render();
     }
 
     /**
      * Закрывает панель настроек
      */
     close() {
         this.isOpen = false;
         this.element.style.display = 'none';
         this.overlay.style.display = 'none';
     }
 
     /**
      * Создает HTML для иконки
      * @param {string} iconPath - путь к иконке
      * @param {number} size - размер иконки
      * @returns {string} HTML строка
      */
     createIconHTML(iconPath, size = 16) {
         return `<img src="${iconPath}" style="width:${size}px; height:${size}px; filter: invert(0.5); vertical-align: middle;" onerror="this.style.display='none'">`;
     }
 
     /**
      * Создает визуальную сетку позиций для панели
      * @param {string} panelName - Имя панели
      * @param {string} currentPos - Текущая позиция
      * @returns {string} HTML сетки
      */
     createPositionGrid(panelName, currentPos) {
         const panelService = this.editor.panelService;
         if (!panelService) return '';
 
         const restrictions = panelService.getRestrictedPositions(panelName) || [];
         const grid = panelService.getPositionGrid();
         
         let html = `
             <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; 
                         max-width: 132px; margin: 4px auto; background: rgba(255,255,255,0.03); 
                         padding: 4px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.05);">
         `;
         
         for (const row of grid) {
             for (const pos of row) {
                 const isActive = pos === currentPos;
                 const isRestricted = restrictions.includes(pos);
                 const icon = panelService.getPositionIcon(pos) || '•';
                 const label = panelService.getPositionLabel(pos) || pos;
                 
                 // Определяем цвета
                 let borderColor, bgColor, textColor, labelColor;
                 if (isActive) {
                     borderColor = '#4a9eff';
                     bgColor = 'rgba(74,158,255,0.2)';
                     textColor = '#4a9eff';
                     labelColor = '#4a9eff';
                 } else if (isRestricted) {
                     borderColor = 'rgba(255,80,80,0.2)';
                     bgColor = 'rgba(255,80,80,0.05)';
                     textColor = '#ff6b6b';
                     labelColor = '#ff6b6b';
                 } else {
                     borderColor = 'rgba(255,255,255,0.08)';
                     bgColor = 'transparent';
                     textColor = '#666';
                     labelColor = '#444';
                 }
 
                 // Строим кнопку с сеткой
                 const isCenter = pos === 'center';
                 const cellContent = isCenter ? '⊞' : icon;
                 const cellSize = isCenter ? '18px' : '18px';
                 const fontSize = isCenter ? '14px' : '16px';
 
                 html += `
                     <button onclick="${!isRestricted ? `window.editor.panelService.setPanelPosition('${panelName}', '${pos}'); window.editor.settingsUI.render();` : ''}"
                             title="${isRestricted ? '⚠️ This position is not available for this panel' : label}"
                             style="padding: 4px 2px; border: 2px solid ${borderColor}; border-radius: 4px;
                                    background: ${bgColor}; color: ${textColor}; 
                                    cursor: ${isRestricted ? 'not-allowed' : 'pointer'};
                                    font-size: ${fontSize}; transition: all 0.2s;
                                    ${isRestricted ? 'opacity: 0.4;' : ''}
                                    ${isActive ? 'box-shadow: 0 0 8px rgba(74,158,255,0.2);' : ''}
                                    display: flex; flex-direction: column; align-items: center;
                                    justify-content: center; min-height: 28px;"
                             ${isRestricted ? 'disabled' : ''}>
                         ${cellContent}
                         <span style="display: block; font-size: 6px; color: ${labelColor}; margin-top: 1px; 
                                     ${isActive ? 'font-weight: 600;' : ''}">
                             ${isActive ? '✓' : isRestricted ? '✕' : ''}
                         </span>
                     </button>
                 `;
             }
         }
         
         html += '</div>';
         return html;
     }
 
     /**
      * Рендерит содержимое панели настроек
      */
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
 
         // Получаем текущие настройки
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
 
         // Начинаем собирать HTML
         let html = renderTemplate(UI_TEMPLATES.settings.header, {
             icon: this.createIconHTML(ICONS.settings, 20),
         });
 
         // ==================== DISPLAY SECTION ====================
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
                            color: ${helperSize === size ? '#4a9eff' : '#888'}; cursor: pointer; font-size: 10px;
                            transition: all 0.2s;">
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
 
             // Создаем визуальную сетку позиций
             const positionGrid = this.createPositionGrid(name, currentPos);
 
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
                     ${restrictions.length > 0 ? `<div style="font-size: 7px; color: #555; margin-top: 4px; text-align: center;">⚠️ Some positions are not available for this panel</div>` : ''}
                 </div>
             `;
         });
 
         html += renderTemplate(UI_TEMPLATES.settings.panelsSection, {
             panels: panelsHtml,
         });
 
         // ==================== RESET BUTTON ====================
         html += UI_TEMPLATES.settings.resetButton;
 
         this.element.innerHTML = html;
     }
 
     /**
      * Рендерит настройки видимости кнопок SecondaryToolbar
      * @returns {string} HTML строка
      */
     renderSecondaryToolbarButtons() {
         const secondaryToolbar = this.editor.uiManager?.secondaryToolbar;
         if (!secondaryToolbar) {
             return '<div style="color:#555; font-size:11px; text-align:center; padding:8px 0;">Secondary toolbar not available</div>';
         }
 
         const buttons = secondaryToolbar.getButtons();
         if (buttons.length === 0) {
             return '<div style="color:#555; font-size:11px; text-align:center; padding:8px 0;">No additional buttons</div>';
         }
 
         // Группируем по типу
         const systemButtons = buttons.filter(b => b.isSystem);
         const extraButtons = buttons.filter(b => !b.isSystem);
 
         let html = '';
 
         // Системные кнопки (всегда показываются, но можно скрыть)
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
 
         // Дополнительные кнопки
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
 
     /**
      * Рендерит переключатель для одной кнопки
      * @param {Object} btn - Конфигурация кнопки
      * @returns {string} HTML строка
      */
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
 
     // ==================== ПАНЕЛЬНЫЕ ИКОНКИ ====================
 
     getPanelIcon(name) {
         const icons = {
             'properties': '📐',
             'sceneTree': '📦',
             'tools': '🔧',
             'spawn': '➕',
         };
         return icons[name] || '📄';
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
 
     // ==================== НАСТРОЙКИ КАМЕРЫ ====================
 
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