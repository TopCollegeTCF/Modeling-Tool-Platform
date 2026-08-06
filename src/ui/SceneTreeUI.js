import { TEMPLATES, createElement } from '../configs/templates.js';

export class SceneTreeUI {
    constructor(editor) {
        this.editor = editor;
        this.element = null;
    }
    
    init() {
        this.element = createElement('div', {
            id: 'scene-tree',
            styles: `
                position: fixed;
                bottom: 12px;
                right: 12px;
                z-index: 1000;
                background: rgba(16, 16, 32, 0.95);
                backdrop-filter: blur(10px);
                padding: 12px;
                border-radius: 10px;
                border: 1px solid rgba(255,255,255,0.08);
                min-width: 150px;
                max-width: 200px;
                max-height: 200px;
                overflow-y: auto;
            `,
            attributes: { 'data-panel': 'sceneTree' },
        });
        
        // Добавляем стили скролла
        this.element.style.cssText += `
            &::-webkit-scrollbar { width: 3px; }
            &::-webkit-scrollbar-track { background: transparent; }
            &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
        `;
        
        document.body.appendChild(this.element);
        this.update();
        console.log('✅ SceneTreeUI initialized');
    }
    
    update() {
        if (!this.element) return;
        
        const entities = this.editor.sceneManager.getAllEntities();
        const selected = this.editor.selectionManager.getSelected();
        
        let html = `
            <div style="color:#666; font-size:10px; text-transform:uppercase; letter-spacing:1px; font-weight:600; margin-bottom:8px;">
                Objects (${entities.length})
            </div>
        `;
        
        if (entities.length === 0) {
            html += `
                <div style="color:#444; font-size:11px; text-align:center; padding:10px 0;">
                    No objects
                </div>
            `;
        } else {
            entities.forEach(entity => {
                const isSelected = selected === entity;
                const icon = this.getIcon(entity.userData.type);
                const name = entity.userData.name || entity.userData.type;
                const id = entity.userData.id;
                
                html += `
                    <div style="padding:3px 6px; margin:2px 0; border-radius:3px; cursor:pointer; 
                                font-size:11px; transition:all 0.2s; display:flex; align-items:center; gap:4px;
                                color: ${isSelected ? '#4a9eff' : '#aaa'};
                                background: ${isSelected ? 'rgba(74,158,255,0.15)' : 'transparent'};"
                         onmouseenter="this.style.background='rgba(255,255,255,0.05)'"
                         onmouseleave="this.style.background='${isSelected ? 'rgba(74,158,255,0.15)' : 'transparent'}'"
                         onclick="
                            const entity = window.editor.sceneManager.getEntity(${id});
                            if (entity) {
                                window.editor.selectionManager.select(entity);
                                window.editor.uiManager.updateUI();
                            }
                         ">
                        <span>${icon}</span>
                        <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${name}</span>
                    </div>
                `;
            });
        }
        
        this.element.innerHTML = html;
    }
    
    getIcon(type) {
        const icons = {
            'cube': '⬛',
            'sphere': '⚪',
            'cylinder': '📐',
            'entity': '📦'
        };
        return icons[type] || '📦';
    }
}