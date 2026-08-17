/**
 * 🎨 ShapeManager - Управление созданием фигур
 *
 * 📋 ОПИСАНИЕ:
 * Отвечает за создание и управление фигурами в сцене.
 * Реализует фабричный метод для создания различных типов фигур.
 *
 */
import { Cube } from '../entities/Cube.js';
import { Sphere } from '../entities/Sphere.js';
import { Cylinder } from '../entities/Cylinder.js';
import { DEFAULTS } from '../configs/defaults.js';

export class ShapeManager {
    constructor(editor) {
        this.editor = editor;
        this.shapeFactories = {
            cube: this.createCube.bind(this),
            sphere: this.createSphere.bind(this),
            cylinder: this.createCylinder.bind(this),
            cone: this.createCone.bind(this),
            torus: this.createTorus.bind(this),
            torusKnot: this.createTorusKnot.bind(this),
            icosahedron: this.createIcosahedron.bind(this),
            octahedron: this.createOctahedron.bind(this),
            dodecahedron: this.createDodecahedron.bind(this),
        };
    }

    createCube(options = {}) {
        const config = {
            width: options.width || DEFAULTS.shapes.cube.width,
            height: options.height || DEFAULTS.shapes.cube.height,
            depth: options.depth || DEFAULTS.shapes.cube.depth,
            name: options.name || 'Cube',
            color: options.color || 0x4a9eff,
            roughness: options.roughness || 0.3,
            metalness: options.metalness || 0.1,
            segments: options.segments || 1,
            transparent: options.transparent || false,
            opacity: options.opacity || 1,
        };

        const cube = new Cube(config.width, config.height, config.depth, {
            name: config.name,
            color: config.color,
            roughness: config.roughness,
            metalness: config.metalness,
            segments: config.segments,
            transparent: config.transparent,
            opacity: config.opacity,
        });

        this._setupEntity(cube);
        return cube;
    }

    createSphere(options = {}) {
        const config = {
            radius: options.radius || DEFAULTS.shapes.sphere.radius,
            name: options.name || 'Sphere',
            color: options.color || 0xff6b6b,
            roughness: options.roughness || 0.3,
            metalness: options.metalness || 0.1,
            widthSegments: options.widthSegments || 32,
            heightSegments: options.heightSegments || 32,
            transparent: options.transparent || false,
            opacity: options.opacity || 1,
        };

        const sphere = new Sphere(config.radius, {
            name: config.name,
            color: config.color,
            roughness: config.roughness,
            metalness: config.metalness,
            widthSegments: config.widthSegments,
            heightSegments: config.heightSegments,
            transparent: config.transparent,
            opacity: config.opacity,
        });

        this._setupEntity(sphere);
        return sphere;
    }

    createCylinder(options = {}) {
        const config = {
            radiusTop: options.radiusTop || DEFAULTS.shapes.cylinder.radiusTop,
            radiusBottom: options.radiusBottom || DEFAULTS.shapes.cylinder.radiusBottom,
            height: options.height || DEFAULTS.shapes.cylinder.height,
            name: options.name || 'Cylinder',
            color: options.color || 0x51cf66,
            roughness: options.roughness || 0.3,
            metalness: options.metalness || 0.1,
            radialSegments: options.radialSegments || 32,
            heightSegments: options.heightSegments || 1,
            openEnded: options.openEnded || false,
            transparent: options.transparent || false,
            opacity: options.opacity || 1,
        };

        const cylinder = new Cylinder(
            config.radiusTop,
            config.radiusBottom,
            config.height,
            {
                name: config.name,
                color: config.color,
                roughness: config.roughness,
                metalness: config.metalness,
                radialSegments: config.radialSegments,
                heightSegments: config.heightSegments,
                openEnded: config.openEnded,
                transparent: config.transparent,
                opacity: config.opacity,
            }
        );

        this._setupEntity(cylinder);
        return cylinder;
    }

    createShape(type, options = {}) {
        const factory = this.shapeFactories[type];
        if (!factory) {
            console.warn(`⚠️ Unknown shape type: ${type}`);
            return null;
        }
        return factory(options);
    }

    /**
     * Настраивает сущность перед добавлением на сцену
     */

    _setupEntity(entity) {
        const isRestoring = this.editor.historyManager?.isRestoring || false;

        this.editor.entityIdCounter++;
        entity.userData.id = this.editor.entityIdCounter;

        const pos = this.editor.spawnService.getSpawnPosition();
        entity.position.copy(pos);

        this.editor.sceneManager.addEntity(entity);

        if (!isRestoring) {
            this.editor.selectionManager.select(entity);
        }

        this.editor.uiManager.updateUI();

        console.log(`✅ ${entity.userData.type} created (id: ${entity.userData.id})`);
        return entity;
    }
    getShapeInfo() {
        return {
            types: Object.keys(this.shapeFactories),
            defaults: DEFAULTS.shapes,
        };
    }

    // Заглушки для новых фигур
    createCone(options = {}) {
        console.warn('⚠️ Cone shape not implemented yet');
        return this.createCylinder({
            ...options,
            radiusTop: 0,
            height: 1.5,
            radialSegments: options.radialSegments || 32,
            heightSegments: options.heightSegments || 1,
        });
    }

    createTorus(options = {}) {
        console.warn('⚠️ Torus shape not implemented yet');
        return this.createSphere({
            ...options,
            radius: 0.8,
            widthSegments: options.widthSegments || 32,
            heightSegments: options.heightSegments || 32,
        });
    }

    createTorusKnot(options = {}) {
        console.warn('⚠️ Torus Knot shape not implemented yet');
        return this.createSphere({
            ...options,
            radius: 0.8,
            color: 0x9775fa,
            widthSegments: options.widthSegments || 32,
            heightSegments: options.heightSegments || 32,
        });
    }

    createIcosahedron(options = {}) {
        console.warn('⚠️ Icosahedron shape not implemented yet');
        return this.createSphere({
            ...options,
            radius: 0.8,
            color: 0x4a9eff,
            widthSegments: options.widthSegments || 16,
            heightSegments: options.heightSegments || 16,
        });
    }

    createOctahedron(options = {}) {
        console.warn('⚠️ Octahedron shape not implemented yet');
        return this.createSphere({
            ...options,
            radius: 0.8,
            color: 0x51cf66,
            widthSegments: options.widthSegments || 16,
            heightSegments: options.heightSegments || 16,
        });
    }

    createDodecahedron(options = {}) {
        console.warn('⚠️ Dodecahedron shape not implemented yet');
        return this.createSphere({
            ...options,
            radius: 0.8,
            color: 0xffa94d,
            widthSegments: options.widthSegments || 16,
            heightSegments: options.heightSegments || 16,
        });
    }
}