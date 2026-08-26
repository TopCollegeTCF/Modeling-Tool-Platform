/**
 * 🎨 StencilUI - Панель управления трафаретом
 * 
 * 📋 ОПИСАНИЕ:
 * Позволяет настраивать параметры трафарета
 * 
 * @version 1.0.0
 */
import { STENCIL_SHAPES } from '../services/StencilService.js';

export class StencilUI {
    constructor(editor) {
        this.editor = editor;
        this.element = null;
        this.isVisible = false;
    }

    init() {
        this.element = document.createElement('div');
        this.element.id = 'stencil-panel';
        this.element.style.cssText = `
             position: fixed;
             bottom: 80px;
             left: 50%;
             transform: translateX(-50%);
             z-index: 1000;
             background: rgba(16, 16, 32, 0.95);
             backdrop-filter: blur(10px);
             padding: 12px 16px;
             border-radius: 10px;
             border: 1px solid rgba(255,255,255,0.08);
             min-width: 280px;
             max-width: 400px;
             display: none;
             box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
         `;

        document.body.appendChild(this.element);
        this.update();
        console.log('✅ StencilUI initialized');
    }

    show() {
        this.isVisible = true;
        this.element.style.display = 'block';
        this.update();
    }

    hide() {
        this.isVisible = false;
        this.element.style.display = 'none';
    }

    toggle() {
        this.isVisible ? this.hide() : this.show();
    }

    update() {
        if (!this.element || !this.isVisible) return;

        const stencilService = this.editor.stencilService;
        if (!stencilService) {
            this.element.innerHTML = `
                 <div style="color:#555; font-size:12px; text-align:center; padding:10px 0;">
                     Stencil service not available
                 </div>
             `;
            return;
        }

        const shape = stencilService.shape;
        const size = stencilService.size;
        const opacity = stencilService.opacity;
        const isActive = stencilService.isActive;

        const shapeNames = {
            'square': '⬜ Square',
            'circle': '⭕ Circle',
            'triangle': '△ Triangle',
            'hexagon': '⬡ Hexagon',
            'octagon': '⬠ Octagon',
            'star': '★ Star',
        };

        this.element.innerHTML = `
             <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                 <span style="color: #666; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                     🎨 Stencil Tool
                 </span>
                 <div style="display: flex; gap: 4px;">
                     <span style="font-size: 8px; color: ${isActive ? '#4a9eff' : '#444'}; background: ${isActive ? 'rgba(74,158,255,0.15)' : 'rgba(255,255,255,0.05)'}; padding: 2px 8px; border-radius: 10px;">
                         ${isActive ? '● Active' : '○ Inactive'}
                     </span>
                     <button onclick="window.editor.stencilUI.hide()"
                             style="background: transparent; border: none; color: #666; cursor: pointer; font-size: 14px; padding: 0 4px;">
                         ✕
                     </button>
                 </div>
             </div>
             
             <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; margin-bottom: 8px;">
                 ${Object.entries(shapeNames).map(([key, name]) => `
                     <button onclick="window.editor.stencilService.setShape('${key}'); window.editor.stencilUI.update();"
                             style="padding: 4px 6px; border: 1px solid ${shape === key ? '#4a9eff' : 'rgba(255,255,255,0.08)'};
                                    border-radius: 4px; background: ${shape === key ? 'rgba(74,158,255,0.15)' : 'transparent'};
                                    color: ${shape === key ? '#4a9eff' : '#888'}; cursor: pointer; font-size: 10px;
                                    transition: all 0.2s;"
                             onmouseenter="this.style.background='${shape === key ? 'rgba(74,158,255,0.25)' : 'rgba(255,255,255,0.05)'}'"
                             onmouseleave="this.style.background='${shape === key ? 'rgba(74,158,255,0.15)' : 'transparent'}'">
                         ${name}
                     </button>
                 `).join('')}
             </div>
             
             <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 6px;">
                 <div>
                     <label style="color: #888; font-size: 8px; display: block; margin-bottom: 2px;">Size</label>
                     <input type="range" min="0.5" max="5" step="0.1" value="${size}"
                            oninput="window.editor.stencilService.setSize(parseFloat(this.value)); window.editor.stencilUI.update();"
                            style="width: 100%; height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px;
                                   -webkit-appearance: none; appearance: none; cursor: pointer;">
                     <div style="display: flex; justify-content: space-between; font-size: 7px; color: #555;">
                         <span>0.5</span>
                         <span id="stencil-size-value" style="color: #888;">${size.toFixed(1)}</span>
                         <span>5.0</span>
                     </div>
                 </div>
                 <div>
                     <label style="color: #888; font-size: 8px; display: block; margin-bottom: 2px;">Opacity</label>
                     <input type="range" min="0.1" max="0.8" step="0.05" value="${opacity}"
                            oninput="window.editor.stencilService.setOpacity(parseFloat(this.value)); window.editor.stencilUI.update();"
                            style="width: 100%; height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px;
                                   -webkit-appearance: none; appearance: none; cursor: pointer;">
                     <div style="display: flex; justify-content: space-between; font-size: 7px; color: #555;">
                         <span>10%</span>
                         <span id="stencil-opacity-value" style="color: #888;">${Math.round(opacity * 100)}%</span>
                         <span>80%</span>
                     </div>
                 </div>
                 <div>
                     <label style="color: #888; font-size: 8px; display: block; margin-bottom: 2px;">Color</label>
                     <input type="color" value="#${stencilService.color.toString(16).padStart(6, '0')}"
                            oninput="window.editor.stencilService.setColor(parseInt(this.value.substring(1), 16)); window.editor.stencilUI.update();"
                            style="width: 100%; padding: 1px; background: transparent;
                                   border: 1px solid rgba(255,255,255,0.08); border-radius: 2px;
                                   cursor: pointer; height: 28px;">
                 </div>
             </div>
             
             <div style="display: flex; gap: 4px; margin-top: 4px;">
                 <button onclick="window.editor.stencilService.toggle(); window.editor.stencilUI.update();"
                         style="flex: 1; padding: 4px 8px; border: 1px solid ${isActive ? 'rgba(74,158,255,0.3)' : 'rgba(255,255,255,0.08)'};
                                border-radius: 4px; background: ${isActive ? 'rgba(74,158,255,0.15)' : 'transparent'};
                                color: ${isActive ? '#4a9eff' : '#888'}; cursor: pointer; font-size: 10px;
                                transition: all 0.2s;">
                     ${isActive ? '🔽 Hide Stencil' : '🔼 Show Stencil'}
                 </button>
                 <button onclick="if (window.editor.selectionManager.getSelected()) { window.editor.toolManager.getTool('stencil').applyStencil(window.editor.selectionManager.getSelected()); }"
                         style="flex: 1; padding: 4px 8px; border: 1px solid rgba(81,207,102,0.3);
                                border-radius: 4px; background: rgba(81,207,102,0.15);
                                color: #51cf66; cursor: pointer; font-size: 10px;
                                transition: all 0.2s;">
                     ✨ Apply to Selected
                 </button>
             </div>
             
             <div style="font-size: 8px; color: #444; text-align: center; margin-top: 6px; border-top: 1px solid rgba(255,255,255,0.04); padding-top: 6px;">
                 <span>Hotkeys: <kbd style="background: rgba(255,255,255,0.05); padding: 1px 6px; border-radius: 3px; color: #666;">S</kbd> Change shape · <kbd style="background: rgba(255,255,255,0.05); padding: 1px 6px; border-radius: 3px; color: #666;">+</kbd> <kbd style="background: rgba(255,255,255,0.05); padding: 1px 6px; border-radius: 3px; color: #666;">-</kbd> Size</span>
             </div>
         `;
    }
}