import { COLORS } from '../configs/colors.js';
import { STYLES } from '../configs/styles.js';

export class PropertiesUI {
    constructor(editor) {
        this.editor = editor;
        this.element = null;
        this.spawnMode = 'marker';
    }
    
    init() {
        this.element = document.createElement('div');
        this.element.id = 'properties';
        this.element.style.cssText = `
            position: fixed;
            right: 12px;
            top: 12px;
            width: 240px;
            max-height: calc(100vh - 24px);
            overflow-y: auto;
            overflow-x: hidden;
            z-index: 1000;
            background: ${COLORS.surface};
            backdrop-filter: blur(10px);
            padding: 16px;
            border-radius: 10px;
            border: 1px solid ${COLORS.border};
        `;
        
        // Добавляем стили для скролла
        const style = document.createElement('style');
        style.textContent = `
            #properties::-webkit-scrollbar {
                width: 3px;
            }
            #properties::-webkit-scrollbar-track {
                background: transparent;
            }
            #properties::-webkit-scrollbar-thumb {
                background: rgba(255,255,255,0.15);
                border-radius: 2px;
            }
            #properties .prop-group {
                margin-bottom: 8px;
            }
            #properties .prop-label {
                color: #888;
                font-size: 10px;
                display: block;
                margin-bottom: 2px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            #properties .prop-row {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 4px;
            }
            #properties .prop-row input {
                width: 100%;
                padding: 3px 6px;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 3px;
                color: #fff;
                font-size: 11px;
                box-sizing: border-box;
                transition: border-color 0.2s;
            }
            #properties .prop-row input:focus {
                outline: none;
                border-color: ${COLORS.accent.blue};
            }
            #properties .prop-row input[type="text"] {
                grid-column: 1 / -1;
            }
            #properties .btn-group {
                display: flex;
                gap: 4px;
                flex-wrap: wrap;
                margin-top: 8px;
            }
            #properties .btn-group button {
                flex: 1;
                min-width: 60px;
                padding: 5px 8px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                transition: all 0.2s;
                color: #fff;
            }
            #properties .btn-group button:hover {
                opacity: 0.8;
                transform: scale(0.98);
            }
            #properties .btn-danger {
                background: rgba(255,80,80,0.2);
                border: 1px solid rgba(255,80,80,0.2);
                color: ${COLORS.accent.red};
            }
            #properties .btn-danger:hover {
                background: rgba(255,80,80,0.3);
            }
            #properties .btn-primary {
                background: rgba(74,158,255,0.15);
                border: 1px solid rgba(74,158,255,0.2);
                color: ${COLORS.accent.blue};
            }
            #properties .btn-primary:hover {
                background: rgba(74,158,255,0.25);
            }
            #properties .btn-success {
                background: rgba(81,207,102,0.15);
                border: 1px solid rgba(81,207,102,0.2);
                color: ${COLORS.accent.green};
            }
            #properties .btn-success.active {
                background: rgba(81,207,102,0.25);
                border-color: ${COLORS.accent.green};
            }
            #properties .mode-toggle {
                display: flex;
                gap: 4px;
                margin-top: 8px;
            }
            #properties .mode-toggle button {
                flex: 1;
                padding: 4px 8px;
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 4px;
                background: transparent;
                color: #888;
                cursor: pointer;
                font-size: 10px;
                transition: all 0.2s;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            #properties .mode-toggle button.active {
                background: rgba(74,158,255,0.2);
                border-color: ${COLORS.accent.blue};
                color: ${COLORS.accent.blue};
            }
            #properties .mode-toggle button:hover {
                background: rgba(255,255,255,0.05);
            }
            #properties .info-text {
                color: #555;
                font-size: 11px;
                text-align: center;
                padding: 15px 0;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(this.element);
        this.update();
        console.log('✅ PropertiesUI initialized');
    }
    
    update() {
        if (!this.element) return;
        
        const selected = this.editor.selectionManager.getSelected();
        const spawnService = this.editor.spawnService;
        const mode = spawnService ? spawnService.getMode() : 'center';
        
        // Заголовок с информацией о режиме спавна
        let headerHtml = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <div class="panel-title">Properties</div>
                <div style="display:flex; gap:4px;">
                    <button onclick="window.editor.toggleSpawnMode()" 
                            style="padding:2px 8px; border:1px solid ${mode === 'marker' ? '#ffd43b' : 'rgba(255,255,255,0.08)'}; 
                                   border-radius:4px; background:${mode === 'marker' ? 'rgba(255,212,59,0.15)' : 'transparent'}; 
                                   color:${mode === 'marker' ? '#ffd43b' : '#888'}; cursor:pointer; font-size:10px;
                                   transition:all 0.2s;">
                        ${mode === 'marker' ? '📍 Marker' : '🎯 Center'}
                    </button>
                </div>
            </div>
        `;
        
        if (!selected) {
            this.element.innerHTML = `
                ${headerHtml}
                <div class="info-text">No object selected</div>
                <div style="margin-top:8px;">
                    <div class="prop-label">Spawn Position</div>
                    <div class="prop-row">
                        <input type="number" id="spawn-x" value="0" step="0.1" style="grid-column:1;">
                        <input type="number" id="spawn-y" value="0.5" step="0.1" style="grid-column:2;">
                        <input type="number" id="spawn-z" value="0" step="0.1" style="grid-column:3;">
                    </div>
                </div>
                <div class="btn-group">
                    <button class="btn-primary" onclick="window.editor.addCube()">➕ Cube</button>
                    <button class="btn-success" onclick="window.editor.addSphere()">⚪ Sphere</button>
                    <button class="btn-primary" onclick="window.editor.addCylinder()">📐 Cylinder</button>
                </div>
            `;
            
            // Обработчики для позиции спавна
            ['x', 'y', 'z'].forEach(axis => {
                const input = this.element.querySelector(`#spawn-${axis}`);
                if (input && this.editor.spawnService) {
                    input.addEventListener('change', () => {
                        const pos = this.editor.spawnService.position;
                        pos[axis] = parseFloat(input.value) || 0;
                        if (this.editor.spawnService.marker) {
                            this.editor.spawnService.marker.position.copy(pos);
                        }
                    });
                }
            });
            return;
        }
        
        const pos = selected.position;
        const rot = selected.rotation;
        const scale = selected.scale;
        const name = selected.userData.name || selected.userData.type;
        
        this.element.innerHTML = `
            ${headerHtml}
            
            <div class="prop-group">
                <label class="prop-label">Name</label>
                <input type="text" id="prop-name" value="${name}" 
                       style="width:100%; padding:3px 6px; background:rgba(255,255,255,0.05);
                              border:1px solid rgba(255,255,255,0.08); border-radius:3px; 
                              color:#fff; font-size:11px; box-sizing:border-box;">
            </div>
            
            <div class="prop-group">
                <label class="prop-label">Position</label>
                <div class="prop-row">
                    <input class="prop-input" data-prop="position" data-axis="x" type="number" value="${pos.x.toFixed(2)}" step="0.1">
                    <input class="prop-input" data-prop="position" data-axis="y" type="number" value="${pos.y.toFixed(2)}" step="0.1">
                    <input class="prop-input" data-prop="position" data-axis="z" type="number" value="${pos.z.toFixed(2)}" step="0.1">
                </div>
            </div>
            
            <div class="prop-group">
                <label class="prop-label">Rotation</label>
                <div class="prop-row">
                    <input class="prop-input" data-prop="rotation" data-axis="x" type="number" value="${(rot.x * 180 / Math.PI).toFixed(0)}" step="1">
                    <input class="prop-input" data-prop="rotation" data-axis="y" type="number" value="${(rot.y * 180 / Math.PI).toFixed(0)}" step="1">
                    <input class="prop-input" data-prop="rotation" data-axis="z" type="number" value="${(rot.z * 180 / Math.PI).toFixed(0)}" step="1">
                </div>
            </div>
            
            <div class="prop-group">
                <label class="prop-label">Scale</label>
                <div class="prop-row">
                    <input class="prop-input" data-prop="scale" data-axis="x" type="number" value="${scale.x.toFixed(2)}" step="0.1" min="0.01">
                    <input class="prop-input" data-prop="scale" data-axis="y" type="number" value="${scale.y.toFixed(2)}" step="0.1" min="0.01">
                    <input class="prop-input" data-prop="scale" data-axis="z" type="number" value="${scale.z.toFixed(2)}" step="0.1" min="0.01">
                </div>
            </div>
            
            <div class="btn-group">
                <button class="btn-danger" onclick="window.editor.deleteSelected()">🗑 Delete</button>
                <button class="btn-primary" onclick="window.editor.addCube()">➕ Cube</button>
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