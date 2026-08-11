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
            padding: 12px;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.08);
            min-width: 150px;
            max-width: 200px;
            max-height: 200px;
            overflow-y: auto;
        `;
        this.element.setAttribute('data-panel', 'sceneTree');
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