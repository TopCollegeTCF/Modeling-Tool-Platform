import { COLORS } from './colors.js';

export const TEMPLATES = {
    // Стили для панелей
    panel: {
        container: `
            position: fixed;
            z-index: 1000;
            background: ${COLORS.surface};
            backdrop-filter: blur(10px);
            padding: 16px;
            border-radius: 10px;
            border: 1px solid ${COLORS.border};
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            min-width: 180px;
            max-width: 280px;
            max-height: calc(100vh - 24px);
            overflow-y: auto;
            overflow-x: hidden;
            transition: all 0.3s ease;
        `,
        title: `
            color: #666;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
            font-weight: 600;
        `,
        scrollbar: `
            &::-webkit-scrollbar {
                width: 3px;
            }
            &::-webkit-scrollbar-track {
                background: transparent;
            }
            &::-webkit-scrollbar-thumb {
                background: rgba(255,255,255,0.15);
                border-radius: 2px;
            }
            &::-webkit-scrollbar-thumb:hover {
                background: rgba(255,255,255,0.25);
            }
        `,
    },
    
    // Стили для свойств
    properties: {
        group: `
            margin-bottom: 8px;
        `,
        label: `
            color: #888;
            font-size: 10px;
            display: block;
            margin-bottom: 2px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        `,
        row: `
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 4px;
        `,
        input: `
            width: 100%;
            padding: 3px 6px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 3px;
            color: #fff;
            font-size: 11px;
            box-sizing: border-box;
            transition: border-color 0.2s;
            &:focus {
                outline: none;
                border-color: ${COLORS.accent.blue};
            }
        `,
        inputFull: `
            width: 100%;
            padding: 3px 6px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 3px;
            color: #fff;
            font-size: 11px;
            box-sizing: border-box;
            &:focus {
                outline: none;
                border-color: ${COLORS.accent.blue};
            }
        `,
    },
    
    // Стили для кнопок
    buttons: {
        group: `
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
            margin-top: 8px;
        `,
        base: `
            flex: 1;
            min-width: 40px;
            padding: 5px 8px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            transition: all 0.2s;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            &:hover {
                opacity: 0.8;
                transform: scale(0.98);
            }
        `,
        danger: `
            background: rgba(255,80,80,0.15);
            border: 1px solid rgba(255,80,80,0.2);
            color: ${COLORS.accent.red};
            &:hover {
                background: rgba(255,80,80,0.25);
            }
        `,
        primary: `
            background: rgba(74,158,255,0.15);
            border: 1px solid rgba(74,158,255,0.2);
            color: ${COLORS.accent.blue};
            &:hover {
                background: rgba(74,158,255,0.25);
            }
        `,
        success: `
            background: rgba(81,207,102,0.15);
            border: 1px solid rgba(81,207,102,0.2);
            color: ${COLORS.accent.green};
            &:hover {
                background: rgba(81,207,102,0.25);
            }
        `,
        icon: `
            width: 28px;
            height: 28px;
            padding: 0;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
            background: transparent;
            color: #888;
            display: flex;
            align-items: center;
            justify-content: center;
            &:hover {
                background: rgba(255,255,255,0.05);
                color: #fff;
            }
            &.active {
                background: rgba(74,158,255,0.2);
                color: ${COLORS.accent.blue};
            }
        `,
    },
    
    // Стили для дерева объектов
    tree: {
        item: `
            padding: 4px 8px;
            margin: 2px 0;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 6px;
            &:hover {
                background: rgba(255,255,255,0.05);
            }
            &.selected {
                background: rgba(74,158,255,0.15);
                color: ${COLORS.accent.blue};
            }
        `,
        icon: `
            font-size: 14px;
        `,
        name: `
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        `,
    },
    
    // Стили для информационных сообщений
    info: {
        text: `
            color: #555;
            font-size: 11px;
            text-align: center;
            padding: 15px 0;
        `,
    },
};

// Функция для применения стилей к элементу
export function applyStyles(element, styles) {
    if (typeof styles === 'string') {
        element.style.cssText = styles;
    } else if (typeof styles === 'object') {
        Object.assign(element.style, styles);
    }
    return element;
}

// Функция для создания элемента с классами и стилями
export function createElement(tag, options = {}) {
    const element = document.createElement(tag);
    
    if (options.className) {
        element.className = options.className;
    }
    
    if (options.styles) {
        applyStyles(element, options.styles);
    }
    
    if (options.innerHTML) {
        element.innerHTML = options.innerHTML;
    }
    
    if (options.textContent) {
        element.textContent = options.textContent;
    }
    
    if (options.attributes) {
        Object.entries(options.attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    }
    
    if (options.events) {
        Object.entries(options.events).forEach(([event, handler]) => {
            element.addEventListener(event, handler);
        });
    }
    
    return element;
}