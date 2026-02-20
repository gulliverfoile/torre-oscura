// ============================================
// ui/components/tabs.js - Sistema de pestañas
// ============================================

export const tabs = {
    core: null,
    ui: null,

    init(core, ui) {
        this.core = core;
        this.ui = ui;
        console.log('📑 Tabs listo');

        // Vincular eventos de clic a las pestañas (si no se hizo en HTML)
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabId = tab.dataset.tab;
                if (tabId) this.switchTab(tabId);
            });
        });

        // Exponer método global por si se necesita desde HTML
        window.switchTab = (tabId) => this.switchTab(tabId);
    },

    switchTab(tabId) {
        console.log(`📑 Cambiando a pestaña: ${tabId}`);
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

        const content = document.getElementById('tab-' + tabId);
        if (content) content.classList.add('active');

        const tab = document.querySelector(`.tab[data-tab="${tabId}"]`);
        if (tab) tab.classList.add('active');

        // Notificar al módulo activo si es necesario
        const module = this.core.currentModuleObj;
        if (module && tabId === 'ingenieria' && module.renderIngenieria) {
            module.renderIngenieria();
        }
    },

    updateLabels() {
        const t = this.core.i18n.t.bind(this.core.i18n);
        document.querySelectorAll('.tab[data-tab]').forEach(tab => {
            const key = `tabs.${tab.dataset.tab}`;
            tab.textContent = t(key, tab.dataset.tab.toUpperCase());
        });
    }
};