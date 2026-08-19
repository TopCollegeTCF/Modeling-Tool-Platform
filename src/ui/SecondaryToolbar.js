/**
 * 🔧 SecondaryToolbar - Дополнительная панель инструментов
 */
 import { ICONS } from '../configs/icons.js';

 export class SecondaryToolbar {
     constructor(editor) {
         this.editor = editor;
         this.element = null;
         this.buttons = new Map();
         this.visibleButtons = new Set();
         this.buttonElements = new Map();
         this._commandUnsubscribe = null;
         
         this.registerButton('project', {
             title: 'Project Manager',
             icon: '/public/assets/icons/folder.svg',
             defaultVisible: true,
             isSystem: true,
             onClick: () => this.editor.projectUI?.open(),
         });
 
         this.registerButton('settings', {
             title: 'Settings',
             icon: ICONS.settings,
             defaultVisible: true,
             isSystem: true,
             onClick: () => this.editor.settingsUI?.toggle(),
         });
 
         this.registerButton('undo', {
             title: 'Undo (Ctrl+Z)',
             icon: '/public/assets/icons/undo.svg',
             defaultVisible: true,
             isSystem: true,
             onClick: () => {
                 console.log('🔘 Undo button clicked');
                 this.editor.undo?.();
                 setTimeout(() => this.update(), 100);
             },
         });
 
         this.registerButton('redo', {
             title: 'Redo (Ctrl+Y)',
             icon: '/public/assets/icons/redo.svg',
             defaultVisible: true,
             isSystem: true,
             onClick: () => {
                 console.log('🔘 Redo button clicked');
                 this.editor.redo?.();
                 setTimeout(() => this.update(), 100);
             },
         });
 
         this.registerButton('cameraFly', {
             title: 'Fly Mode',
             icon: '🚁',
             defaultVisible: true,
             isSystem: false,
             onClick: () => this.toggleFlyMode(),
         });
 
         this.loadVisibilitySettings();
     }
 
     init() {
         this.element = document.createElement('div');
         this.element.id = 'secondary-toolbar';
         this.element.setAttribute('data-panel', 'secondary');
         this.element.style.cssText = `
             position: fixed;
             top: 12px;
             left: 12px;
             z-index: 1001;
             background: rgba(16, 16, 32, 0.95);
             backdrop-filter: blur(10px);
             padding: 6px 8px;
             border-radius: 10px;
             border: 1px solid rgba(255,255,255,0.08);
             display: flex;
             flex-direction: row;
             gap: 2px;
             align-items: center;
             box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
         `;
         document.body.appendChild(this.element);
 
         if (this.editor.commandManager) {
             this._commandUnsubscribe = this.editor.commandManager.addListener(() => {
                 this.update();
             });
         }
 
         setTimeout(() => this.update(), 100);
         this.update();
         console.log('✅ SecondaryToolbar initialized');
     }
 
     registerButton(id, config) {
         this.buttons.set(id, {
             ...config,
             id: id,
             visible: config.defaultVisible !== false,
         });
         if (config.defaultVisible !== false) {
             this.visibleButtons.add(id);
         }
     }
 
     loadVisibilitySettings() {
         try {
             const saved = localStorage.getItem('editor_secondary_toolbar_buttons');
             if (saved) {
                 const visibility = JSON.parse(saved);
                 for (const [id, visible] of Object.entries(visibility)) {
                     if (this.buttons.has(id)) {
                         this.buttons.get(id).visible = visible;
                         if (visible) {
                             this.visibleButtons.add(id);
                         } else {
                             this.visibleButtons.delete(id);
                         }
                     }
                 }
             }
         } catch (e) {}
     }
 
     saveVisibilitySettings() {
         try {
             const visibility = {};
             for (const [id, config] of this.buttons) {
                 visibility[id] = config.visible;
             }
             localStorage.setItem('editor_secondary_toolbar_buttons', JSON.stringify(visibility));
         } catch (e) {}
     }
 
     createButtonElement(id, config) {
         const isActive = id === 'cameraFly' && this.editor.cameraService?.flyModeEnabled;
         const isUndo = id === 'undo';
         const isRedo = id === 'redo';
         
         // Используем CommandManager для проверки состояния
         const canUndo = this.editor.commandManager?.canUndo?.() || false;
         const canRedo = this.editor.commandManager?.canRedo?.() || false;
         
         let extraStyles = '';
         if (isUndo && !canUndo) {
             extraStyles = 'opacity: 0.3; cursor: not-allowed; pointer-events: none;';
         }
         if (isRedo && !canRedo) {
             extraStyles = 'opacity: 0.3; cursor: not-allowed; pointer-events: none;';
         }
         if (isActive) {
             extraStyles += 'background: rgba(74,158,255,0.2); color: #4a9eff;';
         }
 
         const btn = document.createElement('button');
         btn.title = config.title || '';
         btn.dataset.buttonId = id;
         btn.disabled = (isUndo && !canUndo) || (isRedo && !canRedo);
         btn.style.cssText = `
             width: 32px;
             height: 32px;
             border: none;
             border-radius: 6px;
             background: ${isActive ? 'rgba(74,158,255,0.2)' : 'transparent'};
             color: ${isActive ? '#4a9eff' : '#888'};
             cursor: ${(isUndo && !canUndo) || (isRedo && !canRedo) ? 'not-allowed' : 'pointer'};
             font-size: 16px;
             transition: all 0.2s;
             display: flex;
             align-items: center;
             justify-content: center;
             ${extraStyles}
         `;
 
         if (config.icon && (config.icon.startsWith('/') || config.icon.startsWith('http'))) {
             const img = document.createElement('img');
             const filter = isActive ? 'invert(0.5) sepia(1) hue-rotate(200deg) saturate(5)' : 'invert(0.5)';
             img.src = config.icon;
             img.style.cssText = `width:18px; height:18px; filter: ${filter};`;
             img.alt = config.title || '';
             img.onerror = () => {
                 img.style.display = 'none';
                 btn.textContent = this.getFallbackIcon(id);
             };
             btn.appendChild(img);
         } else {
             btn.textContent = config.icon || '🔧';
         }
 
         if (!btn.disabled) {
             btn.addEventListener('mouseenter', () => {
                 btn.style.background = 'rgba(255,255,255,0.08)';
                 btn.style.color = '#fff';
                 const img = btn.querySelector('img');
                 if (img) img.style.filter = 'invert(1)';
             });
             btn.addEventListener('mouseleave', () => {
                 btn.style.background = isActive ? 'rgba(74,158,255,0.2)' : 'transparent';
                 btn.style.color = isActive ? '#4a9eff' : '#888';
                 const img = btn.querySelector('img');
                 if (img) img.style.filter = isActive ? 'invert(0.5) sepia(1) hue-rotate(200deg) saturate(5)' : 'invert(0.5)';
             });
         }
 
         btn.addEventListener('click', (e) => {
             if (btn.disabled) return;
             if (config.onClick) {
                 config.onClick();
             }
             setTimeout(() => this.update(), 100);
         });
 
         return btn;
     }
 
     update() {
         if (!this.element) return;
         
         const canUndo = this.editor.commandManager?.canUndo?.() || false;
         const canRedo = this.editor.commandManager?.canRedo?.() || false;
         const total = this.editor.commandManager?.commands?.length || 0;
         const index = this.editor.commandManager?.currentIndex || -1;
         
         console.log(`🔄 Toolbar update: total=${total}, index=${index}, undo=${canUndo}, redo=${canRedo}`);
         
         this.element.innerHTML = '';
         this.buttonElements.clear();
 
         let hasVisibleButtons = false;
         for (const [id, config] of this.buttons) {
             if (config.visible) {
                 hasVisibleButtons = true;
                 break;
             }
         }
 
         if (!hasVisibleButtons) {
             this.element.innerHTML = '<span style="color:#444; font-size:10px; padding:4px;">No buttons</span>';
             return;
         }
 
         let hasSystemButtons = false;
         for (const [id, config] of this.buttons) {
             if (config.visible && config.isSystem) {
                 hasSystemButtons = true;
                 const btn = this.createButtonElement(id, config);
                 this.element.appendChild(btn);
                 this.buttonElements.set(id, btn);
             }
         }
 
         let hasExtraButtons = false;
         for (const [id, config] of this.buttons) {
             if (config.visible && !config.isSystem) {
                 hasExtraButtons = true;
                 break;
             }
         }
 
         if (hasSystemButtons && hasExtraButtons) {
             const divider = document.createElement('div');
             divider.style.cssText = 'width: 1px; height: 24px; background: rgba(255,255,255,0.08); margin: 0 4px;';
             this.element.appendChild(divider);
         }
 
         for (const [id, config] of this.buttons) {
             if (config.visible && !config.isSystem) {
                 const btn = this.createButtonElement(id, config);
                 this.element.appendChild(btn);
                 this.buttonElements.set(id, btn);
             }
         }
     }
 
     getFallbackIcon(id) {
         const icons = {
             'project': '📁',
             'settings': '⚙️',
             'undo': '↩️',
             'redo': '↪️',
             'cameraFly': '🚁'
         };
         return icons[id] || '🔧';
     }
 
     toggleFlyMode() {
         const cameraService = this.editor.cameraService;
         if (!cameraService) return;
         const current = cameraService.flyModeEnabled || false;
         cameraService.setFlyMode(!current);
         this.update();
         if (this.editor.settingsUI && this.editor.settingsUI.isOpen) {
             this.editor.settingsUI.render();
         }
         console.log(`🚁 Fly mode: ${!current ? 'ON' : 'OFF'}`);
     }
 
     isButtonVisible(id) {
         return this.buttons.get(id)?.visible || false;
     }
 
     setButtonVisible(id, visible) {
         const config = this.buttons.get(id);
         if (!config) return;
         config.visible = visible;
         if (visible) {
             this.visibleButtons.add(id);
         } else {
             this.visibleButtons.delete(id);
         }
         this.saveVisibilitySettings();
         this.update();
     }
 
     getButtons() {
         return Array.from(this.buttons.values());
     }
 
     dispose() {
         if (this._commandUnsubscribe) {
             this._commandUnsubscribe();
             this._commandUnsubscribe = null;
         }
     }
 }