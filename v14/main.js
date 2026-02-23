import { core } from './core.js';
import { menuInicio } from './modules/menu-inicio/index.js';
import { rpgModule } from './modules/rpg/index.js';
import { architectModule } from './modules/architect/index.js';
import { spritesRenderer } from './renderers/sprites/index.js';
import { asciiRenderer } from './renderers/ascii/index.js';
import { uiModule } from './ui/index.js';

window.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando Torre Profunda...');
    core.init('canvas', 'floating-log');

    core.registerModule('menu-inicio', menuInicio);
    core.registerModule('rpg', rpgModule);
    core.registerModule('architect', architectModule);
    core.registerModule('renderer-sprites', spritesRenderer);
    core.registerModule('renderer-ascii', asciiRenderer);
    core.registerModule('ui', uiModule);

    core.switchModule('menu-inicio');
    window.core = core; // para depuración
});