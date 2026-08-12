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

// Буферные зоны между панелями
export const PANEL_BUFFER = {
    horizontal: 6,
    vertical: 6,
};

// Минимальные размеры панелей (компактные)
export const PANEL_MIN_SIZES = {
    properties: { width: 180, height: 280 },
    sceneTree: { width: 160, height: 240 },
    tools: { width: 44, height: 240 },
    spawn: { width: 170, height: 200 },
};

// Максимальные размеры панелей
export const PANEL_MAX_SIZES = {
    properties: { width: 280, height: 420 },
    sceneTree: { width: 240, height: 380 },
    tools: { width: 60, height: 340 },
    spawn: { width: 240, height: 340 },
};

// Дефолтные позиции и размеры панелей (базовые)
export const PANEL_DEFAULTS = {
    properties: {
        position: PANEL_POSITIONS.TOP_RIGHT,
        visible: true,
        title: 'Properties',
        icon: '📐',
        width: 200,
        height: 320,
    },
    sceneTree: {
        position: PANEL_POSITIONS.BOTTOM_RIGHT,
        visible: true,
        title: 'Objects',
        icon: '📦',
        width: 180,
        height: 260,
    },
    tools: {
        position: PANEL_POSITIONS.MIDDLE_LEFT,
        visible: true,
        title: 'Tools',
        icon: '🔧',
        width: 44,
        height: 260,
        restrictedPositions: ['top-left', 'top-center', 'top-right'],
    },
    spawn: {
        position: PANEL_POSITIONS.BOTTOM_LEFT,
        visible: true,
        title: 'Create',
        icon: '➕',
        width: 180,
        height: 220,
    },
};

export const PANEL_NAMES = {
    properties: 'Properties',
    sceneTree: 'Objects',
    tools: 'Tools',
    spawn: 'Create',
};

export const ALL_PANELS = ['properties', 'sceneTree', 'tools', 'spawn'];

export const PANEL_RESTRICTIONS = {
    tools: ['top-left', 'top-center', 'top-right'],
    properties: [],
    sceneTree: [],
    spawn: [],
};

export const PANEL_PRIORITY = {
    tools: 0,
    properties: 1,
    sceneTree: 1,
    spawn: 1,
};