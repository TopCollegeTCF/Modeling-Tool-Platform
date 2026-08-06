export class ToolbarUI {
    constructor(editor) {
        this.editor = editor;
        this.element = null;
    }
    
    init() {
        this.element = document.createElement('div');
        this.element.id = 'toolbar';
        this.element.style.cssText = `
            position: fixed;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            flex-direction: column;
            gap: 4px;
            z-index: 1000;
            background: rgba(16, 16, 32, 0.95);
            backdrop-filter: blur(10px);
            padding: 8px;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.08);
        `;
        
        // Создаем кнопки для всех инструментов
        const tools = this.editor.toolManager.tools;
        tools.forEach((tool, name) => {
            const btn = document.createElement('button');
            btn.title = `${tool.name} (${tool.shortcut || ''})`;
            btn.textContent = tool.icon || '🔧';
            btn.dataset.tool = name;
            btn.style.cssText = `
                width: 36px;
                height: 36px;
                border: none;
                border-radius: 6px;
                background: transparent;
                color: #888;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.2s;
            `;
            
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'rgba(255,255,255,0.08)';
                btn.style.color = '#fff';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'transparent';
                btn.style.color = '#888';
            });
            
            btn.addEventListener('click', () => {
                this.editor.toolManager.switchTool(name);
                this.updateActiveTool(name);
            });
            
            this.element.appendChild(btn);
        });
        
        // Разделитель
        const divider = document.createElement('div');
        divider.style.cssText = `
            border-top: 1px solid rgba(255,255,255,0.08);
            margin: 4px 0;
        `;
        this.element.appendChild(divider);
        
        // Кнопка удаления
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑';
        deleteBtn.title = 'Delete selected (Delete)';
        deleteBtn.style.cssText = `
            width: 36px;
            height: 36px;
            border: none;
            border-radius: 6px;
            background: transparent;
            color: #ff6b6b;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s;
        `;
        deleteBtn.addEventListener('mouseenter', () => {
            deleteBtn.style.background = 'rgba(255,80,80,0.15)';
        });
        deleteBtn.addEventListener('mouseleave', () => {
            deleteBtn.style.background = 'transparent';
        });
        deleteBtn.addEventListener('click', () => {
            this.editor.deleteSelected();
        });
        this.element.appendChild(deleteBtn);
        
        document.body.appendChild(this.element);
        
        // Обновляем активный инструмент
        this.updateActiveTool('select');
    }
    
    updateActiveTool(name) {
        const buttons = this.element.querySelectorAll('button[data-tool]');
        buttons.forEach(btn => {
            if (btn.dataset.tool === name) {
                btn.style.background = 'rgba(74, 158, 255, 0.2)';
                btn.style.color = '#4a9eff';
            } else {
                btn.style.background = 'transparent';
                btn.style.color = '#888';
            }
        });
    }
}