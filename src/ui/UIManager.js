import { ToolbarUI } from './ToolbarUI.js';
import { PropertiesUI } from './PropertiesUI.js';
import { SceneTreeUI } from './SceneTreeUI.js';

export class UIManager {
    constructor(editor) {
        this.editor = editor;
        this.toolbar = new ToolbarUI(editor);
        this.properties = new PropertiesUI(editor);
        this.sceneTree = new SceneTreeUI(editor);
        this.uiElements = [];
    }
    
    init() {
        console.log('🖥 Initializing UI...');
        this.toolbar.init();
        this.properties.init();
        this.sceneTree.init();
        console.log('✅ UI initialized');
        
        // Подписка на изменения выделения
        this.editor.selectionManager.addListener(() => {
            this.updateUI();
        });
    }
    
    updateUI() {
        this.properties.update();
        this.sceneTree.update();
    }
    
    createPanel(title, id) {
        const panel = document.createElement('div');
        panel.id = id || `panel-${Date.now()}`;
        panel.className = 'panel';
        panel.innerHTML = `<div class="panel-title">${title}</div>`;
        return panel;
    }
}