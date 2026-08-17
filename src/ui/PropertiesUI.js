/**
 * 📐 PropertiesUI - Панель свойств объекта
 *
 */
 import { UI_TEMPLATES, renderTemplate } from '../configs/ui-templates.js';
 import { ICONS } from '../configs/icons.js';
 import { COLORS } from '../configs/colors.js';
 import {
     MoveCommand,
     RotateCommand,
     ScaleCommand,
     ChangeColorCommand,
     ChangeOpacityCommand,
     ChangeNameCommand,
     SegmentsChangeCommand
 } from '../core/CommandManager.js';
 
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
 
         // Name input
         html += renderTemplate(UI_TEMPLATES.properties.nameInput, {
             name: name,
             inputStyle: inputStyle,
             labelStyle: labelStyle,
         });
 
         // Appearance
         html += renderTemplate(UI_TEMPLATES.properties.appearance, {
             surfaceLight: colors.surfaceLight,
             borderColor: colors.input.border,
             textMuted: colors.text.muted,
             labelStyle: labelStyle,
             color: color,
             opacity: opacity,
             opacityPercent: Math.round(opacity * 100),
         });
 
         // Transform inputs
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
 
         // === СЕКЦИЯ: Параметры геометрии ===
         const type = selected.userData.type;
         let geometryHtml = '';
 
         if (type === 'cube' && typeof selected.getSegments === 'function') {
             const segs = selected.getSegments();
             const range = selected.getSegmentsRange();
             geometryHtml += `
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
 
         if (type === 'sphere' && typeof selected.getSegments === 'function') {
             const segs = selected.getSegments();
             const range = selected.getSegmentsRange();
             geometryHtml += `
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
 
         if (type === 'cylinder' && typeof selected.getSegments === 'function') {
             const segs = selected.getSegments();
             const range = selected.getSegmentsRange();
             geometryHtml += `
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
 
         html += geometryHtml;
 
         this.element.innerHTML = html;
 
         // Настраиваем обработчики
         this.setupPropertyHandlers(selected);
         this.setupColorHandlers(selected);
         this.setupOpacityHandlers(selected);
         this.setupGeometryHandlers(selected);
 
         const nameInput = this.element.querySelector('#prop-name');
         if (nameInput) {
             nameInput.addEventListener('change', () => {
                 const oldName = selected.userData.name;
                 selected.userData.name = nameInput.value;
                 this.editor.uiManager.sceneTree.update();
                 if (oldName !== nameInput.value) {
                     const command = new ChangeNameCommand(this.editor, {
                         entityId: selected.userData.id,
                         oldName: oldName,
                         newName: nameInput.value
                     });
                     this.editor.commandManager.execute(command);
                 }
             });
         }
     }
 
     /**
      * Настраивает обработчики для полей трансформации (position, rotation, scale)
      */
     setupPropertyHandlers(entity) {
         this.element.querySelectorAll('.prop-input').forEach(input => {
             const prop = input.dataset.prop;
             const axis = input.dataset.axis;
             let oldValue = null;
             let changeTimer = null;
 
             const getCurrentValue = () => {
                 if (prop === 'position') return entity.position[axis];
                 if (prop === 'rotation') return entity.rotation[axis];
                 if (prop === 'scale') return entity.scale[axis];
                 return null;
             };
 
             const onFocus = () => {
                 oldValue = getCurrentValue();
             };
 
             const onBlur = () => {
                 if (changeTimer) {
                     clearTimeout(changeTimer);
                     changeTimer = null;
                 }
                 const newValue = getCurrentValue();
                 if (oldValue !== null && newValue !== null && Math.abs(newValue - oldValue) > 0.0001) {
                     this.createPropertyCommand(entity, prop, axis, oldValue, newValue);
                 }
                 oldValue = null;
             };
 
             const onInput = () => {
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
                         this.createPropertyCommand(entity, prop, axis, oldValue, newValue);
                         oldValue = newValue;
                     }
                     changeTimer = null;
                 }, 500);
             };
 
             input.addEventListener('focus', onFocus);
             input.addEventListener('input', onInput);
             input.addEventListener('blur', onBlur);
         });
     }
 
     /**
      * Создает команду для изменения свойства
      */
     createPropertyCommand(entity, prop, axis, oldValue, newValue) {
         let command = null;
         const entityId = entity.userData.id;
 
         if (prop === 'position') {
             const pos = entity.position.clone();
             command = new MoveCommand(this.editor, {
                 entityId: entityId,
                 oldPosition: { x: pos.x, y: pos.y, z: pos.z },
                 newPosition: { x: pos.x, y: pos.y, z: pos.z }
             });
         } else if (prop === 'rotation') {
             const rot = entity.rotation.clone();
             command = new RotateCommand(this.editor, {
                 entityId: entityId,
                 oldRotation: { x: rot.x, y: rot.y, z: rot.z },
                 newRotation: { x: rot.x, y: rot.y, z: rot.z }
             });
         } else if (prop === 'scale') {
             const scale = entity.scale.clone();
             command = new ScaleCommand(this.editor, {
                 entityId: entityId,
                 oldScale: { x: scale.x, y: scale.y, z: scale.z },
                 newScale: { x: scale.x, y: scale.y, z: scale.z }
             });
         }
 
         if (command) {
             this.editor.commandManager.execute(command);
             console.log(`📝 Property command: ${prop} changed`);
         }
     }
 
     /**
      * Настраивает обработчик для выбора цвета
      */
     setupColorHandlers(entity) {
         const colorInput = this.element.querySelector('#prop-color');
         if (!colorInput) return;
 
         let oldColor = entity.material?.color?.getHex() || 0;
 
         colorInput.addEventListener('focus', () => {
             oldColor = entity.material?.color?.getHex() || 0;
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
                 const command = new ChangeColorCommand(this.editor, {
                     entityId: entity.userData.id,
                     oldColor: oldColor,
                     newColor: newColor
                 });
                 this.editor.commandManager.execute(command);
                 console.log(`🎨 Color changed: ${oldColor.toString(16)} → ${newColor.toString(16)}`);
             }
         });
     }
 
     /**
      * Настраивает обработчик для прозрачности
      */
     setupOpacityHandlers(entity) {
         const opacityInput = this.element.querySelector('#prop-opacity');
         const opacityValue = this.element.querySelector('#opacity-value');
         if (!opacityInput) return;
 
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
                 const command = new ChangeOpacityCommand(this.editor, {
                     entityId: entity.userData.id,
                     oldOpacity: oldOpacity,
                     newOpacity: newOpacity
                 });
                 this.editor.commandManager.execute(command);
                 console.log(`🔆 Opacity changed: ${oldOpacity} → ${newOpacity}`);
             }
         });
     }
 
     /**
      * Настраивает обработчики для параметров геометрии
      */
     setupGeometryHandlers(entity) {
         const type = entity.userData.type;
 
         if (type === 'cube' && typeof entity.setSegments === 'function') {
             this.setupCubeSegmentsHandler(entity);
         } else if (type === 'sphere' && typeof entity.setSegments === 'function') {
             this.setupSphereSegmentsHandler(entity);
         } else if (type === 'cylinder' && typeof entity.setSegments === 'function') {
             this.setupCylinderSegmentsHandler(entity);
         }
     }
 
     /**
      * Настраивает обработчик для сегментов куба
      */
     setupCubeSegmentsHandler(entity) {
         const input = this.element.querySelector('#prop-segments');
         const valueDisplay = this.element.querySelector('#segments-value');
         if (!input) return;
 
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
                 const command = new SegmentsChangeCommand(this.editor, {
                     entityId: entity.userData.id,
                     oldSegments: oldValue,
                     newSegments: newValue,
                     entityType: 'cube'
                 });
                 this.editor.commandManager.execute(command);
                 console.log(`📝 Cube segments changed: ${oldValue} → ${newValue}`);
             }
         });
     }
 
     /**
      * Настраивает обработчик для сегментов сферы
      */
     setupSphereSegmentsHandler(entity) {
         const widthInput = this.element.querySelector('#prop-width-segments');
         const heightInput = this.element.querySelector('#prop-height-segments');
         const widthDisplay = this.element.querySelector('#width-segments-value');
         const heightDisplay = this.element.querySelector('#height-segments-value');
 
         if (!widthInput || !heightInput) return;
 
         let oldWidth = entity.getSegments().width;
         let oldHeight = entity.getSegments().height;
 
         const handleFocus = () => {
             const segs = entity.getSegments();
             oldWidth = segs.width;
             oldHeight = segs.height;
         };
 
         const handleChange = () => {
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
                 const command = new SegmentsChangeCommand(this.editor, {
                     entityId: entity.userData.id,
                     oldSegments: { width: oldWidth, height: oldHeight },
                     newSegments: { width: segs.width, height: segs.height },
                     entityType: 'sphere'
                 });
                 this.editor.commandManager.execute(command);
                 console.log(`📝 Sphere segments changed: width ${oldWidth}→${segs.width}, height ${oldHeight}→${segs.height}`);
             }
         };
 
         widthInput.addEventListener('focus', handleFocus);
         heightInput.addEventListener('focus', handleFocus);
         widthInput.addEventListener('input', handleChange);
         heightInput.addEventListener('input', handleChange);
         widthInput.addEventListener('blur', handleBlur);
         heightInput.addEventListener('blur', handleBlur);
     }
 
     /**
      * Настраивает обработчик для сегментов цилиндра
      */
     setupCylinderSegmentsHandler(entity) {
         const radialInput = this.element.querySelector('#prop-radial-segments');
         const heightInput = this.element.querySelector('#prop-cylinder-height-segments');
         const radialDisplay = this.element.querySelector('#radial-segments-value');
         const heightDisplay = this.element.querySelector('#cylinder-height-segments-value');
 
         if (!radialInput || !heightInput) return;
 
         let oldRadial = entity.getSegments().radial;
         let oldHeight = entity.getSegments().height;
 
         const handleFocus = () => {
             const segs = entity.getSegments();
             oldRadial = segs.radial;
             oldHeight = segs.height;
         };
 
         const handleChange = () => {
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
                 const command = new SegmentsChangeCommand(this.editor, {
                     entityId: entity.userData.id,
                     oldSegments: { radial: oldRadial, height: oldHeight },
                     newSegments: { radial: segs.radial, height: segs.height },
                     entityType: 'cylinder'
                 });
                 this.editor.commandManager.execute(command);
                 console.log(`📝 Cylinder segments changed: radial ${oldRadial}→${segs.radial}, height ${oldHeight}→${segs.height}`);
             }
         };
 
         radialInput.addEventListener('focus', handleFocus);
         heightInput.addEventListener('focus', handleFocus);
         radialInput.addEventListener('input', handleChange);
         heightInput.addEventListener('input', handleChange);
         radialInput.addEventListener('blur', handleBlur);
         heightInput.addEventListener('blur', handleBlur);
     }
 
     updateTheme(theme) {
         this.applyTheme(theme);
         this.update();
     }
 }