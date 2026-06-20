import { AuthManager } from './authManager.js';
import { ThreeManager } from './threeManager.js';
import { TweakpaneManager } from './tweakpaneManager.js';
import { SocketManager } from './socketManager.js';

// Глобальное состояние
const state = {
    currentProject: null,
    isEditorOpen: false,
    socket: null,
    hasUnsavedChanges: false
};

// Инициализация менеджеров
const authManager = new AuthManager();
let threeManager = null;
let tweakpaneManager = null;

// DOM элементы
const authContainer = document.getElementById('auth-container');
const dashboard = document.getElementById('dashboard');
const editorContainer = document.getElementById('editor-container');
const threeContainer = document.getElementById('three-container');
const projectsGrid = document.getElementById('projects-grid');
const userInfo = document.getElementById('user-info');
const logoutBtn = document.getElementById('logout-btn');

// ============= Функции UI =============

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updateUI(isAuthenticated) {
    if (isAuthenticated && authManager.user) {
        authContainer.style.display = 'none';
        dashboard.style.display = 'block';
        editorContainer.style.display = 'none';
        userInfo.textContent = `👤 ${authManager.user.username}`;
        logoutBtn.style.display = 'inline-block';
        loadProjects();
        initSocket();
    } else {
        authContainer.style.display = 'flex';
        dashboard.style.display = 'none';
        editorContainer.style.display = 'none';
        userInfo.textContent = '';
        logoutBtn.style.display = 'none';
        if (state.socket) {
            state.socket.disconnect();
            state.socket = null;
        }
    }
}

// ============= Аутентификация =============

document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        await authManager.login(email, password);
        updateUI(true);
        showToast('Вход выполнен успешно!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
});

document.getElementById('register-btn').addEventListener('click', async () => {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-password-confirm').value;
    
    if (password !== confirm) {
        showToast('Пароли не совпадают', 'error');
        return;
    }
    
    try {
        await authManager.register(username, email, password);
        updateUI(true);
        showToast('Регистрация успешна!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
});

document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
});

document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
});

logoutBtn.addEventListener('click', () => {
    authManager.logout();
    updateUI(false);
    showToast('Вы вышли из системы', 'info');
});

// ============= Работа с проектами =============

async function loadProjects() {
    try {
        const response = await fetch('/api/projects', {
            headers: authManager.getAuthHeader()
        });
        
        if (!response.ok) throw new Error('Failed to load projects');
        
        const projects = await response.json();
        renderProjects(projects);
    } catch (error) {
        showToast('Ошибка загрузки проектов', 'error');
    }
}

function renderProjects(projects) {
    projectsGrid.innerHTML = '';
    
    if (projects.length === 0) {
        projectsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px; color: #666;">
                <p>У вас пока нет проектов</p>
                <p style="font-size: 14px; margin-top: 10px;">Нажмите "Новый проект" чтобы начать</p>
            </div>
        `;
        return;
    }
    
    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';
        const date = new Date(project.updated_at).toLocaleDateString('ru-RU');
        
        card.innerHTML = `
            <h3>${project.name}</h3>
            <p>${project.description || 'Без описания'}</p>
            <div class="project-meta">Обновлен: ${date}</div>
            <button class="delete-project" data-id="${project.id}">Удалить</button>
        `;
        
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-project')) return;
            openProject(project.id);
        });
        
        const deleteBtn = card.querySelector('.delete-project');
        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm(`Удалить проект "${project.name}"?`)) {
                await deleteProject(project.id);
            }
        });
        
        projectsGrid.appendChild(card);
    });
}

async function deleteProject(id) {
    try {
        const response = await fetch(`/api/projects/${id}`, {
            method: 'DELETE',
            headers: authManager.getAuthHeader()
        });
        
        if (!response.ok) throw new Error('Failed to delete project');
        
        showToast('Проект удален', 'success');
        loadProjects();
    } catch (error) {
        showToast('Ошибка удаления проекта', 'error');
    }
}

document.getElementById('new-project-btn').addEventListener('click', async () => {
    const name = prompt('Введите название проекта:');
    if (!name) return;
    
    try {
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: {
                ...authManager.getAuthHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, description: '' })
        });
        
        if (!response.ok) throw new Error('Failed to create project');
        
        const project = await response.json();
        showToast('Проект создан!', 'success');
        loadProjects();
        openProject(project.id);
    } catch (error) {
        showToast('Ошибка создания проекта', 'error');
    }
});

// ============= WebSocket =============

function initSocket() {
    if (!state.socket && authManager.token) {
        state.socket = new SocketManager(authManager.token);
        
        state.socket.on('scene-updated', (data) => {
            if (data.userId !== authManager.user.id && state.currentProject) {
                // Обновляем сцену от других пользователей
                if (threeManager) {
                    threeManager.loadSceneData(data.sceneData);
                    showToast('Сцена обновлена другим пользователем', 'info');
                }
            }
        });
        
        state.socket.on('action-performed', (data) => {
            if (data.userId !== authManager.user.id) {
                showToast(`Пользователь выполнил действие: ${data.action}`, 'info');
            }
        });
    }
}

// ============= Редактор 3D =============

async function openProject(projectId) {
    try {
        const response = await fetch(`/api/projects/${projectId}`, {
            headers: authManager.getAuthHeader()
        });
        
        if (!response.ok) throw new Error('Failed to load project');
        
        const project = await response.json();
        state.currentProject = project;
        state.isEditorOpen = true;
        state.hasUnsavedChanges = false;
        
        // Переключение UI
        dashboard.style.display = 'none';
        editorContainer.style.display = 'flex';
        document.getElementById('project-name').textContent = project.name;
        
        // Инициализация 3D сцены
        if (!threeManager) {
            threeManager = new ThreeManager(threeContainer);
            tweakpaneManager = new TweakpaneManager(threeManager, () => {
                state.hasUnsavedChanges = true;
            });
            tweakpaneManager.onExport(handleExport);
            
            // Настройка клика для выделения объектов
            threeManager.renderer.domElement.addEventListener('click', (event) => {
                // В реальном проекте здесь нужно делать raycasting
                // Для простоты - выделяем последний добавленный объект
                const objects = threeManager.objects;
                if (objects.length > 0) {
                    threeManager.selectObject(objects[objects.length - 1]);
                    tweakpaneManager.updateSelected(threeManager.selectedObject);
                }
            });
        }
        
        // Загрузка данных сцены
        if (project.scene_data && Object.keys(project.scene_data).length > 0) {
            threeManager.loadSceneData(project.scene_data);
        } else {
            threeManager.clearScene();
        }
        
        // Подключение к комнате WebSocket
        if (state.socket) {
            state.socket.joinProject(projectId);
        }
        
        // Обновляем Tweakpane
        tweakpaneManager.updateSelected(null);
        
    } catch (error) {
        showToast('Ошибка загрузки проекта', 'error');
    }
}

document.getElementById('save-project-btn').addEventListener('click', async () => {
    if (!state.currentProject || !threeManager) return;
    
    try {
        const sceneData = threeManager.getSceneData();
        const response = await fetch(`/api/projects/${state.currentProject.id}`, {
            method: 'PUT',
            headers: {
                ...authManager.getAuthHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ scene_data: sceneData })
        });
        
        if (!response.ok) throw new Error('Failed to save project');
        
        state.hasUnsavedChanges = false;
        showToast('Проект сохранен!', 'success');
        
        // Отправляем обновление через WebSocket
        if (state.socket) {
            state.socket.sendSceneUpdate(state.currentProject.id, sceneData);
        }
        
        // Обновляем дату в дашборде
        loadProjects();
    } catch (error) {
        showToast('Ошибка сохранения проекта', 'error');
    }
});

document.getElementById('back-dashboard-btn').addEventListener('click', () => {
    if (state.hasUnsavedChanges) {
        if (!confirm('У вас есть несохраненные изменения. Вы уверены?')) {
            return;
        }
    }
    
    state.isEditorOpen = false;
    editorContainer.style.display = 'none';
    dashboard.style.display = 'block';
    state.currentProject = null;
    loadProjects();
    
    // Отключаемся от комнаты WebSocket
    if (state.socket) {
        state.socket.off('scene-updated');
        state.socket.off('action-performed');
    }
});

// ============= Экспорт =============

async function handleExport(format) {
    if (!threeManager || threeManager.objects.length === 0) {
        showToast('Нет объектов для экспорта', 'error');
        return;
    }
    
    try {
        let data, filename, mimeType;
        
        if (format === 'stl') {
            const stlData = await threeManager.exportSTL();
            data = stlData;
            filename = `${state.currentProject.name || 'model'}.stl`;
            mimeType = 'application/octet-stream';
        } else {
            const gltfData = await threeManager.exportGLTF();
            data = gltfData;
            filename = `${state.currentProject.name || 'model'}.glb`;
            mimeType = 'model/gltf-binary';
        }
        
        // Создаем ссылку для скачивания
        const blob = new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showToast(`Экспорт в ${format.toUpperCase()} выполнен!`, 'success');
    } catch (error) {
        showToast(`Ошибка экспорта: ${error.message}`, 'error');
    }
}

document.getElementById('export-stl-btn').addEventListener('click', () => handleExport('stl'));
document.getElementById('export-gltf-btn').addEventListener('click', () => handleExport('gltf'));

// ============= Инициализация =============

authManager.onAuthChange = (isAuthenticated) => {
    updateUI(isAuthenticated);
};

// Проверяем существующую сессию
if (authManager.isAuthenticated()) {
    updateUI(true);
} else {
    updateUI(false);
}

// Обработка перед закрытием страницы
window.addEventListener('beforeunload', (e) => {
    if (state.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'У вас есть несохраненные изменения';
    }
});

console.log('🚀 3D Modeler запущен!');