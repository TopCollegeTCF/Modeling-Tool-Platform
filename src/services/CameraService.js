import * as THREE from 'three';
import { CAMERA_CONFIG } from '../configs/camera.js';

export class CameraService {
    constructor(camera) {
        this.camera = camera;
        this.target = new THREE.Vector3(0, 0, 0);
        this.isOrbiting = false;
        this.isPanning = false;
        this.previousMouse = { x: 0, y: 0 };
        this.zoomLevel = 1;
        
        // Сохраняем начальную позицию
        this.initialPosition = camera.position.clone();
        this.initialTarget = this.target.clone();
        
        // настройки ограничений
        this.allowBelowFloor = CAMERA_CONFIG.limits.allowBelowFloor || false;

        // загрузка настройки из localStorage
        this.loadSettings();
        
        // Применяем настройки
        this.applyConfig();
    }

    // загрузка настроек из localStorage
    loadSettings() {
        try {
            const saved = localStorage.getItem('editor_camera_allow_below_floor');
            if (saved !== null) {
                this.allowBelowFloor = JSON.parse(saved);
                console.log(`📷 Camera setting loaded: allowBelowFloor = ${this.allowBelowFloor}`);
            }
        } catch (e) {
            // Если ошибка, используем значение по умолчанию
            this.allowBelowFloor = CAMERA_CONFIG.limits.allowBelowFloor || false;
        }
    }

    applyConfig() {
        this.camera.position.set(
            CAMERA_CONFIG.position.x,
            CAMERA_CONFIG.position.y,
            CAMERA_CONFIG.position.z
        );
        this.camera.lookAt(this.target);
        this.camera.fov = CAMERA_CONFIG.fov;
        this.camera.near = CAMERA_CONFIG.near;
        this.camera.far = CAMERA_CONFIG.far;
        this.camera.updateProjectionMatrix();
    }

    // установка разрешения на опускание ниже пола
    setAllowBelowFloor(allow) {
        this.allowBelowFloor = allow;
        console.log(`📷 Camera floor limit: ${allow ? 'OFF (can go below)' : 'ON (constrained)'}`);
    }

    // получение текущего состояния
    getAllowBelowFloor() {
        return this.allowBelowFloor;
    }

    // Орбитальное вращение
    startOrbit(x, y) {
        this.isOrbiting = true;
        this.previousMouse = { x, y };
    }

    orbit(x, y) {
        if (!this.isOrbiting) return;
        
        const deltaX = x - this.previousMouse.x;
        const deltaY = y - this.previousMouse.y;
        
        const radius = this.camera.position.distanceTo(this.target);
        const theta = Math.atan2(
            this.camera.position.x - this.target.x,
            this.camera.position.z - this.target.z
        ) + deltaX * CAMERA_CONFIG.speed.rotation;
        
        const phi = Math.acos(
            (this.camera.position.y - this.target.y) / radius
        ) + deltaY * CAMERA_CONFIG.speed.rotation;
        
        // динамическое ограничение по Y
        let minY = this.allowBelowFloor ? -10 : CAMERA_CONFIG.limits.minY;
        const clampedPhi = Math.max(
            0.1,
            Math.min(Math.PI - 0.1, phi)
        );
        
        const newX = this.target.x + radius * Math.sin(clampedPhi) * Math.sin(theta);
        let newY = this.target.y + radius * Math.cos(clampedPhi);
        const newZ = this.target.z + radius * Math.sin(clampedPhi) * Math.cos(theta);
        
        // проверка ограничения по Y
        if (!this.allowBelowFloor) {
            newY = Math.max(CAMERA_CONFIG.limits.minY, newY);
        }
        
        this.camera.position.set(
            Math.max(-20, Math.min(20, newX)),
            Math.max(this.allowBelowFloor ? -10 : CAMERA_CONFIG.limits.minY, 
                     Math.min(CAMERA_CONFIG.limits.maxY, newY)),
            Math.max(-20, Math.min(20, newZ))
        );
        
        this.camera.lookAt(this.target);
        this.previousMouse = { x, y };
    }

    stopOrbit() {
        this.isOrbiting = false;
    }

    // Приближение к точке под курсором
    zoomToCursor(event, renderer) {
        const rect = renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        );
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        
        // Плоскость на уровне target
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), this.target.y);
        const point = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, point);
        
        if (point) {
            const direction = new THREE.Vector3()
                .copy(this.camera.position)
                .sub(point)
                .normalize();
            const distance = this.camera.position.distanceTo(point);
            const newDistance = Math.max(
                CAMERA_CONFIG.limits.minDistance,
                Math.min(CAMERA_CONFIG.limits.maxDistance, distance * 0.9)
            );
            const newPosition = point.clone().add(direction.multiplyScalar(newDistance));
            
            // проверка ограничения по Y при зуме
            if (!this.allowBelowFloor && newPosition.y < CAMERA_CONFIG.limits.minY) {
                newPosition.y = CAMERA_CONFIG.limits.minY;
            }
            
            this.camera.position.copy(newPosition);
            this.target.copy(point);
            this.camera.lookAt(this.target);
        }
    }

    // Приближение/отдаление
    zoom(delta) {
        const direction = new THREE.Vector3()
            .copy(this.camera.position)
            .sub(this.target)
            .normalize();
        const distance = this.camera.position.distanceTo(this.target);
        const newDistance = Math.max(
            CAMERA_CONFIG.limits.minDistance,
            Math.min(CAMERA_CONFIG.limits.maxDistance,
                distance + delta * CAMERA_CONFIG.speed.zoom
            )
        );
        
        let newPosition = this.target.clone().add(direction.multiplyScalar(newDistance));
        
        // проверка ограничения по Y при зуме
        if (!this.allowBelowFloor && newPosition.y < CAMERA_CONFIG.limits.minY) {
            newPosition.y = CAMERA_CONFIG.limits.minY;
        }
        
        this.camera.position.copy(newPosition);
        this.camera.lookAt(this.target);
    }

    // Панорамирование
    startPan(x, y) {
        this.isPanning = true;
        this.previousMouse = { x, y };
    }

    pan(x, y) {
        if (!this.isPanning) return;
        
        const deltaX = (x - this.previousMouse.x) * CAMERA_CONFIG.speed.pan;
        const deltaY = (y - this.previousMouse.y) * CAMERA_CONFIG.speed.pan;
        
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
        
        this.target.add(right.clone().multiplyScalar(-deltaX));
        this.target.add(forward.clone().multiplyScalar(-deltaY));
        
        // динамическое ограничение target по Y
        if (!this.allowBelowFloor) {
            this.target.y = Math.max(0, this.target.y);
        }
        
        this.camera.position.add(right.clone().multiplyScalar(-deltaX));
        this.camera.position.add(forward.clone().multiplyScalar(-deltaY));
        
        // проверка ограничения по Y при панорамировании
        if (!this.allowBelowFloor && this.camera.position.y < CAMERA_CONFIG.limits.minY) {
            this.camera.position.y = CAMERA_CONFIG.limits.minY;
        }
        
        this.camera.lookAt(this.target);
        this.previousMouse = { x, y };
    }

    stopPan() {
        this.isPanning = false;
    }

    // Сброс камеры
    reset() {
        this.camera.position.copy(this.initialPosition);
        this.target.copy(this.initialTarget);
        this.camera.lookAt(this.target);
    }

    // Получение направления взгляда
    getDirection() {
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        return direction;
    }
}