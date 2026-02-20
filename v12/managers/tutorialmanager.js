export class TutorialManager {
    constructor(core) {
        this.core = core;
        console.log('📖 TutorialManager inicializado');
    }
    checkTriggers() {}
    start() {
        // Mostrar el tutorial si no se ha completado
        if (!localStorage.getItem('torre_profunda_tuto_v2')) {
            this.core.anyadirLog('📖 Tutorial: Usa WASD para moverte.', 'narrativa');
            localStorage.setItem('torre_profunda_tuto_v2', 'true');
        }
    }
}