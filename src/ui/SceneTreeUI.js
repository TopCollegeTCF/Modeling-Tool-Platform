import { UI_TEMPLATES, renderTemplate } from '../configs/ui-templates.js';

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
            bottom: 12px;
            right: 12px;
            z-index: 1000;
            background: rgba(16, 16, 32, 0.95);
            backdrop-filter: blur(10px);
            padding: 12px 14px;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.08);
            min-width: 180px;
            max-width: 220px;
            width: 200px;
            min-height: 280px;
            max-height: 400px;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;
        this.element.setAttribute('data-panel', 'sceneTree');
        
        // Стили для скролла
        const style = document.createElement('style');
        style.textContent = `
            #scene-tree::-webkit-scrollbar { width: 3px; }
            #scene-tree::-webkit-scrollbar-track { background: transparent; }
            #scene-tree::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
            #scene-tree::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }
        `;
        this.element.appendChild(style);
        
        document.body.appendChild(this.element);
        this.update();
        console.log('✅ SceneTreeUI initialized');
    }

    update() {
        if (!this.element) return;

        const entities = this.editor.sceneManager.getAllEntities();
        const selected = this.editor.selectionManager.getSelected();

        let html = renderTemplate(UI_TEMPLATES.sceneTree.header, {
            count: entities.length,
        });

        if (entities.length === 0) {
            html += UI_TEMPLATES.sceneTree.empty;
        } else {
            entities.forEach(entity => {
                const isSelected = selected === entity;
                const icon = this.getIcon(entity.userData.type);
                const name = entity.userData.name || entity.userData.type;
                const id = entity.userData.id;

                html += renderTemplate(UI_TEMPLATES.sceneTree.item, {
                    id: id,
                    icon: icon,
                    name: name,
                    color: isSelected ? '#4a9eff' : '#aaa',
                    background: isSelected ? 'rgba(74,158,255,0.15)' : 'transparent',
                });
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