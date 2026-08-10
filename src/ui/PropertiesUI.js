import { TEMPLATES, createElement, applyStyles } from '../configs/templates.js';
import { ICONS } from '../configs/icons.js';
import { COLORS } from '../configs/colors.js';

/**
 * 📐 PropertiesUI - Панель свойств выбранного объекта
 * 
 * 📋 ОПИСАНИЕ:
 * Отображает и позволяет редактировать свойства выбранного объекта:
 * - Имя объекта
 * - Цвет и прозрачность
 * - Позиция (X, Y, Z)
 * - Вращение (X, Y, Z) в градусах
 * - Масштаб (X, Y, Z)
 * 
 * 🎨 ПОДДЕРЖКА ТЕМ:
 * Автоматически адаптируется под темную/светлую тему
 * 
 * @version 1.0.0
 * @author Gabryelf
 * @since 0.0.9
 */
export class PropertiesUI {
    constructor(editor) {
        this.editor = editor;
        this.element = null;
        this.currentTheme = this.getCurrentTheme();
    }

    /**
     * Инициализирует панель свойств
     */
    init() {
        this.element = createElement('div', {
            id: 'properties',
            styles: `
                position: fixed;
                top: 12px;
                right: 12px;
                z-index: 1000;
                background: rgba(16, 16, 32, 0.95);
                backdrop-filter: blur(10px);
                padding: 12px;
                border-radius: 10px;
                border: 1px solid rgba(255,255,255,0.08);
                min-width: 180px;
                max-width: 220px;
                max-height: calc(100vh - 24px);
                overflow-y: auto;
                overflow-x: hidden;
                transition: all 0.3s ease;
            `,
            attributes: { 'data-panel': 'properties' },
        });

        // Добавляем стили для скролла
        this.element.style.cssText += `
            &::-webkit-scrollbar { width: 3px; }
            &::-webkit-scrollbar-track { background: transparent; }
            &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
        `;

        document.body.appendChild(this.element);
        
        // Применяем текущую тему
        this.applyTheme(this.currentTheme);
        
        this.update();
        console.log('✅ PropertiesUI initialized');
    }

    /**
     * Получает текущую тему из localStorage
     * @returns {string} 'dark' или 'light'
     */
    getCurrentTheme() {
        return localStorage.getItem('editor_theme') || 'dark';
    }

    /**
     * Применяет тему к панели
     * @param {string} theme - 'dark' или 'light'
     */
    applyTheme(theme) {
        this.currentTheme = theme;
        const colors = theme === 'light' ? COLORS.light : COLORS.dark;
        
        if (this.element) {
            this.element.style.background = colors.surface;
            this.element.style.borderColor = colors.border;
            this.element.style.color = colors.text.primary;
        }
    }

    /**
     * Создает HTML для иконки
     * @param {string} iconPath - путь к иконке
     * @param {number} size - размер иконки
     * @returns {string} HTML строка
     */
    createIconHTML(iconPath, size = 14) {
        const isLight = this.currentTheme === 'light';
        const filter = isLight ? 'invert(0.8)' : 'invert(0.5)';
        return `<img src="${iconPath}" style="width:${size}px; height:${size}px; filter: ${filter}; vertical-align: middle;" onerror="this.style.display='none'">`;
    }

    /**
     * Обновляет содержимое панели
     */
    update() {
        if (!this.element) return;

        const selected = this.editor.selectionManager.getSelected();
        const colors = this.currentTheme === 'light' ? COLORS.light : COLORS.dark;
        
        // Стили для полей ввода в зависимости от темы
        const inputStyle = `
            width:100%; 
            padding:2px 5px; 
            background:${colors.input.background};
            border:1px solid ${colors.input.border}; 
            border-radius:2px;
            color:${colors.input.color}; 
            font-size:10px; 
            box-sizing:border-box;
            transition: all 0.3s ease;
        `;

        const labelStyle = `
            color:${colors.input.label}; 
            font-size:8px; 
            display:block; 
            margin-bottom:1px; 
            text-transform:uppercase; 
            letter-spacing:0.5px;
        `;

        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span style="color:${colors.input.label}; font-size:9px; text-transform:uppercase; letter-spacing:1px; font-weight:600;">
                    ${this.createIconHTML(ICONS.cube, 12)} Properties
                </span>
                <button onclick="window.editor.deleteSelected()"
                        style="background:transparent; border:none; color:${colors.input.label}; cursor:pointer; padding:2px; transition:all 0.2s; display:flex; align-items:center;"
                        onmouseenter="this.style.color='#ff6b6b'"
                        onmouseleave="this.style.color='${colors.input.label}'"
                        title="Delete selected">
                    ${this.createIconHTML(ICONS.delete, 14)}
                </button>
            </div>
        `;

        if (!selected) {
            html += `
                <div style="color:${colors.text.muted}; font-size:11px; text-align:center; padding:15px 0;">
                    No object selected
                </div>
            `;
            this.element.innerHTML = html;
            return;
        }

        const pos = selected.position;
        const rot = selected.rotation;
        const scale = selected.scale;
        const name = selected.userData.name || selected.userData.type;

        // Получаем цвет и прозрачность
        let color = '#4a9eff';
        let opacity = 1;
        let transparent = false;
        if (selected.material) {
            if (selected.material.color) {
                color = '#' + selected.material.color.getHexString();
            }
            opacity = selected.material.opacity || 1;
            transparent = selected.material.transparent || false;
        }

        html += `
            <div style="margin-bottom:5px;">
                <label style="${labelStyle}">Name</label>
                <input type="text" id="prop-name" value="${name}"
                       style="${inputStyle}">
            </div>

            <!-- Внешний вид -->
            <div style="margin-bottom:5px; padding:6px 8px; background:${colors.surfaceLight}; border-radius:4px;">
                <label style="${labelStyle}">🎨 Appearance</label>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px;">
                    <div>
                        <label style="color:${colors.text.muted}; font-size:7px; display:block; margin-bottom:1px;">Color</label>
                        <input type="color" id="prop-color" value="${color}"
                               style="width:100%; padding:1px; background:transparent;
                                      border:1px solid ${colors.input.border}; border-radius:2px;
                                      cursor:pointer; height:24px;">
                    </div>
                    <div>
                        <label style="color:${colors.text.muted}; font-size:7px; display:block; margin-bottom:1px;">Opacity</label>
                        <input type="range" id="prop-opacity" min="0" max="1" step="0.05" value="${opacity}"
                               style="width:100%; margin:0; height:4px; background:${colors.input.border};
                                      border-radius:2px; -webkit-appearance:none; appearance:none;
                                      cursor:pointer;">
                        <div style="display:flex; justify-content:space-between; font-size:7px; color:${colors.text.muted};">
                            <span>0%</span>
                            <span id="opacity-value">${Math.round(opacity * 100)}%</span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Позиция -->
            <div style="margin-bottom:4px;">
                <label style="${labelStyle}">Position</label>
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:2px;">
                    <input class="prop-input" data-prop="position" data-axis="x" type="number" value="${pos.x.toFixed(2)}" step="0.1"
                           style="${inputStyle}">
                    <input class="prop-input" data-prop="position" data-axis="y" type="number" value="${pos.y.toFixed(2)}" step="0.1"
                           style="${inputStyle}">
                    <input class="prop-input" data-prop="position" data-axis="z" type="number" value="${pos.z.toFixed(2)}" step="0.1"
                           style="${inputStyle}">
                </div>
            </div>

            <!-- Вращение -->
            <div style="margin-bottom:4px;">
                <label style="${labelStyle}">Rotation</label>
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:2px;">
                    <input class="prop-input" data-prop="rotation" data-axis="x" type="number" value="${(rot.x * 180 / Math.PI).toFixed(0)}" step="1"
                           style="${inputStyle}">
                    <input class="prop-input" data-prop="rotation" data-axis="y" type="number" value="${(rot.y * 180 / Math.PI).toFixed(0)}" step="1"
                           style="${inputStyle}">
                    <input class="prop-input" data-prop="rotation" data-axis="z" type="number" value="${(rot.z * 180 / Math.PI).toFixed(0)}" step="1"
                           style="${inputStyle}">
                </div>
            </div>

            <!-- Масштаб -->
            <div style="margin-bottom:5px;">
                <label style="${labelStyle}">Scale</label>
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:2px;">
                    <input class="prop-input" data-prop="scale" data-axis="x" type="number" value="${scale.x.toFixed(2)}" step="0.1" min="0.01"
                           style="${inputStyle}">
                    <input class="prop-input" data-prop="scale" data-axis="y" type="number" value="${scale.y.toFixed(2)}" step="0.1" min="0.01"
                           style="${inputStyle}">
                    <input class="prop-input" data-prop="scale" data-axis="z" type="number" value="${scale.z.toFixed(2)}" step="0.1" min="0.01"
                           style="${inputStyle}">
                </div>
            </div>
        `;

        this.element.innerHTML = html;

        // Настраиваем обработчики
        this.setupPropertyHandlers(selected);
        this.setupColorHandlers(selected);
        this.setupOpacityHandlers(selected);

        const nameInput = this.element.querySelector('#prop-name');
        if (nameInput) {
            nameInput.addEventListener('change', () => {
                selected.userData.name = nameInput.value;
                this.editor.uiManager.sceneTree.update();
            });
        }
    }

    /**
     * Настраивает обработчики для полей трансформации
     * @param {Entity} entity - выбранный объект
     */
    setupPropertyHandlers(entity) {
        this.element.querySelectorAll('.prop-input').forEach(input => {
            const prop = input.dataset.prop;
            const axis = input.dataset.axis;
            const update = () => {
                const value = parseFloat(input.value);
                if (isNaN(value)) return;
                if (prop === 'position') {
                    entity.position[axis] = value;
                } else if (prop === 'rotation') {
                    entity.rotation[axis] = value * Math.PI / 180;
                } else if (prop === 'scale') {
                    entity.scale[axis] = Math.max(0.01, value);
                }
            };
            input.addEventListener('change', update);
            input.addEventListener('input', update);
        });
    }

    /**
     * Настраивает обработчик для выбора цвета
     * @param {Entity} entity - выбранный объект
     */
    setupColorHandlers(entity) {
        const colorInput = this.element.querySelector('#prop-color');
        if (!colorInput) return;
        colorInput.addEventListener('input', () => {
            const hex = colorInput.value;
            if (entity.material && entity.material.color) {
                entity.material.color.set(hex);
                entity.material.needsUpdate = true;
                entity._originalColor = entity.material.color.clone();
            }
        });
    }

    /**
     * Настраивает обработчик для прозрачности
     * @param {Entity} entity - выбранный объект
     */
    setupOpacityHandlers(entity) {
        const opacityInput = this.element.querySelector('#prop-opacity');
        const opacityValue = this.element.querySelector('#opacity-value');
        if (!opacityInput) return;
        opacityInput.addEventListener('input', () => {
            const value = parseFloat(opacityInput.value);
            if (entity.material) {
                entity.material.transparent = true;
                entity.material.opacity = value;
                entity.material.needsUpdate = true;
            }
            if (opacityValue) {
                opacityValue.textContent = Math.round(value * 100) + '%';
            }
        });
    }

    /**
     * Обновляет тему панели
     * @param {string} theme - 'dark' или 'light'
     */
    updateTheme(theme) {
        this.applyTheme(theme);
        this.update();
    }
}