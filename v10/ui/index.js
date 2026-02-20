// ============================================
// ui/index.js - Módulo de interfaz de usuario
// ============================================

import { floatingLog } from './components/floating-log.js';
import { persistentBars } from './components/persistent-bars.js';
import { inventoryPanel } from './components/inventory-panel.js';
import { characterSheet } from './components/character-sheet.js';
import { dialogModal } from './components/dialog-modal.js';
import { tabs } from './components/tabs.js';

export const uiModule = {
    core: null,
    components: {},

    init(core) {
        this.core = core;
        // Inicializar componentes
        this.components.floatingLog = floatingLog;
        this.components.persistentBars = persistentBars;
        this.components.inventoryPanel = inventoryPanel;
        this.components.characterSheet = characterSheet;
        this.components.dialogModal = dialogModal;
        this.components.tabs = tabs;

        // Inicializar cada componente
        Object.values(this.components).forEach(comp => {
            if (comp.init) comp.init(core, this);
        });

        // Suscribirse a eventos
        core.on('player:updated', (player) => {
            this.components.persistentBars.update(player);
            this.components.characterSheet.update(player);
        });
        core.on('inventory:changed', (inv) => {
            this.components.inventoryPanel.update(inv);
        });
        core.on('language:changed', () => {
            // Actualizar textos de la UI
            this.components.tabs.updateLabels();
        });
    },

    // Método para que el diálogo pueda ser llamado desde otros módulos
    showDialog(options, callback) {
        this.components.dialogModal.show(options, callback);
    }
        onTabChanged(tabId) {
       const module = this.core.currentModuleObj;
       if (!module) return;
       if (tabId === 'ingenieria' && module.renderIngenieria) {
        module.renderIngenieria();
    }
}
};