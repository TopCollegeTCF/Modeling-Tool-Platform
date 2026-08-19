/**
 * 🔧 RotateTool - Инструмент вращения
 * 
 * @version 3.0.0
 */
 import { Tool } from '../tools/Tool.js';

 export class RotateTool extends Tool {
     constructor(editor) {
         super(editor);
         this.name = 'Rotate';
         this.icon = '🔄';
         this.shortcut = '4';
         this.gizmoService = null;
         this.snapAngle = Math.PI / 8;
         this.isDragging = false;
         this._gizmoListenerAdded = false;
     }
 
     onActivate() {
         console.log('🔧 Rotate Tool activated');
         this.editor.getRenderer().domElement.style.cursor = 'pointer';
         
         if (!this.gizmoService) {
             this.gizmoService = this.editor.gizmoService;
         }
         if (!this.gizmoService) {
             console.error('❌ GizmoService not found');
             return;
         }
         
         this.gizmoService.setMode('rotate');
         this.gizmoService.setRotationSnap(this.snapAngle);
         
         if (!this._gizmoListenerAdded) {
             this.gizmoService.addListener((event, value) => {
                 if (event === 'dragging') {
                     if (value) {
                         this.isDragging = true;
                         this.editor.commandManager.beginGroup('rotate');
                         console.log('🔄 Rotate group started');
                     } else {
                         this.isDragging = false;
                         this.editor.commandManager.endGroup();
                         console.log('🔄 Rotate group ended');
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
         console.log('🔧 Rotate Tool deactivated');
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
             this.gizmoService?.setRotationSnap(this.snapAngle);
         } else {
             this.gizmoService?.detach();
         }
     }
 
     setSnapAngle(degrees) {
         this.snapAngle = degrees * Math.PI / 180;
         if (this.gizmoService) {
             this.gizmoService.setRotationSnap(this.snapAngle);
         }
     }
 }