import { GameCore } from './core.js';
import { menuInicio } from './modules/menuInicio.js';
import { rpgModule } from './modules/rpg.js';
import { architectModule } from './modules/architect.js';
import { asciiModule } from './modules/asciiMode.js';
import { UIManager } from './ui/UIManager.js';

// Esperamos a que el DOM esté completamente cargado antes de acceder a los elementos
window.addEventListener('DOMContentLoaded', async () => {
    console.log('⚡ Iniciando Torre Profunda...');

    // Crear el núcleo pasando los IDs correctos
    const core = new GameCore('canvas', 'ui-panel');

    // Registrar módulos
    core.registerModule('menu', menuInicio);
    core.registerModule('rpg', rpgModule);
    core.registerModule('architect', architectModule);
    core.registerModule('ascii', asciiModule);

    // Inicializar UI Manager (no es un módulo, es un servicio)
    const ui = new UIManager(core);
    core.ui = ui; // Exponer para que otros módulos puedan usarlo

    // (Opcional) Podrías precargar los YAML aquí, pero ya se cargan en rpgModule.onEnter

    // Iniciar con el menú
    core.switchModule('menu');

    // Exponer el core globalmente para depuración (opcional)
    window.core = core;
});