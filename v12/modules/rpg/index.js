// ============================================
// modules/rpg/index.js - Módulo RPG (orquestador)
// ============================================

import { combatManager } from './combat/index.js';
import { explorationManager } from './exploration/index.js';
import { characterManager } from './character/index.js';
import { inventoryManager } from './inventory/index.js';
import { missionManager } from './missions/index.js';
import { eventManager } from './event-manager.js';
import { factionManager } from './faction-manager.js';

export const rpgModule = {
  core: null,
  player: null,
  data: { mundo: null, enciclopedia: null, reglas: null },
  combat: combatManager,
  exploration: explorationManager,
  character: characterManager,
  inventory: inventoryManager,
  missions: missionManager,
  events: eventManager,
  factions: factionManager,

  config: {
    hud: {
      style: 'bars',
      x: 20,
      y: 20,
      size: 20,
      spacing: 30,
      colors: { hp: '#e94560', mp: '#44aaff', sanity: '#b19cd9' }
    },
    arch: {
      player: { x: 300, y: 200, size: 64 },
      enemy: { x: 600, y: 200, size: 64 },
      minimap: { offsetX: 500, offsetY: 10, cellSize: 20 },
      combat: { attackSpeed: 0.1, attackDistance: 20, useDice: false }
    }
  },

  init(core) {
    this.core = core;
    console.log('🟢 Módulo RPG iniciado');
    this.combat.init(this);
    this.exploration.init(this);
    this.character.init(this);
    this.inventory.init(this);
    this.missions.init(this);
    this.events.init(this);
    this.factions.init(this);
  },

  async onEnter() {
    console.log('🎮 Entrando en módulo RPG');
    this.core.log('Cargando datos de la Torre...', 'info');
    this.data.mundo = await this.core.data.load('mundo');
    this.data.enciclopedia = await this.core.data.load('enciclopedia');
    this.data.reglas = await this.core.data.load('reglas');
    if (!this.data.mundo || !this.data.enciclopedia) {
      this.core.log('❌ Error al cargar datos. Revisa la consola.', 'error');
      return;
    }
    this.character.createDefault();
    try {
      this.character.player.sprite = await this.core.assets.getAsset('characters/player.png');
      console.log('🖼️ Sprite del jugador cargado');
    } catch (e) {
      console.warn('⚠️ Usando placeholder para sprite del jugador');
    }
    this.exploration.entrarHabitacion(0, 0);
    this.core.on('player:updated', (player) => {
      this.player = player;
      this.core.updateUI(player);
    });

    // --- EVENTO PARA DIÁLOGO DE CAMBIO DE PISO ---
    this.core.on('floor:change-request', (data) => {
      this.core.ui.showDialog({
        titulo: '⬇️ Descenso a las profundidades',
        mensaje: `¿Estás seguro de que quieres bajar al siguiente piso? Los ecos se intensificarán...`,
        opciones: [
          { texto: 'Sí, bajar', valor: 'si' },
          { texto: 'No, quedarme', valor: 'no' }
        ]
      }, (respuesta) => {
        if (respuesta === 'si') {
          this.exploration.cambiarPiso(data.delta);
        }
      });
    });

    console.log('✅ RPG listo');
  },

  update(delta, input) {
    if (this.combat.active) {
      this.combat.update(delta, input);
    } else {
      this.exploration.update(delta, input);
    }

    // --- MODO LOCURA (MATRIX) SEGÚN CORDURA ---
    if (this.character && this.character.player) {
      const ascii = this.core.modules['renderer-ascii'];
      if (ascii) {
        const sanityRatio = this.character.player.sanity / this.character.player.sanityMax;
        if (sanityRatio < 0.3) {
          const intensidad = 1 - (sanityRatio / 0.3);
          ascii.setModoLocura(true, intensidad);
        } else {
          ascii.setModoLocura(false);
        }
      }
    }
  },

  // ============================================
  // PANEL DE INGENIERÍA (con botones, sliders y sección arquitecto)
  // ============================================
  renderIngenieria() {
    const area = document.getElementById('ingenieria-render');
    if (!area) return;

    const ascii = this.core.modules['renderer-ascii'];
    const enabled = ascii ? ascii.enabled : false;
    const player = this.character.player;
    const stats = this.character.getEffectiveStats();
    const fps = Math.round(this.core.lastFPS || 60);
    const memoria = performance.memory ? Math.round(performance.memory.usedJSHeapSize / (1024 * 1024)) : 'N/A';

    area.innerHTML = `
      <style>
        .ing-section { background: #111; border: 1px solid #0f0; padding: 10px; margin-bottom: 10px; border-radius: 5px; }
        .ing-section h4 { color: #ffd700; margin: 0 0 8px 0; font-size: 12px; border-bottom: 1px solid #0f0; padding-bottom: 3px; }
        .ing-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 11px; }
        .ing-label { color: #888; }
        .ing-value { color: #0f0; font-weight: bold; }
        .button-group { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 8px; }
        .equip-btn { background: #1a1a1a; border: 1px solid #0f0; color: #0f0; padding: 5px 8px; cursor: pointer; font-size: 10px; border-radius: 3px; }
        .equip-btn:hover { background: #0f0; color: #000; }
        .slider-container { display: flex; align-items: center; gap: 10px; margin-top: 5px; }
        .slider-container input { flex: 1; }
        .slider-container span { min-width: 40px; text-align: right; }
      </style>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <h3 style="color:#0f0; margin:0;">🔧 PANEL DE INGENIERÍA</h3>
        <span style="color:#888; font-size:10px;">v0.5.0</span>
      </div>

      <div class="ing-section">
        <h4>📊 ESTADO DEL JUEGO</h4>
        <div class="ing-row"><span class="ing-label">FPS:</span><span class="ing-value" id="ing-fps">${fps}</span></div>
        <div class="ing-row"><span class="ing-label">Memoria:</span><span class="ing-value" id="ing-mem">${memoria} MB</span></div>
        <div class="ing-row"><span class="ing-label">Piso actual:</span><span class="ing-value">${this.exploration.pisoActual + 1}</span></div>
        <div class="ing-row"><span class="ing-label">Sala:</span><span class="ing-value">[${this.exploration.salaActual?.pos[0] || 0}, ${this.exploration.salaActual?.pos[1] || 0}]</span></div>
        <div class="button-group">
          <button class="equip-btn" onclick="window.location.reload()">🔄 Recargar</button>
          <button class="equip-btn" onclick="window.core.assets.clear(); alert('Caché limpiada');">🗑️ Limpiar caché</button>
        </div>
      </div>

      <div class="ing-section">
        <h4>🧑 JUGADOR</h4>
        <div class="ing-row"><span class="ing-label">HP:</span><span class="ing-value">${player.hpCurrent}/${player.hpMax}</span></div>
        <div class="ing-row"><span class="ing-label">MP:</span><span class="ing-value">${player.mpCurrent}/${player.mpMax}</span></div>
        <div class="ing-row"><span class="ing-label">Cordura:</span><span class="ing-value">${player.sanity}/${player.sanityMax}</span></div>
        <div class="ing-row"><span class="ing-label">EXP:</span><span class="ing-value">${player.exp}/${player.expParaSubir}</span></div>
        <div class="ing-row"><span class="ing-label">Stats:</span><span class="ing-value">F:${stats.F} D:${stats.D} I:${stats.I} S:${stats.S}</span></div>
        <div class="ing-row"><span class="ing-label">Puntos mejora:</span><span class="ing-value">${player.puntosMejora}</span></div>
        <div class="ing-row"><span class="ing-label">Esencia:</span><span class="ing-value">${player.esencia || 0}</span></div>
        <div class="button-group">
          <button class="equip-btn" onclick="(() => { const p = window.core.modules.rpg.character.player; p.hpCurrent = p.hpMax; p.mpCurrent = p.mpMax; p.sanity = p.sanityMax; window.core.emit('player:updated', p); })()">❤️ Curar</button>
          <button class="equip-btn" onclick="(() => { const p = window.core.modules.rpg.character.player; p.hpCurrent = Math.max(1, p.hpCurrent - 20); window.core.emit('player:updated', p); })()">💔 -20 HP</button>
          <button class="equip-btn" onclick="window.core.modules.rpg.character.addExp(50)">📈 +50 EXP</button>
          <button class="equip-btn" onclick="(() => { const p = window.core.modules.rpg.character.player; p.puntosMejora++; window.core.emit('player:updated', p); })()">✨ +1 punto</button>
          <button class="equip-btn" onclick="(() => { const p = window.core.modules.rpg.character.player; p.esencia = (p.esencia || 0) + 100; window.core.emit('player:updated', p); })()">💰 +100 esencia</button>
          <button class="equip-btn" onclick="(() => { const p = window.core.modules.rpg.character.player; p.sanity = Math.max(0, p.sanity - 20); window.core.emit('player:updated', p); })()">🧠 -20 cordura</button>
        </div>
      </div>

      <div class="ing-section">
        <h4>⚔️ COMBATE</h4>
        <div class="ing-row"><span class="ing-label">Enemigos vivos:</span><span class="ing-value">${this.combat.enemigos?.length || 0}</span></div>
        <div class="button-group">
          <button class="equip-btn" onclick="window.core.modules.rpg.combat.iniciarCombate(['slime'])">🐌 Spawnear slime</button>
          <button class="equip-btn" onclick="window.core.modules.rpg.combat.iniciarCombate(['slime', 'slime'])">🐌🐌 2 slimes</button>
          <button class="equip-btn" onclick="window.core.modules.rpg.combat.enemigos = []; window.core.modules.rpg.combat.active = false;">💀 Matar todos</button>
          <button class="equip-btn" onclick="window.core.modules.rpg.combat._generarLoot().forEach(i => window.core.modules.rpg.inventory.anyadirItem(i.id, i.cantidad))">📦 Generar loot</button>
        </div>
      </div>

      <div class="ing-section">
        <h4>⬆️⬇️ PISOS</h4>
        <div class="button-group">
          <button class="equip-btn" onclick="window.core.modules.rpg.exploration.cambiarPiso(1)">⬇️ Bajar</button>
          <button class="equip-btn" onclick="window.core.modules.rpg.exploration.cambiarPiso(-1)">⬆️ Subir</button>
          <button class="equip-btn" onclick="(() => { const p = prompt('Ir al piso (0-${this.data.mundo.pisos.length-1})'); if(p) window.core.modules.rpg.exploration.pisoActual = parseInt(p); window.core.modules.rpg.exploration.visitadas.clear(); window.core.modules.rpg.exploration.entrarHabitacion(0,0); })()">🔢 Ir a piso</button>
        </div>
      </div>

      <div class="ing-section">
        <h4>🗺️ MINIMAPA</h4>
        <div class="slider-container">
          <span>Offset X:</span>
          <input type="range" id="ing-map-x" min="0" max="700" value="${this.exploration.mapOffsetX}" step="1">
          <span id="ing-map-x-val">${this.exploration.mapOffsetX}</span>
        </div>
        <div class="slider-container">
          <span>Offset Y:</span>
          <input type="range" id="ing-map-y" min="0" max="300" value="${this.exploration.mapOffsetY}" step="1">
          <span id="ing-map-y-val">${this.exploration.mapOffsetY}</span>
        </div>
        <div class="slider-container">
          <span>Tamaño celda:</span>
          <input type="range" id="ing-map-cell" min="10" max="40" value="${this.exploration.mapCellSize}" step="1">
          <span id="ing-map-cell-val">${this.exploration.mapCellSize}</span>
        </div>
      </div>

      <div class="ing-section">
        <h4>📟 MODO ASCII</h4>
        <div class="button-group">
          <button class="equip-btn" onclick="window.core.modules['renderer-ascii'].toggle()">
            ${enabled ? 'Desactivar' : 'Activar'} ASCII
          </button>
          <button class="equip-btn" onclick="window.core.modules['renderer-ascii'].setTheme('classic')">Clásico</button>
          <button class="equip-btn" onclick="window.core.modules['renderer-ascii'].setTheme('retro')">Retro</button>
          <button class="equip-btn" onclick="window.core.modules['renderer-ascii'].setTheme('matrix')">Matrix</button>
          <button class="equip-btn" onclick="window.core.modules['renderer-ascii'].setTheme('fire')">Fuego</button>
        </div>
      </div>

      <!-- SECCIÓN ARQUITECTO (INCORPORADA) -->
      <div id="architect-section" style="margin-top: 20px; border-top: 2px solid #0f0; padding-top: 15px;">
        ${this.core.modules.architect.getControlesHTML()}
      </div>
    `;

    // Eventos de los sliders del minimapa
    document.getElementById('ing-map-x')?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      document.getElementById('ing-map-x-val').textContent = val;
      this.exploration.setMapOffsetX(val);
    });
    document.getElementById('ing-map-y')?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      document.getElementById('ing-map-y-val').textContent = val;
      this.exploration.setMapOffsetY(val);
    });
    document.getElementById('ing-map-cell')?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      document.getElementById('ing-map-cell-val').textContent = val;
      this.exploration.setMapCellSize(val);
    });

    // Enlazar eventos de los controles de arquitecto
    this.core.modules.architect.bindEvents();

    // Actualizar FPS y memoria cada medio segundo
    if (!this._ingInterval) {
      this._ingInterval = setInterval(() => {
        const fpsSpan = document.getElementById('ing-fps');
        if (fpsSpan) fpsSpan.textContent = Math.round(this.core.lastFPS || 60);
        if (performance.memory) {
          const memSpan = document.getElementById('ing-mem');
          if (memSpan) memSpan.textContent = Math.round(performance.memory.usedJSHeapSize / (1024 * 1024)) + ' MB';
        }
      }, 500);
    }
  }
};