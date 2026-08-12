import { Editor } from './core/Editor.js';

console.log('🚀 Starting editor...');
const editor = new Editor();
window.editor = editor;

// Загружаем сохраненные настройки
setTimeout(() => {
    // Тема
    const theme = localStorage.getItem('editor_theme') || 'dark';
    if (editor.settingsUI) {
        editor.settingsUI.applyTheme(theme);
    }
    
    // Хелперы
    const showGrid = localStorage.getItem('editor_show_grid') !== 'false';
    const showAxes = localStorage.getItem('editor_show_axes') !== 'false';
    if (editor.sceneManager) {
        editor.sceneManager.toggleGrid(showGrid);
        editor.sceneManager.toggleAxes(showAxes);
    }
    
    const helperSize = localStorage.getItem('editor_helper_size') || 'medium';
    if (editor.sceneManager) {
        editor.sceneManager.setHelperSize(helperSize);
    }
    
    const helperThickness = parseFloat(localStorage.getItem('editor_helper_thickness') || '1');
    if (editor.sceneManager) {
        editor.sceneManager.setHelperThickness(helperThickness);
    }
    
    // Восстанавливаем позиции панелей
    if (editor.panelService) {
        setTimeout(() => {
            editor.panelService.refreshAllPanels();
        }, 50);
    }
    
    console.log('✅ Settings loaded from localStorage');
}, 200);

console.log('✅ 3D Editor initialized');
console.log('📦 Commands:');
console.log('  - editor.addCube()');
console.log('  - editor.addSphere()');
console.log('  - editor.addCylinder()');
console.log('  - editor.undo() / editor.redo()');
console.log('  - editor.toggleSpawnMode()');
console.log('  - editor.cameraService.reset()');
console.log('🎮 Controls:');
console.log('  - Right click + drag: Orbit');
console.log('  - Middle click + drag: Pan');
console.log('  - Scroll: Zoom');
console.log('  - R: Reset camera');
console.log('  - M: Toggle spawn mode');
console.log('  - Ctrl+Z: Undo');
console.log('  - Ctrl+Y: Redo');
console.log('  - Ctrl+Shift+F: Toggle camera floor limit');
console.log('⚙️ Settings: Click gear icon in toolbar');

// Создаем тестовый куб
setTimeout(() => {
    try {
        if (editor && editor.sceneManager) {
            const cube = editor.addCube();
            console.log('✅ Test cube created:', cube);
        }
    } catch (e) {
        console.error('❌ Error creating test cube:', e);
    }
}, 300);