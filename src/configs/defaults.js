export const DEFAULTS = {
    // Настройки спавна
    spawn: {
        mode: 'marker', // 'center' | 'marker' | 'random'
        position: { x: 0, y: 0.5, z: 0 },
        offset: 1.5,
    },
    
    // Настройки фигур
    shapes: {
        cube: {
            width: 1,
            height: 1,
            depth: 1,
        },
        sphere: {
            radius: 0.5,
        },
        cylinder: {
            radiusTop: 0.5,
            radiusBottom: 0.5,
            height: 1,
        },
    },
    
    // Настройки сетки
    grid: {
        size: 20,
        divisions: 20,
    },
    
    // Настройки трансформации
    transform: {
        snap: 0.1,
        snapEnabled: false,
        scaleSpeed: 0.02,
        rotateSpeed: 0.02,
    },
};