// ============================================
// ui/components/dialog-modal.js - Modal de diálogo
// ============================================

export const dialogModal = {
    core: null,
    ui: null,
    overlay: null,
    callback: null,

    init(core, ui) {
        this.core = core;
        this.ui = ui;
        this.overlay = document.getElementById('dialog-overlay');
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.id = 'dialog-overlay';
            this.overlay.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0,0,0,0.9);
                border: 2px solid #0f0;
                padding: 20px;
                z-index: 2000;
                display: none;
                flex-direction: column;
                gap: 10px;
                min-width: 300px;
                text-align: center;
            `;
            document.body.appendChild(this.overlay);
        }
        console.log('💬 DialogModal listo');
    },

    show(options, callback) {
        this.callback = callback;
        let html = `<h3 style="color:#0f0;">${options.titulo || 'Diálogo'}</h3>`;
        if (options.mensaje) html += `<p style="color:#fff;">${options.mensaje}</p>`;
        html += '<div style="display:flex; gap:10px; justify-content:center;">';
        options.opciones.forEach((opt, i) => {
            html += `<button class="dialog-btn" data-index="${i}" style="background:#1a1a1a; border:1px solid #0f0; color:#0f0; padding:5px 15px; cursor:pointer;">${opt.texto}</button>`;
        });
        html += '</div>';
        this.overlay.innerHTML = html;
        this.overlay.style.display = 'flex';

        this.overlay.querySelectorAll('.dialog-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.dataset.index;
                this.overlay.style.display = 'none';
                if (this.callback) this.callback(parseInt(idx));
            });
        });
    },

    hide() {
        this.overlay.style.display = 'none';
    }
};