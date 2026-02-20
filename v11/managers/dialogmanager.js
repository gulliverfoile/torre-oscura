// ============================================
// dialogmanager.js - Gestor de diálogos y overlays
// ============================================
export class DialogManager {
    constructor(core) {
        this.core = core;
        this.overlay = null;
        this.active = false;
        this.callback = null;
        this.createOverlay();
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'dialog-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(10,10,10,0.95);
            border: 2px solid #0f0;
            color: #0f0;
            padding: 20px;
            border-radius: 10px;
            z-index: 11000;
            display: none;
            flex-direction: column;
            gap: 15px;
            min-width: 300px;
            text-align: center;
            font-family: 'Courier New', monospace;
            box-shadow: 0 0 30px rgba(0,255,0,0.3);
        `;
        document.body.appendChild(this.overlay);
    }

    showDialog(options) {
        return new Promise((resolve) => {
            this.active = true;
            this.callback = resolve;
            this.overlay.innerHTML = `
                <h3 style="margin:0; color:#0f0;">${options.title || 'Diálogo'}</h3>
                <p style="color:#fff;">${options.message || ''}</p>
                <div style="display:flex; gap:10px; justify-content:center;">
                    ${options.buttons.map((btn, i) => `
                        <button class="dialog-btn" data-index="${i}" style="
                            background: #1a1a1a;
                            border: 1px solid #0f0;
                            color: #0f0;
                            padding: 5px 15px;
                            cursor: pointer;
                            font-family: inherit;
                        ">${btn.text}</button>
                    `).join('')}
                </div>
            `;
            this.overlay.style.display = 'flex';

            this.overlay.querySelectorAll('.dialog-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = e.target.dataset.index;
                    const choice = options.buttons[index].value !== undefined ? options.buttons[index].value : index;
                    this.hideDialog();
                    resolve(choice);
                });
            });
        });
    }

    hideDialog() {
        this.overlay.style.display = 'none';
        this.active = false;
        this.callback = null;
    }

    async confirm(message) {
        const result = await this.showDialog({
            title: 'Confirmar',
            message,
            buttons: [
                { text: 'Sí', value: true },
                { text: 'No', value: false }
            ]
        });
        return result;
    }
}