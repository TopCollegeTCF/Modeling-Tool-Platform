/**
 * 🔧 SecondaryToolbar - Дополнительная панель инструментов
 *
 * 📋 ОПИСАНИЕ:
 * Фиксированная горизонтальная панель в левом верхнем углу.
 * Содержит основные системные кнопки: Project, Settings, Undo, Redo, Fly Mode.
 * Панель не перемещается и не скрывается через стандартные настройки панелей.
 *
 * @version 1.0.2
 * @author Gabryelf
 * @since 0.1.0
 */
 import { ICONS } from '../configs/icons.js';

 export class SecondaryToolbar {
     constructor(editor) {
         this.editor = editor;
         this.element = null;
         this.buttons = new Map();
         this.visibleButtons = new Set();
         this.buttonElements = new Map(); // Храним ссылки на элементы кнопок
 
         // Регистрируем системные кнопки
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
             onClick: () => this.editor.undo?.(),
         });
 
         this.registerButton('redo', {
             title: 'Redo (Ctrl+Y)',
             icon: '/public/assets/icons/redo.svg',
             defaultVisible: true,
             isSystem: true,
             onClick: () => this.editor.redo?.(),
         });
 
         this.registerButton('cameraFly', {
             title: 'Fly Mode (Auto Rotate)',
             icon: '🚁',
             defaultVisible: true,
             isSystem: false,
             onClick: () => this.toggleFlyMode(),
         });
 
         // Загружаем настройки видимости
         this.loadVisibilitySettings();
     }
 
     /**
      * Инициализирует панель
      */
     init() {
         this.element = document.createElement('div');
         this.element.id = 'secondary-toolbar';
         this.element.setAttribute('data-panel', 'secondary');
         
         // Горизонтальная панель в левом верхнем углу
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
         this.update();
 
         console.log('✅ SecondaryToolbar initialized (horizontal)');
     }
 
     /**
      * Регистрирует новую кнопку
      * @param {string} id - Уникальный идентификатор
      * @param {Object} config - Конфигурация кнопки
      */
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
 
     /**
      * Загружает настройки видимости из localStorage
      */
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
         } catch (e) {
             // Используем значения по умолчанию
         }
     }
 
     /**
      * Сохраняет настройки видимости
      */
     saveVisibilitySettings() {
         try {
             const visibility = {};
             for (const [id, config] of this.buttons) {
                 visibility[id] = config.visible;
             }
             localStorage.setItem('editor_secondary_toolbar_buttons', JSON.stringify(visibility));
         } catch (e) {
             // Игнорируем ошибки
         }
     }
 
     /**
      * Создает элемент кнопки
      * @param {string} id - Идентификатор кнопки
      * @param {Object} config - Конфигурация кнопки
      * @returns {HTMLButtonElement} Созданная кнопка
      */
     createButtonElement(id, config) {
         const isActive = id === 'cameraFly' && this.editor.cameraService?.flyModeEnabled;
         const isUndo = id === 'undo';
         const isRedo = id === 'redo';
 
         // Определяем стили для кнопок Undo/Redo
         let extraStyles = '';
         if (isUndo && !this.editor.historyManager?.canUndo()) {
             extraStyles = 'opacity: 0.3; cursor: not-allowed;';
         }
         if (isRedo && !this.editor.historyManager?.canRedo()) {
             extraStyles = 'opacity: 0.3; cursor: not-allowed;';
         }
         if (isActive) {
             extraStyles += 'background: rgba(74,158,255,0.2); color: #4a9eff;';
         }
 
         const btn = document.createElement('button');
         btn.title = config.title || '';
         btn.dataset.buttonId = id;
         btn.style.cssText = `
             width: 32px;
             height: 32px;
             border: none;
             border-radius: 6px;
             background: ${isActive ? 'rgba(74,158,255,0.2)' : 'transparent'};
             color: ${isActive ? '#4a9eff' : '#888'};
             cursor: ${extraStyles.includes('not-allowed') ? 'not-allowed' : 'pointer'};
             font-size: 16px;
             transition: all 0.2s;
             display: flex;
             align-items: center;
             justify-content: center;
             ${extraStyles}
         `;
 
         // Создаем содержимое кнопки
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
 
         // Добавляем обработчики событий
         btn.addEventListener('mouseenter', () => {
             if (btn.style.cursor.includes('not-allowed')) return;
             btn.style.background = 'rgba(255,255,255,0.08)';
             btn.style.color = '#fff';
             const img = btn.querySelector('img');
             if (img) img.style.filter = 'invert(1)';
         });
 
         btn.addEventListener('mouseleave', () => {
             if (btn.style.cursor.includes('not-allowed')) return;
             btn.style.background = isActive ? 'rgba(74,158,255,0.2)' : 'transparent';
             btn.style.color = isActive ? '#4a9eff' : '#888';
             const img = btn.querySelector('img');
             if (img) img.style.filter = isActive ? 'invert(0.5) sepia(1) hue-rotate(200deg) saturate(5)' : 'invert(0.5)';
         });
 
         // Обработчик клика
         btn.addEventListener('click', (e) => {
             if (btn.style.cursor.includes('not-allowed')) return;
             if (config.onClick) {
                 config.onClick();
             }
         });
 
         return btn;
     }
 
     /**
      * Обновляет отображение панели
      */
     update() {
         if (!this.element) return;
 
         // Очищаем панель
         this.element.innerHTML = '';
         this.buttonElements.clear();
 
         let hasVisibleButtons = false;
         let hasSystemVisible = false;
         let hasExtraVisible = false;
 
         // Сначала проверяем, какие кнопки видимы
         for (const [id, config] of this.buttons) {
             if (!config.visible) continue;
             hasVisibleButtons = true;
             if (config.isSystem) hasSystemVisible = true;
             else hasExtraVisible = true;
         }
 
         if (!hasVisibleButtons) {
             this.element.innerHTML = '<span style="color:#444; font-size:10px; padding:4px;">No buttons</span>';
             return;
         }
 
         // Создаем кнопки
         let isFirstSystem = true;
         let isFirstExtra = true;
 
         for (const [id, config] of this.buttons) {
             if (!config.visible) continue;
 
             // Добавляем разделитель между системными и дополнительными кнопками
             if (!config.isSystem && hasSystemVisible && isFirstExtra) {
                 const divider = document.createElement('div');
                 divider.style.cssText = 'width: 1px; height: 24px; background: rgba(255,255,255,0.08); margin: 0 2px;';
                 this.element.appendChild(divider);
                 isFirstExtra = false;
             }
 
             const btn = this.createButtonElement(id, config);
             this.element.appendChild(btn);
             this.buttonElements.set(id, btn);
 
             if (config.isSystem) isFirstSystem = false;
             else isFirstExtra = false;
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
 
     /**
      * Переключает режим полета камеры
      */
     toggleFlyMode() {
         const cameraService = this.editor.cameraService;
         if (!cameraService) return;
 
         const current = cameraService.flyModeEnabled || false;
         cameraService.setFlyMode(!current);
         this.update();
 
         // Обновляем настройки если они открыты
         if (this.editor.settingsUI && this.editor.settingsUI.isOpen) {
             this.editor.settingsUI.render();
         }
 
         console.log(`🚁 Fly mode: ${!current ? 'ON' : 'OFF'}`);
     }
 
     /**
      * Получает состояние видимости кнопки
      * @param {string} id - Идентификатор кнопки
      * @returns {boolean}
      */
     isButtonVisible(id) {
         return this.buttons.get(id)?.visible || false;
     }
 
     /**
      * Устанавливает видимость кнопки
      * @param {string} id - Идентификатор кнопки
      * @param {boolean} visible - Видимость
      */
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
 
     /**
      * Получает все зарегистрированные кнопки с их состоянием
      * @returns {Array} Массив конфигураций кнопок
      */
     getButtons() {
         return Array.from(this.buttons.values());
     }
 }