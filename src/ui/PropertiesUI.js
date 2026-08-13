/**
 * 📐 PropertiesUI - Панель свойств объекта
 *
 * @version 1.1.0
 * @author Gabryelf
 * @since 0.1.0
 */
 import { UI_TEMPLATES, renderTemplate } from '../configs/ui-templates.js';
 import { ICONS } from '../configs/icons.js';
 import { COLORS } from '../configs/colors.js';
 
 export class PropertiesUI {
     constructor(editor) {
         this.editor = editor;
         this.element = null;
         this.currentTheme = this.getCurrentTheme();
         this._propertyChangeTimers = {};
     }
 
     init() {
         this.element = document.createElement('div');
         this.element.id = 'properties';
         this.element.style.cssText = `
             position: fixed;
             top: 12px;
             right: 12px;
             z-index: 1000;
             background: rgba(16, 16, 32, 0.95);
             backdrop-filter: blur(10px);
             padding: 14px 16px;
             border-radius: 10px;
             border: 1px solid rgba(255,255,255,0.08);
             min-width: 240px;
             max-width: 280px;
             width: 260px;
             min-height: 320px;
             max-height: calc(100vh - 120px);
             overflow-y: auto;
             overflow-x: hidden;
             transition: all 0.3s ease;
             box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
         `;
         this.element.setAttribute('data-panel', 'properties');
 
         const style = document.createElement('style');
         style.textContent = `
             #properties::-webkit-scrollbar { width: 3px; }
             #properties::-webkit-scrollbar-track { background: transparent; }
             #properties::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
             #properties::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }
         `;
         this.element.appendChild(style);
 
         document.body.appendChild(this.element);
         this.applyTheme(this.currentTheme);
         this.update();
 
         console.log('✅ PropertiesUI initialized');
     }
 
     getCurrentTheme() {
         return localStorage.getItem('editor_theme') || 'dark';
     }
 
     applyTheme(theme) {
         this.currentTheme = theme;
         const colors = theme === 'light' ? COLORS.light : COLORS.dark;
         if (this.element) {
             this.element.style.background = colors.surface;
             this.element.style.borderColor = colors.border;
             this.element.style.color = colors.text.primary;
         }
     }
 
     createIconHTML(iconPath, size = 14) {
         const isLight = this.currentTheme === 'light';
         const filter = isLight ? 'invert(0.8)' : 'invert(0.5)';
         return `<img src="${iconPath}" style="width:${size}px; height:${size}px; filter: ${filter}; vertical-align: middle;" onerror="this.style.display='none'">`;
     }
 
     update() {
         if (!this.element) return;
 
         const selected = this.editor.selectionManager.getSelected();
         const colors = this.currentTheme === 'light' ? COLORS.light : COLORS.dark;
 
         const inputStyle = `
             width:100%;
             padding:3px 6px;
             background:${colors.input.background};
             border:1px solid ${colors.input.border};
             border-radius:3px;
             color:${colors.input.color};
             font-size:11px;
             box-sizing:border-box;
             transition: all 0.3s ease;
         `;
 
         const labelStyle = `
             color:${colors.input.label};
             font-size:9px;
             display:block;
             margin-bottom:2px;
             text-transform:uppercase;
             letter-spacing:0.5px;
         `;
 
         let html = renderTemplate(UI_TEMPLATES.properties.header, {
             icon: this.createIconHTML(ICONS.cube, 14),
             deleteIcon: this.createIconHTML(ICONS.delete, 16),
             labelColor: colors.input.label,
         });
 
         if (!selected) {
             html += renderTemplate(UI_TEMPLATES.properties.empty, {
                 textMuted: colors.text.muted,
             });
             this.element.innerHTML = html;
             return;
         }
 
         const pos = selected.position;
         const rot = selected.rotation;
         const scale = selected.scale;
         const name = selected.userData.name || selected.userData.type;
 
         let color = '#4a9eff';
         let opacity = 1;
         if (selected.material) {
             if (selected.material.color) {
                 color = '#' + selected.material.color.getHexString();
             }
             opacity = selected.material.opacity || 1;
         }
 
         html += renderTemplate(UI_TEMPLATES.properties.nameInput, {
             name: name,
             inputStyle: inputStyle,
             labelStyle: labelStyle,
         });
 
         html += renderTemplate(UI_TEMPLATES.properties.appearance, {
             surfaceLight: colors.surfaceLight,
             borderColor: colors.input.border,
             textMuted: colors.text.muted,
             labelStyle: labelStyle,
             color: color,
             opacity: opacity,
             opacityPercent: Math.round(opacity * 100),
         });
 
         const renderTransform = (prop, values, step, extra = '') => {
             const inputs = ['x', 'y', 'z'].map(axis => {
                 const val = values[axis] !== undefined ? values[axis] : 0;
                 const formattedVal = typeof val === 'number' ? val.toFixed(step < 1 ? 2 : 0) : val;
                 return renderTemplate(UI_TEMPLATES.properties.input.single, {
                     prop: prop,
                     axis: axis,
                     value: formattedVal,
                     step: step,
                     extra: extra,
                     inputStyle: inputStyle,
                 });
             }).join('');
             return renderTemplate(UI_TEMPLATES.properties.transform[prop], {
                 labelStyle: labelStyle,
                 inputs: inputs,
             });
         };
 
         html += renderTransform('position', { x: pos.x, y: pos.y, z: pos.z }, 0.1);
         html += renderTransform('rotation', { x: rot.x * 180 / Math.PI, y: rot.y * 180 / Math.PI, z: rot.z * 180 / Math.PI }, 1);
         html += renderTransform('scale', { x: scale.x, y: scale.y, z: scale.z }, 0.1, 'min="0.01"');
 
         this.element.innerHTML = html;
 
         this.setupPropertyHandlers(selected);
         this.setupColorHandlers(selected);
         this.setupOpacityHandlers(selected);
 
         const nameInput = this.element.querySelector('#prop-name');
         if (nameInput) {
             nameInput.addEventListener('change', () => {
                 const oldName = selected.userData.name;
                 selected.userData.name = nameInput.value;
                 this.editor.uiManager.sceneTree.update();
                 if (oldName !== nameInput.value) {
                     this.editor.historyManager.push('changeName');
                 }
             });
         }
     }
 
     setupPropertyHandlers(entity) {
         this.element.querySelectorAll('.prop-input').forEach(input => {
             const prop = input.dataset.prop;
             const axis = input.dataset.axis;
             let changeTimer = null;
             let oldValue = null;
 
             const getCurrentValue = () => {
                 if (prop === 'position') return entity.position[axis];
                 if (prop === 'rotation') return entity.rotation[axis];
                 if (prop === 'scale') return entity.scale[axis];
                 return null;
             };
 
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
 
                 // 🔥 Записываем в историю с дебаунсом
                 if (changeTimer) clearTimeout(changeTimer);
                 changeTimer = setTimeout(() => {
                     const newValue = getCurrentValue();
                     if (oldValue !== null && Math.abs(newValue - oldValue) > 0.0001) {
                         this.editor.historyManager.push(`propertyChange_${prop}`);
                         oldValue = newValue;
                     }
                     changeTimer = null;
                 }, 300);
             };
 
             const onFocus = () => {
                 oldValue = getCurrentValue();
                 this.editor.historyManager.captureState(`before_${prop}_${axis}`);
             };
 
             const onBlur = () => {
                 if (changeTimer) {
                     clearTimeout(changeTimer);
                     changeTimer = null;
                 }
                 const newValue = getCurrentValue();
                 if (oldValue !== null && Math.abs(newValue - oldValue) > 0.0001) {
                     this.editor.historyManager.push(`propertyChange_${prop}`);
                 }
                 oldValue = null;
             };
 
             input.addEventListener('focus', onFocus);
             input.addEventListener('change', update);
             input.addEventListener('input', update);
             input.addEventListener('blur', onBlur);
         });
     }
 
     setupColorHandlers(entity) {
         const colorInput = this.element.querySelector('#prop-color');
         if (!colorInput) return;
 
         let oldColor = entity.material?.color?.getHex() || 0;
 
         colorInput.addEventListener('focus', () => {
             oldColor = entity.material?.color?.getHex() || 0;
             this.editor.historyManager.captureState('before_colorChange');
         });
 
         colorInput.addEventListener('input', () => {
             const hex = colorInput.value;
             if (entity.material && entity.material.color) {
                 entity.material.color.set(hex);
                 entity.material.needsUpdate = true;
                 entity._originalColor = entity.material.color.clone();
             }
         });
 
         colorInput.addEventListener('blur', () => {
             const newColor = entity.material?.color?.getHex() || 0;
             if (oldColor !== newColor) {
                 this.editor.historyManager.push('colorChange');
             }
         });
     }
 
     setupOpacityHandlers(entity) {
         const opacityInput = this.element.querySelector('#prop-opacity');
         const opacityValue = this.element.querySelector('#opacity-value');
         if (!opacityInput) return;
 
         let oldOpacity = entity.material?.opacity || 1;
 
         opacityInput.addEventListener('focus', () => {
             oldOpacity = entity.material?.opacity || 1;
             this.editor.historyManager.captureState('before_opacityChange');
         });
 
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
 
         opacityInput.addEventListener('blur', () => {
             const newOpacity = entity.material?.opacity || 1;
             if (Math.abs(oldOpacity - newOpacity) > 0.001) {
                 this.editor.historyManager.push('opacityChange');
             }
         });
     }
 
     updateTheme(theme) {
         this.applyTheme(theme);
         this.update();
     }
 }