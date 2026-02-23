// ============================================
// modules/rpg/exploration/index.js - Exploración y minimapa
// ============================================

export const explorationManager = {
  rpg: null,
  core: null,
  pisoActual: 0,
  salaActual: null,
  visitadas: new Set(),
  fixedPlayerX: 300,
  fixedPlayerY: 200,
  mapOffsetX: 500,
  mapOffsetY: 10,
  mapCellSize: 20,
  _moveCooldown: 0,

  init(rpg) {
    this.rpg = rpg;
    this.core = rpg.core;
    this.fixedPlayerX = rpg.config.arch.player.x;
    this.fixedPlayerY = rpg.config.arch.player.y;
    this.mapOffsetX = rpg.config.arch.minimap.offsetX;
    this.mapOffsetY = rpg.config.arch.minimap.offsetY;
    this.mapCellSize = rpg.config.arch.minimap.cellSize;
    console.log('🗺️ ExplorationManager iniciado');
  },

  entrarHabitacion(y, x) {
    console.log(`🚪 entrarHabitacion llamado con [${y},${x}]`);
    const piso = this.rpg.data.mundo.pisos[this.pisoActual];
    if (!piso) return false;
    const [maxY, maxX] = piso.tamano;
    if (y < 0 || y >= maxY || x < 0 || x >= maxX) return false;
    const hab = piso.habitaciones.find(h => h.pos[0] === y && h.pos[1] === x);
    if (!hab) return false;
    const clave = `${y},${x}`;
    const esNueva = !this.visitadas.has(clave);
    this.salaActual = hab;
    if (esNueva) this.visitadas.add(clave);
    this.core.log(hab.descripcion || `Has entrado en una sala (${hab.tipo})`, 'info');
    this.core.emit('room:entered', hab);

    // --- ACCIONES SEGÚN TIPO DE SALA ---
    if (hab.tipo === 'combate' && !hab.completada) {
      this.rpg.combat.iniciarCombate(hab.enemigos || ['slime']);
      hab.completada = true;
    } else if (hab.tipo === 'tesoro' && !hab.abierto) {
      this._abrirTesoro(hab);
      hab.abierto = true;
    } else if (hab.tipo === 'escalera_abajo') {
      // Emitir evento para que el diálogo pregunte
      this.core.emit('floor:change-request', { delta: 1, desde: this.salaActual });
    } else if (hab.tipo === 'inicio' && this.pisoActual > 0) {
      // Emitir evento para preguntar si queremos subir
      this.core.emit('floor:change-request', { delta: -1, desde: this.salaActual });
    }
    return true;
  },

  _abrirTesoro(hab) {
    this.core.log('🎁 Has encontrado un cofre!', 'info');
    const item = { id: 'pocion_vida', nombre: 'Poción de vida', cantidad: 1 };
    this.rpg.inventory.anyadirItem(item.id, item.cantidad, item);
    this.core.log(`✨ Obtienes: ${item.nombre}`, 'info');
  },

  cambiarPiso(delta) {
    const nuevo = this.pisoActual + delta;
    if (nuevo < 0 || nuevo >= this.rpg.data.mundo.pisos.length) {
      this.core.log('No hay más pisos en esa dirección.', 'sistema');
      return false;
    }
    this.pisoActual = nuevo;
    this.visitadas.clear();
    const piso = this.rpg.data.mundo.pisos[this.pisoActual];
    const inicio = piso.habitaciones.find(h => h.tipo === 'inicio');
    if (inicio) {
      this.entrarHabitacion(inicio.pos[0], inicio.pos[1]);
    } else {
      this.entrarHabitacion(0, 0);
    }
    this.core.log(`Has ${delta > 0 ? 'bajado' : 'subido'} al piso ${this.pisoActual + 1}.`, 'sistema');
    this.core.emit('floor:changed', this.pisoActual);
    return true;
  },

  getPlayerScreenPosition() {
    return { x: this.fixedPlayerX, y: this.fixedPlayerY };
  },

  update(delta, input) {
    if (this._moveCooldown > 0) {
      this._moveCooldown -= delta;
      return;
    }
    if (input.justPressed('w') || input.justPressed('arrowup')) {
      this._intentarMovimiento(-1, 0);
    } else if (input.justPressed('s') || input.justPressed('arrowdown')) {
      this._intentarMovimiento(1, 0);
    } else if (input.justPressed('a') || input.justPressed('arrowleft')) {
      this._intentarMovimiento(0, -1);
    } else if (input.justPressed('d') || input.justPressed('arrowright')) {
      this._intentarMovimiento(0, 1);
    }
  },

  _intentarMovimiento(dy, dx) {
    if (!this.salaActual) return;
    const [y, x] = [this.salaActual.pos[0] + dy, this.salaActual.pos[1] + dx];
    if (this.entrarHabitacion(y, x)) {
      this._moveCooldown = 200;
    }
  },

  draw(ctx) {
    if (!this.salaActual) return;
    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    ctx.fillText(`Pos: (${this.salaActual.pos[0]},${this.salaActual.pos[1]})`, 10, 30);
    this._drawMinimap(ctx);
  },

  _drawMinimap(ctx) {
    const piso = this.rpg.data.mundo.pisos[this.pisoActual];
    if (!piso) return;
    const [maxY, maxX] = piso.tamano;
    const cell = this.mapCellSize;
    const startX = this.mapOffsetX;
    const startY = this.mapOffsetY;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(startX - 2, startY - 2, maxX * cell + 4, maxY * cell + 4);
    for (let y = 0; y < maxY; y++) {
      for (let x = 0; x < maxX; x++) {
        const cx = startX + x * cell;
        const cy = startY + y * cell;
        const visitada = this.visitadas.has(`${y},${x}`);
        const actual = this.salaActual && this.salaActual.pos[0] === y && this.salaActual.pos[1] === x;
        ctx.fillStyle = actual ? '#ffd700' : (visitada ? '#4a6cf7' : '#333');
        ctx.fillRect(cx, cy, cell - 1, cell - 1);
        ctx.strokeStyle = '#888';
        ctx.strokeRect(cx, cy, cell - 1, cell - 1);
      }
    }
  },

  setMapOffsetX(val) { this.mapOffsetX = val; },
  setMapOffsetY(val) { this.mapOffsetY = val; },
  setMapCellSize(val) { this.mapCellSize = val; }
};