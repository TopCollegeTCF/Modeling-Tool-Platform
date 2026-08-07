import { Tool } from './Tool.js';
import * as THREE from 'three';

export class FaceEditTool extends Tool {
    constructor(editor) {
        super(editor);
        this.name = 'Face Edit';
        this.icon = '▦';
        this.shortcut = '5';
        
        // Состояние
        this.isDragging = false;
        this.isHovering = false;
        this.selectedFace = null;
        this.hoveredFace = null;
        this.startPoint = new THREE.Vector3();
        this.startPosition = new THREE.Vector3();
        
        // Режимы редактирования
        this.editMode = 'extrude'; // 'extrude' | 'inset' | 'move'
        
        // Трехмерные объекты
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.faceHelpers = [];
        this.highlightMesh = null;
        this.faceData = [];
        this.extrudeDirection = new THREE.Vector3();
        
        // Настройки
        this.snapDistance = 0.05;
        this.extrudeDistance = 0;
    }

    onActivate() {
        console.log('🔧 Face Edit Tool activated');
        this.editor.getRenderer().domElement.style.cursor = 'pointer';
        this.showFaceHelpers();
        
        // Подписываемся на изменения выделения
        this.editor.selectionManager.addListener(() => {
            if (this.isActive) {
                this.showFaceHelpers();
            }
        });
    }

    onDeactivate() {
        console.log('🔧 Face Edit Tool deactivated');
        this.hideFaceHelpers();
        this.clearHighlight();
        this.editor.getRenderer().domElement.style.cursor = 'default';
    }

    showFaceHelpers() {
        const selected = this.editor.selectionManager.getSelected();
        if (!selected) {
            this.hideFaceHelpers();
            return;
        }

        // Проверяем, поддерживает ли объект редактирование граней
        if (!this.supportsFaceEditing(selected)) {
            this.hideFaceHelpers();
            return;
        }

        this.hideFaceHelpers();
        this.faceData = this.extractFaces(selected);
        
        // Создаем хелперы для каждой грани
        this.faceData.forEach((face, index) => {
            const helper = this.createFaceHelper(face, index);
            this.faceHelpers.push(helper);
            this.editor.getScene().add(helper);
        });

        // Добавляем сетку на объект для визуализации полигонов
        this.showWireframe(selected);
    }

    supportsFaceEditing(entity) {
        // Поддерживаем кубы и подобные объекты с плоскими гранями
        return entity.type === 'cube' || 
               entity.userData.type === 'cube' ||
               entity.geometry.type === 'BoxGeometry';
    }

    extractFaces(entity) {
        const geometry = entity.geometry;
        const position = geometry.getAttribute('position');
        const faces = [];
        
        // Для BoxGeometry используем грани по 2 треугольника на грань
        const vertexCount = position.count;
        const faceGroupSize = 6; // 2 треугольника * 3 вершины
        
        for (let i = 0; i < vertexCount; i += faceGroupSize) {
            const vertices = [];
            const normals = [];
            
            // Собираем вершины грани (2 треугольника)
            for (let j = 0; j < faceGroupSize; j++) {
                const idx = i + j;
                if (idx >= vertexCount) break;
                
                const x = position.getX(idx);
                const y = position.getY(idx);
                const z = position.getZ(idx);
                vertices.push(new THREE.Vector3(x, y, z));
            }
            
            if (vertices.length < 6) continue;
            
            // Вычисляем центр грани
            const center = new THREE.Vector3();
            vertices.forEach(v => center.add(v));
            center.divideScalar(vertices.length);
            
            // Вычисляем нормаль (средняя)
            const normal = new THREE.Vector3();
            // Берем первые 3 вершины для нормали
            const a = vertices[0];
            const b = vertices[1];
            const c = vertices[2];
            const edge1 = new THREE.Vector3().copy(b).sub(a);
            const edge2 = new THREE.Vector3().copy(c).sub(a);
            normal.crossVectors(edge1, edge2).normalize();
            
            // Определяем направление (внешняя или внутренняя нормаль)
            // Проверяем, смотрит ли нормаль от центра объекта
            const toCenter = new THREE.Vector3().copy(center).multiplyScalar(-1);
            if (normal.dot(toCenter) < 0) {
                normal.negate();
            }
            
            faces.push({
                index: Math.floor(i / faceGroupSize),
                vertices: vertices,
                center: center,
                normal: normal,
                object: entity
            });
        }
        
        return faces;
    }

    createFaceHelper(face, index) {
        const size = 0.15;
        const group = new THREE.Group();
        
        // Прозрачная плоскость для клика
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(size * 2, size * 2),
            new THREE.MeshBasicMaterial({
                color: 0x4a9eff,
                transparent: true,
                opacity: 0.1,
                side: THREE.DoubleSide,
                depthWrite: false
            })
        );
        
        // Рамка для визуализации
        const border = new THREE.Line(
            new THREE.EdgesGeometry(new THREE.PlaneGeometry(size * 2, size * 2)),
            new THREE.LineBasicMaterial({
                color: 0x4a9eff,
                transparent: true,
                opacity: 0.6
            })
        );
        
        group.add(plane);
        group.add(border);
        
        // Позиционируем на центре грани
        group.position.copy(face.center);
        
        // Ориентируем по нормали
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, face.normal);
        group.quaternion.copy(quaternion);
        
        group.userData.faceIndex = index;
        group.userData.faceData = face;
        group.userData.type = 'face-helper';
        
        // Делаем хелпер кликабельным
        group.userData.isSelectable = true;
        
        return group;
    }

    showWireframe(entity) {
        // Добавляем поверх сетку для визуализации полигонов
        if (this.wireframeMesh) {
            this.editor.getScene().remove(this.wireframeMesh);
            this.wireframeMesh.geometry.dispose();
            this.wireframeMesh.material.dispose();
        }
        
        const geometry = entity.geometry.clone();
        const material = new THREE.LineBasicMaterial({
            color: 0x4a9eff,
            transparent: true,
            opacity: 0.15,
        });
        
        const wireframe = new THREE.LineSegments(
            new THREE.WireframeGeometry(geometry),
            material
        );
        
        wireframe.position.copy(entity.position);
        wireframe.rotation.copy(entity.rotation);
        wireframe.scale.copy(entity.scale);
        
        this.wireframeMesh = wireframe;
        this.editor.getScene().add(wireframe);
    }

    hideFaceHelpers() {
        this.faceHelpers.forEach(helper => {
            this.editor.getScene().remove(helper);
        });
        this.faceHelpers = [];
        
        // Удаляем сетку
        if (this.wireframeMesh) {
            this.editor.getScene().remove(this.wireframeMesh);
            this.wireframeMesh.geometry.dispose();
            this.wireframeMesh.material.dispose();
            this.wireframeMesh = null;
        }
    }

    clearHighlight() {
        if (this.highlightMesh) {
            this.editor.getScene().remove(this.highlightMesh);
            this.highlightMesh.geometry.dispose();
            this.highlightMesh.material.dispose();
            this.highlightMesh = null;
        }
    }

    highlightFace(face) {
        this.clearHighlight();
        
        if (!face) return;
        
        // Создаем подсвеченную грань
        const geometry = new THREE.PlaneGeometry(0.5, 0.5);
        const material = new THREE.MeshBasicMaterial({
            color: 0x4a9eff,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        
        this.highlightMesh = new THREE.Mesh(geometry, material);
        this.highlightMesh.position.copy(face.center);
        
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, face.normal);
        this.highlightMesh.quaternion.copy(quaternion);
        
        this.editor.getScene().add(this.highlightMesh);
    }

    getFaceFromIntersect(intersect) {
        // Ищем хелпер в иерархии
        let object = intersect.object;
        let faceIndex = null;
        
        // Проходим вверх по иерархии
        while (object) {
            if (object.userData && object.userData.type === 'face-helper') {
                return this.faceData[object.userData.faceIndex];
            }
            if (object.parent) {
                object = object.parent;
            } else {
                break;
            }
        }
        
        return null;
    }

    onMouseDown(event) {
        const renderer = this.editor.getRenderer();
        const camera = this.editor.getCamera();
        const rect = renderer.domElement.getBoundingClientRect();
        
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, camera);
        
        // Проверяем попадание в хелперы граней
        const intersects = this.raycaster.intersectObjects(this.faceHelpers, true);
        
        if (intersects.length > 0) {
            const face = this.getFaceFromIntersect(intersects[0]);
            if (face) {
                this.selectedFace = face;
                this.isDragging = true;
                this.startPoint.copy(face.center);
                this.startPosition.copy(face.object.position);
                this.extrudeDirection.copy(face.normal);
                this.extrudeDistance = 0;
                
                this.highlightFace(face);
                
                // Меняем курсор
                this.editor.getRenderer().domElement.style.cursor = 'grabbing';
                
                console.log('🎯 Face selected:', face.index);
                return;
            }
        }
        
        // Сбрасываем выделение грани
        this.selectedFace = null;
        this.clearHighlight();
    }

    onMouseMove(event) {
        const renderer = this.editor.getRenderer();
        const camera = this.editor.getCamera();
        const rect = renderer.domElement.getBoundingClientRect();
        
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Обновляем ховер
        this.raycaster.setFromCamera(this.mouse, camera);
        const intersects = this.raycaster.intersectObjects(this.faceHelpers, true);
        
        if (intersects.length > 0 && !this.isDragging) {
            const face = this.getFaceFromIntersect(intersects[0]);
            if (face && face !== this.hoveredFace) {
                this.hoveredFace = face;
                this.editor.getRenderer().domElement.style.cursor = 'pointer';
                // Показываем подсветку при наведении
                this.highlightFace(face);
            }
        } else if (!this.isDragging) {
            this.hoveredFace = null;
            this.editor.getRenderer().domElement.style.cursor = 'default';
            if (!this.selectedFace) {
                this.clearHighlight();
            }
        }
        
        // Если перетаскиваем грань
        if (this.isDragging && this.selectedFace) {
            // Вычисляем смещение в направлении нормали
            const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
            const point = new THREE.Vector3();
            this.raycaster.ray.intersectPlane(plane, point);
            
            if (point) {
                const delta = point.y - this.startPoint.y;
                const extrusion = delta * 0.1;
                
                // Ограничиваем максимальное смещение
                const maxExtrusion = 0.5;
                const clampedExtrusion = Math.max(-maxExtrusion, Math.min(maxExtrusion, extrusion));
                
                this.extrudeDistance = clampedExtrusion;
                
                // Обновляем позицию подсветки
                if (this.highlightMesh) {
                    const newPos = this.selectedFace.center.clone().add(
                        this.selectedFace.normal.clone().multiplyScalar(clampedExtrusion)
                    );
                    this.highlightMesh.position.copy(newPos);
                }
            }
        }
    }

    onMouseUp(event) {
        if (this.isDragging && this.selectedFace) {
            // Применяем изменения к объекту
            this.applyFaceEdit(this.selectedFace, this.extrudeDistance);
            
            this.isDragging = false;
            this.selectedFace = null;
            this.editor.getRenderer().domElement.style.cursor = 'default';
            
            // Обновляем хелперы
            this.showFaceHelpers();
            this.editor.uiManager.updateUI();
        }
    }

    applyFaceEdit(face, distance) {
        if (Math.abs(distance) < 0.01) return;
        
        const object = face.object;
        const geometry = object.geometry;
        const position = geometry.getAttribute('position');
        
        // Находим вершины, принадлежащие этой грани
        const vertexIndices = [];
        const epsilon = 0.001;
        
        for (let i = 0; i < position.count; i++) {
            const v = new THREE.Vector3(
                position.getX(i),
                position.getY(i),
                position.getZ(i)
            );
            
            // Проверяем, лежит ли вершина на грани
            for (const vertex of face.vertices) {
                if (v.distanceTo(vertex) < epsilon) {
                    vertexIndices.push(i);
                    break;
                }
            }
        }
        
        // Перемещаем вершины в направлении нормали
        const offset = face.normal.clone().multiplyScalar(distance);
        
        vertexIndices.forEach(idx => {
            const x = position.getX(idx) + offset.x;
            const y = position.getY(idx) + offset.y;
            const z = position.getZ(idx) + offset.z;
            position.setXYZ(idx, x, y, z);
        });
        
        position.needsUpdate = true;
        geometry.computeVertexNormals();
        
        console.log(`📐 Face edited: extrusion = ${distance.toFixed(2)}`);
    }

    onUpdate() {
        // Ничего не делаем, обновление происходит через события
    }
}