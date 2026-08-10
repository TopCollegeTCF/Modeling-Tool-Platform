export const CAMERA_CONFIG = {
    // Начальная позиция
    position: {
        x: 8,
        y: 6,
        z: 8,
    },
    
    // Параметры камеры
    fov: 40,
    near: 0.1,
    far: 100,
    
    // Скорости
    speed: {
        zoom: 0.5,
        rotation: 0.01,
        pan: 0.5,
    },
    
    // Границы
    limits: {
        minDistance: 2,
        maxDistance: 20,
        minY: 1,
        maxY: 15,
        allowBelowFloor: false, // false - камера не опускается ниже пола, true - можно
    },
    
    // Орбитальные настройки
    orbit: {
        enabled: true,
        autoRotate: false,
        autoRotateSpeed: 1.0,
    },
};