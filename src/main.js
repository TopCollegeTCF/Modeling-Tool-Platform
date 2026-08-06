import { Editor } from './core/Editor.js';

console.log('🚀 Starting editor...');

// Создаем экземпляр редактора
const editor = new Editor();
window.editor = editor;

console.log('✅ 3D Editor initialized');
console.log('📦 Commands:');
console.log('  - editor.addCube()');
console.log('  - editor.addSphere()');
console.log('  - editor.addCylinder()');
console.log('  - editor.toolManager.switchTool("move")');

// Автоматически создаем тестовый куб
setTimeout(() => {
    try {
        if (editor && editor.sceneManager) {
            const cube = editor.addCube();
            console.log('✅ Test cube created:', cube);
        }
    } catch (e) {
        console.error('❌ Error creating test cube:', e);
    }
}, 100);