// ============================================
// explorationmanager.js - Exploración con minimapa configurable
// ============================================
export class ExplorationManager {
    constructor(core, mundo, character, combatManager, inventory, archConfig) {
        this.core = core;
        this.mundo = mundo;
        this.character = character;
        this.combat = combatManager;
        this.inventory = inventory;
        this.archConfig = archConfig;
        this.pisoActual = 0;
        this.salaActual = null;
        this.visitadas = new Set();
        
        this.pisosMap = {};
        if (mundo.pisos) {
            mundo.pisos.forEach(p => {
                this.pisosMap[p.piso_index] = p;
            });
        }

        this.fixedPlayerX = archConfig.player.x;
        this.fixedPlayerY = archConfig.player.y;
        
        this.mapOffsetX = archConfig.minimap.offsetX;
        this.mapOffsetY = archConfig.minimap.offsetY;
        this.mapCellSize = archConfig.minimap.cellSize;
    }

    entrarHabitacion(y, x, loguear = true) {
        const piso = this.pisosMap[this.pisoActual];
        if (!piso) {
            console.error(`❌ Piso ${this.pisoActual} no encontrado.`);
            return false;
        }

        const [maxY, maxX] = piso.tamano;
        if (y < 0 || y >= maxY || x < 0 || x >= maxX) {
            console.log(`Coordenadas [${y},${x}] fuera del mapa (tamaño ${maxY}x${maxX})`);
            return false;
        }

        console.log(`🚪 Intentando entrar a [${y},${x}]`);
        
        const hab = piso.habitaciones.find(h => h.pos[0] === y && h.pos[1] === x);
        if (!hab) {
            console.warn(`No hay habitación definida en [${y},${x}]`);
            return false;
        }

        const clave = `${y},${x}`;
        const esNueva = !this.visitadas.has(clave);
        this.salaActual = hab;
        if (esNueva) {
            this.visitadas.add(clave);
            this.core.stats_partida.salas_exploradas++;
        }

        if (loguear) {
            this.core.log(hab.descripcion || `Has entrado en una sala (${hab.tipo})`, 'info');
            if (this.core.locationSpan) {
                this.core.locationSpan.textContent = `Piso ${this.pisoActual + 1}`;
            }
        }

        this.core.emit('room:entered', hab);

        if (hab.tipo === 'combate' && !hab.completada) {
            console.log('Iniciando combate en esta sala');
            this.combat.iniciarCombate(hab.enemigos || ['slime']);
            hab.completada = true;
        } else if (hab.tipo === 'tesoro' && !hab.abierto) {
            this._abrirTesoro(hab);
            hab.abierto = true;
        } else if (hab.tipo === 'evento') {
            console.log('Evento en sala:', hab.evento_id);
        }

        return true;
    }

    _abrirTesoro(hab) {
        this.core.log('🎁 Has encontrado un cofre!', 'info');
        const lootManager = this.combat.loot;
        const tesoro = lootManager.generarLoot(this.pisoActual + 1, false);
        if (tesoro.length > 0) {
            const item = tesoro[0];
            this.inventory.anyadirItem(item.id, 1, item);
            this.core.log(`✨ Obtienes: ${item.nombre}`, 'info');
        } else {
            this.core.log('El cofre está vacío...', 'info');
        }
    }

    async cambiarPiso(delta) {
        const nuevoPiso = this.pisoActual + delta;
        if (nuevoPiso < 0 || nuevoPiso >= this.mundo.pisos.length) {
            this.core.log('No hay más pisos en esa dirección.', 'sistema');
            return false;
        }

        // Emitir evento para que el DialogManager pregunte
        return new Promise((resolve) => {
            this.core.emit('floor:change-request', { 
                delta, 
                callback: async (confirmed) => {
                    if (!confirmed) {
                        resolve(false);
                        return;
                    }
                    this.pisoActual = nuevoPiso;
                    this.visitadas.clear();
                    const piso = this.pisosMap[this.pisoActual];
                    if (!piso) return;
                    const habInicio = piso.habitaciones.find(h => h.tipo === 'inicio');
                    if (habInicio) {
                        this.entrarHabitacion(habInicio.pos[0], habInicio.pos[1]);
                    } else {
                        this.entrarHabitacion(0, 0);
                    }
                    this.core.log(`Has ${delta > 0 ? 'bajado' : 'subido'} al piso ${this.pisoActual + 1}.`, 'sistema');
                    this.core.emit('floor:changed', this.pisoActual);
                    resolve(true);
                }
            });
        });
    }

    getPlayerScreenPosition() {
        return { x: this.fixedPlayerX, y: this.fixedPlayerY };
    }

    draw(ctx) {
        if (!this.salaActual) return;
        ctx.fillStyle = '#fff';
        ctx.font = '14px monospace';
        ctx.fillText(`Pos: (${this.salaActual.pos[0]},${this.salaActual.pos[1]})`, 10, 60);
        this.drawMinimap(ctx);
    }

    drawMinimap(ctx) {
        const piso = this.pisosMap[this.pisoActual];
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

                if (actual) {
                    ctx.fillStyle = '#ffd700';
                } else if (visitada) {
                    ctx.fillStyle = '#4a6cf7';
                } else {
                    ctx.fillStyle = '#333';
                }
                ctx.fillRect(cx, cy, cell - 1, cell - 1);
                ctx.strokeStyle = '#888';
                ctx.strokeRect(cx, cy, cell - 1, cell - 1);
            }
        }
    }

    setMapOffsetX(val) { this.mapOffsetX = val; }
    setMapOffsetY(val) { this.mapOffsetY = val; }
    setMapCellSize(val) { this.mapCellSize = val; }
}