import { UI_TEMPLATES, renderTemplate } from '../configs/ui-templates.js';
import { ICONS } from '../configs/icons.js';

export class SpawnUI {
    constructor(editor) {
        this.editor = editor;
        this.element = null;
    }

    init() {
        this.element = document.createElement('div');
        this.element.id = 'spawn-panel';
        this.element.style.cssText = `
            position: fixed;
            bottom: 12px;
            left: 12px;
            z-index: 1000;
            background: rgba(16, 16, 32, 0.95);
            backdrop-filter: blur(10px);
            padding: 12px;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.08);
            min-width: 160px;
            max-width: 200px;
        `;
        this.element.setAttribute('data-panel', 'spawn');
        document.body.appendChild(this.element);
        this.update();
        console.log('✅ SpawnUI initialized');
    }

    createIconHTML(iconPath, size = 32) {
        return `<img src="${iconPath}" style="width:${size}px; height:${size}px; filter: invert(0.7); vertical-align: middle;" onerror="this.style.display='none'">`;
    }

    update() {
        if (!this.element) return;

        const spawnService = this.editor.spawnService;
        if (!spawnService) {
            this.element.innerHTML = `
                <div style="color:#555; font-size:10px; text-align:center; padding:10px 0;">
                    Loading...
                </div>
            `;
            return;
        }

        const mode = spawnService.getMode();
        const modeDisplay = mode === 'marker' ? '📍' : '🎯';

        this.element.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="color: #666; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                    ${this.createIconHTML(ICONS.cube, 14)} Create
                </span>
                <span style="font-size: 8px; color: #444; background: rgba(255,255,255,0.05); padding: 1px 6px; border-radius: 10px;">
                    ${modeDisplay}
                </span>
            </div>
            <div style="display: flex; flex-direction: row; gap: 8px; justify-content: center; flex-wrap: wrap;">
                <!-- Cube Button -->
                <div style="display: flex; flex-direction: column; align-items: center;">
                    <button onclick="window.editor.shapeManager.createCube()"
                            style="width: 56px; height: 56px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.08);
                                   background: rgba(74,158,255,0.1); cursor: pointer;
                                   transition: all 0.3s ease; display: flex; align-items: center; justify-content: center;
                                   box-shadow: 0 2px 8px rgba(0,0,0,0.2);"
                            onmouseenter="this.style.background='rgba(74,158,255,0.25)'; this.style.borderColor='rgba(74,158,255,0.4)'; this.style.transform='scale(1.08)'; this.style.boxShadow='0 4px 16px rgba(74,158,255,0.3)';"
                            onmouseleave="this.style.background='rgba(74,158,255,0.1)'; this.style.borderColor='rgba(255,255,255,0.08)'; this.style.transform='scale(1)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.2)';">
                        ${this.createIconHTML(ICONS.cube, 32)}
                    </button>
                    <span style="font-size: 8px; color: #666; margin-top: 4px; transition: all 0.3s ease; opacity: 0.5;"
                          onmouseenter="this.style.opacity='1'; this.style.color='#4a9eff';"
                          onmouseleave="this.style.opacity='0.5'; this.style.color='#666';">Cube</span>
                </div>

                <!-- Sphere Button -->
                <div style="display: flex; flex-direction: column; align-items: center;">
                    <button onclick="window.editor.shapeManager.createSphere()"
                            style="width: 56px; height: 56px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.08);
                                   background: rgba(255,107,107,0.1); cursor: pointer;
                                   transition: all 0.3s ease; display: flex; align-items: center; justify-content: center;
                                   box-shadow: 0 2px 8px rgba(0,0,0,0.2);"
                            onmouseenter="this.style.background='rgba(255,107,107,0.25)'; this.style.borderColor='rgba(255,107,107,0.4)'; this.style.transform='scale(1.08)'; this.style.boxShadow='0 4px 16px rgba(255,107,107,0.3)';"
                            onmouseleave="this.style.background='rgba(255,107,107,0.1)'; this.style.borderColor='rgba(255,255,255,0.08)'; this.style.transform='scale(1)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.2)';">
                        ${this.createIconHTML(ICONS.sphere, 32)}
                    </button>
                    <span style="font-size: 8px; color: #666; margin-top: 4px; transition: all 0.3s ease; opacity: 0.5;"
                          onmouseenter="this.style.opacity='1'; this.style.color='#ff6b6b';"
                          onmouseleave="this.style.opacity='0.5'; this.style.color='#666';">Sphere</span>
                </div>

                <!-- Cylinder Button -->
                <div style="display: flex; flex-direction: column; align-items: center;">
                    <button onclick="window.editor.shapeManager.createCylinder()"
                            style="width: 56px; height: 56px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.08);
                                   background: rgba(81,207,102,0.1); cursor: pointer;
                                   transition: all 0.3s ease; display: flex; align-items: center; justify-content: center;
                                   box-shadow: 0 2px 8px rgba(0,0,0,0.2);"
                            onmouseenter="this.style.background='rgba(81,207,102,0.25)'; this.style.borderColor='rgba(81,207,102,0.4)'; this.style.transform='scale(1.08)'; this.style.boxShadow='0 4px 16px rgba(81,207,102,0.3)';"
                            onmouseleave="this.style.background='rgba(81,207,102,0.1)'; this.style.borderColor='rgba(255,255,255,0.08)'; this.style.transform='scale(1)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.2)';">
                        ${this.createIconHTML(ICONS.cylinder, 32)}
                    </button>
                    <span style="font-size: 8px; color: #666; margin-top: 4px; transition: all 0.3s ease; opacity: 0.5;"
                          onmouseenter="this.style.opacity='1'; this.style.color='#51cf66';"
                          onmouseleave="this.style.opacity='0.5'; this.style.color='#666';">Cylinder</span>
                </div>
            </div>
        `;
    }
}