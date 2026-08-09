import { Tool } from './Tool.js';
import * as THREE from 'three';

export class DuplicateTool extends Tool {
    constructor(editor) {
        super(editor);
        this.name = 'Duplicate';
        this.icon = '📋';
        this.shortcut = '5';
        this.offset = new THREE.Vector3(0.5, 0, 0.5);
        this.cloneCount = 0;
    }

    onActivate() {
        console.log('📋 Duplicate Tool activated');
        this.editor.getRenderer().domElement.style.cursor = 'crosshair';
        // Сбрасываем счетчик при активации
        this.cloneCount = 0;
    }

    onDeactivate() {
        this.editor.getRenderer().domElement.style.cursor = 'default';
    }

    onMouseDown(event) {
        const selected = this.editor.selectionManager.getSelected();
        if (!selected) {
            console.warn('⚠️ No object selected to duplicate');
            return;
        }

        // Создаем копию
        this.duplicateObject(selected);
    }

    duplicateObject(source) {
        // Получаем данные исходного объекта
        const type = source.userData.type;
        const color = source.material.color ? source.material.color.getHex() : 0x4a9eff;
        const opacity = source.material.opacity || 1;
        const transparent = source.material.transparent || false;
        const name = source.userData.name || type;
        
        let clone = null;
        
        // Создаем копию в зависимости от типа
        switch (type) {
            case 'cube':
                // Получаем размеры куба
                const width = source.geometry.parameters?.width || 1;
                const height = source.geometry.parameters?.height || 1;
                const depth = source.geometry.parameters?.depth || 1;
                
                clone = this.editor.addCube({
                    color: color,
                    width: width,
                    height: height,
                    depth: depth,
                    name: `${name} (copy ${this.cloneCount + 1})`
                });
                break;
                
            case 'sphere':
                const radius = source.geometry.parameters?.radius || 0.5;
                clone = this.editor.addSphere({
                    color: color,
                    radius: radius,
                    name: `${name} (copy ${this.cloneCount + 1})`
                });
                break;
                
            case 'cylinder':
                const radiusTop = source.geometry.parameters?.radiusTop || 0.5;
                const radiusBottom = source.geometry.parameters?.radiusBottom || 0.5;
                const heightCyl = source.geometry.parameters?.height || 1;
                clone = this.editor.addCylinder({
                    color: color,
                    radiusTop: radiusTop,
                    radiusBottom: radiusBottom,
                    height: heightCyl,
                    name: `${name} (copy ${this.cloneCount + 1})`
                });
                break;
                
            default:
                console.warn('⚠️ Unknown entity type for cloning:', type);
                return;
        }
        
        if (!clone) {
            console.warn('⚠️ Failed to create clone');
            return;
        }
        
        // Увеличиваем счетчик
        this.cloneCount++;
        
        // Копируем трансформации с небольшим смещением
        const offset = this.offset.clone();
        // Добавляем случайное смещение для естественности
        offset.x += (Math.random() - 0.5) * 0.2;
        offset.z += (Math.random() - 0.5) * 0.2;
        // Увеличиваем смещение с каждой копией
        offset.multiplyScalar(this.cloneCount);
        
        clone.position.copy(source.position).add(offset);
        clone.rotation.copy(source.rotation);
        clone.scale.copy(source.scale);
        
        // Копируем прозрачность
        if (clone.material) {
            clone.material.transparent = transparent;
            clone.material.opacity = opacity;
            clone.material.needsUpdate = true;
        }
        
        // Выделяем новую копию
        this.editor.selectionManager.select(clone);
        this.editor.uiManager.updateUI();
        
        console.log(`📋 Duplicated: ${source.userData.name} → ${clone.userData.name}`);
    }
}