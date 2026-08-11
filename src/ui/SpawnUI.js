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
            padding: 10px;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.08);
            min-width: 120px;
            max-width: 160px;
        `;
        this.element.setAttribute('data-panel', 'spawn');
        document.body.appendChild(this.element);
        this.update();
        console.log('✅ SpawnUI initialized');
    }

    createIconHTML(iconPath, size = 14) {
        return `<img src="${iconPath}" style="width:${size}px; height:${size}px; filter: invert(0.5); vertical-align: middle;" onerror="this.style.display='none'">`;
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

        let html = renderTemplate(UI_TEMPLATES.spawn.header, {
            icon: this.createIconHTML(ICONS.cube, 12),
            mode: modeDisplay,
        });

        html += `
            <div style="display: flex; flex-direction: column; gap: 3px;">
                ${renderTemplate(UI_TEMPLATES.spawn.buttons.cube, {
                    icon: this.createIconHTML(ICONS.cube, 14),
                })}
                ${renderTemplate(UI_TEMPLATES.spawn.buttons.sphere, {
                    icon: this.createIconHTML(ICONS.sphere, 14),
                })}
                ${renderTemplate(UI_TEMPLATES.spawn.buttons.cylinder, {
                    icon: this.createIconHTML(ICONS.cylinder, 14),
                })}
            </div>
        `;

        this.element.innerHTML = html;
    }
}