import { core } from './core.js';
import { menuInicio } from './modules/menu-inicio/index.js';
import { rpgModule } from './modules/rpg/index.js';
import { architectModule } from './modules/architect/index.js';
import { spritesRenderer } from './renderers/sprites/index.js';
import { asciiRenderer } from './renderers/ascii/index.js';

window.addEventListener('DOMContentLoaded', async () => {
    // Inicializar core
    core.init('canvas', 'floating-log');

    // Registrar módulos
    core.registerModule('menu-inicio', menuInicio);
    core.registerModule('rpg', rpgModule);
    core.registerModule('architect', architectModule);
    core.registerModule('renderer-sprites', spritesRenderer);
    core.registerModule('renderer-ascii', asciiRenderer);

    // Iniciar con el menú
    core.switchModule('menu-inicio');

    // Exponer core globalmente (para depuración)
    window.core = core;
});