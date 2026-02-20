// ============================================
// modules/architect/index.js - Modo Arquitecto (configuración en tiempo real)
// ============================================

export const architectModule = {
  core: null,
  panel: null,
  visible: false,

  init(core) {
    this.core = core;
    console.log('🟢 Módulo arquitecto iniciado');
    // Mantenemos el panel flotante para compatibilidad, pero ya no se usa por defecto
    this._crearPanelLegacy();
  },

  // Devuelve el HTML de los controles para incrustar en otra parte
  getControlesHTML() {
    const rpg = this.core.modules.rpg;
    if (!rpg) return '<p>Módulo RPG no activo</p>';
    const config = rpg.config.arch;
    return `
      <div style="background: #111; border: 1px solid #0f0; padding: 10px; margin-top: 10px;">
        <h4 style="color:#0f0; margin-top:0;">⚙️ MODO ARQUITECTO</h4>
        <div style="margin-bottom:10px;">
          <h5 style="color:#ffd700;">Jugador</h5>
          X: <input type="range" id="arch-player-x" min="0" max="800" value="${config.player.x}" step="1" style="width:100%;">
          Y: <input type="range" id="arch-player-y" min="0" max="400" value="${config.player.y}" step="1" style="width:100%;">
          Tamaño: <input type="range" id="arch-player-size" min="32" max="128" value="${config.player.size}" step="1" style="width:100%;">
        </div>
        <div style="margin-bottom:10px;">
          <h5 style="color:#ffd700;">Enemigos</h5>
          X: <input type="range" id="arch-enemy-x" min="0" max="800" value="${config.enemy.x}" step="1" style="width:100%;">
          Y: <input type="range" id="arch-enemy-y" min="0" max="400" value="${config.enemy.y}" step="1" style="width:100%;">
          Tamaño: <input type="range" id="arch-enemy-size" min="32" max="128" value="${config.enemy.size}" step="1" style="width:100%;">
        </div>
        <div style="margin-bottom:10px;">
          <h5 style="color:#ffd700;">Minimapa</h5>
          Offset X: <input type="range" id="arch-map-x" min="0" max="700" value="${config.minimap.offsetX}" step="1" style="width:100%;">
          Offset Y: <input type="range" id="arch-map-y" min="0" max="300" value="${config.minimap.offsetY}" step="1" style="width:100%;">
          Celda: <input type="range" id="arch-map-cell" min="10" max="40" value="${config.minimap.cellSize}" step="1" style="width:100%;">
        </div>
        <div style="margin-bottom:10px;">
          <h5 style="color:#ffd700;">Combate</h5>
          Velocidad: <input type="range" id="arch-combat-speed" min="0.05" max="0.5" step="0.01" value="${config.combat.attackSpeed}" style="width:100%;">
          Distancia: <input type="range" id="arch-combat-distance" min="0" max="100" value="${config.combat.attackDistance}" step="1" style="width:100%;">
          <label><input type="checkbox" id="arch-combat-dice" ${config.combat.useDice ? 'checked' : ''}> Usar dados</label>
        </div>
        <button class="equip-btn" onclick="window.core.modules.architect.resetOffsets()">Restablecer offsets</button>
        <button class="equip-btn" onclick="window.core.modules.architect.toggleUI()">Ocultar/Mostrar UI</button>
      </div>
    `;
  },

  // Enlaza los eventos de los sliders (debe llamarse después de insertar el HTML)
  bindEvents() {
    const rpg = this.core.modules.rpg;
    if (!rpg) return;

    document.getElementById('arch-player-x')?.addEventListener('input', (e) => {
      rpg.config.arch.player.x = parseInt(e.target.value);
      if (rpg.exploration) rpg.exploration.fixedPlayerX = rpg.config.arch.player.x;
      if (rpg.combat) rpg.combat.playerBaseX = rpg.config.arch.player.x;
    });
    document.getElementById('arch-player-y')?.addEventListener('input', (e) => {
      rpg.config.arch.player.y = parseInt(e.target.value);
      if (rpg.exploration) rpg.exploration.fixedPlayerY = rpg.config.arch.player.y;
      if (rpg.combat) rpg.combat.playerBaseY = rpg.config.arch.player.y;
    });
    document.getElementById('arch-player-size')?.addEventListener('input', (e) => {
      rpg.config.arch.player.size = parseInt(e.target.value);
    });
    document.getElementById('arch-enemy-x')?.addEventListener('input', (e) => {
      rpg.config.arch.enemy.x = parseInt(e.target.value);
      if (rpg.combat) rpg.combat.enemyBaseX = rpg.config.arch.enemy.x;
    });
    document.getElementById('arch-enemy-y')?.addEventListener('input', (e) => {
      rpg.config.arch.enemy.y = parseInt(e.target.value);
      if (rpg.combat) rpg.combat.enemyBaseY = rpg.config.arch.enemy.y;
    });
    document.getElementById('arch-enemy-size')?.addEventListener('input', (e) => {
      rpg.config.arch.enemy.size = parseInt(e.target.value);
    });
    document.getElementById('arch-map-x')?.addEventListener('input', (e) => {
      rpg.config.arch.minimap.offsetX = parseInt(e.target.value);
      if (rpg.exploration) rpg.exploration.mapOffsetX = rpg.config.arch.minimap.offsetX;
    });
    document.getElementById('arch-map-y')?.addEventListener('input', (e) => {
      rpg.config.arch.minimap.offsetY = parseInt(e.target.value);
      if (rpg.exploration) rpg.exploration.mapOffsetY = rpg.config.arch.minimap.offsetY;
    });
    document.getElementById('arch-map-cell')?.addEventListener('input', (e) => {
      rpg.config.arch.minimap.cellSize = parseInt(e.target.value);
      if (rpg.exploration) rpg.exploration.mapCellSize = rpg.config.arch.minimap.cellSize;
    });
    document.getElementById('arch-combat-speed')?.addEventListener('input', (e) => {
      rpg.config.arch.combat.attackSpeed = parseFloat(e.target.value);
    });
    document.getElementById('arch-combat-distance')?.addEventListener('input', (e) => {
      rpg.config.arch.combat.attackDistance = parseInt(e.target.value);
    });
    document.getElementById('arch-combat-dice')?.addEventListener('change', (e) => {
      rpg.config.arch.combat.useDice = e.target.checked;
    });
  },

  resetOffsets() {
    const rpg = this.core.modules.rpg;
    if (!rpg) return;
    rpg.config.arch.minimap.offsetX = 500;
    rpg.config.arch.minimap.offsetY = 10;
    rpg.config.arch.minimap.cellSize = 20;
    if (rpg.exploration) {
      rpg.exploration.mapOffsetX = 500;
      rpg.exploration.mapOffsetY = 10;
      rpg.exploration.mapCellSize = 20;
    }
    // Actualizar sliders si están visibles
    const xSlider = document.getElementById('arch-map-x');
    if (xSlider) xSlider.value = 500;
    const ySlider = document.getElementById('arch-map-y');
    if (ySlider) ySlider.value = 10;
    const cellSlider = document.getElementById('arch-map-cell');
    if (cellSlider) cellSlider.value = 20;
  },

  toggleUI() {
    const uiOverlay = document.getElementById('ui-overlay');
    if (uiOverlay) {
      uiOverlay.style.display = uiOverlay.style.display === 'none' ? 'grid' : 'none';
    }
  },

  // Panel flotante legacy (por si acaso, pero no se usa)
  _crearPanelLegacy() {
    this.panel = document.createElement('div');
    this.panel.id = 'architect-panel';
    this.panel.style.cssText = `
      position: fixed; top: 20px; right: 20px; width: 300px;
      background: #000; border: 2px solid #0f0; color: #0f0;
      padding: 10px; z-index: 10000; display: none;
      font-family: monospace;
    `;
    this.panel.innerHTML = `<h3>🔧 ARQUITECTO</h3><div id="arch-content"></div><button id="arch-close" style="background:#1a1a1a; border:1px solid #0f0; color:#0f0; padding:5px; margin-top:10px;">Cerrar [F2]</button>`;
    document.body.appendChild(this.panel);
    document.getElementById('arch-close').addEventListener('click', () => this.toggle());
    window.addEventListener('keydown', (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        this.toggle();
      }
    });
  },

  toggle() {
    // Al pulsar F2, cambiamos a la pestaña de ingeniería
    if (window.switchTab) window.switchTab('ingenieria');
    // También podemos hacer scroll a la sección
    setTimeout(() => {
      const archSection = document.getElementById('architect-section');
      if (archSection) archSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
};