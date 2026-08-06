export class PropertiesUI {
    constructor(editor) {
        this.editor = editor;
        this.element = null;
    }
    
    init() {
        this.element = document.createElement('div');
        this.element.id = 'properties';
        this.element.style.cssText = `
            position: fixed;
            right: 12px;
            top: 12px;
            width: 260px;
            max-height: calc(100vh - 24px);
            overflow-y: auto;
            z-index: 1000;
            background: rgba(16, 16, 32, 0.95);
            backdrop-filter: blur(10px);
            padding: 16px;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.08);
        `;
        
        document.body.appendChild(this.element);
        this.update();
        console.log('✅ PropertiesUI initialized');
    }
    
    update() {
        if (!this.element) {
            console.warn('PropertiesUI: element not initialized');
            return;
        }
        
        const selected = this.editor.selectionManager.getSelected();
        
        if (!selected) {
            this.element.innerHTML = `
                <div class="panel-title">Properties</div>
                <div style="color: #555; font-size: 13px; text-align: center; padding: 20px 0;">
                    No object selected
                </div>
                <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-top: 10px;">
                    <button onclick="window.editor.addCube()"
                            style="flex: 1; padding: 6px; background: rgba(74,158,255,0.15);
                                   border: 1px solid rgba(74,158,255,0.2); border-radius: 4px; color: #4a9eff;
                                   cursor: pointer; font-size: 12px;">
                        ➕ Cube
                    </button>
                    <button onclick="window.editor.addSphere()"
                            style="flex: 1; padding: 6px; background: rgba(255,107,107,0.15);
                                   border: 1px solid rgba(255,107,107,0.2); border-radius: 4px; color: #ff6b6b;
                                   cursor: pointer; font-size: 12px;">
                        ⚪ Sphere
                    </button>
                    <button onclick="window.editor.addCylinder()"
                            style="flex: 1; padding: 6px; background: rgba(81,207,102,0.15);
                                   border: 1px solid rgba(81,207,102,0.2); border-radius: 4px; color: #51cf66;
                                   cursor: pointer; font-size: 12px;">
                        📐 Cylinder
                    </button>
                </div>
            `;
            return;
        }
        
        const pos = selected.position;
        const rot = selected.rotation;
        const scale = selected.scale;
        const name = selected.userData.name || selected.userData.type;
        
        this.element.innerHTML = `
            <div class="panel-title">Properties</div>
            
            <div style="margin-bottom: 10px;">
                <label style="color: #888; font-size: 11px; display: block; margin-bottom: 2px;">Name</label>
                <input id="prop-name" type="text" value="${name}" 
                       style="width: 100%; padding: 4px 8px; background: rgba(255,255,255,0.05); 
                              border: 1px solid rgba(255,255,255,0.08); border-radius: 4px; color: #fff; font-size: 12px;">
            </div>
            
            <div style="margin-bottom: 8px;">
                <label style="color: #888; font-size: 11px; display: block; margin-bottom: 2px;">Position</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px;">
                    <input class="prop-input" data-prop="position" data-axis="x" type="number" value="${pos.x.toFixed(2)}" step="0.1">
                    <input class="prop-input" data-prop="position" data-axis="y" type="number" value="${pos.y.toFixed(2)}" step="0.1">
                    <input class="prop-input" data-prop="position" data-axis="z" type="number" value="${pos.z.toFixed(2)}" step="0.1">
                </div>
            </div>
            
            <div style="margin-bottom: 8px;">
                <label style="color: #888; font-size: 11px; display: block; margin-bottom: 2px;">Rotation</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px;">
                    <input class="prop-input" data-prop="rotation" data-axis="x" type="number" value="${(rot.x * 180 / Math.PI).toFixed(0)}" step="1">
                    <input class="prop-input" data-prop="rotation" data-axis="y" type="number" value="${(rot.y * 180 / Math.PI).toFixed(0)}" step="1">
                    <input class="prop-input" data-prop="rotation" data-axis="z" type="number" value="${(rot.z * 180 / Math.PI).toFixed(0)}" step="1">
                </div>
            </div>
            
            <div style="margin-bottom: 12px;">
                <label style="color: #888; font-size: 11px; display: block; margin-bottom: 2px;">Scale</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px;">
                    <input class="prop-input" data-prop="scale" data-axis="x" type="number" value="${scale.x.toFixed(2)}" step="0.1" min="0.01">
                    <input class="prop-input" data-prop="scale" data-axis="y" type="number" value="${scale.y.toFixed(2)}" step="0.1" min="0.01">
                    <input class="prop-input" data-prop="scale" data-axis="z" type="number" value="${scale.z.toFixed(2)}" step="0.1" min="0.01">
                </div>
            </div>
            
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                <button onclick="window.editor.deleteSelected()" 
                        style="flex: 1; padding: 6px; background: rgba(255,80,80,0.15); 
                               border: 1px solid rgba(255,80,80,0.2); border-radius: 4px; color: #ff6b6b; 
                               cursor: pointer; font-size: 12px;">
                    🗑 Delete
                </button>
                <button onclick="window.editor.addCube()"
                        style="flex: 1; padding: 6px; background: rgba(74,158,255,0.15); 
                               border: 1px solid rgba(74,158,255,0.2); border-radius: 4px; color: #4a9eff; 
                               cursor: pointer; font-size: 12px;">
                    ➕ Cube
                </button>
            </div>
        `;
        
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