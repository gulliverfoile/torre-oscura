// ============================================
// modules/rpg/exploration/index.js - Exploración por salas
// ============================================

export const explorationManager = {
    parent: null,
    core: null,
    pisoActual: 0,
    salaActual: null,
    visitadas: new Set(),
    pisosMap: {},
    moveCooldown: 0,
    cooldownTime: 300, // ms

    init(parent) {
        this.parent = parent;
        this.core = parent.core;
        this.cooldownTime = parent.config.arch.combat.attackSpeed * 1000 || 300; // ejemplo
    },

    cargarMundo(mundo) {
        if (mundo.pisos) {
            mundo.pisos.forEach(p => this.pisosMap[p.piso_index] = p);
        }
    },

    entrarHabitacion(y, x) {
      console.log('🚪 entrarHabitacion llamado con', y, x);
        const piso = this.pisosMap[this.pisoActual];
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

        if (hab.tipo === 'combate' && !hab.completada) {
            this.parent.combat.iniciarCombate(hab.enemigos || ['slime']);
            hab.completada = true;
        } else if (hab.tipo === 'tesoro' && !hab.abierto) {
            this._abrirTesoro(hab);
            hab.abierto = true;
        } else if (hab.tipo === 'evento') {
            // El eventManager se encargará (mediante evento room:entered)
        }

        return true;
    },

    _abrirTesoro(hab) {
        this.core.log('🎁 Has encontrado un cofre!', 'info');
        // Generar loot simple
        const items = ['pocion_vida', 'pocion_mana', 'espada_hierro'];
        const itemId = items[Math.floor(Math.random() * items.length)];
        this.parent.inventory.anyadirItem(itemId, 1);
    },

    update(delta, input) {
        if (this.moveCooldown > 0) {
            this.moveCooldown -= delta;
            return;
        }

        let moved = false;
        if (input.isDown('w') || input.isDown('arrowup')) moved = this._intentarMovimiento(-1, 0);
        else if (input.isDown('s') || input.isDown('arrowdown')) moved = this._intentarMovimiento(1, 0);
        else if (input.isDown('a') || input.isDown('arrowleft')) moved = this._intentarMovimiento(0, -1);
        else if (input.isDown('d') || input.isDown('arrowright')) moved = this._intentarMovimiento(0, 1);

        if (moved) this.moveCooldown = this.cooldownTime;
    },

    _intentarMovimiento(dy, dx) {
        if (!this.salaActual) return false;
        const [y, x] = this.salaActual.pos;
        return this.entrarHabitacion(y + dy, x + dx);
    },

    getPlayerScreenPosition() {
        // Coordenadas fijas por ahora (configurables)
        return {
            x: this.parent.config.arch.player.x,
            y: this.parent.config.arch.player.y
        };
    },

    draw(ctx) {
        if (!this.salaActual) return;
        ctx.fillStyle = '#fff';
        ctx.font = '14px monospace';
        ctx.fillText(`Pos: (${this.salaActual.pos[0]},${this.salaActual.pos[1]})`, 10, 30);
        this._drawMinimap(ctx);
      
      ctx.fillStyle = '#0f0';
    ctx.font = '12px monospace';
    ctx.fillText('Exploración', 10, 30);
    this._drawMinimap(ctx); // si existe
    },

    _drawMinimap(ctx) {
        const piso = this.pisosMap[this.pisoActual];
        if (!piso) return;
        const [maxY, maxX] = piso.tamano;
        const cell = this.parent.config.arch.minimap.cellSize;
        const startX = this.parent.config.arch.minimap.offsetX;
        const startY = this.parent.config.arch.minimap.offsetY;

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(startX - 2, startY - 2, maxX * cell + 4, maxY * cell + 4);

        for (let y = 0; y < maxY; y++) {
            for (let x = 0; x < maxX; x++) {
                const cx = startX + x * cell;
                const cy = startY + y * cell;
                const visitada = this.visitadas.has(`${y},${x}`);
                const actual = this.salaActual && this.salaActual.pos[0] === y && this.salaActual.pos[1] === x;

                if (actual) ctx.fillStyle = '#ffd700';
                else if (visitada) ctx.fillStyle = '#4a6cf7';
                else ctx.fillStyle = '#333';

                ctx.fillRect(cx, cy, cell - 1, cell - 1);
                ctx.strokeStyle = '#888';
                ctx.strokeRect(cx, cy, cell - 1, cell - 1);
            }
        }
    }
};