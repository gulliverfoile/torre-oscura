// ============================================
// modules/controls.js - Módulo independiente de entrada
// ============================================

export const controlsModule = {
    core: null,
    teclas: {},
    teclasPulsadas: {},

    init(core) {
        this.core = core;
        console.log('🎮 Módulo de controles iniciado');
        this._setupListeners();
    },

    _setupListeners() {
        window.addEventListener('keydown', (e) => this._onKeyDown(e));
        window.addEventListener('keyup', (e) => this._onKeyUp(e));
    },

    _onKeyDown(e) {
        const key = e.key.toLowerCase();
        if (key === 'control' || key === 'shift' || key === 'alt' || key === 'meta') return;

        if (!this.teclas[key]) {
            this.teclas[key] = true;
            this.teclasPulsadas[key] = true;
            this.core.emit('keydown', key);
            console.log('⌨️ Tecla pulsada:', key);
        }

        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
            e.preventDefault();
        }
    },

    _onKeyUp(e) {
        const key = e.key.toLowerCase();
        this.teclas[key] = false;
        this.core.emit('keyup', key);
    },

    update() {
        this.teclasPulsadas = {};
    },

    isDown(key) {
        return this.teclas[key] || false;
    },

    justPressed(key) {
        return this.teclasPulsadas[key] || false;
    }
};