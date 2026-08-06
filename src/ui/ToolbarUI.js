import { ICONS } from '../configs/icons.js';

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
            gap: 3px;
            z-index: 1000;
            background: rgba(16, 16, 32, 0.95);
            backdrop-filter: blur(10px);
            padding: 6px;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.08);
        `;
        this.element.setAttribute('data-panel', 'tools');
        
        const tools = this.editor.toolManager.tools;
        tools.forEach((tool, name) => {
            const btn = this.createToolButton(tool, name);
            this.element.appendChild(btn);
        });
        
        // Разделитель
        const divider = document.createElement('div');
        divider.style.cssText = `
            border-top: 1px solid rgba(255,255,255,0.08);
            margin: 3px 0;
        `;
        this.element.appendChild(divider);
        
        // Кнопка настроек (только одна!)
        const settingsBtn = this.createSettingsButton();
        this.element.appendChild(settingsBtn);
        
        // Кнопка удаления
        const deleteBtn = this.createDeleteButton();
        this.element.appendChild(deleteBtn);
        
        document.body.appendChild(this.element);
        this.updateActiveTool('select');
        console.log('✅ ToolbarUI initialized');
    }
    
    createToolButton(tool, name) {
        const btn = document.createElement('button');
        btn.title = `${tool.name} (${tool.shortcut || ''})`;
        btn.dataset.tool = name;
        btn.style.cssText = `
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 6px;
            background: transparent;
            color: #888;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const iconMap = {
            'select': ICONS.select,
            'move': ICONS.move,
            'scale': ICONS.scale,
            'rotate': ICONS.rotate,
            'face-edit': ICONS.faceEdit,
        };
        
        const img = document.createElement('img');
        img.src = iconMap[name] || '';
        img.style.cssText = 'width:18px; height:18px; filter: invert(0.5);';
        img.alt = tool.name;
        img.onerror = () => {
            img.style.display = 'none';
            btn.textContent = tool.icon || '🔧';
        };
        btn.appendChild(img);
        
        btn.addEventListener('mouseenter', () => {
            btn.style.background = 'rgba(255,255,255,0.08)';
            btn.style.color = '#fff';
            const imgEl = btn.querySelector('img');
            if (imgEl) imgEl.style.filter = 'invert(1)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = 'transparent';
            btn.style.color = '#888';
            const imgEl = btn.querySelector('img');
            if (imgEl) imgEl.style.filter = 'invert(0.5)';
        });
        
        btn.addEventListener('click', () => {
            this.editor.toolManager.switchTool(name);
            this.updateActiveTool(name);
        });
        
        return btn;
    }
    
    createSettingsButton() {
        const btn = document.createElement('button');
        btn.title = 'Settings';
        btn.style.cssText = `
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 6px;
            background: transparent;
            color: #888;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const img = document.createElement('img');
        img.src = ICONS.settings;
        img.style.cssText = 'width:18px; height:18px; filter: invert(0.5);';
        img.alt = 'Settings';
        img.onerror = () => {
            img.style.display = 'none';
            btn.textContent = '⚙';
        };
        btn.appendChild(img);
        
        btn.addEventListener('mouseenter', () => {
            btn.style.background = 'rgba(255,255,255,0.08)';
            btn.style.color = '#fff';
            const imgEl = btn.querySelector('img');
            if (imgEl) imgEl.style.filter = 'invert(1)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = 'transparent';
            btn.style.color = '#888';
            const imgEl = btn.querySelector('img');
            if (imgEl) imgEl.style.filter = 'invert(0.5)';
        });
        
        btn.addEventListener('click', () => {
            this.editor.settingsUI.toggle();
        });
        
        return btn;
    }
    
    createDeleteButton() {
        const btn = document.createElement('button');
        btn.title = 'Delete selected (Delete)';
        btn.style.cssText = `
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 6px;
            background: transparent;
            color: #ff6b6b;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const img = document.createElement('img');
        img.src = ICONS.delete;
        img.style.cssText = 'width:18px; height:18px; filter: invert(0.3) sepia(1) hue-rotate(-30deg) saturate(10);';
        img.alt = 'Delete';
        img.onerror = () => {
            img.style.display = 'none';
            btn.textContent = '🗑';
        };
        btn.appendChild(img);
        
        btn.addEventListener('mouseenter', () => {
            btn.style.background = 'rgba(255,80,80,0.15)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = 'transparent';
        });
        
        btn.addEventListener('click', () => {
            this.editor.deleteSelected();
        });
        
        return btn;
    }
    
    updateActiveTool(name) {
        const buttons = this.element.querySelectorAll('button[data-tool]');
        buttons.forEach(btn => {
            const img = btn.querySelector('img');
            if (btn.dataset.tool === name) {
                btn.style.background = 'rgba(74, 158, 255, 0.2)';
                btn.style.color = '#4a9eff';
                if (img) img.style.filter = 'invert(0.5) sepia(1) hue-rotate(200deg) saturate(5)';
            } else {
                btn.style.background = 'transparent';
                btn.style.color = '#888';
                if (img) img.style.filter = 'invert(0.5)';
            }
        });
    }
}