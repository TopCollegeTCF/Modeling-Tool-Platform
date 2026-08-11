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

        // Fly mode
        this.flyModeEnabled = false;
        this.flySpeed = 0.003;
        this.flyAngle = 0;

        // Сохраняем начальную позицию
        this.initialPosition = camera.position.clone();
        this.initialTarget = this.target.clone();

        this.allowBelowFloor = CAMERA_CONFIG.limits.allowBelowFloor || false;

        this.loadSettings();
        this.applyConfig();
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('editor_camera_allow_below_floor');
            if (saved !== null) {
                this.allowBelowFloor = JSON.parse(saved);
                console.log(`📷 Camera setting loaded: allowBelowFloor = ${this.allowBelowFloor}`);
            }
            const flyMode = localStorage.getItem('editor_fly_mode_enabled');
            if (flyMode !== null) {
                this.flyModeEnabled = JSON.parse(flyMode);
            }
        } catch (e) {
            this.allowBelowFloor = CAMERA_CONFIG.limits.allowBelowFloor || false;
            this.flyModeEnabled = false;
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

    // === FLY MODE ===

    setFlyMode(enabled) {
        this.flyModeEnabled = enabled;
        try {
            localStorage.setItem('editor_fly_mode_enabled', JSON.stringify(enabled));
        } catch (e) {}

        if (enabled) {
            // Сохраняем текущую позицию и цель
            this._flyStartPosition = this.camera.position.clone();
            this._flyStartTarget = this.target.clone();
            this.flyAngle = 0;
            console.log('🚁 Fly mode activated');
        } else {
            console.log('🚁 Fly mode deactivated');
        }
    }

    updateFlyMode() {
        if (!this.flyModeEnabled) return;

        this.flyAngle += this.flySpeed;

        const radius = this.camera.position.distanceTo(this.target);
        const heightOffset = 3;

        // Вращаем камеру вокруг центра
        const newX = this.target.x + radius * Math.sin(this.flyAngle);
        const newZ = this.target.z + radius * Math.cos(this.flyAngle);
        const newY = this.target.y + heightOffset + Math.sin(this.flyAngle * 0.3) * 1;

        this.camera.position.set(newX, newY, newZ);
        this.camera.lookAt(this.target);
    }

    // === ORBIT ===

    startOrbit(x, y) {
        if (this.flyModeEnabled) {
            this.setFlyMode(false);
            return;
        }
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

        let minY = this.allowBelowFloor ? -10 : CAMERA_CONFIG.limits.minY;
        const clampedPhi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));

        const newX = this.target.x + radius * Math.sin(clampedPhi) * Math.sin(theta);
        let newY = this.target.y + radius * Math.cos(clampedPhi);
        const newZ = this.target.z + radius * Math.sin(clampedPhi) * Math.cos(theta);

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

    // === ZOOM ===

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
        if (!this.allowBelowFloor && newPosition.y < CAMERA_CONFIG.limits.minY) {
            newPosition.y = CAMERA_CONFIG.limits.minY;
        }
        this.camera.position.copy(newPosition);
        this.camera.lookAt(this.target);
    }

    // === PAN ===

    startPan(x, y) {
        if (this.flyModeEnabled) {
            this.setFlyMode(false);
            return;
        }
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

        if (!this.allowBelowFloor) {
            this.target.y = Math.max(0, this.target.y);
        }

        this.camera.position.add(right.clone().multiplyScalar(-deltaX));
        this.camera.position.add(forward.clone().multiplyScalar(-deltaY));

        if (!this.allowBelowFloor && this.camera.position.y < CAMERA_CONFIG.limits.minY) {
            this.camera.position.y = CAMERA_CONFIG.limits.minY;
        }
        this.camera.lookAt(this.target);
        this.previousMouse = { x, y };
    }

    stopPan() {
        this.isPanning = false;
    }

    // === RESET ===

    reset() {
        this.camera.position.copy(this.initialPosition);
        this.target.copy(this.initialTarget);
        this.camera.lookAt(this.target);
        if (this.flyModeEnabled) {
            this.setFlyMode(false);
        }
    }

    // === SETTERS / GETTERS ===

    setAllowBelowFloor(allow) {
        this.allowBelowFloor = allow;
        try {
            localStorage.setItem('editor_camera_allow_below_floor', JSON.stringify(allow));
        } catch (e) {}
        console.log(`📷 Camera floor limit: ${allow ? 'OFF (can go below)' : 'ON (constrained)'}`);
    }

    getAllowBelowFloor() {
        return this.allowBelowFloor;
    }

    getDirection() {
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        return direction;
    }
}