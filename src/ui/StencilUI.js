/**
 * 🎨 StencilUI - Минималистичная панель управления трафаретом
 *
 * @version 3.1.0
 */
 import { STENCIL_SHAPES } from '../services/StencilService.js';

 export class StencilUI {
     constructor(editor) {
         this.editor = editor;
         this.element = null;
         this.isVisible = false;
         this._updateInterval = null;
     }
     
     init() {
         this.element = document.createElement('div');
         this.element.id = 'stencil-panel';
         this.element.style.cssText = `
             position: fixed;
             bottom: 70px;
             left: 50%;
             transform: translateX(-50%);
             z-index: 1000;
             background: rgba(16, 16, 32, 0.92);
             backdrop-filter: blur(12px);
             padding: 8px 12px;
             border-radius: 12px;
             border: 1px solid rgba(255,255,255,0.06);
             display: none;
             box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
         `;
         document.body.appendChild(this.element);
         
         // Обновляем каждые 200ms для отслеживания объектов на трафарете
         this._updateInterval = setInterval(() => {
             if (this.isVisible) this.update();
         }, 200);
         
         this.update();
         console.log('✅ StencilUI v3.1 initialized');
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
     
     /**
      * Проверяет, есть ли объект на трафарете
      */
     hasObjectOnStencil() {
         const stencilService = this.editor.stencilService;
         if (!stencilService) return false;
         
         const stencilPos = stencilService.position;
         const stencilRadius = stencilService.size / 2;
         const entities = this.editor.sceneManager.getAllEntities();
         
         for (const entity of entities) {
             if (entity.userData.isStencil || entity.userData.isHelper) continue;
             
             const dist = entity.position.distanceTo(stencilPos);
             // Проверяем только объекты в радиусе трафарета и на уровне трафарета
             if (dist < stencilRadius * 1.5) {
                 const heightDiff = Math.abs(entity.position.y - stencilPos.y);
                 if (heightDiff < 1) {
                     return true;
                 }
             }
         }
         return false;
     }
     
     /**
      * Находит объект на трафарете
      */
     getObjectOnStencil() {
         const stencilService = this.editor.stencilService;
         if (!stencilService) return null;
         
         const stencilPos = stencilService.position;
         const stencilRadius = stencilService.size / 2;
         const entities = this.editor.sceneManager.getAllEntities();
         let closest = null;
         let closestDist = Infinity;
         
         for (const entity of entities) {
             if (entity.userData.isStencil || entity.userData.isHelper) continue;
             
             const dist = entity.position.distanceTo(stencilPos);
             if (dist < stencilRadius * 1.5 && dist < closestDist) {
                 const heightDiff = Math.abs(entity.position.y - stencilPos.y);
                 if (heightDiff < 1) {
                     closest = entity;
                     closestDist = dist;
                 }
             }
         }
         return closest;
     }
     
     update() {
         if (!this.element || !this.isVisible) return;
         
         const stencilService = this.editor.stencilService;
         if (!stencilService) {
             this.element.innerHTML = `<div style="color:#555;font-size:10px;">⚠</div>`;
             return;
         }
         
         const shape = stencilService.shape;
         const size = stencilService.size;
         const opacity = stencilService.opacity;
         const isActive = stencilService.isActive;
         
         // Проверяем наличие объекта на трафарете
         const hasObject = this.hasObjectOnStencil();
         const targetObject = this.getObjectOnStencil();
         
         const shapeIcons = {
             'square': '⬜',
             'circle': '⭕',
             'triangle': '△',
             'hexagon': '⬡',
             'octagon': '⬠',
             'star': '★',
         };
         
         this.element.innerHTML = `
             <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;">
                 ${Object.entries(shapeIcons).map(([key, icon]) => `
                     <button onclick="window.editor.stencilService.setShape('${key}');window.editor.stencilUI.update();"
                             style="width:28px;height:28px;border:2px solid ${shape===key?'rgba(74,158,255,0.5)':'rgba(255,255,255,0.06)'};
                                    border-radius:6px;background:${shape===key?'rgba(74,158,255,0.15)':'transparent'};
                                    color:${shape===key?'#4a9eff':'#666'};cursor:pointer;font-size:14px;
                                    transition:all 0.15s;display:flex;align-items:center;justify-content:center;"
                             onmouseenter="this.style.background='rgba(255,255,255,0.06)'"
                             onmouseleave="this.style.background='${shape===key?'rgba(74,158,255,0.15)':'transparent'}'"
                             title="${key}">
                         ${icon}
                     </button>
                 `).join('')}
                 
                 <div style="width:1px;height:24px;background:rgba(255,255,255,0.06);margin:0 2px;"></div>
                 
                 <div style="display:flex;align-items:center;gap:2px;">
                     <input type="range" min="0.2" max="3" step="0.1" value="${size}"
                            oninput="window.editor.stencilService.setSize(parseFloat(this.value));window.editor.stencilUI.update();"
                            style="width:50px;height:2px;background:rgba(255,255,255,0.1);border-radius:1px;
                                   -webkit-appearance:none;appearance:none;cursor:pointer;">
                     <span style="color:#666;font-size:8px;min-width:18px;">${size.toFixed(1)}</span>
                 </div>
                 
                 <div style="width:1px;height:24px;background:rgba(255,255,255,0.06);margin:0 2px;"></div>
                 
                 <button onclick="window.editor.stencilService.toggle();window.editor.stencilUI.update();"
                         style="width:28px;height:28px;border:2px solid ${isActive?'rgba(74,158,255,0.4)':'rgba(255,255,255,0.06)'};
                                border-radius:6px;background:${isActive?'rgba(74,158,255,0.15)':'transparent'};
                                color:${isActive?'#4a9eff':'#666'};cursor:pointer;font-size:14px;
                                transition:all 0.15s;display:flex;align-items:center;justify-content:center;"
                         onmouseenter="this.style.background='rgba(255,255,255,0.06)'"
                         onmouseleave="this.style.background='${isActive?'rgba(74,158,255,0.15)':'transparent'}'"
                         title="${isActive?'Hide':'Show'}">
                     ${isActive?'👁':'👁‍🗨'}
                 </button>
                 
                 <button onclick="if(window.editor.stencilUI.hasObjectOnStencil()){window.editor.toolManager.getTool('stencil').applyStencil(window.editor.stencilUI.getObjectOnStencil());}"
                         style="width:28px;height:28px;border:2px solid ${hasObject?'rgba(81,207,102,0.4)':'rgba(255,255,255,0.04)'};
                                border-radius:6px;background:${hasObject?'rgba(81,207,102,0.15)':'transparent'};
                                color:${hasObject?'#51cf66':'#444'};cursor:${hasObject?'pointer':'not-allowed'};font-size:14px;
                                transition:all 0.15s;display:flex;align-items:center;justify-content:center;
                                ${!hasObject?'opacity:0.3;':''}"
                         onmouseenter="${hasObject?'this.style.background="rgba(81,207,102,0.25)"':''}"
                         onmouseleave="${hasObject?'this.style.background="rgba(81,207,102,0.15)"':''}"
                         title="${hasObject ? `Apply to ${targetObject?.userData?.name || 'object'}` : 'No object on stencil'}">
                     ✨
                 </button>
                 
                 ${hasObject ? `<span style="color:#51cf66;font-size:8px;margin-left:2px;">●</span>` : ''}
             </div>
         `;
     }
     
     dispose() {
         if (this._updateInterval) {
             clearInterval(this._updateInterval);
             this._updateInterval = null;
         }
     }
 }