/**
 * 🎨 StencilService - Сервис для работы с трафаретами
 *
 * 📋 ОПИСАНИЕ:
 * Обрезает нижнюю часть объекта по форме трафарета
 * Фигура начинается строго от уровня трафарета
 * Верхняя часть сохраняет оригинальную форму
 *
 * @version 7.0.0
 */
import * as THREE from 'three';

export const STENCIL_SHAPES = {
    SQUARE: 'square',
    CIRCLE: 'circle',
    TRIANGLE: 'triangle',
    HEXAGON: 'hexagon',
    OCTAGON: 'octagon',
    STAR: 'star'
};

export class StencilService {
    constructor(editor) {
        this.editor = editor;
        this.isActive = false;
        this.shape = STENCIL_SHAPES.CIRCLE;
        this.size = 1.0;
        this.color = 0x4a9eff;
        this.opacity = 0.3;
        this.position = new THREE.Vector3(0, 0, 0);

        this.stencilMesh = null;
        this.stencilHelper = null;
        this._scene = null;
        this._isInitialized = false;

        // Параметры форм - радиус = size/2 для всех
        this.shapeParams = {
            square: { sides: 4, angleOffset: Math.PI / 4 },
            circle: { sides: 32, angleOffset: 0 },
            triangle: { sides: 3, angleOffset: -Math.PI / 2 },
            hexagon: { sides: 6, angleOffset: 0 },
            octagon: { sides: 8, angleOffset: 0 },
            star: { sides: 5, innerRadius: 0.4, angleOffset: -Math.PI / 2 },
        };

        this.listeners = [];
    }

    init(scene) {
        this._scene = scene;
        this._isInitialized = true;
        if (!this._scene) {
            console.warn('⚠️ StencilService: Scene not available');
            return;
        }
        this.createStencil();
        this.hide();
        console.log('🎨 StencilService v7.0 initialized');
    }

    isReady() {
        return this._isInitialized && this._scene !== null;
    }

    createStencil() {
        if (!this.isReady()) return;
        if (this.stencilMesh) {
            this._scene.remove(this.stencilMesh);
            this.stencilMesh.geometry.dispose();
            this.stencilMesh.material.dispose();
            this.stencilMesh = null;
        }

        const geometry = this.createStencilGeometry();
        const material = new THREE.MeshBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: this.opacity,
            side: THREE.DoubleSide,
            depthWrite: false,
        });

        this.stencilMesh = new THREE.Mesh(geometry, material);
        this.stencilMesh.position.copy(this.position);
        this.stencilMesh.rotation.x = -Math.PI / 2;
        this.stencilMesh.userData.isStencil = true;
        this.stencilMesh.userData.isHelper = true;

        this.createStencilHelper();
        this._scene.add(this.stencilMesh);
    }

    createStencilGeometry() {
        const params = this.shapeParams[this.shape];
        if (!params) {
            return new THREE.PlaneGeometry(this.size, this.size);
        }

        const radius = this.size / 2;
        const sides = params.sides;
        const angleOffset = params.angleOffset || 0;
        const isStar = this.shape === STENCIL_SHAPES.STAR;
        const innerRadius = params.innerRadius || radius * 0.4;

        // Для круга используем CircleGeometry
        if (this.shape === STENCIL_SHAPES.CIRCLE) {
            return new THREE.CircleGeometry(radius, sides);
        }

        // Для квадрата используем PlaneGeometry
        if (this.shape === STENCIL_SHAPES.SQUARE) {
            return new THREE.PlaneGeometry(this.size, this.size);
        }

        // Для остальных многоугольников строим вручную
        const vertices = [];
        const indices = [];
        const normals = [];
        const uvs = [];

        // Центральная точка
        vertices.push(0, 0, 0);
        normals.push(0, 0, 1);
        uvs.push(0.5, 0.5);

        // Вершины многоугольника
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2 + angleOffset;
            let r = radius;
            if (isStar) {
                r = i % 2 === 0 ? radius : innerRadius;
            }
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            vertices.push(x, y, 0);
            normals.push(0, 0, 1);
            uvs.push(x / this.size + 0.5, y / this.size + 0.5);
        }

        // Индексы треугольников (веер из центра)
        for (let i = 0; i < sides; i++) {
            const next = (i + 1) % sides;
            indices.push(0, i + 1, next + 1);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        return geometry;
    }

    createStencilHelper() {
        if (!this.isReady()) return;
        if (this.stencilHelper) {
            this._scene.remove(this.stencilHelper);
            this.stencilHelper.geometry.dispose();
            this.stencilHelper.material.dispose();
            this.stencilHelper = null;
        }

        const points = this.getShapePoints();
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: 0.8,
            linewidth: 2,
        });

        this.stencilHelper = new THREE.Line(geometry, material);
        this.stencilHelper.position.copy(this.position);
        this.stencilHelper.rotation.x = -Math.PI / 2;
        this.stencilHelper.userData.isStencilHelper = true;
        this.stencilHelper.userData.isHelper = true;
        this._scene.add(this.stencilHelper);
    }

    getShapePoints() {
        const params = this.shapeParams[this.shape];
        if (!params) {
            const half = this.size / 2;
            return [
                new THREE.Vector3(-half, -half, 0),
                new THREE.Vector3(half, -half, 0),
                new THREE.Vector3(half, half, 0),
                new THREE.Vector3(-half, half, 0),
                new THREE.Vector3(-half, -half, 0),
            ];
        }

        const radius = this.size / 2;
        const sides = params.sides;
        const angleOffset = params.angleOffset || 0;
        const isStar = this.shape === STENCIL_SHAPES.STAR;
        const innerRadius = params.innerRadius || radius * 0.4;
        const points = [];
        const segments = this.shape === STENCIL_SHAPES.CIRCLE ? 32 : sides;

        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2 + angleOffset;
            let r = radius;
            if (isStar) {
                const idx = i % sides;
                r = idx % 2 === 0 ? radius : innerRadius;
            }
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            points.push(new THREE.Vector3(x, y, 0));
        }
        return points;
    }

    /**
     * Применяет трафарет: обрезает нижнюю часть от уровня трафарета
     */
    applyStencil(entity) {
        if (!entity || !this.isActive || !this.isReady()) return null;

        console.log(`🎨 Applying stencil to ${entity.userData.name} (shape: ${this.shape}, size: ${this.size})`);

        const points = this.getShapePoints();
        const clone = this.cloneEntity(entity);
        if (!clone) return null;

        this.applyStencilCut(clone, points);
        this.editor.commandManager.push('stencilApply');

        console.log(`✅ Stencil applied: ${entity.userData.name} → ${clone.userData.name}`);
        return clone;
    }

    cloneEntity(entity) {
        const type = entity.userData.type;
        const color = entity.material.color ? entity.material.color.getHex() : 0x4a9eff;
        const opacity = entity.material.opacity || 1;
        const transparent = entity.material.transparent || false;
        const materialType = entity.userData.materialType || 'standard';
        const texture = entity.userData.texture || null;
        const name = `${entity.userData.name || type} (${this.shape})`;

        let clone = null;
        const pos = entity.position.clone();
        const rot = entity.rotation.clone();
        const scale = entity.scale.clone();

        switch (type) {
            case 'cube':
                clone = this.editor.addCube({
                    color: color,
                    width: entity._width || 1,
                    height: entity._height || 1,
                    depth: entity._depth || 1,
                    segments: Math.max(entity._segments || 1, 4),
                    name: name,
                    transparent: transparent,
                    opacity: opacity,
                });
                break;
            case 'sphere':
                clone = this.editor.addSphere({
                    color: color,
                    radius: entity._radius || 0.5,
                    widthSegments: Math.max(entity._widthSegments || 32, 32),
                    heightSegments: Math.max(entity._heightSegments || 32, 32),
                    name: name,
                    transparent: transparent,
                    opacity: opacity,
                });
                break;
            case 'cylinder':
                clone = this.editor.addCylinder({
                    color: color,
                    radiusTop: entity._radiusTop || 0.5,
                    radiusBottom: entity._radiusBottom || 0.5,
                    height: entity._height || 1,
                    radialSegments: Math.max(entity._radialSegments || 32, 32),
                    heightSegments: Math.max(entity._heightSegments || 1, 4),
                    openEnded: entity._openEnded || false,
                    name: name,
                    transparent: transparent,
                    opacity: opacity,
                });
                break;
            default:
                console.warn('⚠️ Unknown entity type for cloning:', type);
                return null;
        }

        if (clone) {
            clone.position.copy(pos);
            clone.rotation.copy(rot);
            clone.scale.copy(scale);
            if (clone.material && entity.material) {
                clone.material.color.copy(entity.material.color);
                clone.material.opacity = entity.material.opacity;
                clone.material.transparent = entity.material.transparent;
                clone.material.roughness = entity.material.roughness || 0.3;
                clone.material.metalness = entity.material.metalness || 0.1;
                clone.material.needsUpdate = true;
            }
            if (materialType) clone.userData.materialType = materialType;
            if (texture) clone.userData.texture = texture;
        }
        return clone;
    }

    /**
 * Применяет трафарет: обрезает нижнюю часть от уровня трафарета
 */
    applyStencilCut(entity, points) {
        const geometry = entity.geometry;
        const position = geometry.attributes.position;
        if (!position) return;

        const positions = position.array.slice();
        const vertexCount = positions.length / 3;

        // Находим границы объекта
        let minY = Infinity;
        let maxY = -Infinity;

        for (let i = 0; i < vertexCount; i++) {
            const idx = i * 3;
            const y = positions[idx + 1];
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }

        const heightRange = maxY - minY;
        if (heightRange < 0.001) return;

        const normalizedPoints = this.normalizePoints(points);
        const stencilRadius = this.size / 2;
        const stencilY = this.position.y;

        const newPositions = [];

        for (let i = 0; i < vertexCount; i++) {
            const idx = i * 3;
            const x = positions[idx];
            const y = positions[idx + 1];
            const z = positions[idx + 2];

            const normalizedY = (y - minY) / heightRange;
            const angle = Math.atan2(z, x);
            const currentRadius = Math.sqrt(x * x + z * z);

            const boundary = this.getBoundaryAtAngle(normalizedPoints, angle);
            const targetRadius = boundary * stencilRadius;

            let newX, newY, newZ;

            if (normalizedY < 0.5) {
                const progress = normalizedY / 0.5;
                const t = progress * progress * (3 - 2 * progress);

                const newRadius = targetRadius + (currentRadius - targetRadius) * t;
                const scale = currentRadius > 0.001 ? newRadius / currentRadius : 1;

                newX = x * scale;
                newZ = z * scale;

                const yProgress = progress;
                const yEase = yProgress * yProgress;
                newY = stencilY + (y - minY) * yEase;

                if (progress < 0.05) {
                    newY = stencilY;
                }
            } else {
                const yOffset = stencilY - minY;
                newX = x;
                newY = y + yOffset;
                newZ = z;
            }

            newPositions.push(newX, newY, newZ);
        }

        // Обновляем геометрию
        position.array = new Float32Array(newPositions);
        position.needsUpdate = true;
        geometry.computeVertexNormals();

        // Обновляем позицию объекта на уровне трафарета
        entity.position.y = 0;

        // УСТАНАВЛИВАЕМ ВСЕ ФЛАГИ ДЛЯ СОХРАНЕНИЯ
        entity.userData.stencilApplied = true;
        entity.userData.stencilShape = this.shape;
        entity.userData.stencilSize = this.size;
        entity.userData.geometryModified = true; // Важно для сериализации

        console.log(`📐 Stencil applied: ${entity.userData.name}, shape: ${this.shape}, size: ${this.size}`);
    }

    normalizePoints(points) {
        if (points.length === 0) return points;
        const center = new THREE.Vector3(0, 0, 0);
        for (const p of points) {
            center.x += p.x;
            center.y += p.y;
        }
        center.x /= points.length;
        center.y /= points.length;
        return points.map(p => new THREE.Vector3(
            p.x - center.x,
            p.y - center.y,
            0
        ));
    }

    getBoundaryAtAngle(points, angle) {
        if (points.length < 2) return 1;
        const dir = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0);
        let maxDist = 0;

        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const intersection = this.raySegmentIntersection(
                new THREE.Vector3(0, 0, 0), dir, p1, p2
            );
            if (intersection) {
                const dist = intersection.length();
                if (dist > maxDist) maxDist = dist;
            }
        }

        // Проверяем замыкающую линию
        const intersection = this.raySegmentIntersection(
            new THREE.Vector3(0, 0, 0), dir,
            points[points.length - 1], points[0]
        );
        if (intersection) {
            const dist = intersection.length();
            if (dist > maxDist) maxDist = dist;
        }

        return maxDist > 0.001 ? maxDist : 1;
    }

    raySegmentIntersection(origin, direction, p1, p2) {
        const d = new THREE.Vector3().copy(p2).sub(p1);
        const n = new THREE.Vector3(-d.y, d.x, 0);
        n.normalize();
        const denom = direction.dot(n);
        if (Math.abs(denom) < 0.0001) return null;
        const t = p1.clone().sub(origin).dot(n) / denom;
        if (t < 0) return null;
        const point = origin.clone().add(direction.clone().multiplyScalar(t));

        // Проверяем, что точка на отрезке
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 0.0001) return null;

        const t1 = ((point.x - p1.x) * dx + (point.y - p1.y) * dy) / (len * len);
        if (t1 >= 0 && t1 <= 1) {
            return point;
        }
        return null;
    }

    show() {
        if (!this.isReady()) return;
        if (this.stencilMesh) this.stencilMesh.visible = true;
        if (this.stencilHelper) this.stencilHelper.visible = true;
        this.isActive = true;
        this.notifyListeners('show');
    }

    hide() {
        if (this.stencilMesh) this.stencilMesh.visible = false;
        if (this.stencilHelper) this.stencilHelper.visible = false;
        this.isActive = false;
        this.notifyListeners('hide');
    }

    toggle() {
        this.isActive ? this.hide() : this.show();
    }

    update() {
        if (!this.isReady()) return;
        this.createStencil();
        if (this.isActive) this.show();
        else this.hide();
        this.notifyListeners('update');
    }

    setShape(shape) {
        if (this.shape === shape) return;
        this.shape = shape;
        this.update();
        console.log(`🎨 Stencil shape: ${shape}`);
    }

    setSize(size) {
        this.size = Math.max(0.2, Math.min(5, size));
        this.update();
    }

    setPosition(position) {
        this.position.copy(position);
        if (this.stencilMesh) this.stencilMesh.position.copy(position);
        if (this.stencilHelper) this.stencilHelper.position.copy(position);
    }

    setColor(color) {
        this.color = color;
        if (this.stencilMesh) this.stencilMesh.material.color.setHex(color);
        if (this.stencilHelper) this.stencilHelper.material.color.setHex(color);
    }

    setOpacity(opacity) {
        this.opacity = Math.max(0, Math.min(1, opacity));
        if (this.stencilMesh) this.stencilMesh.material.opacity = this.opacity;
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    notifyListeners(event, data) {
        this.listeners.forEach(cb => cb(event, data));
    }

    dispose() {
        if (this.stencilMesh) {
            this._scene.remove(this.stencilMesh);
            this.stencilMesh.geometry.dispose();
            this.stencilMesh.material.dispose();
            this.stencilMesh = null;
        }
        if (this.stencilHelper) {
            this._scene.remove(this.stencilHelper);
            this.stencilHelper.geometry.dispose();
            this.stencilHelper.material.dispose();
            this.stencilHelper = null;
        }
    }
}