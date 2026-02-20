// ============================================
// ui/components/tabs.js - Sistema de pestañas
// ============================================

export const tabs = {
    core: null,
    ui: null,

    init(core, ui) {
        this.core = core;
        this.ui = ui;
        // Los eventos de clic ya están en el HTML, pero podemos sincronizar
        window.switchTab = (tabId) => {
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.getElementById('tab-' + tabId)?.classList.add('active');
            document.querySelector(`.tab[data-tab="${tabId}"]`)?.classList.add('active');
            // Notificar al módulo RPG si es necesario
            if (tabId === 'mochila') {
                const inv = core.modules.rpg?.inventory.getInventoryList();
                if (inv) ui.components.inventoryPanel.update(inv);
            } else if (tabId === 'heroe') {
                ui.components.characterSheet.update(core.modules.rpg?.character.player);
            }
        };
    },

    updateLabels() {
        // Actualizar textos de las pestañas según idioma
        const t = this.core.i18n.t.bind(this.core.i18n);
        document.querySelectorAll('.tab[data-tab]').forEach(tab => {
            const key = `tabs.${tab.dataset.tab}`;
            tab.textContent = t(key, tab.dataset.tab.toUpperCase());
        });
    }
};