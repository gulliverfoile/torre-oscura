export const characterSheet = {
    core: null, ui: null, container: null, _updating: false,

    init(core, ui) {
        this.core = core; this.ui = ui;
        this.container = document.getElementById('stats-render');
    },

    update(player) {
        if (this._updating || !this.container || !player) return;
        this._updating = true;
        try {
            let stats;
            try { stats = this.core.modules.rpg.character.getEffectiveStats(); }
            catch { stats = player.stats; }

            this.container.innerHTML = `
                <div style="background:#111; border:1px solid #0f0; padding:10px;">
                    <h3 style="color:#ffd700;">${player.nombre} Lv.${player.nivel}</h3>
                    <div>F: ${stats.F} ${player.puntosMejora > 0 ? `<button class="equip-btn" onclick="window.core.modules.rpg.character.upgradeStat('F')">+</button>` : ''}</div>
                    <div>D: ${stats.D} ${player.puntosMejora > 0 ? `<button class="equip-btn" onclick="window.core.modules.rpg.character.upgradeStat('D')">+</button>` : ''}</div>
                    <div>I: ${stats.I} ${player.puntosMejora > 0 ? `<button class="equip-btn" onclick="window.core.modules.rpg.character.upgradeStat('I')">+</button>` : ''}</div>
                    <div>S: ${stats.S} ${player.puntosMejora > 0 ? `<button class="equip-btn" onclick="window.core.modules.rpg.character.upgradeStat('S')">+</button>` : ''}</div>
                    <div>❤️ HP: ${player.hpCurrent}/${player.hpMax}</div>
                    <div>🔮 MP: ${player.mpCurrent}/${player.mpMax}</div>
                    <div>🧠 San: ${player.sanity}/${player.sanityMax}</div>
                    <div>✨ Puntos mejora: ${player.puntosMejora}</div>
                </div>
            `;
        } finally { this._updating = false; }
    }
};