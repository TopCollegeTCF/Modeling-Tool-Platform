/**
 * 🎨 ShapeManager - Управление созданием фигур
 *
 * 📋 ОПИСАНИЕ:
 * Отвечает за создание и управление фигурами в сцене.
 * Реализует фабричный метод для создания различных типов фигур.
 * 
 * @version 1.0.0
 * @author Gabryelf
 * @since 0.1.0
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
        };
    }

    /**
     * Создает куб
     * @param {Object} options - параметры куба
     * @param {number} options.width - ширина
     * @param {number} options.height - высота
     * @param {number} options.depth - глубина
     * @param {string} options.name - имя
     * @param {number} options.color - цвет
     * @returns {Cube} Созданный куб
     */
    createCube(options = {}) {
        const config = {
            width: options.width || DEFAULTS.shapes.cube.width,
            height: options.height || DEFAULTS.shapes.cube.height,
            depth: options.depth || DEFAULTS.shapes.cube.depth,
            name: options.name || 'Cube',
            color: options.color || 0x4a9eff,
            roughness: options.roughness || 0.3,
            metalness: options.metalness || 0.1,
        };

        const cube = new Cube(config.width, config.height, config.depth, {
            name: config.name,
            color: config.color,
            roughness: config.roughness,
            metalness: config.metalness,
        });

        this._setupEntity(cube);
        return cube;
    }

    /**
     * Создает сферу
     * @param {Object} options - параметры сферы
     * @param {number} options.radius - радиус
     * @param {string} options.name - имя
     * @param {number} options.color - цвет
     * @returns {Sphere} Созданная сфера
     */
    createSphere(options = {}) {
        const config = {
            radius: options.radius || DEFAULTS.shapes.sphere.radius,
            name: options.name || 'Sphere',
            color: options.color || 0xff6b6b,
            roughness: options.roughness || 0.3,
            metalness: options.metalness || 0.1,
        };

        const sphere = new Sphere(config.radius, {
            name: config.name,
            color: config.color,
            roughness: config.roughness,
            metalness: config.metalness,
        });

        this._setupEntity(sphere);
        return sphere;
    }

    /**
     * Создает цилиндр
     * @param {Object} options - параметры цилиндра
     * @param {number} options.radiusTop - верхний радиус
     * @param {number} options.radiusBottom - нижний радиус
     * @param {number} options.height - высота
     * @param {string} options.name - имя
     * @param {number} options.color - цвет
     * @returns {Cylinder} Созданный цилиндр
     */
    createCylinder(options = {}) {
        const config = {
            radiusTop: options.radiusTop || DEFAULTS.shapes.cylinder.radiusTop,
            radiusBottom: options.radiusBottom || DEFAULTS.shapes.cylinder.radiusBottom,
            height: options.height || DEFAULTS.shapes.cylinder.height,
            name: options.name || 'Cylinder',
            color: options.color || 0x51cf66,
            roughness: options.roughness || 0.3,
            metalness: options.metalness || 0.1,
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
            }
        );

        this._setupEntity(cylinder);
        return cylinder;
    }

    /**
     * Создает фигуру по типу
     * @param {string} type - тип фигуры ('cube', 'sphere', 'cylinder')
     * @param {Object} options - параметры фигуры
     * @returns {Entity} Созданная фигура
     */
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
     * @param {Entity} entity - сущность для настройки
     * @private
     */
    _setupEntity(entity) {
        // Устанавливаем ID
        this.editor.entityIdCounter++;
        entity.userData.id = this.editor.entityIdCounter;

        // Устанавливаем позицию спавна
        const pos = this.editor.spawnService.getSpawnPosition();
        entity.position.copy(pos);

        // Добавляем на сцену
        this.editor.sceneManager.addEntity(entity);

        // Выделяем созданную фигуру
        this.editor.selectionManager.select(entity);

        // Обновляем UI
        this.editor.uiManager.updateUI();

        // Записываем в историю
        this.editor.historyManager.push(`add ${entity.userData.type}`);

        console.log(`✅ ${entity.userData.type} created (id: ${entity.userData.id})`);
        return entity;
    }

    /**
     * Получает информацию о доступных типах фигур
     * @returns {Object} Информация о типах фигур
     */
    getShapeInfo() {
        return {
            types: Object.keys(this.shapeFactories),
            defaults: DEFAULTS.shapes,
        };
    }
}