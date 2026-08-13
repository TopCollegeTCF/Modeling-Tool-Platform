/**
 * 🔧 MoveTool - Инструмент перемещения
 *
 * @version 1.1.0
 * @author Gabryelf
 * @since 0.1.0
 */
 import { Tool } from './Tool.js';

 export class MoveTool extends Tool {
     constructor(editor) {
         super(editor);
         this.name = 'Move';
         this.icon = '✚';
         this.shortcut = '2';
         this.gizmoService = null;
         this.snapDistance = 0.1;
         this.isDragging = false;
         this.dragStartPosition = null;
         this.draggedEntity = null;
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
 
         // 🔥 Добавляем слушатель для записи в историю
         if (!this._gizmoListenerAdded) {
             this.gizmoService.addListener((event, value) => {
                 if (event === 'dragging') {
                     if (value) {
                         this.isDragging = true;
                         this.draggedEntity = this.editor.selectionManager.getSelected();
                         if (this.draggedEntity) {
                             this.dragStartPosition = this.draggedEntity.position.clone();
                             this.editor.historyManager.captureState('before_move');
                         }
                     } else {
                         this.isDragging = false;
                         if (this.draggedEntity && this.dragStartPosition) {
                             const currentPos = this.draggedEntity.position;
                             const distance = this.dragStartPosition.distanceTo(currentPos);
                             if (distance > 0.001) {
                                 this.editor.historyManager.push('move');
                                 console.log(`📝 Move recorded: ${distance.toFixed(3)} units`);
                             }
                         }
                         this.dragStartPosition = null;
                         this.draggedEntity = null;
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
         if (this.gizmoService) {
             this.gizmoService.detach();
         }
         this.editor.getRenderer().domElement.style.cursor = 'default';
         this.isDragging = false;
         this.dragStartPosition = null;
         this.draggedEntity = null;
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