// ============================================
// services/controls.js - Gestión de entrada de teclado
// ============================================

export const controlsModule = {
    core: null,
    teclas: {},
    teclasPulsadas: {},
    anyPressed: false,  // Bandera para "cualquier tecla"

    init(core) {
        this.core = core;
        console.log('🎮 Módulo de controles iniciado');
        this._setupListeners();
    },

    _setupListeners() {
        window.addEventListener('keydown', (e) => this._onKeyDown(e));
        window.addEventListener('keyup', (e) => this._onKeyUp(e));
        // También en el canvas para asegurar foco
        this.core.canvas.addEventListener('keydown', (e) => this._onKeyDown(e));
        this.core.canvas.addEventListener('keyup', (e) => this._onKeyUp(e));
    },

    _onKeyDown(e) {
        const key = e.key.toLowerCase();
        // Ignorar teclas modificadoras solas
        if (key === 'control' || key === 'shift' || key === 'alt' || key === 'meta') return;

        // Prevenir scroll con flechas
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
            e.preventDefault();
        }

        if (!this.teclas[key]) {
            this.teclas[key] = true;
            this.teclasPulsadas[key] = true;
            this.anyPressed = true;
            console.log(`🎯 Tecla detectada: ${key}`);
        }
    },

    _onKeyUp(e) {
        const key = e.key.toLowerCase();
        this.teclas[key] = false;
    },

    // Este método se llama desde core.js al final de cada frame
    update() {
        this.teclasPulsadas = {};
        this.anyPressed = false;
    },

    isDown(key) {
        return this.teclas[key] || false;
    },

    justPressed(key) {
        if (key === 'any') {
            return this.anyPressed;
        }
        return this.teclasPulsadas[key] || false;
    }
};