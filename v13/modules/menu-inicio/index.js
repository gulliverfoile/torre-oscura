// ============================================
// modules/menu-inicio/index.js - Pantalla de inicio
// ============================================

export const menuInicio = {
    core: null,

    init(core) {
        this.core = core;
        console.log('🟢 Módulo menú-inicio iniciado');
    },

    onEnter() {
        console.log('🎬 Entrando en menú de inicio');
        this.core.log('Bienvenido a la Torre Profunda', 'info');
    },

    update(delta, input) {
        // Cualquier tecla cambia al módulo RPG
        if (input.justPressed('any')) {
            console.log('✅ Tecla any detectada, cambiando a RPG');
            this.core.switchModule('rpg');
        }
    }

    // SIN método draw: el renderer se encarga de dibujar el menú
};