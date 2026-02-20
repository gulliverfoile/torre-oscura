// ============================================
// ui/index.js - Módulo de interfaz de usuario (orquestador)
// ============================================

import { floatingLog } from './components/floating-log.js';
import { persistentBars } from './components/persistent-bars.js';
import { inventoryPanel } from './components/inventory-panel.js';
import { characterSheet } from './components/character-sheet.js';
import { dialogModal } from './components/dialog-modal.js';
import { tabs } from './components/tabs.js';
import { floatingDamage } from './components/floating-damage.js';
import { gameOver } from './components/game-over.js'; // <-- NUEVO

export const uiModule = {
  core: null,
  components: {},

  init(core) {
    this.core = core;
    core.ui = this;
    console.log('🎨 Módulo UI iniciado');
    this.components.floatingLog = floatingLog;
    this.components.persistentBars = persistentBars;
    this.components.inventoryPanel = inventoryPanel;
    this.components.characterSheet = characterSheet;
    this.components.dialogModal = dialogModal;
    this.components.tabs = tabs;
    this.components.floatingDamage = floatingDamage;
    this.components.gameOver = gameOver; // <-- NUEVO

    Object.values(this.components).forEach(comp => {
      if (comp.init) comp.init(core, this);
    });

    core.on('player:updated', (player) => {
      this.components.persistentBars?.update(player);
      this.components.characterSheet?.update(player);
    });
    core.on('inventory:changed', (inv) => {
      this.components.inventoryPanel?.update(inv);
    });
    core.on('language:changed', () => {
      this.components.tabs?.updateLabels();
    });
    core.on('combat:damage', (data) => {
      if (this.components.floatingDamage) {
        const tipo = data.esCritico ? 'critico' : data.tipo;
        this.components.floatingDamage.mostrar(
          `-${data.cantidad}`,
          tipo,
          data.x,
          data.y
        );
      }
    });

    console.log('✅ UI lista');
  },

  showDialog(options, callback) {
    if (this.components.dialogModal) {
      this.components.dialogModal.show(options, callback);
    }
  },

  log(msg, type) {
    if (this.components.floatingLog) {
      this.components.floatingLog.add(msg, type);
    }
  }
};