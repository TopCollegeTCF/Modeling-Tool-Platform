/**
 * 🎨 StencilService - Сервис для работы с трафаретами
 *
 * 📋 ОПИСАНИЕ:
 * Позволяет создавать объекты, которые принимают форму трафарета
 * (выдавливание по контуру)
 *
 */
import * as THREE from 'three';

export const STENCIL_SHAPES = {
    SQUARE: 'square',
    CIRCLE: 'circle',
    TRIANGLE: 'triangle',
    HEXAGON: 'hexagon',
    OCTAGON: 'octagon',
    STAR: 'star',
    CUSTOM: 'custom'
};

export class StencilService {
    constructor(editor) {
        this.editor = editor;
        this.isActive = false;
        this.shape = STENCIL_SHAPES.SQUARE;
        this.size = 2;
        this.height = 0.5;
        this.offset = 0.1;
        this.color = 0x4a9eff;
        this.opacity = 0.3;
        this.position = new THREE.Vector3(0, 0, 0);

        // Визуализация трафарета
        this.stencilMesh = null;
        this.stencilHelper = null;
        this._scene = null;
        this._isInitialized = false;

        // Настройки формы
        this.shapeParams = {
            square: { sides: 4, radius: 1 },
            circle: { sides: 32, radius: 1 },
            triangle: { sides: 3, radius: 1 },
            hexagon: { sides: 6, radius: 1 },
            octagon: { sides: 8, radius: 1 },
            star: { sides: 5, radius: 1, innerRadius: 0.4 },
        };

        this.listeners = [];
    }

    init(scene) {
        this._scene = scene;
        this._isInitialized = true;

        // Проверяем, что сцена существует
        if (!this._scene) {
            console.warn('⚠️ StencilService: Scene not available, waiting...');
            return;
        }

        this.createStencil();
        this.hide();
        console.log('🎨 StencilService initialized');
    }

    /**
     * Проверяет, готов ли сервис к работе
     */
    isReady() {
        return this._isInitialized && this._scene !== null;
    }

    /**
     * Создает визуализацию трафарета
     */
    createStencil() {
        if (!this.isReady()) {
            console.warn('⚠️ StencilService not ready');
            return;
        }

        // Удаляем старый трафарет
        if (this.stencilMesh) {
            this._scene.remove(this.stencilMesh);
            this.stencilMesh.geometry.dispose();
            this.stencilMesh.material.dispose();
            this.stencilMesh = null;
        }

        // Создаем геометрию трафарета
        const geometry = this.createStencilGeometry();

        // Материал для трафарета (полупрозрачный)
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

        // Добавляем контур
        this.createStencilHelper();

        this._scene.add(this.stencilMesh);
    }

    /**
     * Создает геометрию трафарета
     */
    createStencilGeometry() {
        const params = this.shapeParams[this.shape];
        if (!params) {
            return new THREE.PlaneGeometry(this.size, this.size);
        }

        if (this.shape === STENCIL_SHAPES.SQUARE) {
            return new THREE.PlaneGeometry(this.size, this.size);
        }

        if (this.shape === STENCIL_SHAPES.CIRCLE) {
            const geometry = new THREE.CircleGeometry(this.size / 2, params.sides);
            return geometry;
        }

        // Многоугольники
        const radius = this.size / 2;
        const vertices = [];
        const indices = [];
        const normals = [];
        const uvs = [];

        const sides = params.sides;
        const isStar = this.shape === STENCIL_SHAPES.STAR;
        const innerRadius = params.innerRadius || radius * 0.4;

        // Центральная точка
        vertices.push(0, 0, 0);
        normals.push(0, 0, 1);
        uvs.push(0.5, 0.5);

        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
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

        // Индексы для треугольников
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

    /**
     * Создает вспомогательный контур трафарета
     */
    createStencilHelper() {
        if (!this.isReady()) return;

        // Удаляем старый хелпер
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

    /**
     * Получает точки контура трафарета
     */
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
        const isStar = this.shape === STENCIL_SHAPES.STAR;
        const innerRadius = params.innerRadius || radius * 0.4;
        const points = [];

        const segments = this.shape === STENCIL_SHAPES.CIRCLE ? 32 : sides;

        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2 - Math.PI / 2;
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
     * Применяет трафарет к объекту
     */
    applyStencil(entity) {
        if (!entity || !this.isActive || !this.isReady()) return null;

        const points = this.getShapePoints();
        const clone = this.cloneEntity(entity);
        if (!clone) return null;

        this.stencilGeometry(clone, points);
        this.editor.commandManager.push('stencilApply');

        console.log(`🎨 Stencil applied to ${entity.userData.name}`);
        return clone;
    }

    /**
     * Клонирует объект
     */
    cloneEntity(entity) {
        const type = entity.userData.type;
        const color = entity.material.color ? entity.material.color.getHex() : 0x4a9eff;
        const opacity = entity.material.opacity || 1;
        const transparent = entity.material.transparent || false;
        const name = `${entity.userData.name || type} (stencil)`;

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
                    name: name,
                    transparent: transparent,
                    opacity: opacity,
                });
                break;
            case 'sphere':
                clone = this.editor.addSphere({
                    color: color,
                    radius: entity._radius || 0.5,
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
                    name: name,
                    transparent: transparent,
                    opacity: opacity,
                });
                break;
            default:
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
                clone.material.needsUpdate = true;
            }
        }

        return clone;
    }

    /**
     * Изменяет геометрию объекта по форме трафарета
     */
    stencilGeometry(entity, points) {
        const geometry = entity.geometry;
        const position = geometry.attributes.position;

        if (!position) return;

        const positions = position.array.slice();
        const center = new THREE.Vector3(0, 0, 0);

        for (let i = 0; i < positions.length; i += 3) {
            center.x += positions[i];
            center.y += positions[i + 1];
            center.z += positions[i + 2];
        }
        const count = positions.length / 3;
        center.x /= count;
        center.y /= count;
        center.z /= count;

        const normalizedPoints = this.normalizePoints(points);

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i] - center.x;
            const y = positions[i + 1] - center.y;
            const z = positions[i + 2] - center.z;

            const angle = Math.atan2(y, x);
            const dist = Math.sqrt(x * x + y * y);
            const boundary = this.getBoundaryAtAngle(normalizedPoints, angle);

            if (boundary > 0.001 && dist > 0.001) {
                const scale = boundary / dist;
                const newX = x * scale;
                const newY = y * scale;

                positions[i] = newX + center.x;
                positions[i + 1] = newY + center.y;
            }
        }

        position.array = positions;
        position.needsUpdate = true;
        geometry.computeVertexNormals();
    }

    /**
     * Нормализует точки контура (центр в 0,0)
     */
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

    /**
     * Находит границу трафарета под заданным углом
     */
    getBoundaryAtAngle(points, angle) {
        if (points.length < 2) return 1;

        const dir = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0);
        let maxDist = 0;

        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];

            const intersection = this.raySegmentIntersection(
                new THREE.Vector3(0, 0, 0),
                dir,
                p1,
                p2
            );

            if (intersection) {
                const dist = intersection.length();
                if (dist > maxDist) {
                    maxDist = dist;
                }
            }
        }

        const intersection = this.raySegmentIntersection(
            new THREE.Vector3(0, 0, 0),
            dir,
            points[points.length - 1],
            points[0]
        );
        if (intersection) {
            const dist = intersection.length();
            if (dist > maxDist) {
                maxDist = dist;
            }
        }

        return maxDist > 0.001 ? maxDist : 1;
    }

    /**
     * Пересечение луча и отрезка
     */
    raySegmentIntersection(origin, direction, p1, p2) {
        const d = new THREE.Vector3().copy(p2).sub(p1);
        const n = new THREE.Vector3(-d.y, d.x, 0);
        n.normalize();

        const denom = direction.dot(n);
        if (Math.abs(denom) < 0.0001) return null;

        const t = p1.clone().sub(origin).dot(n) / denom;
        if (t < 0) return null;

        const point = origin.clone().add(direction.clone().multiplyScalar(t));
        const t1 = (point.x - p1.x) / (p2.x - p1.x + 0.0001);
        const t2 = (point.y - p1.y) / (p2.y - p1.y + 0.0001);

        if (isNaN(t1) && isNaN(t2)) {
            const tCheck = (point.y - p1.y) / (p2.y - p1.y + 0.0001);
            if (tCheck >= 0 && tCheck <= 1) return point;
            return null;
        }

        const tCheck = isFinite(t1) ? t1 : t2;
        if (tCheck >= 0 && tCheck <= 1) {
            return point;
        }

        return null;
    }

    /**
     * Показывает трафарет
     */
    show() {
        if (!this.isReady()) {
            console.warn('⚠️ StencilService not ready');
            return;
        }
        if (this.stencilMesh) {
            this.stencilMesh.visible = true;
        }
        if (this.stencilHelper) {
            this.stencilHelper.visible = true;
        }
        this.isActive = true;
        this.notifyListeners('show');
    }

    /**
     * Скрывает трафарет
     */
    hide() {
        if (this.stencilMesh) {
            this.stencilMesh.visible = false;
        }
        if (this.stencilHelper) {
            this.stencilHelper.visible = false;
        }
        this.isActive = false;
        this.notifyListeners('hide');
    }

    /**
     * Переключает видимость трафарета
     */
    toggle() {
        if (this.isActive) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Обновляет трафарет после изменения параметров
     */
    update() {
        if (!this.isReady()) return;
        this.createStencil();
        if (this.isActive) {
            this.show();
        } else {
            this.hide();
        }
        this.notifyListeners('update');
    }

    /**
     * Устанавливает форму трафарета
     */
    setShape(shape) {
        if (this.shape === shape) return;
        this.shape = shape;
        this.update();
        console.log(`🎨 Stencil shape: ${shape}`);
    }

    /**
     * Устанавливает размер трафарета
     */
    setSize(size) {
        this.size = Math.max(0.5, size);
        this.update();
    }

    /**
     * Устанавливает высоту трафарета
     */
    setHeight(height) {
        this.height = Math.max(0.1, height);
        this.update();
    }

    /**
     * Устанавливает позицию трафарета
     */
    setPosition(position) {
        this.position.copy(position);
        if (this.stencilMesh) {
            this.stencilMesh.position.copy(position);
        }
        if (this.stencilHelper) {
            this.stencilHelper.position.copy(position);
        }
    }

    /**
     * Устанавливает цвет трафарета
     */
    setColor(color) {
        this.color = color;
        if (this.stencilMesh) {
            this.stencilMesh.material.color.setHex(color);
        }
        if (this.stencilHelper) {
            this.stencilHelper.material.color.setHex(color);
        }
    }

    /**
     * Устанавливает прозрачность
     */
    setOpacity(opacity) {
        this.opacity = Math.max(0, Math.min(1, opacity));
        if (this.stencilMesh) {
            this.stencilMesh.material.opacity = this.opacity;
        }
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