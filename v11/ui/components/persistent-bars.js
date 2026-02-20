// ============================================
// ui/components/persistent-bars.js - Barras de vida, maná, cordura
// ============================================

export const persistentBars = {
    core: null,
    ui: null,
    elements: {},

    init(core, ui) {
        this.core = core;
        this.ui = ui;
        this.elements = {
            hpVal: document.getElementById('pers-hp-val'),
            mpVal: document.getElementById('pers-mp-val'),
            sanVal: document.getElementById('pers-san-val'),
            expVal: document.getElementById('pers-exp-val'),
            esenciaVal: document.getElementById('pers-esencia-val'),
            hpFill: document.getElementById('pers-hp-fill'),
            mpFill: document.getElementById('pers-mp-fill'),
            sanFill: document.getElementById('pers-san-fill'),
            expFill: document.getElementById('pers-exp-fill')
        };
        console.log('📊 PersistentBars listo');
    },

    update(player) {
        if (!player) return;
        const hpMax = player.hpMax;
        const mpMax = player.mpMax;
        const sanMax = player.sanityMax || 100;
        if (this.elements.hpVal) this.elements.hpVal.textContent = `${Math.floor(player.hpCurrent)}/${hpMax}`;
        if (this.elements.mpVal) this.elements.mpVal.textContent = `${Math.floor(player.mpCurrent)}/${mpMax}`;
        if (this.elements.sanVal) this.elements.sanVal.textContent = `${Math.floor(player.sanity)}/${sanMax}`;
        if (this.elements.expVal) this.elements.expVal.textContent = `Lv.${player.nivel}`;
        if (this.elements.esenciaVal) this.elements.esenciaVal.textContent = `${Math.floor(player.esencia || 0)}`;
        if (this.elements.hpFill) this.elements.hpFill.style.width = `${(player.hpCurrent / hpMax) * 100}%`;
        if (this.elements.mpFill) this.elements.mpFill.style.width = `${(player.mpCurrent / mpMax) * 100}%`;
        if (this.elements.sanFill) this.elements.sanFill.style.width = `${(player.sanity / sanMax) * 100}%`;
        if (this.elements.expFill) this.elements.expFill.style.width = `${(player.exp / player.expParaSubir) * 100}%`;
    }
};