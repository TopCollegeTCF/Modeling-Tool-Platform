/**
 * 🔧 MoveTool - Инструмент перемещения
 * 
 * @version 3.0.0
 */
 import { Tool } from '../tools/Tool.js';

 export class MoveTool extends Tool {
     constructor(editor) {
         super(editor);
         this.name = 'Move';
         this.icon = '✚';
         this.shortcut = '2';
         this.gizmoService = null;
         this.snapDistance = 0.1;
         this.isDragging = false;
         this._gizmoListenerAdded = false;
     }
 
     onActivate() {
         console.log('🔧 Move Tool activated');
         this.editor.getRenderer().domElement.style.cursor = 'move';
         
         if (!this.gizmoService) {
             this.gizmoService = this.editor.gizmoService;
         }
         if (!this.gizmoService) {
             console.error('❌ GizmoService not found');
             return;
         }
         
         this.gizmoService.setMode('translate');
         this.gizmoService.setTranslationSnap(this.snapDistance);
         
         if (!this._gizmoListenerAdded) {
             this.gizmoService.addListener((event, value) => {
                 if (event === 'dragging') {
                     if (value) {
                         // Начало перетаскивания
                         this.isDragging = true;
                         this.editor.commandManager.beginGroup('move');
                         console.log('📦 Move group started');
                     } else {
                         // Конец перетаскивания
                         this.isDragging = false;
                         this.editor.commandManager.endGroup();
                         console.log('📦 Move group ended');
                     }
                 }
             });
             this._gizmoListenerAdded = true;
         }
         
         const selected = this.editor.selectionManager.getSelected();
         if (selected) {
             this.gizmoService.attach(selected);
         } else {
             this.gizmoService.detach();
         }
     }
 
     onDeactivate() {
         console.log('🔧 Move Tool deactivated');
         if (this._gizmoListenerAdded) {
             // Не удаляем слушатель, чтобы не создавать новый при каждой активации
         }
         if (this.gizmoService) {
             this.gizmoService.detach();
         }
         this.editor.getRenderer().domElement.style.cursor = 'default';
         this.isDragging = false;
     }
 
     onUpdate() {
         if (this.gizmoService) {
             this.gizmoService.update();
         }
     }
 
     onSelectionChanged(entity) {
         if (!this.isActive) return;
         if (entity) {
             this.gizmoService?.attach(entity);
             this.gizmoService?.setTranslationSnap(this.snapDistance);
         } else {
             this.gizmoService?.detach();
         }
     }
 
     setSnapDistance(value) {
         this.snapDistance = value;
         if (this.gizmoService) {
             this.gizmoService.setTranslationSnap(value);
         }
     }
 }