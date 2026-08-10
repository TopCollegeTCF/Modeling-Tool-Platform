import { ProjectUI } from './ProjectUI.js';
import { ToolbarUI } from './ToolbarUI.js';
import { PropertiesUI } from './PropertiesUI.js';
import { SceneTreeUI } from './SceneTreeUI.js';
import { SpawnUI } from './SpawnUI.js';
import { SettingsUI } from './SettingsUI.js';

export class UIManager {
    constructor(editor) {
        this.editor = editor;
        this.toolbar = new ToolbarUI(editor);
        this.properties = new PropertiesUI(editor);
        this.sceneTree = new SceneTreeUI(editor);
        this.spawn = new SpawnUI(editor);
        this.settings = new SettingsUI(editor);
        this.uiElements = [];

        this.project = new ProjectUI(editor);
        this.editor.projectUI = this.project;
    }

    init() {
        console.log('🖥 Initializing UI...');
        
        this.toolbar.init();
        this.properties.init();
        this.sceneTree.init();
        this.spawn.init();
        this.settings.init();
        
        // Регистрируем панели в PanelService
        if (this.editor.panelService) {
            this.editor.panelService.registerPanel('properties', this.properties.element);
            this.editor.panelService.registerPanel('sceneTree', this.sceneTree.element);
            this.editor.panelService.registerPanel('tools', this.toolbar.element);
            this.editor.panelService.registerPanel('spawn', this.spawn.element);
        }
        
        // Подписка на изменения выделения
        this.editor.selectionManager.addListener(() => {
            this.updateUI();
        });
        
        // Подписка на изменения Gizmo
        if (this.editor.gizmoService) {
            this.editor.gizmoService.addListener((event, value) => {
                if (event === 'dragging') {
                    // Обновляем свойства в реальном времени
                    if (!value) {
                        this.updateUI();
                    }
                }
            });
        }
        
        this.project.init();
        console.log('✅ UI initialized');
    }

    updateUI() {
        this.properties.update();
        this.sceneTree.update();
        this.spawn.update();
    }
}