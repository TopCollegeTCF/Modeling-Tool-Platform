/**
 * 📁 Project UI - Управление проектами
 * 
 * 💾 Сохранение/Загрузка проектов
 * 🔮 Будущее: Интеграция с базой данных
 */
 export class ProjectUI {
    constructor(editor) {
        this.editor = editor;
        this.element = null;
        this.isOpen = false;
    }

    init() {
        // Создаем контейнер для проекта
        this.element = document.createElement('div');
        this.element.id = 'project-panel';
        this.element.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2001;
            background: rgba(16, 16, 32, 0.98);
            backdrop-filter: blur(20px);
            padding: 24px;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
            min-width: 400px;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            display: none;
        `;

        document.body.appendChild(this.element);
        console.log('✅ ProjectUI initialized');
    }

    open() {
        this.isOpen = true;
        this.element.style.display = 'block';
        this.render();
    }

    close() {
        this.isOpen = false;
        this.element.style.display = 'none';
    }

    render() {
        this.element.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h2 style="color:#fff; font-weight:400; font-size:18px; margin:0;">💾 Project Manager</h2>
                <button onclick="window.editor.projectUI.close()"
                        style="background:transparent; border:none; color:#666; font-size:20px; cursor:pointer; padding:4px 8px;">
                    ✕
                </button>
            </div>

            <div style="margin-bottom:12px;">
                <label style="color:#888; font-size:11px; display:block; margin-bottom:4px;">Project Name</label>
                <div style="display:flex; gap:8px;">
                    <input type="text" id="project-name" placeholder="My Project"
                           style="flex:1; padding:8px 12px; background:rgba(255,255,255,0.05);
                                  border:1px solid rgba(255,255,255,0.08); border-radius:4px;
                                  color:#fff; font-size:13px;">
                    <button onclick="window.editor.projectUI.saveProject()"
                            style="padding:8px 16px; background:rgba(74,158,255,0.2);
                                   border:1px solid rgba(74,158,255,0.3); border-radius:4px;
                                   color:#4a9eff; cursor:pointer; font-size:13px;">
                        💾 Save
                    </button>
                </div>
            </div>

            <div style="margin-bottom:12px;">
                <button onclick="window.editor.projectUI.loadProject()"
                        style="width:100%; padding:8px; background:rgba(81,207,102,0.15);
                               border:1px solid rgba(81,207,102,0.2); border-radius:4px;
                               color:#51cf66; cursor:pointer; font-size:13px;">
                    📂 Load Project
                </button>
                <input type="file" id="project-file-input" accept=".json"
                       style="display:none;" 
                       onchange="window.editor.projectUI.handleFileUpload(event)">
            </div>

            <div id="project-list" style="margin-top:12px;">
                <div style="color:#666; font-size:10px; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">
                    Recent Projects
                </div>
                <div id="project-list-items">
                    <div style="color:#444; font-size:12px; text-align:center; padding:20px 0;">
                        Loading projects...
                    </div>
                </div>
            </div>
        `;

        // Загружаем список проектов
        this.loadProjectList();
    }

    async saveProject() {
        const nameInput = document.getElementById('project-name');
        const projectName = nameInput?.value || 'untitled';

        const data = this.editor.exportScene();

        try {
            const response = await fetch('/api/project/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectName, data })
            });

            const result = await response.json();

            if (result.success) {
                alert(`✅ Project saved: ${result.filename}`);
                this.loadProjectList();
            } else {
                alert('❌ Error saving project: ' + result.error);
            }
        } catch (error) {
            console.error('❌ Error saving project:', error);
            alert('❌ Error saving project: ' + error.message);
        }
    }

    loadProject() {
        document.getElementById('project-file-input')?.click();
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            this.editor.importScene(data);
            this.close();
            
            console.log(`✅ Project loaded: ${file.name}`);
            alert(`✅ Project loaded: ${file.name}`);
        } catch (error) {
            console.error('❌ Error loading project:', error);
            alert('❌ Error loading project: ' + error.message);
        }

        // Сбросить input
        event.target.value = '';
    }

    async loadProjectList() {
        try {
            const response = await fetch('/api/projects');
            const result = await response.json();

            const container = document.getElementById('project-list-items');
            if (!container) return;

            if (!result.success || !result.projects || result.projects.length === 0) {
                container.innerHTML = `
                    <div style="color:#444; font-size:12px; text-align:center; padding:20px 0;">
                        No saved projects yet
                    </div>
                `;
                return;
            }

            container.innerHTML = result.projects.map(proj => `
                <div style="display:flex; justify-content:space-between; align-items:center;
                            padding:8px 12px; margin:4px 0; background:rgba(255,255,255,0.03);
                            border-radius:4px;">
                    <div>
                        <div style="color:#fff; font-size:12px;">${proj.name}</div>
                        <div style="color:#555; font-size:9px;">${new Date(proj.modified).toLocaleString()}</div>
                    </div>
                    <div style="display:flex; gap:4px;">
                        <button onclick="window.editor.projectUI.loadProjectFile('${proj.filename}')"
                                style="padding:4px 10px; background:rgba(74,158,255,0.15);
                                       border:1px solid rgba(74,158,255,0.2); border-radius:3px;
                                       color:#4a9eff; cursor:pointer; font-size:10px;">
                            📂 Load
                        </button>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('❌ Error loading project list:', error);
        }
    }

    async loadProjectFile(filename) {
        try {
            const response = await fetch(`/api/project/load/${filename}`);
            const result = await response.json();
            if (result.success) {
                // Очищаем сцену и историю
                this.editor.clearScene();
                this.editor.importScene(result.data);
                this.close();
                console.log(`✅ Project loaded: ${filename}`);
                alert(`✅ Project loaded: ${filename}`);
            } else {
                alert('❌ Error loading project: ' + result.error);
            }
        } catch (error) {
            console.error('❌ Error loading project:', error);
            alert('❌ Error loading project: ' + error.message);
        }
    }
}