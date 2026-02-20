// ============================================
// ui/components/persistent-bars.js - Barras de vida, maná, etc.
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
    },

    update(player) {
        if (!player) return;
        const hpMax = player.hpMax;
        const mpMax = player.mpMax;
        const sanMax = player.sanityMax || 100;
        this.elements.hpVal.textContent = `${Math.floor(player.hpCurrent)}/${hpMax}`;
        this.elements.mpVal.textContent = `${Math.floor(player.mpCurrent)}/${mpMax}`;
        this.elements.sanVal.textContent = `${Math.floor(player.sanity)}/${sanMax}`;
        this.elements.expVal.textContent = `Lv.${player.nivel}`;
        this.elements.esenciaVal.textContent = `${Math.floor(player.esencia || 0)}`;
        this.elements.hpFill.style.width = `${(player.hpCurrent / hpMax) * 100}%`;
        this.elements.mpFill.style.width = `${(player.mpCurrent / mpMax) * 100}%`;
        this.elements.sanFill.style.width = `${(player.sanity / sanMax) * 100}%`;
        this.elements.expFill.style.width = `${(player.exp / player.expParaSubir) * 100}%`;
    }
};