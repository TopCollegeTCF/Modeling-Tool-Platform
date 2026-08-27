/**
 * 📁 Project UI - Управление проектами
 *
 * 💾 Сохранение/Загрузка/Удаление проектов
 * 🔄 Перезапись существующих проектов
 * 
 * @version 2.0.0
 */
export class ProjectUI {
    constructor(editor) {
        this.editor = editor;
        this.element = null;
        this.isOpen = false;
        this.currentProject = null; // Имя текущего загруженного проекта
        this.currentFilename = null; // Полное имя файла
        this.projectsCache = []; // Кеш списка проектов
    }

    init() {
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
            min-width: 420px;
            max-width: 520px;
            max-height: 80vh;
            overflow-y: auto;
            display: none;
        `;
        document.body.appendChild(this.element);
        console.log('✅ ProjectUI v2.0 initialized');
    }

    open() {
        this.isOpen = true;
        this.element.style.display = 'block';
        this.loadProjectList();
        this.render();
    }

    close() {
        this.isOpen = false;
        this.element.style.display = 'none';
    }

    render() {
        const isLoaded = !!this.currentProject;
        const currentName = this.currentProject || '';

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
                    <input type="text" id="project-name" placeholder="My Project" value="${currentName}"
                           style="flex:1; padding:8px 12px; background:rgba(255,255,255,0.05);
                                  border:1px solid rgba(255,255,255,0.08); border-radius:4px;
                                  color:#fff; font-size:13px; outline:none;
                                  transition: border-color 0.3s;"
                           onfocus="this.style.borderColor='rgba(74,158,255,0.5)'"
                           onblur="this.style.borderColor='rgba(255,255,255,0.08)'">
                    
                    <!-- Кнопка Save New -->
                    <button onclick="window.editor.projectUI.saveProject(false)"
                            style="padding:8px 16px; background:rgba(74,158,255,0.2);
                                   border:1px solid rgba(74,158,255,0.3); border-radius:4px;
                                   color:#4a9eff; cursor:pointer; font-size:13px;
                                   transition: all 0.2s; white-space:nowrap;"
                            onmouseenter="this.style.background='rgba(74,158,255,0.3)'"
                            onmouseleave="this.style.background='rgba(74,158,255,0.2)'"
                            title="Save as new project">
                        💾 Save New
                    </button>
                    
                    <!-- Кнопка Overwrite (активна только если проект загружен) -->
                    <button onclick="window.editor.projectUI.saveProject(true)"
                            style="padding:8px 16px; background:${isLoaded ? 'rgba(255,212,59,0.15)' : 'rgba(255,255,255,0.03)'};
                                   border:1px solid ${isLoaded ? 'rgba(255,212,59,0.3)' : 'rgba(255,255,255,0.05)'};
                                   border-radius:4px; color:${isLoaded ? '#ffd43b' : '#444'};
                                   cursor:${isLoaded ? 'pointer' : 'not-allowed'}; font-size:13px;
                                   transition: all 0.2s; white-space:nowrap;
                                   ${!isLoaded ? 'opacity:0.4;' : ''}"
                            onmouseenter="${isLoaded ? 'this.style.background="rgba(255,212,59,0.25)"' : ''}"
                            onmouseleave="${isLoaded ? 'this.style.background="rgba(255,212,59,0.15)"' : ''}"
                            title="${isLoaded ? 'Overwrite current project' : 'No project loaded to overwrite'}">
                        🔄 Overwrite
                    </button>
                </div>
                ${isLoaded ? `<div style="font-size:9px; color:#555; margin-top:4px;">Current: ${this.currentFilename || this.currentProject}</div>` : ''}
            </div>
            
            <div style="display:flex; gap:8px; margin-bottom:12px;">
                <button onclick="window.editor.projectUI.loadProject()"
                        style="flex:1; padding:8px; background:rgba(81,207,102,0.15);
                               border:1px solid rgba(81,207,102,0.2); border-radius:4px;
                               color:#51cf66; cursor:pointer; font-size:13px;
                               transition: all 0.2s;"
                        onmouseenter="this.style.background='rgba(81,207,102,0.25)'"
                        onmouseleave="this.style.background='rgba(81,207,102,0.15)'">
                    📂 Load Project
                </button>
                <input type="file" id="project-file-input" accept=".json"
                       style="display:none;"
                       onchange="window.editor.projectUI.handleFileUpload(event)">
            </div>
            
            <div id="project-list" style="margin-top:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="color:#666; font-size:10px; text-transform:uppercase; letter-spacing:1px;">
                        Saved Projects
                    </span>
                    <span id="project-count" style="color:#444; font-size:9px;">0</span>
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

    async saveProject(overwrite = false) {
        const nameInput = document.getElementById('project-name');
        let projectName = nameInput?.value?.trim() || 'untitled';

        // Если перезапись и есть текущий проект - используем его имя
        if (overwrite && this.currentProject) {
            projectName = this.currentProject;
        }

        const data = this.editor.exportScene();

        try {
            const response = await fetch('/api/project/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectName: projectName,
                    data: data,
                    overwrite: overwrite,
                    currentFilename: overwrite ? this.currentFilename : null
                })
            });

            const result = await response.json();
            if (result.success) {
                // Обновляем текущий проект
                this.currentProject = result.name || projectName;
                this.currentFilename = result.filename;

                // Показываем сообщение
                const action = overwrite ? 'Overwritten' : 'Saved';
                alert(`✅ Project ${action}: ${result.filename}`);

                this.loadProjectList();
                this.render();
            } else {
                alert('❌ Error saving project: ' + (result.error || 'Unknown error'));
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

            // Очищаем сцену и загружаем проект
            this.editor.clearScene();
            this.editor.importScene(data);

            // Сохраняем информацию о загруженном проекте
            const filename = file.name;
            this.currentProject = filename.replace('.json', '').replace(/_\d+$/, '');
            this.currentFilename = filename;

            this.close();
            console.log(`✅ Project loaded: ${filename}`);
            alert(`✅ Project loaded: ${filename}`);
        } catch (error) {
            console.error('❌ Error loading project:', error);
            alert('❌ Error loading project: ' + error.message);
        }

        event.target.value = '';
    }

    async loadProjectList() {
        try {
            const response = await fetch('/api/projects');
            const result = await response.json();
            const container = document.getElementById('project-list-items');
            const countEl = document.getElementById('project-count');

            if (!container) return;

            if (!result.success || !result.projects || result.projects.length === 0) {
                container.innerHTML = `
                    <div style="color:#444; font-size:12px; text-align:center; padding:20px 0;">
                        No saved projects yet
                    </div>
                `;
                if (countEl) countEl.textContent = '0';
                return;
            }

            this.projectsCache = result.projects;
            if (countEl) countEl.textContent = result.projects.length;

            // Сортируем по дате изменения (новые сверху)
            const projects = result.projects.sort((a, b) =>
                new Date(b.modified) - new Date(a.modified)
            );

            container.innerHTML = projects.map(proj => {
                const isCurrent = this.currentFilename === proj.filename;
                const date = new Date(proj.modified);
                const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return `
                    <div style="display:flex; justify-content:space-between; align-items:center;
                                padding:8px 12px; margin:4px 0; 
                                background:${isCurrent ? 'rgba(74,158,255,0.08)' : 'rgba(255,255,255,0.02)'};
                                border:1px solid ${isCurrent ? 'rgba(74,158,255,0.15)' : 'rgba(255,255,255,0.03)'};
                                border-radius:4px;
                                transition: all 0.2s;">
                        <div style="flex:1; min-width:0;">
                            <div style="color:${isCurrent ? '#4a9eff' : '#fff'}; font-size:12px; font-weight:${isCurrent ? '600' : '400'};
                                       overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                                ${proj.name}
                                ${isCurrent ? ' <span style="color:#4a9eff;font-size:9px;">(loaded)</span>' : ''}
                            </div>
                            <div style="color:#555; font-size:9px;">
                                ${dateStr} · ${(proj.size / 1024).toFixed(1)} KB
                            </div>
                        </div>
                        <div style="display:flex; gap:4px; flex-shrink:0;">
                            <button onclick="window.editor.projectUI.loadProjectFile('${proj.filename}')"
                                    style="padding:4px 10px; background:rgba(74,158,255,0.15);
                                           border:1px solid rgba(74,158,255,0.2); border-radius:3px;
                                           color:#4a9eff; cursor:pointer; font-size:10px;
                                           transition: all 0.2s;"
                                    onmouseenter="this.style.background='rgba(74,158,255,0.25)'"
                                    onmouseleave="this.style.background='rgba(74,158,255,0.15)'">
                                📂 Load
                            </button>
                            <button onclick="window.editor.projectUI.deleteProject('${proj.filename}')"
                                    style="padding:4px 10px; background:rgba(255,80,80,0.1);
                                           border:1px solid rgba(255,80,80,0.15); border-radius:3px;
                                           color:#ff6b6b; cursor:pointer; font-size:10px;
                                           transition: all 0.2s;"
                                    onmouseenter="this.style.background='rgba(255,80,80,0.2)'"
                                    onmouseleave="this.style.background='rgba(255,80,80,0.1)'">
                                🗑 Delete
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

        } catch (error) {
            console.error('❌ Error loading project list:', error);
            const container = document.getElementById('project-list-items');
            if (container) {
                container.innerHTML = `
                    <div style="color:#ff6b6b; font-size:12px; text-align:center; padding:20px 0;">
                        ❌ Error loading projects
                    </div>
                `;
            }
        }
    }

    async loadProjectFile(filename) {
        try {
            const response = await fetch(`/api/project/load/${filename}`);
            const result = await response.json();

            if (result.success) {
                // Очищаем сцену и загружаем проект
                this.editor.clearScene();
                this.editor.importScene(result.data);

                // Сохраняем информацию о загруженном проекте
                this.currentProject = filename.replace('.json', '').replace(/_\d+$/, '');
                this.currentFilename = filename;

                this.close();
                console.log(`✅ Project loaded: ${filename}`);
                alert(`✅ Project loaded: ${filename}`);
            } else {
                alert('❌ Error loading project: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('❌ Error loading project:', error);
            alert('❌ Error loading project: ' + error.message);
        }
    }

    async deleteProject(filename) {
        if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
            return;
        }

        try {
            // Используем encodeURIComponent для безопасного URL
            const encodedFilename = encodeURIComponent(filename);
            const url = `/api/project/delete/${encodedFilename}`;

            console.log(`🗑️ Deleting: ${url}`);

            const response = await fetch(url, {
                method: 'DELETE'
            });

            // Проверяем статус ответа
            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                    console.error('Delete error response:', errorData);
                } catch (e) {
                    // Если не удалось распарсить JSON
                    console.error('Error parsing response:', e);
                }
                alert(`❌ Error deleting project: ${errorMessage}`);
                return;
            }

            const result = await response.json();
            console.log('Delete response:', result);

            if (result.success) {
                if (this.currentFilename === filename) {
                    this.currentProject = null;
                    this.currentFilename = null;
                }

                alert(`✅ Project deleted: ${filename}`);
                await this.loadProjectList();
                this.render();
            } else {
                alert('❌ Error deleting project: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('❌ Error deleting project:', error);
            alert('❌ Error deleting project: ' + error.message);
        }
    }
}