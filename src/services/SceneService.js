export class SceneService {
    constructor(editor) {
        this.editor = editor;
        this.sceneData = {
            name: 'Untitled',
            createdAt: new Date(),
            modifiedAt: new Date(),
            objects: [],
        };
    }
    
    getSceneInfo() {
        const entities = this.editor.sceneManager.getAllEntities();
        return {
            name: this.sceneData.name,
            objectCount: entities.length,
            createdAt: this.sceneData.createdAt,
            modifiedAt: this.sceneData.modifiedAt,
        };
    }
    
    updateSceneName(name) {
        this.sceneData.name = name;
        this.sceneData.modifiedAt = new Date();
    }
    
    // Экспорт сцены в JSON
    exportScene() {
        const entities = this.editor.sceneManager.getAllEntities();
        return {
            name: this.sceneData.name,
            version: '1.0',
            createdAt: this.sceneData.createdAt,
            modifiedAt: new Date(),
            objects: entities.map(entity => entity.toJSON()),
        };
    }
    
    // Импорт сцены из JSON
    importScene(data) {
        // Очищаем сцену
        const entities = this.editor.sceneManager.getAllEntities();
        entities.forEach(entity => {
            this.editor.sceneManager.removeEntity(entity);
        });
        
        // Восстанавливаем объекты
        // Здесь логика восстановления объектов из JSON
        this.sceneData.name = data.name || 'Untitled';
        this.sceneData.modifiedAt = new Date();
    }
}