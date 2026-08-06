export class SceneTreeUI {
    constructor(editor) {
        this.editor = editor;
        this.element = null;
    }
    
    init() {
        this.element = document.createElement('div');
        this.element.id = 'scene-tree';
        this.element.style.cssText = `
            position: fixed;
            left: 12px;
            bottom: 12px;
            width: 200px;
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            background: rgba(16, 16, 32, 0.95);
            backdrop-filter: blur(10px);
            padding: 12px;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.08);
        `;
        
        document.body.appendChild(this.element);
        this.update();
        console.log('✅ SceneTreeUI initialized');
    }
    
    update() {
        if (!this.element) return;
        
        const entities = this.editor.sceneManager.getAllEntities();
        const selected = this.editor.selectionManager.getSelected();
        
        if (entities.length === 0) {
            this.element.innerHTML = `
                <div class="panel-title">Objects</div>
                <div style="color: #444; font-size: 12px; text-align: center; padding: 10px 0;">
                    No objects
                </div>
            `;
            return;
        }
        
        let html = `<div class="panel-title">Objects (${entities.length})</div>`;
        
        entities.forEach(entity => {
            const isSelected = selected === entity;
            const icon = this.getIcon(entity.userData.type);
            const id = entity.userData.id;
            const name = entity.userData.name || entity.userData.type;
            
            html += `
                <div class="tree-item ${isSelected ? 'selected' : ''}"
                     data-id="${id}"
                     style="
                        padding: 4px 8px;
                        margin: 2px 0;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                        color: ${isSelected ? '#4a9eff' : '#aaa'};
                        background: ${isSelected ? 'rgba(74,158,255,0.15)' : 'transparent'};
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    "
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
                    <span>${name}</span>
                </div>
            `;
        });
        
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