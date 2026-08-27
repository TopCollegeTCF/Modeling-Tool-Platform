import { ProjectUI } from './ProjectUI.js';
import { ToolbarUI } from './ToolbarUI.js';
import { SecondaryToolbar } from './SecondaryToolbar.js';
import { PropertiesUI } from './PropertiesUI.js';
import { SceneTreeUI } from './SceneTreeUI.js';
import { SpawnUI } from './SpawnUI.js';
import { SettingsUI } from './SettingsUI.js';
import { StencilUI } from './StencilUI.js';

export class UIManager {
    constructor(editor) {
        this.editor = editor;
        this.toolbar = new ToolbarUI(editor);
        this.secondaryToolbar = new SecondaryToolbar(editor);
        this.properties = new PropertiesUI(editor);
        this.sceneTree = new SceneTreeUI(editor);
        this.spawn = new SpawnUI(editor);
        this.settings = new SettingsUI(editor);
        this.stencil = new StencilUI(editor);
        this.uiElements = [];
        this.project = new ProjectUI(editor);
        this.editor.projectUI = this.project;
        this.editor.stencilUI = this.stencil;
    }

    init() {
        console.log('🖥 Initializing UI...');

        // Инициализируем в правильном порядке
        this.secondaryToolbar.init();
        this.toolbar.init();
        this.properties.init();
        this.sceneTree.init();
        this.spawn.init();
        this.settings.init();
        this.stencil.init();

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
                    if (!value) {
                        this.updateUI();
                    }
                }
            });
        }

        this.project.init();
        
        // Применяем сохраненные позиции панелей после загрузки
        setTimeout(() => {
            if (this.editor.panelService) {
                this.editor.panelService.refreshAllPanels();
            }
        }, 100);

        console.log('✅ UI initialized');
    }

    updateUI() {
        this.properties.update();
        this.sceneTree.update();
        this.spawn.update();
        this.secondaryToolbar.update();
    }
}