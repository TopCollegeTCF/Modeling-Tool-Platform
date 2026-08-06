import { Editor } from './core/Editor.js';

console.log('Starting editor...');

const editor = new Editor();
window.editor = editor;

console.log('✅ 3D Editor initialized');
console.log('📦 Commands:');
console.log('  - editor.addCube()');
console.log('  - editor.addSphere()');
console.log('  - editor.addCylinder()');
console.log('  - editor.toggleSpawnMode() - toggle spawn mode');
console.log('  - editor.cameraService.reset() - reset camera');
console.log('🎮 Controls:');
console.log('  - Right click + drag: Orbit');
console.log('  - Middle click + drag: Pan');
console.log('  - Scroll: Zoom');
console.log('  - R: Reset camera');
console.log('  - M: Toggle spawn mode');

// Автоматически создаем тестовый куб
setTimeout(() => {
    try {
        if (editor && editor.sceneManager) {
            const cube = editor.addCube();
            console.log('Test cube created:', cube);
        }
    } catch (e) {
        console.error('Error creating test cube:', e);
    }
}, 100);