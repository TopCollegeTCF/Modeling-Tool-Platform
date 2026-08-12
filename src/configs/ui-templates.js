/**
 * 🎨 UI TEMPLATES - Шаблоны для UI компонентов
 *
 * 📋 ОПИСАНИЕ:
 * Содержит HTML шаблоны для всех UI компонентов.
 * Используется для создания элементов интерфейса.
 *
 * @version 1.0.1
 * @author Gabryelf
 * @since 0.1.0
 */
 export const UI_TEMPLATES = {
    /**
     * Шаблон панели свойств
     */
    properties: {
        empty: `
            <div style="color: {textMuted}; font-size: 11px; text-align: center; padding: 15px 0;">
                No object selected
            </div>
        `,
        header: `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="color: {labelColor}; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                    {icon} Properties
                </span>
                <button onclick="window.editor.deleteSelected()"
                        style="background: transparent; border: none; color: {labelColor}; cursor: pointer; padding: 2px; transition: all 0.2s; display: flex; align-items: center;"
                        onmouseenter="this.style.color='#ff6b6b'"
                        onmouseleave="this.style.color='{labelColor}'"
                        title="Delete selected">
                    {deleteIcon}
                </button>
            </div>
        `,
        nameInput: `
            <div style="margin-bottom: 5px;">
                <label style="{labelStyle}">Name</label>
                <input type="text" id="prop-name" value="{name}"
                       style="{inputStyle}">
            </div>
        `,
        appearance: `
            <div style="margin-bottom: 5px; padding: 6px 8px; background: {surfaceLight}; border-radius: 4px;">
                <label style="{labelStyle}">🎨 Appearance</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                    <div>
                        <label style="color: {textMuted}; font-size: 7px; display: block; margin-bottom: 1px;">Color</label>
                        <input type="color" id="prop-color" value="{color}"
                               style="width: 100%; padding: 1px; background: transparent;
                                      border: 1px solid {borderColor}; border-radius: 2px;
                                      cursor: pointer; height: 24px;">
                    </div>
                    <div>
                        <label style="color: {textMuted}; font-size: 7px; display: block; margin-bottom: 1px;">Opacity</label>
                        <input type="range" id="prop-opacity" min="0" max="1" step="0.05" value="{opacity}"
                               style="width: 100%; margin: 0; height: 4px; background: {borderColor};
                                      border-radius: 2px; -webkit-appearance: none; appearance: none;
                                      cursor: pointer;">
                        <div style="display: flex; justify-content: space-between; font-size: 7px; color: {textMuted};">
                            <span>0%</span>
                            <span id="opacity-value">{opacityPercent}%</span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>
            </div>
        `,
        transform: {
            position: `
                <div style="margin-bottom: 4px;">
                    <label style="{labelStyle}">Position</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2px;">
                        {inputs}
                    </div>
                </div>
            `,
            rotation: `
                <div style="margin-bottom: 4px;">
                    <label style="{labelStyle}">Rotation</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2px;">
                        {inputs}
                    </div>
                </div>
            `,
            scale: `
                <div style="margin-bottom: 5px;">
                    <label style="{labelStyle}">Scale</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2px;">
                        {inputs}
                    </div>
                </div>
            `,
        },
        input: {
            single: `
                <input class="prop-input" data-prop="{prop}" data-axis="{axis}" type="number" value="{value}" step="{step}" {extra}
                       style="{inputStyle}">
            `,
        },
    },
    /**
     * Шаблоны для SceneTree
     */
    sceneTree: {
        header: `
            <div style="color: #666; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-bottom: 8px;">
                Objects ({count})
            </div>
        `,
        empty: `
            <div style="color: #444; font-size: 11px; text-align: center; padding: 10px 0;">
                No objects
            </div>
        `,
        item: `
            <div style="padding: 3px 6px; margin: 2px 0; border-radius: 3px; cursor: pointer;
                        font-size: 11px; transition: all 0.2s; display: flex; align-items: center; gap: 4px;
                        color: {color}; background: {background};"
                 onmouseenter="this.style.background='rgba(255,255,255,0.05)'"
                 onmouseleave="this.style.background='{background}'"
                 onclick="
                    const entity = window.editor.sceneManager.getEntity({id});
                    if (entity) {
                        window.editor.selectionManager.select(entity);
                        window.editor.uiManager.updateUI();
                    }
                 ">
                <span>{icon}</span>
                <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{name}</span>
            </div>
        `,
    },
    /**
     * Шаблоны для SpawnUI
     */
    spawn: {
        header: `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="color: #666; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">{icon} Create</span>
                <span style="font-size: 8px; color: #444; background: rgba(255,255,255,0.05); padding: 1px 6px; border-radius: 10px;">
                    {mode}
                </span>
            </div>
        `,
        buttons: {
            cube: `
                <button onclick="window.editor.shapeManager.createCube()"
                        style="display: flex; align-items: center; gap: 6px; padding: 3px 6px;
                               background: rgba(74,158,255,0.15); border: 1px solid rgba(74,158,255,0.2);
                               border-radius: 3px; color: #4a9eff; cursor: pointer; font-size: 11px;
                               transition: all 0.2s; width: 100%; justify-content: center;"
                        onmouseenter="this.style.background='rgba(74,158,255,0.25)'"
                        onmouseleave="this.style.background='rgba(74,158,255,0.15)'">
                    {icon} Cube
                </button>
            `,
            sphere: `
                <button onclick="window.editor.shapeManager.createSphere()"
                        style="display: flex; align-items: center; gap: 6px; padding: 3px 6px;
                               background: rgba(255,107,107,0.15); border: 1px solid rgba(255,107,107,0.2);
                               border-radius: 3px; color: #ff6b6b; cursor: pointer; font-size: 11px;
                               transition: all 0.2s; width: 100%; justify-content: center;"
                        onmouseenter="this.style.background='rgba(255,107,107,0.25)'"
                        onmouseleave="this.style.background='rgba(255,107,107,0.15)'">
                    {icon} Sphere
                </button>
            `,
            cylinder: `
                <button onclick="window.editor.shapeManager.createCylinder()"
                        style="display: flex; align-items: center; gap: 6px; padding: 3px 6px;
                               background: rgba(81,207,102,0.15); border: 1px solid rgba(81,207,102,0.2);
                               border-radius: 3px; color: #51cf66; cursor: pointer; font-size: 11px;
                               transition: all 0.2s; width: 100%; justify-content: center;"
                        onmouseenter="this.style.background='rgba(81,207,102,0.25)'"
                        onmouseleave="this.style.background='rgba(81,207,102,0.15)'">
                    {icon} Cylinder
                </button>
            `,
        },
    },
    /**
     * Шаблоны для SettingsUI
     */
    settings: {
        header: `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h2 style="color: #fff; font-weight: 400; font-size: 18px; margin: 0;">{icon} Settings</h2>
                <button onclick="window.editor.settingsUI.close()"
                        style="background: transparent; border: none; color: #666; font-size: 20px; cursor: pointer; padding: 4px 8px;">
                    ✕
                </button>
            </div>
        `,
        displaySection: {
            container: `
                <div style="margin-bottom: 16px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 6px;">
                    <div style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                        🎨 Display Settings
                    </div>
                    {content}
                </div>
            `,
            theme: `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="color: #aaa; font-size: 11px;">Theme</span>
                    <div style="display: flex; gap: 4px;">
                        <button onclick="window.editor.settingsUI.setTheme('dark')"
                                style="padding: 4px 12px; border: 1px solid {activeBorder}; border-radius: 4px;
                                       background: {activeBg}; color: {activeColor}; cursor: pointer; font-size: 11px;">
                            🌙 Dark
                        </button>
                        <button onclick="window.editor.settingsUI.setTheme('light')"
                                style="padding: 4px 12px; border: 1px solid {inactiveBorder}; border-radius: 4px;
                                       background: {inactiveBg}; color: {inactiveColor}; cursor: pointer; font-size: 11px;">
                            ☀️ Light
                        </button>
                    </div>
                </div>
            `,
            toggle: `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="color: #aaa; font-size: 11px;">{label}</span>
                    <button onclick="window.editor.settingsUI.{onClick}()"
                            style="padding: 4px 12px; border: 1px solid {border}; border-radius: 4px;
                                   background: {bg}; color: {color}; cursor: pointer; font-size: 11px;">
                        {status}
                    </button>
                </div>
            `,
            helperSize: `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="color: #aaa; font-size: 11px;">Helper Size</span>
                    <div style="display: flex; gap: 4px;">
                        {buttons}
                    </div>
                </div>
            `,
        },
        cameraSection: `
            <div style="margin-bottom: 16px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 6px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="color: #888; font-size: 12px;">📷 Camera Settings</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
                    <span style="color: #aaa; font-size: 11px;">Allow camera below floor</span>
                    <button onclick="window.editor.settingsUI.toggleCameraFloorLimit()"
                            style="padding: 4px 12px; border: 1px solid {border}; border-radius: 4px;
                                   background: {bg}; color: {color}; cursor: pointer; font-size: 11px;
                                   transition: all 0.2s;">
                        {status}
                    </button>
                </div>
                <div style="font-size: 10px; color: #555; margin-top: 4px;">
                    {description}
                </div>
            </div>
        `,
        spawnSection: `
            <div style="margin-bottom: 16px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 6px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="color: #888; font-size: 12px;">{icon} Spawn Mode</span>
                    <button onclick="window.editor.toggleSpawnMode(); window.editor.settingsUI.render();"
                            style="padding: 4px 12px; border: 1px solid {border}; border-radius: 4px;
                                   background: {bg}; color: {color}; cursor: pointer; font-size: 11px;">
                        {status}
                    </button>
                </div>
                <div style="font-size: 11px; color: #555;">
                    {description}
                </div>
            </div>
        `,
        panelsSection: `
            <div style="margin-bottom: 12px;">
                <div style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                    Panel Positions
                </div>
                {panels}
            </div>
        `,
        panelItem: `
            <div style="margin-bottom: 8px; padding: 8px; background: rgba(255,255,255,0.03); border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="color: #aaa; font-size: 12px;">{icon} {title}</span>
                    <div style="display: flex; gap: 4px; align-items: center;">
                        <button onclick="window.editor.panelService.togglePanel('{name}'); window.editor.settingsUI.render();"
                                style="padding: 2px 8px; border: 1px solid {border}; border-radius: 3px;
                                       background: {bg}; color: {color}; cursor: pointer; font-size: 9px;">
                            {status}
                        </button>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px;">
                    {positions}
                </div>
            </div>
        `,
        positionButton: `
            <button onclick="window.editor.panelService.setPanelPosition('{panelName}', '{pos}'); window.editor.settingsUI.render();"
                    style="padding: 2px 4px; border: 1px solid {border}; border-radius: 2px;
                           background: {bg}; color: {color}; cursor: pointer; font-size: 8px;
                           transition: all 0.2s;">
                {label}
            </button>
        `,
        resetButton: `
            <button onclick="window.editor.panelService.reset(); window.editor.settingsUI.render();"
                    style="width: 100%; padding: 8px; border: 1px solid rgba(255,80,80,0.2);
                           border-radius: 4px; background: rgba(255,80,80,0.1); color: #ff6b6b;
                           cursor: pointer; font-size: 11px; transition: all 0.2s;">
                🔄 Reset All Panel Settings
            </button>
        `,
    },
    /**
     * Шаблоны для SecondaryToolbar
     */
    secondaryToolbar: {
        container: `
            <div style="position: fixed; left: 12px; top: 12px; z-index: 1000;
                        background: rgba(16, 16, 32, 0.95); backdrop-filter: blur(10px);
                        padding: 6px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);
                        display: flex; flex-direction: column; gap: 3px;">
                {buttons}
            </div>
        `,
        button: `
            <button onclick="{onClick}"
                    title="{title}"
                    style="width: 32px; height: 32px; border: none; border-radius: 6px;
                           background: transparent; color: #888; font-size: 16px;
                           cursor: pointer; transition: all 0.2s;
                           display: flex; align-items: center; justify-content: center;
                           {extraStyles}"
                    onmouseenter="{onMouseEnter}"
                    onmouseleave="{onMouseLeave}">
                {content}
            </button>
        `,
        divider: `
            <div style="border-top: 1px solid rgba(255,255,255,0.08); margin: 3px 0;"></div>
        `,
    },
};

/**
 * Вспомогательная функция для замены плейсхолдеров в шаблоне
 * @param {string} template - Шаблон с плейсхолдерами {key}
 * @param {Object} data - Данные для подстановки
 * @returns {string} Готовый HTML
 */
export function renderTemplate(template, data) {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return result;
}