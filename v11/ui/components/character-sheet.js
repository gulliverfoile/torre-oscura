// ============================================
// ui/components/character-sheet.js - Carta de personaje
// ============================================

export const characterSheet = {
    core: null,
    ui: null,
    container: null,

    init(core, ui) {
        this.core = core;
        this.ui = ui;
        this.container = document.getElementById('stats-render');
        if (!this.container) console.warn('⚠️ Elemento #stats-render no encontrado');
        console.log('🧑 CharacterSheet listo');
    },

    update(player) {
        if (!this.container || !player) return;
        const stats = this.core.modules.rpg.character.getEffectiveStats();
        let html = `
            <h3 style="color:#ffd700;">${player.nombre} <span style="color:#fff;">Lv.${player.nivel}</span></h3>
            <div style="display:grid; grid-template-columns:1fr 1fr;">
                <div>F: ${stats.F} ${player.puntosMejora > 0 ? `<button onclick="window.core.modules.rpg.character.upgradeStat('F')">+</button>` : ''}</div>
                <div>D: ${stats.D} ${player.puntosMejora > 0 ? `<button onclick="window.core.modules.rpg.character.upgradeStat('D')">+</button>` : ''}</div>
                <div>I: ${stats.I} ${player.puntosMejora > 0 ? `<button onclick="window.core.modules.rpg.character.upgradeStat('I')">+</button>` : ''}</div>
                <div>S: ${stats.S} ${player.puntosMejora > 0 ? `<button onclick="window.core.modules.rpg.character.upgradeStat('S')">+</button>` : ''}</div>
            </div>
            <div>❤️ HP: ${player.hpCurrent}/${player.hpMax}</div>
            <div>🔮 MP: ${player.mpCurrent}/${player.mpMax}</div>
            <div>🧠 San: ${player.sanity}/${player.sanityMax}</div>
            <div>✨ Puntos mejora: ${player.puntosMejora}</div>
            <div>💰 Esencia: ${player.esencia || 0}</div>
        `;
        this.container.innerHTML = html;
    }
};