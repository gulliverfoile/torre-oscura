// ============================================
// main.js - Punto de entrada de la aplicación
// ============================================

import { core } from './core.js';
import { menuInicio } from './modules/menu-inicio/index.js';
import { rpgModule } from './modules/rpg/index.js';
import { architectModule } from './modules/architect/index.js';
import { spritesRenderer } from './renderers/sprites/index.js';
import { asciiRenderer } from './renderers/ascii/index.js';
import { uiModule } from './ui/index.js';

window.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando Torre Profunda...');

    // Inicializar core
    core.init('canvas', 'floating-log');

    // Registrar módulos de juego
    core.registerModule('menu-inicio', menuInicio);
    core.registerModule('rpg', rpgModule);
    core.registerModule('architect', architectModule);

    // Registrar renderers
    core.registerModule('renderer-sprites', spritesRenderer);
    core.registerModule('renderer-ascii', asciiRenderer);

    // Registrar UI (también como módulo)
    core.registerModule('ui', uiModule);

    // Iniciar con el menú
    core.switchModule('menu-inicio');

    // Exponer core globalmente para depuración (opcional)
    window.core = core;

    console.log('✅ Aplicación lista');
});