/**
 * 🎨 StencilTool - Инструмент для работы с трафаретами
 * 
 * 📋 ОПИСАНИЕ:
 * Позволяет применять трафарет к выбранному объекту
 * 
 * @version 1.0.0
 */
import { Tool } from './Tool.js';
import * as THREE from 'three';

export class StencilTool extends Tool {
    constructor(editor) {
        super(editor);
        this.name = 'Stencil';
        this.icon = '🎨';
        this.shortcut = '6';
        this.stencilService = null;
    }

    onActivate() {
        console.log('🎨 Stencil Tool activated');
        this.editor.getRenderer().domElement.style.cursor = 'crosshair';

        if (!this.stencilService) {
            this.stencilService = this.editor.stencilService;
        }

        if (!this.stencilService) {
            console.error('❌ StencilService not found');
            return;
        }

        // Показываем трафарет
        this.stencilService.show();

        // Подписываемся на изменения выделения
        this._selectionListener = this.editor.selectionManager.addListener((entity) => {
            if (entity && this.stencilService.isActive) {
                // Подсвечиваем выбранный объект
                this.highlightEntity(entity);
            }
        });
    }

    onDeactivate() {
        console.log('🎨 Stencil Tool deactivated');
        this.editor.getRenderer().domElement.style.cursor = 'default';

        if (this.stencilService) {
            this.stencilService.hide();
        }

        if (this._selectionListener) {
            this._selectionListener();
            this._selectionListener = null;
        }

        // Убираем подсветку
        this.clearHighlight();
    }

    onMouseDown(event) {
        // При клике применяем трафарет к выбранному объекту
        if (event.button === 0) {
            const selected = this.editor.selectionManager.getSelected();
            if (selected && this.stencilService) {
                this.applyStencil(selected);
            } else {
                console.warn('⚠️ No object selected to apply stencil');
            }
        }
    }

    /**
     * Применяет трафарет к объекту
     */
    applyStencil(entity) {
        if (!this.stencilService) return;

        // Проверяем, что объект не является трафаретом
        if (entity.userData.isStencil || entity.userData.isHelper) {
            console.warn('⚠️ Cannot apply stencil to helper object');
            return;
        }

        // Применяем трафарет
        const result = this.stencilService.applyStencil(entity);

        if (result) {
            // Выделяем новый объект
            this.editor.selectionManager.select(result);
            this.editor.uiManager.updateUI();
            console.log(`🎨 Stencil applied successfully: ${result.userData.name}`);
        }
    }

    /**
     * Подсвечивает выбранный объект
     */
    highlightEntity(entity) {
        this.clearHighlight();
        if (entity && entity.material && !entity.userData.isStencil && !entity.userData.isHelper) {
            this._originalEmissive = entity.material.emissive ? entity.material.emissive.clone() : null;
            this._originalEmissiveIntensity = entity.material.emissiveIntensity || 0;

            if (entity.material.emissive) {
                entity.material.emissive.setHex(0x4a9eff);
                entity.material.emissiveIntensity = 0.2;
            }
        }
    }

    /**
     * Убирает подсветку
     */
    clearHighlight() {
        const selected = this.editor.selectionManager.getSelected();
        if (selected && selected.material) {
            if (selected.material.emissive && this._originalEmissive) {
                selected.material.emissive.copy(this._originalEmissive);
                selected.material.emissiveIntensity = this._originalEmissiveIntensity || 0;
            }
        }
        this._originalEmissive = null;
        this._originalEmissiveIntensity = 0;
    }

    onKeyDown(event) {
        // S - переключить форму
        if (event.key === 's' || event.key === 'S') {
            if (this.stencilService) {
                const shapes = ['square', 'circle', 'triangle', 'hexagon', 'octagon', 'star'];
                const currentIndex = shapes.indexOf(this.stencilService.shape);
                const nextIndex = (currentIndex + 1) % shapes.length;
                this.stencilService.setShape(shapes[nextIndex]);
                // Обновляем UI
                if (this.editor.settingsUI && this.editor.settingsUI.isOpen) {
                    this.editor.settingsUI.render();
                }
            }
            return;
        }

        // +/- - изменить размер
        if (event.key === '+' || event.key === '=') {
            if (this.stencilService) {
                this.stencilService.setSize(this.stencilService.size + 0.5);
            }
            return;
        }
        if (event.key === '-' || event.key === '_') {
            if (this.stencilService) {
                this.stencilService.setSize(Math.max(0.5, this.stencilService.size - 0.5));
            }
            return;
        }
    }
}