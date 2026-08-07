import { Tool } from './Tool.js';
import * as THREE from 'three';

export class FaceEditTool extends Tool {
    constructor(editor) {
        super(editor);
        this.name = 'Face Edit';
        this.icon = '▦';
        this.shortcut = '5';
        
        this.isDragging = false;
        this.isHovering = false;
        this.selectedFace = null;
        this.hoveredFace = null;
        this.startPoint = new THREE.Vector3();
        this.startPosition = new THREE.Vector3();
        
        this.editMode = 'extrude';
        
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.faceHelpers = [];
        this.highlightMesh = null;
        this.faceData = [];
        this.extrudeDirection = new THREE.Vector3();
        
        this.snapDistance = 0.05;
        this.extrudeDistance = 0;
        
        // Флаг для отладки
        this.debug = true;
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

        console.log('📐 Showing face helpers for:', selected.userData.name);

        if (!this.supportsFaceEditing(selected)) {
            console.warn('⚠️ Object does not support face editing:', selected.userData.type);
            this.hideFaceHelpers();
            return;
        }

        this.hideFaceHelpers();
        this.faceData = this.extractFaces(selected);
        console.log(`📐 Extracted ${this.faceData.length} faces`);

        this.faceData.forEach((face, index) => {
            const helper = this.createFaceHelper(face, index);
            this.faceHelpers.push(helper);
            this.editor.getScene().add(helper);
        });

        this.showWireframe(selected);
    }

    supportsFaceEditing(entity) {
        const supported = entity.type === 'cube' || 
                         entity.userData.type === 'cube' ||
                         entity.geometry.type === 'BoxGeometry';
        
        if (this.debug) {
            console.log(`🔍 Checking face editing support for ${entity.userData.name}:`, {
                type: entity.type,
                userDataType: entity.userData.type,
                geometryType: entity.geometry.type,
                supported: supported
            });
        }
        
        return supported;
    }

    extractFaces(entity) {
        const geometry = entity.geometry;
        const position = geometry.getAttribute('position');
        const faces = [];
        
        if (!position) {
            console.warn('⚠️ No position attribute found');
            return faces;
        }

        const vertexCount = position.count;
        const faceGroupSize = 6;

        for (let i = 0; i < vertexCount; i += faceGroupSize) {
            const vertices = [];
            
            for (let j = 0; j < faceGroupSize; j++) {
                const idx = i + j;
                if (idx >= vertexCount) break;
                
                const x = position.getX(idx);
                const y = position.getY(idx);
                const z = position.getZ(idx);
                vertices.push(new THREE.Vector3(x, y, z));
            }
            
            if (vertices.length < 6) continue;
            
            const center = new THREE.Vector3();
            vertices.forEach(v => center.add(v));
            center.divideScalar(vertices.length);
            
            const normal = new THREE.Vector3();
            const a = vertices[0];
            const b = vertices[1];
            const c = vertices[2];
            const edge1 = new THREE.Vector3().copy(b).sub(a);
            const edge2 = new THREE.Vector3().copy(c).sub(a);
            normal.crossVectors(edge1, edge2).normalize();
            
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
        
        if (this.debug) {
            console.log(`📐 Extracted ${faces.length} faces from geometry`);
        }
        
        return faces;
    }

    createFaceHelper(face, index) {
        const size = 0.15;
        const group = new THREE.Group();
        
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
        
        group.position.copy(face.center);
        
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, face.normal);
        group.quaternion.copy(quaternion);
        
        group.userData.faceIndex = index;
        group.userData.faceData = face;
        group.userData.type = 'face-helper';
        group.userData.isSelectable = true;
        
        return group;
    }

    showWireframe(entity) {
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
        let object = intersect.object;
        
        while (object) {
            if (object.userData && object.userData.type === 'face-helper') {
                const faceData = this.faceData[object.userData.faceIndex];
                if (this.debug) {
                    console.log('🎯 Found face helper:', object.userData.faceIndex);
                }
                return faceData;
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
        console.log('🖱️ FaceEditTool: onMouseDown');
        
        const renderer = this.editor.getRenderer();
        const camera = this.editor.getCamera();
        const rect = renderer.domElement.getBoundingClientRect();
        
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, camera);
        
        // Проверяем попадание в хелперы граней
        const intersects = this.raycaster.intersectObjects(this.faceHelpers, true);
        
        if (this.debug) {
            console.log(`🔍 Raycast hit ${intersects.length} objects`);
        }
        
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
                this.editor.getRenderer().domElement.style.cursor = 'grabbing';
                
                console.log('🎯 Face selected:', face.index);
                return;
            }
        }
        
        this.selectedFace = null;
        this.clearHighlight();
        console.log('❌ No face selected');
    }

    onMouseMove(event) {
        const renderer = this.editor.getRenderer();
        const camera = this.editor.getCamera();
        const rect = renderer.domElement.getBoundingClientRect();
        
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, camera);
        const intersects = this.raycaster.intersectObjects(this.faceHelpers, true);
        
        if (intersects.length > 0 && !this.isDragging) {
            const face = this.getFaceFromIntersect(intersects[0]);
            if (face && face !== this.hoveredFace) {
                this.hoveredFace = face;
                this.editor.getRenderer().domElement.style.cursor = 'pointer';
                this.highlightFace(face);
            }
        } else if (!this.isDragging) {
            this.hoveredFace = null;
            this.editor.getRenderer().domElement.style.cursor = 'default';
            if (!this.selectedFace) {
                this.clearHighlight();
            }
        }
        
        if (this.isDragging && this.selectedFace) {
            const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
            const point = new THREE.Vector3();
            this.raycaster.ray.intersectPlane(plane, point);
            
            if (point) {
                const delta = point.y - this.startPoint.y;
                const extrusion = delta * 0.1;
                const maxExtrusion = 0.5;
                const clampedExtrusion = Math.max(-maxExtrusion, Math.min(maxExtrusion, extrusion));
                this.extrudeDistance = clampedExtrusion;
                
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
            console.log(`📐 Applying face edit: extrusion = ${this.extrudeDistance.toFixed(2)}`);
            this.applyFaceEdit(this.selectedFace, this.extrudeDistance);
            
            this.isDragging = false;
            this.selectedFace = null;
            this.editor.getRenderer().domElement.style.cursor = 'default';
            
            this.showFaceHelpers();
            this.editor.uiManager.updateUI();
        }
    }

    applyFaceEdit(face, distance) {
        if (Math.abs(distance) < 0.01) return;
        
        const object = face.object;
        const geometry = object.geometry;
        const position = geometry.getAttribute('position');
        
        const vertexIndices = [];
        const epsilon = 0.001;
        
        for (let i = 0; i < position.count; i++) {
            const v = new THREE.Vector3(
                position.getX(i),
                position.getY(i),
                position.getZ(i)
            );
            
            for (const vertex of face.vertices) {
                if (v.distanceTo(vertex) < epsilon) {
                    vertexIndices.push(i);
                    break;
                }
            }
        }
        
        const offset = face.normal.clone().multiplyScalar(distance);
        
        vertexIndices.forEach(idx => {
            const x = position.getX(idx) + offset.x;
            const y = position.getY(idx) + offset.y;
            const z = position.getZ(idx) + offset.z;
            position.setXYZ(idx, x, y, z);
        });
        
        position.needsUpdate = true;
        geometry.computeVertexNormals();
        
        console.log(`📐 Face edited: extrusion = ${distance.toFixed(2)}, ${vertexIndices.length} vertices moved`);
    }

    onUpdate() {
        // Ничего не делаем, обновление происходит через события
    }
}