/**
 * 🔧 SecondaryToolbar - Дополнительная панель инструментов
 *
 * 📋 ОПИСАНИЕ:
 * Фиксированная панель с дополнительными кнопками.
 * Расположена в левом верхнем углу над основным тулбаром.
 * Некоторые кнопки можно скрывать/показывать через настройки.
 *
 * @version 1.0.0
 * @author Gabryelf
 * @since 0.1.0
 */
import { ICONS } from '../configs/icons.js';
import { UI_TEMPLATES, renderTemplate } from '../configs/ui-templates.js';

export class SecondaryToolbar {
    constructor(editor) {
        this.editor = editor;
        this.element = null;
        this.buttons = new Map();
        this.visibleButtons = new Set();

        // Регистрируем доступные кнопки
        this.registerButton('cameraFly', {
            title: 'Fly Mode (Auto Rotate)',
            icon: '🚁',
            defaultVisible: true,
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
        this.update();

        // Добавляем после основного тулбара
        const toolbar = document.getElementById('toolbar');
        if (toolbar) {
            toolbar.parentNode.insertBefore(this.element, toolbar);
        } else {
            document.body.appendChild(this.element);
        }

        console.log('✅ SecondaryToolbar initialized');
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
     * Обновляет отображение панели
     */
    update() {
        if (!this.element) return;

        let buttonsHtml = '';
        let first = true;

        for (const [id, config] of this.buttons) {
            if (!config.visible) continue;

            if (!first) {
                buttonsHtml += UI_TEMPLATES.secondaryToolbar.divider;
            }
            first = false;

            const isActive = this.editor.cameraService?.flyModeEnabled || false;
            const activeStyles = isActive && id === 'cameraFly'
                ? 'background: rgba(74,158,255,0.2); color: #4a9eff;'
                : '';

            buttonsHtml += renderTemplate(UI_TEMPLATES.secondaryToolbar.button, {
                onClick: config.onClick.toString(),
                title: config.title || '',
                content: config.icon || '🔧',
                extraStyles: activeStyles,
                onMouseEnter: "this.style.background='rgba(255,255,255,0.08)'; this.style.color='#fff';",
                onMouseLeave: `this.style.background='${isActive && id === 'cameraFly' ? 'rgba(74,158,255,0.2)' : 'transparent'}'; this.style.color='${isActive && id === 'cameraFly' ? '#4a9eff' : '#888'}';`,
            });
        }

        this.element.innerHTML = renderTemplate(UI_TEMPLATES.secondaryToolbar.container, {
            buttons: buttonsHtml || '<div style="color:#444; font-size:10px; padding:4px;">No buttons</div>',
        });
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