// ============================================
// ui/components/game-over.js - Pantalla de muerte y estadísticas
// ============================================

export const gameOver = {
  core: null,
  ui: null,
  overlay: null,
  stats: {},

  init(core, ui) {
    this.core = core;
    this.ui = ui;
    this._crearOverlay();
    console.log('💀 GameOver component listo');
  },

  _crearOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'game-over-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      z-index: 10000;
      display: none;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      color: #ff4b4b;
      font-family: 'Press Start 2P', cursive;
      text-align: center;
    `;
    document.body.appendChild(this.overlay);
  },

  mostrar(estadisticas) {
    this.stats = estadisticas || {
      piso: this.core.modules?.rpg?.exploration?.pisoActual + 1 || 0,
      enemigos: this.core.stats_partida?.enemigos_derrotados || 0,
      salas: this.core.stats_partida?.salas_exploradas || 0,
      tiempo: '--:--'
    };

    this.overlay.innerHTML = `
      <h1 style="color: #ff4b4b; font-size: 24px; margin-bottom: 20px; text-shadow: 0 0 20px #f00;">💀 HAS MUERTO</h1>
      <div style="background: #111; border: 2px solid #ff4b4b; padding: 20px; margin-bottom: 30px; min-width: 300px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #aaa;">Piso alcanzado:</span>
          <span style="color: #ffd700;">${this.stats.piso}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #aaa;">Enemigos derrotados:</span>
          <span style="color: #ffd700;">${this.stats.enemigos}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #aaa;">Salas exploradas:</span>
          <span style="color: #ffd700;">${this.stats.salas}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #aaa;">Tiempo de vida:</span>
          <span style="color: #ffd700;">${this.stats.tiempo}</span>
        </div>
      </div>
      <div style="display: flex; gap: 20px;">
        <button class="equip-btn" onclick="window.location.reload()" style="background: #4a0404; border: 2px solid #ff4b4b; padding: 15px 30px; font-size: 14px;">REINTENTAR</button>
        <button class="equip-btn" onclick="window.gameOverVolverAlMenu()" style="background: #1b1528; border: 2px solid #888; padding: 15px 30px; font-size: 14px;">MENÚ PRINCIPAL</button>
      </div>
    `;

    this.overlay.style.display = 'flex';

    if (this.core) {
      this.core.running = false;
    }
  },

  ocultar() {
    this.overlay.style.display = 'none';
    if (this.core) {
      this.core.running = true;
    }
  }
};

window.gameOverVolverAlMenu = () => {
  if (window.core) {
    window.core.switchModule('menu-inicio');
    const overlay = document.getElementById('game-over-overlay');
    if (overlay) overlay.style.display = 'none';
    window.core.running = true;
  }
};