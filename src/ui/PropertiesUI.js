/**
 * 📐 PropertiesUI - Панель свойств объекта
 *
 * 📋 ОПИСАНИЕ:
 * Отображает и позволяет редактировать свойства выбранного объекта.
 * Поддерживает изменение:
 * - Имени
 * - Цвета
 * - Прозрачности
 * - Позиции (X, Y, Z)
 * - Поворота (X, Y, Z в градусах)
 * - Масштаба (X, Y, Z)
 * - Параметров геометрии (сегменты)
 * - Материала и текстуры
 *
 */
 import { UI_TEMPLATES, renderTemplate } from '../configs/ui-templates.js';
 import { ICONS } from '../configs/icons.js';
 import { COLORS } from '../configs/colors.js';
 import { MATERIAL_TYPES } from '../services/MaterialManager.js';
 import * as THREE from 'three';
 
 export class PropertiesUI {
     constructor(editor) {
         this.editor = editor;
         this.element = null;
         this.currentTheme = this.getCurrentTheme();
         this._propertyChangeTimers = {};
         this._isUpdating = false;
         this._selectedEntity = null;
     }
 
     init() {
         this.element = document.createElement('div');
         this.element.id = 'properties';
         this.element.setAttribute('data-panel', 'properties');
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
 
         const style = document.createElement('style');
         style.textContent = `
             #properties::-webkit-scrollbar { width: 3px; }
             #properties::-webkit-scrollbar-track { background: transparent; }
             #properties::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
             #properties::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }
             #properties select {
                 cursor: pointer;
             }
             #properties select:hover {
                 border-color: rgba(74,158,255,0.5);
             }
             #properties select option {
                 background: #1a1a2e;
                 color: #fff;
             }
         `;
         this.element.appendChild(style);
 
         document.body.appendChild(this.element);
         this.applyTheme(this.currentTheme);
         this.update();
 
         this.editor.selectionManager.addListener(() => {
             this.update();
         });
 
         console.log('✅ PropertiesUI v2.1 initialized');
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
         if (!iconPath) return '';
         const isLight = this.currentTheme === 'light';
         const filter = isLight ? 'invert(0.8)' : 'invert(0.5)';
         return `<img src="${iconPath}" style="width:${size}px; height:${size}px; filter: ${filter}; vertical-align: middle;" onerror="this.style.display='none'">`;
     }
 
     update() {
         if (this._isUpdating) return;
         this._isUpdating = true;
 
         try {
             if (!this.element) return;
 
             const selected = this.editor.selectionManager.getSelected();
             this._selectedEntity = selected;
 
             if (!selected) {
                 this._renderEmpty();
                 return;
             }
 
             this._renderProperties(selected);
             this._setupEventListeners(selected);
 
         } catch (error) {
             console.error('❌ Error updating PropertiesUI:', error);
         } finally {
             this._isUpdating = false;
         }
     }
 
     _renderEmpty() {
         const colors = this.currentTheme === 'light' ? COLORS.light : COLORS.dark;
         const html = `
             <div style="color: ${colors.text.muted}; font-size: 11px; text-align: center; padding: 15px 0;">
                 No object selected
             </div>
         `;
         this.element.innerHTML = html;
     }
 
     _renderProperties(entity) {
         const colors = this.currentTheme === 'light' ? COLORS.light : COLORS.dark;
         const pos = entity.position;
         const rot = entity.rotation;
         const scale = entity.scale;
         const name = entity.userData.name || entity.userData.type;
 
         let color = '#4a9eff';
         let opacity = 1;
         if (entity.material) {
             if (entity.material.color) {
                 color = '#' + entity.material.color.getHexString();
             }
             opacity = entity.material.opacity || 1;
         }
 
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
             outline: none;
         `;
 
         const labelStyle = `
             color:${colors.input.label};
             font-size:9px;
             display:block;
             margin-bottom:2px;
             text-transform:uppercase;
             letter-spacing:0.5px;
         `;
 
         let html = `
             <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                 <span style="color: ${colors.input.label}; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                     ${this.createIconHTML(ICONS.cube, 14)} Properties
                 </span>
                 <button onclick="window.editor.deleteSelected()"
                         style="background: transparent; border: none; color: ${colors.input.label}; cursor: pointer; padding: 2px; transition: all 0.2s; display: flex; align-items: center;"
                         onmouseenter="this.style.color='#ff6b6b'"
                         onmouseleave="this.style.color='${colors.input.label}'"
                         title="Delete selected">
                     ${this.createIconHTML(ICONS.delete, 16)}
                 </button>
             </div>
         `;
 
         // Name input
         html += `
             <div style="margin-bottom: 5px;">
                 <label style="${labelStyle}">Name</label>
                 <input type="text" id="prop-name" value="${name}"
                        style="${inputStyle}">
             </div>
         `;
 
         // Appearance
         html += `
             <div style="margin-bottom: 5px; padding: 6px 8px; background: ${colors.surfaceLight}; border-radius: 4px;">
                 <label style="${labelStyle}">🎨 Appearance</label>
                 <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                     <div>
                         <label style="color: ${colors.text.muted}; font-size: 7px; display: block; margin-bottom: 1px;">Color</label>
                         <input type="color" id="prop-color" value="${color}"
                                style="width: 100%; padding: 1px; background: transparent;
                                       border: 1px solid ${colors.input.border}; border-radius: 2px;
                                       cursor: pointer; height: 24px;">
                     </div>
                     <div>
                         <label style="color: ${colors.text.muted}; font-size: 7px; display: block; margin-bottom: 1px;">Opacity</label>
                         <input type="range" id="prop-opacity" min="0" max="1" step="0.05" value="${opacity}"
                                style="width: 100%; margin: 0; height: 4px; background: ${colors.input.border};
                                       border-radius: 2px; -webkit-appearance: none; appearance: none;
                                       cursor: pointer;">
                         <div style="display: flex; justify-content: space-between; font-size: 7px; color: ${colors.text.muted};">
                             <span>0%</span>
                             <span id="opacity-value">${Math.round(opacity * 100)}%</span>
                             <span>100%</span>
                         </div>
                     </div>
                 </div>
             </div>
         `;
 
         // Material section
         html += this._renderMaterialSection(entity, colors, labelStyle);
 
         // Transform: Position
         html += this._renderTransformInput('position', 'Position', pos, 0.1, colors, labelStyle, inputStyle);
 
         // Transform: Rotation (в градусах)
         const rotDeg = {
             x: rot.x * 180 / Math.PI,
             y: rot.y * 180 / Math.PI,
             z: rot.z * 180 / Math.PI
         };
         html += this._renderTransformInput('rotation', 'Rotation', rotDeg, 1, colors, labelStyle, inputStyle);
 
         // Transform: Scale
         html += this._renderTransformInput('scale', 'Scale', scale, 0.1, colors, labelStyle, inputStyle);
 
         // Geometry parameters
         html += this._renderGeometryParams(entity, colors, labelStyle);
 
         this.element.innerHTML = html;
     }
 
     _renderMaterialSection(entity, colors, labelStyle) {
         const materialManager = this.editor.materialManager;
         if (!materialManager) return '';
 
         const currentType = entity.userData.materialType || MATERIAL_TYPES.STANDARD;
         const currentTexture = entity.userData.texture || null;
 
         const materialTypes = [
             MATERIAL_TYPES.STANDARD,
             MATERIAL_TYPES.BASIC,
             MATERIAL_TYPES.PHONG,
             MATERIAL_TYPES.LAMBERT,
             MATERIAL_TYPES.TOON,
             MATERIAL_TYPES.WIREFRAME
         ];
 
         const textures = materialManager.getAvailableTextures() || [];
 
         let html = `
             <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid ${colors.border};">
                 <label style="${labelStyle}">🎨 Material Type</label>
                 <select id="prop-material-type" style="width:100%; padding:4px 6px;
                         background:${colors.input.background}; border:1px solid ${colors.input.border};
                         border-radius:3px; color:${colors.input.color}; font-size:11px;
                         margin-bottom:6px; cursor:pointer;">
         `;
 
         materialTypes.forEach(type => {
             const label = materialManager.getMaterialTypeLabel(type) || type;
             const selected = type === currentType ? 'selected' : '';
             html += `<option value="${type}" ${selected}>${label}</option>`;
         });
 
         html += `</select>`;
 
         // Texture select
         html += `
             <label style="${labelStyle}">🖼️ Texture</label>
             <select id="prop-texture" style="width:100%; padding:4px 6px;
                     background:${colors.input.background}; border:1px solid ${colors.input.border};
                     border-radius:3px; color:${colors.input.color}; font-size:11px;
                     cursor:pointer;">
                 <option value="none" ${!currentTexture ? 'selected' : ''}>None</option>
         `;
 
         textures.forEach(name => {
             const selected = name === currentTexture ? 'selected' : '';
             const displayName = name.charAt(0).toUpperCase() + name.slice(1);
             html += `<option value="${name}" ${selected}>${displayName}</option>`;
         });
 
         html += `</select>`;
 
         // Show current texture preview if exists
         if (currentTexture) {
             const tex = materialManager.getTexture(currentTexture);
             if (tex) {
                 html += `
                     <div style="margin-top: 4px; padding: 4px; background: ${colors.surfaceLight}; border-radius: 3px; text-align: center;">
                         <span style="color: ${colors.text.muted}; font-size: 8px;">✓ ${currentTexture}</span>
                     </div>
                 `;
             }
         }
 
         html += `</div>`;
 
         return html;
     }
 
     _renderTransformInput(prop, label, values, step, colors, labelStyle, inputStyle) {
         const axes = ['x', 'y', 'z'];
         const inputs = axes.map(axis => {
             const val = values[axis] !== undefined ? values[axis] : 0;
             const formattedVal = typeof val === 'number' ? val.toFixed(step < 1 ? 2 : 0) : val;
             const minAttr = prop === 'scale' ? 'min="0.01"' : '';
             return `
                 <input class="prop-input" data-prop="${prop}" data-axis="${axis}"
                        type="number" value="${formattedVal}" step="${step}" ${minAttr}
                        style="${inputStyle}">
             `;
         }).join('');
 
         return `
             <div style="margin-bottom: 4px;">
                 <label style="${labelStyle}">${label}</label>
                 <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2px;">
                     ${inputs}
                 </div>
             </div>
         `;
     }
 
     _renderGeometryParams(entity, colors, labelStyle) {
         const type = entity.userData.type;
         let html = '';
 
         if (type === 'cube' && typeof entity.getSegments === 'function') {
             const segs = entity.getSegments();
             const range = entity.getSegmentsRange();
             html += `
                 <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid ${colors.border};">
                     <label style="${labelStyle}">🔲 Geometry</label>
                     <div style="margin-bottom: 4px;">
                         <label style="color:${colors.text.muted}; font-size:8px;">Segments</label>
                         <input type="range" id="prop-segments"
                                min="${range.min}" max="${range.max}" step="1" value="${segs}"
                                style="width:100%; margin:2px 0; height:3px;
                                       background:${colors.input.border}; border-radius:2px;
                                       -webkit-appearance:none; appearance:none; cursor:pointer;">
                         <div style="display:flex; justify-content:space-between; font-size:7px; color:${colors.text.muted};">
                             <span>Low (${range.min})</span>
                             <span id="segments-value" style="color:${colors.text.primary};">${segs}</span>
                             <span>High (${range.max})</span>
                         </div>
                     </div>
                 </div>
             `;
         }
 
         if (type === 'sphere' && typeof entity.getSegments === 'function') {
             const segs = entity.getSegments();
             const range = entity.getSegmentsRange();
             html += `
                 <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid ${colors.border};">
                     <label style="${labelStyle}">⚪ Smoothness</label>
                     <div style="margin-bottom: 4px;">
                         <label style="color:${colors.text.muted}; font-size:8px;">Horizontal</label>
                         <input type="range" id="prop-width-segments"
                                min="${range.min}" max="${range.max}" step="1" value="${segs.width}"
                                style="width:100%; margin:2px 0; height:3px;
                                       background:${colors.input.border}; border-radius:2px;
                                       -webkit-appearance:none; appearance:none; cursor:pointer;">
                         <div style="display:flex; justify-content:space-between; font-size:7px; color:${colors.text.muted};">
                             <span>Low</span>
                             <span id="width-segments-value" style="color:${colors.text.primary};">${segs.width}</span>
                             <span>High</span>
                         </div>
                     </div>
                     <div>
                         <label style="color:${colors.text.muted}; font-size:8px;">Vertical</label>
                         <input type="range" id="prop-height-segments"
                                min="${range.min}" max="${range.max}" step="1" value="${segs.height}"
                                style="width:100%; margin:2px 0; height:3px;
                                       background:${colors.input.border}; border-radius:2px;
                                       -webkit-appearance:none; appearance:none; cursor:pointer;">
                         <div style="display:flex; justify-content:space-between; font-size:7px; color:${colors.text.muted};">
                             <span>Low</span>
                             <span id="height-segments-value" style="color:${colors.text.primary};">${segs.height}</span>
                             <span>High</span>
                         </div>
                     </div>
                 </div>
             `;
         }
 
         if (type === 'cylinder' && typeof entity.getSegments === 'function') {
             const segs = entity.getSegments();
             const range = entity.getSegmentsRange();
             html += `
                 <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid ${colors.border};">
                     <label style="${labelStyle}">🔄 Smoothness</label>
                     <div style="margin-bottom: 4px;">
                         <label style="color:${colors.text.muted}; font-size:8px;">Radial</label>
                         <input type="range" id="prop-radial-segments"
                                min="${range.radial.min}" max="${range.radial.max}" step="1" value="${segs.radial}"
                                style="width:100%; margin:2px 0; height:3px;
                                       background:${colors.input.border}; border-radius:2px;
                                       -webkit-appearance:none; appearance:none; cursor:pointer;">
                         <div style="display:flex; justify-content:space-between; font-size:7px; color:${colors.text.muted};">
                             <span>Low</span>
                             <span id="radial-segments-value" style="color:${colors.text.primary};">${segs.radial}</span>
                             <span>High</span>
                         </div>
                     </div>
                     <div>
                         <label style="color:${colors.text.muted}; font-size:8px;">Height</label>
                         <input type="range" id="prop-cylinder-height-segments"
                                min="${range.height.min}" max="${range.height.max}" step="1" value="${segs.height}"
                                style="width:100%; margin:2px 0; height:3px;
                                       background:${colors.input.border}; border-radius:2px;
                                       -webkit-appearance:none; appearance:none; cursor:pointer;">
                         <div style="display:flex; justify-content:space-between; font-size:7px; color:${colors.text.muted};">
                             <span>Low</span>
                             <span id="cylinder-height-segments-value" style="color:${colors.text.primary};">${segs.height}</span>
                             <span>High</span>
                         </div>
                     </div>
                 </div>
             `;
         }
 
         return html;
     }
 
     _setupEventListeners(entity) {
         // Name input
         const nameInput = this.element.querySelector('#prop-name');
         if (nameInput) {
             nameInput.addEventListener('change', () => {
                 const oldName = entity.userData.name;
                 const newName = nameInput.value.trim() || entity.userData.type;
                 if (oldName !== newName) {
                     entity.userData.name = newName;
                     this.editor.commandManager.push('changeName');
                     this.editor.uiManager.sceneTree.update();
                     console.log(`📝 Name changed: ${oldName} → ${newName}`);
                 }
             });
         }
 
         // Color input
         const colorInput = this.element.querySelector('#prop-color');
         if (colorInput) {
             let oldColor = entity.material?.color?.getHex() || 0;
 
             colorInput.addEventListener('focus', () => {
                 oldColor = entity.material?.color?.getHex() || 0;
             });
 
             colorInput.addEventListener('input', () => {
                 const hex = colorInput.value;
                 if (entity.material && entity.material.color) {
                     entity.material.color.set(hex);
                     entity.material.needsUpdate = true;
                     if (entity._originalColor) {
                         entity._originalColor.setHex(parseInt(hex.replace('#', ''), 16));
                     }
                 }
             });
 
             colorInput.addEventListener('blur', () => {
                 const newColor = entity.material?.color?.getHex() || 0;
                 if (oldColor !== newColor) {
                     this.editor.commandManager.push('changeColor');
                     console.log(`🎨 Color changed: ${oldColor.toString(16)} → ${newColor.toString(16)}`);
                 }
             });
         }
 
         // Opacity input
         const opacityInput = this.element.querySelector('#prop-opacity');
         const opacityValue = this.element.querySelector('#opacity-value');
         if (opacityInput) {
             let oldOpacity = entity.material?.opacity || 1;
 
             opacityInput.addEventListener('focus', () => {
                 oldOpacity = entity.material?.opacity || 1;
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
                     this.editor.commandManager.push('changeOpacity');
                     console.log(`🔆 Opacity changed: ${oldOpacity} → ${newOpacity}`);
                 }
             });
         }
 
         // Material type select
         const materialSelect = this.element.querySelector('#prop-material-type');
         if (materialSelect) {
             materialSelect.addEventListener('change', () => {
                 const type = materialSelect.value;
                 const entity = this._selectedEntity;
                 if (entity && this.editor.materialManager) {
                     const textureSelect = this.element.querySelector('#prop-texture');
                     const texture = textureSelect && textureSelect.value !== 'none' ? textureSelect.value : null;
                     this.editor.materialManager.applyMaterial(entity, type, { texture });
                     this.editor.commandManager.push('changeMaterial');
                     this.editor.uiManager.updateUI();
                     console.log(`🎨 Material changed: ${type}, texture: ${texture || 'none'}`);
                 }
             });
         }
 
         // Texture select
         const textureSelect = this.element.querySelector('#prop-texture');
         if (textureSelect) {
             textureSelect.addEventListener('change', () => {
                 const entity = this._selectedEntity;
                 if (entity && this.editor.materialManager) {
                     const type = entity.userData.materialType || MATERIAL_TYPES.STANDARD;
                     const texture = textureSelect.value !== 'none' ? textureSelect.value : null;
                     this.editor.materialManager.applyMaterial(entity, type, { texture });
                     this.editor.commandManager.push('changeMaterial');
                     this.editor.uiManager.updateUI();
                     console.log(`🖼️ Texture changed: ${texture || 'none'}`);
                 }
             });
         }
 
         // Transform inputs (position, rotation, scale)
         this.element.querySelectorAll('.prop-input').forEach(input => {
             const prop = input.dataset.prop;
             const axis = input.dataset.axis;
             let oldValue = null;
             let changeTimer = null;
 
             const getCurrentValue = () => {
                 if (prop === 'position') return entity.position[axis];
                 if (prop === 'rotation') return entity.rotation[axis] * 180 / Math.PI;
                 if (prop === 'scale') return entity.scale[axis];
                 return null;
             };
 
             input.addEventListener('focus', () => {
                 oldValue = getCurrentValue();
             });
 
             input.addEventListener('input', () => {
                 const value = parseFloat(input.value);
                 if (isNaN(value)) return;
 
                 if (prop === 'position') {
                     entity.position[axis] = value;
                 } else if (prop === 'rotation') {
                     entity.rotation[axis] = value * Math.PI / 180;
                 } else if (prop === 'scale') {
                     entity.scale[axis] = Math.max(0.01, value);
                 }
 
                 if (changeTimer) clearTimeout(changeTimer);
                 changeTimer = setTimeout(() => {
                     const newValue = getCurrentValue();
                     if (oldValue !== null && newValue !== null && Math.abs(newValue - oldValue) > 0.0001) {
                         this.editor.commandManager.push(`${prop}Change`);
                         oldValue = newValue;
                         console.log(`📝 ${prop} changed for entity ${entity.userData.id}`);
                     }
                     changeTimer = null;
                 }, 500);
             });
 
             input.addEventListener('blur', () => {
                 if (changeTimer) {
                     clearTimeout(changeTimer);
                     changeTimer = null;
                 }
                 const newValue = getCurrentValue();
                 if (oldValue !== null && newValue !== null && Math.abs(newValue - oldValue) > 0.0001) {
                     this.editor.commandManager.push(`${prop}Change`);
                     console.log(`📝 ${prop} changed for entity ${entity.userData.id}`);
                 }
                 oldValue = null;
             });
         });
 
         // Geometry inputs
         this._setupGeometryListeners(entity);
     }
 
     _setupGeometryListeners(entity) {
         const type = entity.userData.type;
 
         if (type === 'cube' && typeof entity.setSegments === 'function') {
             const input = this.element.querySelector('#prop-segments');
             const valueDisplay = this.element.querySelector('#segments-value');
             if (input) {
                 let oldValue = entity.getSegments();
 
                 input.addEventListener('focus', () => {
                     oldValue = entity.getSegments();
                 });
 
                 input.addEventListener('input', () => {
                     const value = parseInt(input.value);
                     entity.setSegments(value);
                     if (valueDisplay) valueDisplay.textContent = value;
                     this.editor.uiManager.updateUI();
                 });
 
                 input.addEventListener('blur', () => {
                     const newValue = entity.getSegments();
                     if (oldValue !== newValue) {
                         this.editor.commandManager.push('segmentsChange');
                         console.log(`📝 Cube segments changed: ${oldValue} → ${newValue}`);
                     }
                 });
             }
         }
 
         if (type === 'sphere' && typeof entity.setSegments === 'function') {
             const widthInput = this.element.querySelector('#prop-width-segments');
             const heightInput = this.element.querySelector('#prop-height-segments');
             const widthDisplay = this.element.querySelector('#width-segments-value');
             const heightDisplay = this.element.querySelector('#height-segments-value');
 
             if (widthInput && heightInput) {
                 let oldWidth = entity.getSegments().width;
                 let oldHeight = entity.getSegments().height;
 
                 const handleFocus = () => {
                     const segs = entity.getSegments();
                     oldWidth = segs.width;
                     oldHeight = segs.height;
                 };
 
                 const handleInput = () => {
                     const w = parseInt(widthInput.value);
                     const h = parseInt(heightInput.value);
                     entity.setSegments(w, h);
                     if (widthDisplay) widthDisplay.textContent = w;
                     if (heightDisplay) heightDisplay.textContent = h;
                     this.editor.uiManager.updateUI();
                 };
 
                 const handleBlur = () => {
                     const segs = entity.getSegments();
                     if (oldWidth !== segs.width || oldHeight !== segs.height) {
                         this.editor.commandManager.push('segmentsChange');
                         console.log(`📝 Sphere segments changed: width ${oldWidth}→${segs.width}, height ${oldHeight}→${segs.height}`);
                     }
                 };
 
                 widthInput.addEventListener('focus', handleFocus);
                 heightInput.addEventListener('focus', handleFocus);
                 widthInput.addEventListener('input', handleInput);
                 heightInput.addEventListener('input', handleInput);
                 widthInput.addEventListener('blur', handleBlur);
                 heightInput.addEventListener('blur', handleBlur);
             }
         }
 
         if (type === 'cylinder' && typeof entity.setSegments === 'function') {
             const radialInput = this.element.querySelector('#prop-radial-segments');
             const heightInput = this.element.querySelector('#prop-cylinder-height-segments');
             const radialDisplay = this.element.querySelector('#radial-segments-value');
             const heightDisplay = this.element.querySelector('#cylinder-height-segments-value');
 
             if (radialInput && heightInput) {
                 let oldRadial = entity.getSegments().radial;
                 let oldHeight = entity.getSegments().height;
 
                 const handleFocus = () => {
                     const segs = entity.getSegments();
                     oldRadial = segs.radial;
                     oldHeight = segs.height;
                 };
 
                 const handleInput = () => {
                     const r = parseInt(radialInput.value);
                     const h = parseInt(heightInput.value);
                     entity.setSegments(r, h);
                     if (radialDisplay) radialDisplay.textContent = r;
                     if (heightDisplay) heightDisplay.textContent = h;
                     this.editor.uiManager.updateUI();
                 };
 
                 const handleBlur = () => {
                     const segs = entity.getSegments();
                     if (oldRadial !== segs.radial || oldHeight !== segs.height) {
                         this.editor.commandManager.push('segmentsChange');
                         console.log(`📝 Cylinder segments changed: radial ${oldRadial}→${segs.radial}, height ${oldHeight}→${segs.height}`);
                     }
                 };
 
                 radialInput.addEventListener('focus', handleFocus);
                 heightInput.addEventListener('focus', handleFocus);
                 radialInput.addEventListener('input', handleInput);
                 heightInput.addEventListener('input', handleInput);
                 radialInput.addEventListener('blur', handleBlur);
                 heightInput.addEventListener('blur', handleBlur);
             }
         }
     }
 
     updateTheme(theme) {
         this.applyTheme(theme);
         this.update();
     }
 }