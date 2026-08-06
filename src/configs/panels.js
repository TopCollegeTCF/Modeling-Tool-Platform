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

// Дефолтные позиции панелей
export const PANEL_DEFAULTS = {
    properties: {
        position: PANEL_POSITIONS.TOP_RIGHT,
        visible: true,
        title: 'Properties',
        icon: '📐',
    },
    sceneTree: {
        position: PANEL_POSITIONS.BOTTOM_RIGHT,
        visible: true,
        title: 'Objects',
        icon: '📦',
    },
    tools: {
        position: PANEL_POSITIONS.MIDDLE_LEFT,
        visible: true,
        title: 'Tools',
        icon: '🔧',
    },
    spawn: {
        position: PANEL_POSITIONS.BOTTOM_LEFT,
        visible: true,
        title: 'Create',
        icon: '➕',
    },
};

export const PANEL_NAMES = {
    properties: 'Properties',
    sceneTree: 'Objects',
    tools: 'Tools',
    spawn: 'Create',
};

// Все доступные панели
export const ALL_PANELS = ['properties', 'sceneTree', 'tools', 'spawn'];