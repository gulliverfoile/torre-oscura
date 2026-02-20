// ============================================
// ui/components/floating-log.js - Log flotante
// ============================================

export const floatingLog = {
    core: null,
    element: null,

    init(core) {
        this.core = core;
        this.element = document.getElementById('floating-log');
        // Redirigir el método log del core para que también escriba aquí
        const originalLog = core.log;
        core.log = (msg, type) => {
            originalLog.call(core, msg, type);
            this._addEntry(msg, type);
        };
    },

    _addEntry(msg, type) {
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