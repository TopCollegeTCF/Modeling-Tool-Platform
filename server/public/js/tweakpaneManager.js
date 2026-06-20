import { Pane } from 'tweakpane';

export class TweakpaneManager {
    constructor(threeManager, onUpdate) {
        this.threeManager = threeManager;
        this.onUpdate = onUpdate;
        this.pane = new Pane({ title: 'Инструменты' });
        this.setupUI();
        this.selectedObjectParams = null;
    }

    setupUI() {
        // Tab для инструментов
        this.tab = this.pane.addTab({
            pages: [
                { title: 'Добавить' },
                { title: 'Выбрано' },
                { title: 'Инструменты' }
            ]
        });

        // Страница "Добавить"
        this.setupAddPage(this.tab.pages[0]);
        
        // Страница "Выбрано"
        this.setupSelectedPage(this.tab.pages[1]);
        
        // Страница "Инструменты"
        this.setupToolsPage(this.tab.pages[2]);
    }

    setupAddPage(page) {
        const addContainer = page.addBlade({
            view: 'list',
            label: 'Добавить примитив',
            options: [
                { text: 'Куб', value: 'box' },
                { text: 'Сфера', value: 'sphere' },
                { text: 'Цилиндр', value: 'cylinder' },
                { text: 'Конус', value: 'cone' },
                { text: 'Тор', value: 'torus' }
            ],
            value: 'box'
        });

        const colorPicker = page.addBlade({
            view: 'color',
            label: 'Цвет',
            value: '#3498db'
        });

        const positionX = page.addBlade({
            view: 'slider',
            label: 'X',
            value: 0,
            min: -5,
            max: 5,
            step: 0.1
        });

        const positionY = page.addBlade({
            view: 'slider',
            label: 'Y',
            value: 0,
            min: -5,
            max: 5,
            step: 0.1
        });

        const positionZ = page.addBlade({
            view: 'slider',
            label: 'Z',
            value: 0,
            min: -5,
            max: 5,
            step: 0.1
        });

        const addBtn = page.addBlade({
            view: 'button',
            label: 'Добавить',
            title: '➕'
        });

        addBtn.on('click', () => {
            const type = addContainer.value;
            const color = parseInt(colorPicker.value.replace('#', ''), 16);
            const params = {
                color,
                x: positionX.value,
                y: positionY.value,
                z: positionZ.value
            };

            // Добавляем параметры в зависимости от типа
            switch(type) {
                case 'box':
                    params.width = 1;
                    params.height = 1;
                    params.depth = 1;
                    break;
                case 'sphere':
                    params.radius = 0.7;
                    params.segments = 32;
                    break;
                case 'cylinder':
                    params.radiusTop = 0.5;
                    params.radiusBottom = 0.5;
                    params.height = 1;
                    params.segments = 32;
                    break;
                case 'cone':
                    params.radius = 0.7;
                    params.height = 1;
                    params.segments = 32;
                    break;
                case 'torus':
                    params.radius = 0.7;
                    params.tube = 0.2;
                    params.segments = 16;
                    params.tubularSegments = 32;
                    break;
            }

            const mesh = this.threeManager.addObject(type, params);
            if (this.onUpdate) this.onUpdate();
        });
    }

    setupSelectedPage(page) {
        // Параметры для выбранного объекта будут динамическими
        this.selectedContainer = page;
        this.updateSelectedParams(null);
    }

    updateSelectedParams(mesh) {
        // Очищаем старые параметры
        if (this.selectedObjectParams) {
            this.selectedContainer.remove(this.selectedObjectParams);
            this.selectedObjectParams = null;
        }

        if (!mesh) {
            this.selectedContainer.addBlade({
                view: 'text',
                label: 'Информация',
                text: 'Ничего не выбрано'
            });
            return;
        }

        // Создаем параметры для выбранного объекта
        const params = {
            position: {
                x: mesh.position.x,
                y: mesh.position.y,
                z: mesh.position.z
            },
            rotation: {
                x: mesh.rotation.x,
                y: mesh.rotation.y,
                z: mesh.rotation.z
            },
            scale: {
                x: mesh.scale.x,
                y: mesh.scale.y,
                z: mesh.scale.z
            },
            color: mesh.material.color.getHex(),
            roughness: mesh.material.roughness,
            metalness: mesh.material.metalness,
            opacity: mesh.material.opacity
        };

        this.selectedObjectParams = this.selectedContainer.addBlade({
            view: 'folder',
            title: `Объект #${mesh.userData.id}`,
            expanded: true
        });

        // Позиция
        const posFolder = this.selectedObjectParams.addBlade({
            view: 'folder',
            title: 'Позиция'
        });

        posFolder.addBinding(params.position, 'x', { min: -5, max: 5, step: 0.1 })
            .on('change', (ev) => {
                mesh.position.x = ev.value;
                if (this.onUpdate) this.onUpdate();
            });
        posFolder.addBinding(params.position, 'y', { min: -5, max: 5, step: 0.1 })
            .on('change', (ev) => {
                mesh.position.y = ev.value;
                if (this.onUpdate) this.onUpdate();
            });
        posFolder.addBinding(params.position, 'z', { min: -5, max: 5, step: 0.1 })
            .on('change', (ev) => {
                mesh.position.z = ev.value;
                if (this.onUpdate) this.onUpdate();
            });

        // Вращение
        const rotFolder = this.selectedObjectParams.addBlade({
            view: 'folder',
            title: 'Вращение'
        });

        rotFolder.addBinding(params.rotation, 'x', { min: -Math.PI, max: Math.PI, step: 0.01 })
            .on('change', (ev) => {
                mesh.rotation.x = ev.value;
                if (this.onUpdate) this.onUpdate();
            });
        rotFolder.addBinding(params.rotation, 'y', { min: -Math.PI, max: Math.PI, step: 0.01 })
            .on('change', (ev) => {
                mesh.rotation.y = ev.value;
                if (this.onUpdate) this.onUpdate();
            });
        rotFolder.addBinding(params.rotation, 'z', { min: -Math.PI, max: Math.PI, step: 0.01 })
            .on('change', (ev) => {
                mesh.rotation.z = ev.value;
                if (this.onUpdate) this.onUpdate();
            });

        // Масштаб
        const scaleFolder = this.selectedObjectParams.addBlade({
            view: 'folder',
            title: 'Масштаб'
        });

        scaleFolder.addBinding(params.scale, 'x', { min: 0.1, max: 3, step: 0.05 })
            .on('change', (ev) => {
                mesh.scale.x = ev.value;
                if (this.onUpdate) this.onUpdate();
            });
        scaleFolder.addBinding(params.scale, 'y', { min: 0.1, max: 3, step: 0.05 })
            .on('change', (ev) => {
                mesh.scale.y = ev.value;
                if (this.onUpdate) this.onUpdate();
            });
        scaleFolder.addBinding(params.scale, 'z', { min: 0.1, max: 3, step: 0.05 })
            .on('change', (ev) => {
                mesh.scale.z = ev.value;
                if (this.onUpdate) this.onUpdate();
            });

        // Материал
        const matFolder = this.selectedObjectParams.addBlade({
            view: 'folder',
            title: 'Материал'
        });

        matFolder.addBinding(params, 'color')
            .on('change', (ev) => {
                mesh.material.color.setHex(ev.value);
                if (this.onUpdate) this.onUpdate();
            });
        matFolder.addBinding(params, 'roughness', { min: 0, max: 1, step: 0.01 })
            .on('change', (ev) => {
                mesh.material.roughness = ev.value;
                if (this.onUpdate) this.onUpdate();
            });
        matFolder.addBinding(params, 'metalness', { min: 0, max: 1, step: 0.01 })
            .on('change', (ev) => {
                mesh.material.metalness = ev.value;
                if (this.onUpdate) this.onUpdate();
            });
        matFolder.addBinding(params, 'opacity', { min: 0.1, max: 1, step: 0.01 })
            .on('change', (ev) => {
                mesh.material.opacity = ev.value;
                mesh.material.transparent = ev.value < 1;
                if (this.onUpdate) this.onUpdate();
            });

        // Кнопка удаления
        this.selectedObjectParams.addBlade({
            view: 'button',
            label: 'Удалить',
            title: '🗑️'
        }).on('click', () => {
            this.threeManager.removeSelected();
            this.updateSelectedParams(null);
            if (this.onUpdate) this.onUpdate();
        });
    }

    setupToolsPage(page) {
        // Экспорт
        const exportFolder = page.addBlade({
            view: 'folder',
            title: 'Экспорт'
        });

        exportFolder.addBlade({
            view: 'button',
            label: 'Экспорт STL',
            title: '📐'
        }).on('click', () => {
            // Будет обрабатываться в main.js
            if (this.onExport) this.onExport('stl');
        });

        exportFolder.addBlade({
            view: 'button',
            label: 'Экспорт GLTF',
            title: '🔄'
        }).on('click', () => {
            if (this.onExport) this.onExport('gltf');
        });

        // Очистка сцены
        page.addBlade({
            view: 'button',
            label: 'Очистить сцену',
            title: '🧹'
        }).on('click', () => {
            if (confirm('Вы уверены, что хотите очистить сцену?')) {
                this.threeManager.clearScene();
                this.updateSelectedParams(null);
                if (this.onUpdate) this.onUpdate();
            }
        });
    }

    onExport(callback) {
        this.onExport = callback;
    }

    updateSelected(mesh) {
        this.updateSelectedParams(mesh);
    }

    dispose() {
        this.pane.dispose();
    }
}