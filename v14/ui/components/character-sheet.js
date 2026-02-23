// ============================================
// ui/components/character-sheet.js - Carta de personaje
// ============================================

export const characterSheet = {
  core: null,
  ui: null,
  container: null,
  _updating: false,

  init(core, ui) {
    this.core = core;
    this.ui = ui;
    this.container = document.getElementById('stats-render');
    console.log('🧑 CharacterSheet listo');
  },

  showStatsView() {
    const statsView = document.getElementById('heroe-stats-view');
    const equipView = document.getElementById('heroe-equip-view');
    const spellView = document.getElementById('heroe-spellbook-view');
    if (statsView) statsView.style.display = 'block';
    if (equipView) equipView.style.display = 'none';
    if (spellView) spellView.style.display = 'none';
    console.log('[UI] Mostrando vista de stats');
  },

  showEquipmentView() {
    const statsView = document.getElementById('heroe-stats-view');
    const equipView = document.getElementById('heroe-equip-view');
    const spellView = document.getElementById('heroe-spellbook-view');
    if (statsView) statsView.style.display = 'none';
    if (equipView) equipView.style.display = 'block';
    if (spellView) spellView.style.display = 'none';
    console.log('[UI] Mostrando vista de equipo');
    if (this.core.modules?.rpg?.inventory?.actualizarSlotsVisuales) {
      this.core.modules.rpg.inventory.actualizarSlotsVisuales();
    }
  },

  showSpellbookView() {
    const statsView = document.getElementById('heroe-stats-view');
    const equipView = document.getElementById('heroe-equip-view');
    const spellView = document.getElementById('heroe-spellbook-view');
    if (statsView) statsView.style.display = 'none';
    if (equipView) equipView.style.display = 'none';
    if (spellView) spellView.style.display = 'block';
    console.log('[UI] Mostrando libro de hechizos');
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