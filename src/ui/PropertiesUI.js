import { TEMPLATES, createElement, applyStyles } from '../configs/templates.js';
import { ICONS } from '../configs/icons.js';

export class PropertiesUI {
    constructor(editor) {
        this.editor = editor;
        this.element = null;
    }
    
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
            `,
            attributes: { 'data-panel': 'properties' },
        });
        
        document.body.appendChild(this.element);
        this.update();
        console.log('✅ PropertiesUI initialized');
    }
    
    createIconHTML(iconPath, size = 14) {
        return `<img src="${iconPath}" style="width:${size}px; height:${size}px; filter: invert(0.5); vertical-align: middle;" onerror="this.style.display='none'">`;
    }
    
    update() {
        if (!this.element) return;
        
        const selected = this.editor.selectionManager.getSelected();
        
        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span style="color:#666; font-size:9px; text-transform:uppercase; letter-spacing:1px; font-weight:600;">
                    ${this.createIconHTML(ICONS.cube, 12)} Properties
                </span>
                <button onclick="window.editor.deleteSelected()" 
                        style="background:transparent; border:none; color:#888; cursor:pointer; padding:2px; transition:all 0.2s; display:flex; align-items:center;"
                        onmouseenter="this.style.color='#ff6b6b'"
                        onmouseleave="this.style.color='#888'"
                        title="Delete selected">
                    ${this.createIconHTML(ICONS.delete, 14)}
                </button>
            </div>
        `;
        
        if (!selected) {
            html += `
                <div style="color:#444; font-size:11px; text-align:center; padding:15px 0;">
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
        
        html += `
            <div style="margin-bottom:5px;">
                <label style="color:#666; font-size:8px; display:block; margin-bottom:1px; text-transform:uppercase; letter-spacing:0.5px;">Name</label>
                <input type="text" id="prop-name" value="${name}" 
                       style="width:100%; padding:2px 5px; background:rgba(255,255,255,0.05);
                              border:1px solid rgba(255,255,255,0.08); border-radius:2px; 
                              color:#fff; font-size:10px; box-sizing:border-box;">
            </div>
            
            <div style="margin-bottom:4px;">
                <label style="color:#666; font-size:8px; display:block; margin-bottom:1px; text-transform:uppercase; letter-spacing:0.5px;">Position</label>
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:2px;">
                    <input class="prop-input" data-prop="position" data-axis="x" type="number" value="${pos.x.toFixed(2)}" step="0.1" 
                           style="width:100%; padding:1px 3px; background:rgba(255,255,255,0.05);
                                  border:1px solid rgba(255,255,255,0.08); border-radius:2px; 
                                  color:#fff; font-size:9px; box-sizing:border-box;">
                    <input class="prop-input" data-prop="position" data-axis="y" type="number" value="${pos.y.toFixed(2)}" step="0.1" 
                           style="width:100%; padding:1px 3px; background:rgba(255,255,255,0.05);
                                  border:1px solid rgba(255,255,255,0.08); border-radius:2px; 
                                  color:#fff; font-size:9px; box-sizing:border-box;">
                    <input class="prop-input" data-prop="position" data-axis="z" type="number" value="${pos.z.toFixed(2)}" step="0.1" 
                           style="width:100%; padding:1px 3px; background:rgba(255,255,255,0.05);
                                  border:1px solid rgba(255,255,255,0.08); border-radius:2px; 
                                  color:#fff; font-size:9px; box-sizing:border-box;">
                </div>
            </div>
            
            <div style="margin-bottom:4px;">
                <label style="color:#666; font-size:8px; display:block; margin-bottom:1px; text-transform:uppercase; letter-spacing:0.5px;">Rotation</label>
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:2px;">
                    <input class="prop-input" data-prop="rotation" data-axis="x" type="number" value="${(rot.x * 180 / Math.PI).toFixed(0)}" step="1" 
                           style="width:100%; padding:1px 3px; background:rgba(255,255,255,0.05);
                                  border:1px solid rgba(255,255,255,0.08); border-radius:2px; 
                                  color:#fff; font-size:9px; box-sizing:border-box;">
                    <input class="prop-input" data-prop="rotation" data-axis="y" type="number" value="${(rot.y * 180 / Math.PI).toFixed(0)}" step="1" 
                           style="width:100%; padding:1px 3px; background:rgba(255,255,255,0.05);
                                  border:1px solid rgba(255,255,255,0.08); border-radius:2px; 
                                  color:#fff; font-size:9px; box-sizing:border-box;">
                    <input class="prop-input" data-prop="rotation" data-axis="z" type="number" value="${(rot.z * 180 / Math.PI).toFixed(0)}" step="1" 
                           style="width:100%; padding:1px 3px; background:rgba(255,255,255,0.05);
                                  border:1px solid rgba(255,255,255,0.08); border-radius:2px; 
                                  color:#fff; font-size:9px; box-sizing:border-box;">
                </div>
            </div>
            
            <div style="margin-bottom:5px;">
                <label style="color:#666; font-size:8px; display:block; margin-bottom:1px; text-transform:uppercase; letter-spacing:0.5px;">Scale</label>
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:2px;">
                    <input class="prop-input" data-prop="scale" data-axis="x" type="number" value="${scale.x.toFixed(2)}" step="0.1" min="0.01" 
                           style="width:100%; padding:1px 3px; background:rgba(255,255,255,0.05);
                                  border:1px solid rgba(255,255,255,0.08); border-radius:2px; 
                                  color:#fff; font-size:9px; box-sizing:border-box;">
                    <input class="prop-input" data-prop="scale" data-axis="y" type="number" value="${scale.y.toFixed(2)}" step="0.1" min="0.01" 
                           style="width:100%; padding:1px 3px; background:rgba(255,255,255,0.05);
                                  border:1px solid rgba(255,255,255,0.08); border-radius:2px; 
                                  color:#fff; font-size:9px; box-sizing:border-box;">
                    <input class="prop-input" data-prop="scale" data-axis="z" type="number" value="${scale.z.toFixed(2)}" step="0.1" min="0.01" 
                           style="width:100%; padding:1px 3px; background:rgba(255,255,255,0.05);
                                  border:1px solid rgba(255,255,255,0.08); border-radius:2px; 
                                  color:#fff; font-size:9px; box-sizing:border-box;">
                </div>
            </div>
        `;
        
        this.element.innerHTML = html;
        this.setupPropertyHandlers(selected);
        
        const nameInput = this.element.querySelector('#prop-name');
        if (nameInput) {
            nameInput.addEventListener('change', () => {
                selected.userData.name = nameInput.value;
                this.editor.uiManager.sceneTree.update();
            });
        }
    }
    
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
}