export const PANEL_POSITIONS = {
    TOP_LEFT: 'top-left',
    TOP_CENTER: 'top-center',
    TOP_RIGHT: 'top-right',
    MIDDLE_LEFT: 'middle-left',
    MIDDLE_RIGHT: 'middle-right',
    BOTTOM_LEFT: 'bottom-left',
    BOTTOM_CENTER: 'bottom-center',
    BOTTOM_RIGHT: 'bottom-right',
};

export const PANEL_POSITION_STYLES = {
    [PANEL_POSITIONS.TOP_LEFT]: {
        top: '12px',
        left: '12px',
        transform: 'none',
    },
    [PANEL_POSITIONS.TOP_CENTER]: {
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
    },
    [PANEL_POSITIONS.TOP_RIGHT]: {
        top: '12px',
        right: '12px',
        transform: 'none',
    },
    [PANEL_POSITIONS.MIDDLE_LEFT]: {
        top: '50%',
        left: '12px',
        transform: 'translateY(-50%)',
    },
    [PANEL_POSITIONS.MIDDLE_RIGHT]: {
        top: '50%',
        right: '12px',
        transform: 'translateY(-50%)',
    },
    [PANEL_POSITIONS.BOTTOM_LEFT]: {
        bottom: '12px',
        left: '12px',
        transform: 'none',
    },
    [PANEL_POSITIONS.BOTTOM_CENTER]: {
        bottom: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
    },
    [PANEL_POSITIONS.BOTTOM_RIGHT]: {
        bottom: '12px',
        right: '12px',
        transform: 'none',
    },
};

export const PANEL_POSITION_ICONS = {
    [PANEL_POSITIONS.TOP_LEFT]: '↖',
    [PANEL_POSITIONS.TOP_CENTER]: '↑',
    [PANEL_POSITIONS.TOP_RIGHT]: '↗',
    [PANEL_POSITIONS.MIDDLE_LEFT]: '←',
    [PANEL_POSITIONS.MIDDLE_RIGHT]: '→',
    [PANEL_POSITIONS.BOTTOM_LEFT]: '↙',
    [PANEL_POSITIONS.BOTTOM_CENTER]: '↓',
    [PANEL_POSITIONS.BOTTOM_RIGHT]: '↘',
};

export const PANEL_POSITION_GRID = [
    ['top-left', 'top-center', 'top-right'],
    ['middle-left', 'center', 'middle-right'],
    ['bottom-left', 'bottom-center', 'bottom-right'],
];

// Дефолтные позиции и размеры панелей
export const PANEL_DEFAULTS = {
    properties: {
        position: PANEL_POSITIONS.TOP_RIGHT,
        visible: true,
        title: 'Properties',
        icon: '📐',
        width: 240,
        height: 380,
    },
    sceneTree: {
        position: PANEL_POSITIONS.BOTTOM_RIGHT,
        visible: true,
        title: 'Objects',
        icon: '📦',
        width: 200,
        height: 300,
    },
    tools: {
        position: PANEL_POSITIONS.MIDDLE_LEFT,
        visible: true,
        title: 'Tools',
        icon: '🔧',
        width: 50,
        height: 280,
        restrictedPositions: ['top-left', 'top-center', 'top-right'],
    },
    spawn: {
        position: PANEL_POSITIONS.BOTTOM_LEFT,
        visible: true,
        title: 'Create',
        icon: '➕',
        width: 190,
        height: 180,
    },
};

export const PANEL_NAMES = {
    properties: 'Properties',
    sceneTree: 'Objects',
    tools: 'Tools',
    spawn: 'Create',
};

export const ALL_PANELS = ['properties', 'sceneTree', 'tools', 'spawn'];

// Ограничения для панелей (не могут занимать эти позиции)
export const PANEL_RESTRICTIONS = {
    tools: ['top-left', 'top-center', 'top-right'],
    properties: [], // Может быть где угодно
    sceneTree: [], // Может быть где угодно
    spawn: [], // Может быть где угодно
};

// Приоритеты панелей при конфликте позиций (чем выше число, тем выше приоритет)
export const PANEL_PRIORITY = {
    tools: 0, // Самый низкий приоритет - всегда уступает
    properties: 1,
    sceneTree: 1,
    spawn: 1,
};