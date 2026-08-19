/**
 * 🔧 ScaleTool - Инструмент масштабирования
 * 
 * @version 3.0.0
 */
 import { Tool } from '../tools/Tool.js';

 export class ScaleTool extends Tool {
     constructor(editor) {
         super(editor);
         this.name = 'Scale';
         this.icon = '⬛';
         this.shortcut = '3';
         this.gizmoService = null;
         this.snapScale = 0.1;
         this.isDragging = false;
         this._gizmoListenerAdded = false;
     }
 
     onActivate() {
         console.log('🔧 Scale Tool activated');
         this.editor.getRenderer().domElement.style.cursor = 'pointer';
         
         if (!this.gizmoService) {
             this.gizmoService = this.editor.gizmoService;
         }
         if (!this.gizmoService) {
             console.error('❌ GizmoService not found');
             return;
         }
         
         this.gizmoService.setMode('scale');
         this.gizmoService.setScaleSnap(this.snapScale);
         
         if (!this._gizmoListenerAdded) {
             this.gizmoService.addListener((event, value) => {
                 if (event === 'dragging') {
                     if (value) {
                         this.isDragging = true;
                         this.editor.commandManager.beginGroup('scale');
                         console.log('📦 Scale group started');
                     } else {
                         this.isDragging = false;
                         this.editor.commandManager.endGroup();
                         console.log('📦 Scale group ended');
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
         console.log('🔧 Scale Tool deactivated');
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
             this.gizmoService?.setScaleSnap(this.snapScale);
         } else {
             this.gizmoService?.detach();
         }
     }
 
     setSnapScale(value) {
         this.snapScale = value;
         if (this.gizmoService) {
             this.gizmoService.setScaleSnap(value);
         }
     }
 }