import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

export class GizmoService {
    constructor(editor) {
        this.editor = editor;
        this.gizmo = null;
        this.mode = 'translate';
        this.isActive = false;
        this.selectedEntity = null;
        this.listeners = [];
    }

    init(camera, renderer) {
        this.gizmo = new TransformControls(camera, renderer.domElement);
        this.gizmo.setSize(0.8);
        this.gizmo.space = 'world';
        
        // этот инструмент нужно встроить позже
        // this.gizmo.setColors({ x: 0xff4444, y: 0x44ff44, z: 0x4444ff });
        
        // Вместо этого пока настроим внешний вид через CSS или оставить стандартный

        // События Gizmo
        this.gizmo.addEventListener('dragging-changed', (event) => {
            this.isActive = event.value;
            this.notifyListeners('dragging', event.value);
            
            if (!event.value) {
                // Обновляем UI после завершения трансформации
                this.editor.uiManager.updateUI();
            }
        });

        // Подписываемся на изменения объекта
        this.gizmo.addEventListener('objectChange', () => {
            this.editor.uiManager.updateUI();
        });

        console.log('✅ GizmoService initialized');
    }

    attach(entity) {
        if (!entity) {
            this.detach();
            return;
        }
        
        this.selectedEntity = entity;
        this.gizmo.attach(entity);
        this.gizmo.visible = true;
        this.isActive = true;
        console.log('🔗 Gizmo attached to:', entity.userData.name);
    }

    detach() {
        this.gizmo.detach();
        this.gizmo.visible = false;
        this.selectedEntity = null;
        this.isActive = false;
    }

    setMode(mode) {
        if (!this.gizmo) return;
        this.mode = mode;
        this.gizmo.setMode(mode);
        console.log('🎯 Gizmo mode:', mode);
    }

    setSpace(space) {
        if (!this.gizmo) return;
        this.gizmo.space = space;
    }

    setSize(size) {
        if (!this.gizmo) return;
        this.gizmo.setSize(size);
    }

    // Добавляем поддержку привязки (snap)
    setTranslationSnap(snap) {
        if (!this.gizmo) return;
        this.gizmo.setTranslationSnap(snap);
    }

    setRotationSnap(snap) {
        if (!this.gizmo) return;
        this.gizmo.setRotationSnap(snap);
    }

    setScaleSnap(snap) {
        if (!this.gizmo) return;
        this.gizmo.setScaleSnap(snap);
    }

    update() {
        if (this.gizmo) {
            this.gizmo.updateMatrixWorld();
        }
    }

    getGizmo() {
        return this.gizmo;
    }

    isActive() {
        return this.isActive;
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    notifyListeners(event, value) {
        this.listeners.forEach(cb => cb(event, value));
    }

    dispose() {
        if (this.gizmo) {
            this.gizmo.dispose();
        }
    }
}