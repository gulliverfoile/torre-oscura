// ============================================
// ui/components/floating-log.js - Log flotante
// ============================================

export const floatingLog = {
    core: null,
    ui: null,
    element: null,

    init(core, ui) {
        this.core = core;
        this.ui = ui;
        this.element = document.getElementById('floating-log');
        if (!this.element) {
            console.warn('⚠️ Elemento #floating-log no encontrado en el DOM');
            this._crearElemento();
        }
        console.log('📋 FloatingLog listo');
    },

    _crearElemento() {
        this.element = document.createElement('div');
        this.element.id = 'floating-log';
        document.body.appendChild(this.element);
    },

    add(msg, type = 'info') {
        if (!this.element) return;
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = msg;
        this.element.appendChild(entry);
        this.element.scrollTop = this.element.scrollHeight;
        if (this.element.children.length > 50) {
            this.element.removeChild(this.element.firstChild);
        }
    }
};