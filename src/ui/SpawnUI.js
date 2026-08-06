import { TEMPLATES, createElement, applyStyles } from '../configs/templates.js';
import { ICONS } from '../configs/icons.js';

export class SpawnUI {
    constructor(editor) {
        this.editor = editor;
        this.element = null;
    }
    
    init() {
        this.element = createElement('div', {
            id: 'spawn-panel',
            styles: `
                position: fixed;
                bottom: 12px;
                left: 12px;
                z-index: 1000;
                background: rgba(16, 16, 32, 0.95);
                backdrop-filter: blur(10px);
                padding: 10px;
                border-radius: 10px;
                border: 1px solid rgba(255,255,255,0.08);
                min-width: 120px;
                max-width: 160px;
            `,
            attributes: { 'data-panel': 'spawn' },
        });
        
        document.body.appendChild(this.element);
        this.update();
        console.log('✅ SpawnUI initialized');
    }
    
    createIconHTML(iconPath, size = 14) {
        return `<img src="${iconPath}" style="width:${size}px; height:${size}px; filter: invert(0.5); vertical-align: middle;" onerror="this.style.display='none'">`;
    }
    
    update() {
        if (!this.element) return;
        
        const spawnService = this.editor.spawnService;
        if (!spawnService) {
            this.element.innerHTML = `
                <div style="color:#555; font-size:10px; text-align:center; padding:10px 0;">
                    Loading...
                </div>
            `;
            return;
        }
        
        const mode = spawnService.getMode();
        
        this.element.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="color:#666; font-size:9px; text-transform:uppercase; letter-spacing:1px; font-weight:600;">${this.createIconHTML(ICONS.cube, 12)} Create</span>
                <span style="font-size:8px; color:#444; background:rgba(255,255,255,0.05); padding:1px 6px; border-radius:10px;">
                    ${mode === 'marker' ? '📍' : '🎯'}
                </span>
            </div>
            <div style="display:flex; flex-direction:column; gap:3px;">
                <button onclick="window.editor.addCube()"
                        style="display:flex; align-items:center; gap:6px; padding:3px 6px;
                               background:rgba(74,158,255,0.15); border:1px solid rgba(74,158,255,0.2);
                               border-radius:3px; color:#4a9eff; cursor:pointer; font-size:11px;
                               transition:all 0.2s; width:100%; justify-content:center;"
                        onmouseenter="this.style.background='rgba(74,158,255,0.25)'"
                        onmouseleave="this.style.background='rgba(74,158,255,0.15)'">
                    ${this.createIconHTML(ICONS.cube, 14)} Cube
                </button>
                
                <button onclick="window.editor.addSphere()"
                        style="display:flex; align-items:center; gap:6px; padding:3px 6px;
                               background:rgba(255,107,107,0.15); border:1px solid rgba(255,107,107,0.2);
                               border-radius:3px; color:#ff6b6b; cursor:pointer; font-size:11px;
                               transition:all 0.2s; width:100%; justify-content:center;"
                        onmouseenter="this.style.background='rgba(255,107,107,0.25)'"
                        onmouseleave="this.style.background='rgba(255,107,107,0.15)'">
                    ${this.createIconHTML(ICONS.sphere, 14)} Sphere
                </button>
                
                <button onclick="window.editor.addCylinder()"
                        style="display:flex; align-items:center; gap:6px; padding:3px 6px;
                               background:rgba(81,207,102,0.15); border:1px solid rgba(81,207,102,0.2);
                               border-radius:3px; color:#51cf66; cursor:pointer; font-size:11px;
                               transition:all 0.2s; width:100%; justify-content:center;"
                        onmouseenter="this.style.background='rgba(81,207,102,0.25)'"
                        onmouseleave="this.style.background='rgba(81,207,102,0.15)'">
                    ${this.createIconHTML(ICONS.cylinder, 14)} Cylinder
                </button>
            </div>
        `;
    }
}