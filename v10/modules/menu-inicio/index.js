// ============================================
// modules/menu-inicio/index.js - Pantalla de inicio
// ============================================

export const menuInicio = {
    core: null,

    init(core) {
        this.core = core;
    },

    onEnter() {
        this.core.log('Bienvenido a la Torre Profunda', 'info');
    },

    update(delta, input) {
      console.log('📋 Update del menú ejecutándose');
        // Cualquier tecla cambia al módulo RPG
        if (input.justPressed('any')) {
           console.log('✅ Tecla any detectada');
            this.core.switchModule('rpg');
        }
    }

    // SIN método draw
};