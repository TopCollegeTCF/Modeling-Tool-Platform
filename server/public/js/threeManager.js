import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

export class ThreeManager {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        
        // Камера
        this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);

        // Рендер
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        container.appendChild(this.renderer.domElement);

        // Контролы
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Свет
        this.setupLights();

        // Сетка
        this.setupGrid();

        // Хранение объектов
        this.objects = [];
        this.selectedObject = null;
        this.objectCounter = 0;

        // Обработка resize
        window.addEventListener('resize', () => this.resize());

        // Анимация
        this.animate();
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        // Основной свет
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // Фоновый свет
        const backLight = new THREE.DirectionalLight(0x4444ff, 0.3);
        backLight.position.set(-10, 0, -10);
        this.scene.add(backLight);

        // Hemispheric light
        const hemiLight = new THREE.HemisphereLight(0x444444, 0x222222, 0.7);
        this.scene.add(hemiLight);
    }

    setupGrid() {
        const gridHelper = new THREE.GridHelper(20, 20, 0x4444ff, 0x3333aa);
        this.scene.add(gridHelper);

        // Пол
        const planeGeometry = new THREE.PlaneGeometry(20, 20);
        const planeMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -0.01;
        this.scene.add(plane);
    }

    addObject(type, params = {}) {
        let geometry, material, mesh;
        const id = ++this.objectCounter;

        switch(type) {
            case 'box':
                geometry = new THREE.BoxGeometry(
                    params.width || 1,
                    params.height || 1,
                    params.depth || 1
                );
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(
                    params.radius || 0.7,
                    params.segments || 32
                );
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(
                    params.radiusTop || 0.5,
                    params.radiusBottom || 0.5,
                    params.height || 1,
                    params.segments || 32
                );
                break;
            case 'cone':
                geometry = new THREE.ConeGeometry(
                    params.radius || 0.7,
                    params.height || 1,
                    params.segments || 32
                );
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(
                    params.radius || 0.7,
                    params.tube || 0.2,
                    params.segments || 16,
                    params.tubularSegments || 32
                );
                break;
            default:
                geometry = new THREE.BoxGeometry(1, 1, 1);
        }

        const color = params.color || Math.floor(Math.random() * 0xffffff);
        material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: params.roughness || 0.4,
            metalness: params.metalness || 0.1,
            transparent: params.opacity !== undefined,
            opacity: params.opacity || 1,
        });

        mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(
            params.x || 0,
            params.y || 0,
            params.z || 0
        );
        mesh.userData.id = id;
        mesh.userData.type = type;
        mesh.userData.params = params;

        this.scene.add(mesh);
        this.objects.push(mesh);
        
        // Выделяем новый объект
        this.selectObject(mesh);
        
        return mesh;
    }

    selectObject(mesh) {
        if (this.selectedObject) {
            // Сброс выделения предыдущего объекта
            if (this.selectedObject.material._originalEmissive) {
                this.selectedObject.material.emissive.setHex(this.selectedObject.material._originalEmissive);
            }
        }
        
        this.selectedObject = mesh;
        if (mesh) {
            // Сохраняем оригинальный цвет свечения
            if (!mesh.material._originalEmissive) {
                mesh.material._originalEmissive = mesh.material.emissive.getHex();
            }
            mesh.material.emissive.setHex(0x00d2ff);
            mesh.material.emissiveIntensity = 0.2;
        }
    }

    removeSelected() {
        if (this.selectedObject) {
            this.scene.remove(this.selectedObject);
            const index = this.objects.indexOf(this.selectedObject);
            if (index > -1) {
                this.objects.splice(index, 1);
            }
            // Очищаем геометрию и материал
            this.selectedObject.geometry.dispose();
            this.selectedObject.material.dispose();
            this.selectedObject = null;
            return true;
        }
        return false;
    }

    clearScene() {
        while (this.objects.length > 0) {
            const obj = this.objects.pop();
            this.scene.remove(obj);
            obj.geometry.dispose();
            obj.material.dispose();
        }
        this.selectedObject = null;
        this.objectCounter = 0;
    }

    getSceneData() {
        return this.objects.map(obj => ({
            id: obj.userData.id,
            type: obj.userData.type,
            position: obj.position.toArray(),
            rotation: obj.rotation.toArray(),
            scale: obj.scale.toArray(),
            params: obj.userData.params,
            color: obj.material.color.getHex(),
            roughness: obj.material.roughness,
            metalness: obj.material.metalness,
            opacity: obj.material.opacity
        }));
    }

    loadSceneData(data) {
        this.clearScene();
        data.forEach(objData => {
            const mesh = this.addObject(objData.type, {
                ...objData.params,
                color: objData.color,
                roughness: objData.roughness,
                metalness: objData.metalness,
                opacity: objData.opacity,
                x: objData.position[0],
                y: objData.position[1],
                z: objData.position[2]
            });
            mesh.rotation.set(objData.rotation[0], objData.rotation[1], objData.rotation[2]);
            mesh.scale.set(objData.scale[0], objData.scale[1], objData.scale[2]);
        });
    }

    async exportSTL() {
        const exporter = new STLExporter();
        const objects = this.objects;
        if (objects.length === 0) {
            throw new Error('No objects to export');
        }
        const result = exporter.parse(objects);
        return result;
    }

    async exportGLTF() {
        const exporter = new GLTFExporter();
        const objects = this.objects;
        if (objects.length === 0) {
            throw new Error('No objects to export');
        }
        
        return new Promise((resolve, reject) => {
            exporter.parse(
                objects,
                (gltf) => resolve(gltf),
                (error) => reject(error),
                { binary: true }
            );
        });
    }

    resize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        window.removeEventListener('resize', () => this.resize());
        this.renderer.dispose();
        this.container.removeChild(this.renderer.domElement);
    }
}