// ============================================
// ui/index.js - Módulo de interfaz de usuario (orquestador)
// ============================================

import { floatingLog } from './components/floating-log.js';
import { persistentBars } from './components/persistent-bars.js';
import { inventoryPanel } from './components/inventory-panel.js';
import { characterSheet } from './components/character-sheet.js';
console.log('characterTest:', characterTest);

import { dialogModal } from './components/dialog-modal.js';
import { tabs } from './components/tabs.js';

export const uiModule = {
    core: null,
    components: {},

    init(core) {
        this.core = core;
        console.log('🎨 Módulo UI iniciado');

        // Inicializar componentes
        this.components.floatingLog = floatingLog;
        this.components.persistentBars = persistentBars;
        this.components.inventoryPanel = inventoryPanel;
        this.components.characterSheet = characterSheet;
        this.components.dialogModal = dialogModal;
        this.components.tabs = tabs;

        // Inicializar cada componente (pasan el core y la referencia a ui)
        Object.values(this.components).forEach(comp => {
            if (comp.init) comp.init(core, this);
        });

        // Suscribirse a eventos del core
        core.on('player:updated', (player) => {
            console.log('🎨 player:updated recibido');
            this.components.persistentBars.update(player);
            this.components.characterSheet.update(player);
        });

        core.on('inventory:changed', (inv) => {
            console.log('🎨 inventory:changed recibido');
            this.components.inventoryPanel.update(inv);
        });

        core.on('language:changed', () => {
            console.log('🎨 language:changed recibido');
            this.components.tabs.updateLabels();
        });

        console.log('✅ UI lista');
    },

    // Métodos públicos para que otros módulos puedan usar la UI
    showDialog(options, callback) {
        this.components.dialogModal.show(options, callback);
    },

    log(msg, type) {
        this.components.floatingLog.add(msg, type);
    }
};