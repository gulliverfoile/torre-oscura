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
            document.body.appendChild(this.overlay);
        }
    },

    mostrarOpciones(options, callback) {
        this.callback = callback;
        let html = `<h3>${options.titulo || 'Diálogo'}</h3>`;
        if (options.mensaje) html += `<p>${options.mensaje}</p>`;
        html += '<div>';
        options.opciones.forEach((opt, i) => {
            html += `<button class="dialog-btn" data-index="${i}">${opt.texto}</button>`;
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
    }
};