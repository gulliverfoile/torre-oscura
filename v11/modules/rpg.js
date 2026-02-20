// ============================================
// modules/rpg.js - Módulo RPG principal (CORREGIDO)
// ============================================
import { CombatManager } from '../managers/combatmanager.js';
import { LootManager } from '../managers/lootmanager.js';
import { InventoryManager } from '../managers/inventorymanager.js';
import { CharacterManager } from '../managers/charactermanager.js';
import { ExplorationManager } from '../managers/explorationmanager.js';
import { SanityManager } from '../managers/sanitymanager.js';
import { MissionManager } from '../managers/missionmanager.js';
import { TutorialManager } from '../managers/tutorialmanager.js';
import { DialogManager } from '../managers/dialogmanager.js';
import { HUDRenderer } from '../visual/hudrenderer.js';

export const rpgModule = {
    // Propiedades del módulo
    core: null,
    data: {},
    player: null,
    combat: null,
    loot: null,
    inventory: null,
    character: null,
    exploration: null,
    sanity: null,
    missions: null,
    tutorial: null,
    dialog: null,
    hud: null,
    frameCounter: 0,
    fondo: null,
    moveCooldown: 0,

    // Configuración visual (HUD)
    hudConfig: {
        style: 'bars',
        x: 20,
        y: 20,
        size: 20,
        spacing: 30,
        colors: { hp: '#e94560', mp: '#44aaff', sanity: '#b19cd9' }
    },

    // Configuración de arquitectura (posiciones, tamaños, etc.)
    archConfig: {
        player: { x: 300, y: 200, size: 64 },
        enemy: { x: 600, y: 200, size: 64 },
        minimap: { offsetX: 500, offsetY: 10, cellSize: 20 },
        combat: { attackSpeed: 0.1, attackDistance: 20, useDice: false }
    },

    // Método de inicialización (se llama desde el núcleo)
    init(core) {
        this.core = core;
        console.log('✅ rpgModule.init() llamado');
    },

    // Método que se ejecuta al entrar al módulo (carga datos, crea managers)
    async onEnter(params) {
        console.log('✅ rpgModule.onEnter() iniciado');
        if (!this.core) {
            console.error('❌ core es null en onEnter');
            return;
        }
        this.core.log('Cargando datos de la Torre...', 'info');
        this.core.canvas.focus();

        const dataManager = this.core.dataManager;
        this.data.mundo = await dataManager.load('mundo');
        this.data.enciclopedia = await dataManager.load('enciclopedia');
        this.data.reglas = await dataManager.load('reglas');

        if (!this.data.mundo || !this.data.enciclopedia) {
            this.core.log('Error al cargar datos. Revisa la consola.', 'error');
            return;
        }

        // Crear el personaje del jugador
        this.character = new CharacterManager(this.core);
        const playerData = {
            nombre: 'Héroe',
            hpMax: 100, hpCurrent: 100,
            mpMax: 50, mpCurrent: 50,
            sanity: 100, sanityMax: 100,
            stats: { F:10, D:10, I:10, S:10 },
            inventario: [],
            equipo: {},
            habilidades: ['golpe_basico'],
            habilidadesActivas: ['golpe_basico']
        };
        this.character.initialize(playerData);
        this.player = this.character.player;

        // Cargar sprites (imágenes)
        try {
            this.player.sprite = await this.core.images.get('characters/player.png');
            console.log('🖼️ Sprite del jugador cargado');
        } catch (e) {
            console.warn('No se pudo cargar sprite del jugador, usando rectángulo');
            this.player.sprite = null;
        }

        try {
            this.fondo = await this.core.images.get('backgrounds/bg_default.png');
            console.log('Fondo cargado');
        } catch (e) {
            console.warn('No se pudo cargar el fondo, usando color sólido');
            this.fondo = null;
        }

        // Inicializar todos los submódulos
        this.sanity = new SanityManager(this.core);
        this.loot = new LootManager(this.data.enciclopedia, this.core);
        this.inventory = new InventoryManager(this.core);
        this.combat = new CombatManager(this.core, this.data.enciclopedia, this.loot, this.character, this.inventory, this.archConfig, this.data.reglas);
        this.exploration = new ExplorationManager(this.core, this.data.mundo, this.character, this.combat, this.inventory, this.archConfig);
        this.missions = new MissionManager(this.core);
        this.tutorial = new TutorialManager(this.core);
        this.dialog = new DialogManager(this.core);
        this.hud = new HUDRenderer(this.core, this.hudConfig);

        // Escuchar eventos del núcleo
        this.core.on('player:updated', (player) => {
            this.player = player;
            this.core.updateUI(player);
        });

        this.core.on('floor:change-request', async (data) => {
            const direccion = data.delta > 0 ? 'bajar' : 'subir';
            const confirmed = await this.dialog.confirm(`¿Quieres ${direccion} al siguiente piso?`);
            data.callback(confirmed);
        });

        // Entrar en la primera habitación
        console.log('Entrando a sala [0,0]...');
        this.exploration.entrarHabitacion(0, 0);
        this.core.updateUI(this.player);
        console.log('onEnter finalizado');
    },

    // Bucle de actualización (se llama en cada frame)
    update(delta, input) {
        this.frameCounter++;

        if (this.moveCooldown > 0) {
            this.moveCooldown -= delta;
        }

        if (this.combat?.combateActivo) {
            this.combat.update(delta, input);
        } else {
            if (this.moveCooldown <= 0) {
                let moved = false;
                if (input.isDown('w') || input.isDown('arrowup')) {
                    const [y, x] = this._move(-1, 0);
                    if (this.exploration.entrarHabitacion(y, x)) moved = true;
                } else if (input.isDown('s') || input.isDown('arrowdown')) {
                    const [y, x] = this._move(1, 0);
                    if (this.exploration.entrarHabitacion(y, x)) moved = true;
                } else if (input.isDown('a') || input.isDown('arrowleft')) {
                    const [y, x] = this._move(0, -1);
                    if (this.exploration.entrarHabitacion(y, x)) moved = true;
                } else if (input.isDown('d') || input.isDown('arrowright')) {
                    const [y, x] = this._move(0, 1);
                    if (this.exploration.entrarHabitacion(y, x)) moved = true;
                }
                if (moved) {
                    this.moveCooldown = 300; // Milisegundos entre movimientos
                }
            }
        }

        // Efectos periódicos (cada 10 frames)
        if (this.frameCounter % 10 === 0 && this.sanity) {
            this.sanity.tickExploration();
        }

        // Atajos de teclado para desarrollo
        if (input.justPressed('l')) {
            this.core.log('El loot se recoge automáticamente al matar enemigos.', 'info');
        }

        if (input.justPressed('i')) {
            if (window.switchTab) window.switchTab('mochila');
        }
    },

    // Método de dibujo (se llama en cada frame)
    draw(ctx) {
        // Fondo
        if (this.fondo) {
            ctx.drawImage(this.fondo, 0, 0, ctx.canvas.width, ctx.canvas.height);
        } else {
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }

        // Dibujar la exploración (mapa, habitaciones)
        if (this.exploration) {
            this.exploration.draw(ctx);
        }

        // Si hay combate activo, dibujar combate; si no, dibujar al jugador
        if (this.combat?.combateActivo) {
            this.combat.draw(ctx);
        } else {
            if (this.player) {
                const pos = this.exploration.getPlayerScreenPosition();
                const size = this.archConfig.player.size;
                if (this.player.sprite) {
                    try {
                        ctx.drawImage(this.player.sprite, pos.x, pos.y, size, size);
                    } catch (e) {
                        ctx.fillStyle = '#ff00ff';
                        ctx.fillRect(pos.x, pos.y, size, size);
                    }
                } else {
                    ctx.fillStyle = '#ff00ff';
                    ctx.fillRect(pos.x, pos.y, size, size);
                }
            }
            // Si el modo ASCII está activado, lo aplicamos sobre el canvas
            if (this.core.modules.ascii && this.core.modules.ascii.enabled) {
                this.core.modules.ascii.apply();
            }
        }

        // Dibujar el HUD (barras de vida, etc.)
        if (this.hud) {
            this.hud.draw(ctx, this.player);
        }
    },

    // Método auxiliar para calcular la siguiente posición al moverse
    _move(dy, dx) {
        if (!this.exploration?.salaActual) {
            return [0, 0];
        }
        const [y, x] = this.exploration.salaActual.pos;
        return [y + dy, x + dx];
    },

    // 🔧 PANEL DE INGENIERÍA (herramientas de desarrollo)
    // Este método se llama cuando se abre la pestaña de ingeniería
    renderIngenieria() {
        const area = document.getElementById('ingenieria-render');
        if (!area) return;

        // Valores actuales para los controles
        const mapX = this.exploration.mapOffsetX;
        const mapY = this.exploration.mapOffsetY;
        const cellSize = this.exploration.mapCellSize;
        const useDice = this.archConfig.combat.useDice;
        const asciiEnabled = this.core.modules.ascii?.enabled;

        // Generamos el HTML del panel con un template string (backticks)
        area.innerHTML = `
            <h3 style="color:#0f0;">🔧 PANEL DE INGENIERÍA</h3>
            <p style="font-size:11px;">Herramientas para héroes que han visto demasiado.</p>
            <div style="display:flex; flex-direction:column; gap:10px;">
                <!-- Botones de desarrollo -->
                <button class="equip-btn" onclick="window.core.ui._devHeal()">❤️ Curar</button>
                <button class="equip-btn" onclick="window.core.ui._devAddGold()">💰 +100 Esencia</button>
                <button class="equip-btn" onclick="window.core.ui._devAddItem()">📦 Añadir espada</button>
                <button class="equip-btn" onclick="window.core.ui._devNextFloor()">⬇️ Bajar piso</button>
                <button class="equip-btn" onclick="window.core.ui._devKillEnemies()">💀 Matar enemigos</button>
                <button class="equip-btn" onclick="window.core.modules.architect.toggle()">⚙️ Abrir Arquitecto</button>

                <hr style="border-color:#0f0;">

                <!-- MODO ASCII: activar/desactivar y temas -->
                <h4 style="color:#0f0;">MODO ASCII</h4>
                <button class="equip-btn" onclick="window.core.modules.ascii.toggle()">
                    ${asciiEnabled ? '🔳 Desactivar ASCII' : '🔲 Activar ASCII'}
                </button>
                <div style="display:flex; gap:5px; flex-wrap:wrap;">
                    ${Object.keys(this.core.modules.ascii.themes).map(key => `
                        <button class="equip-btn" style="font-size:9px;" onclick="window.core.modules.ascii.applyTheme('${key}')">
                            ${this.core.modules.ascii.themes[key].name}
                        </button>
                    `).join('')}
                </div>

                <hr style="border-color:#0f0;">

                <!-- CONFIGURACIÓN DEL MINIMAPA -->
                <h4 style="color:#0f0;">CONFIGURACIÓN MINIMAPA</h4>
                <div>
                    <label>Offset X: <span id="ing-map-x-val">${mapX}</span></label>
                    <input type="range" id="ing-map-x" min="0" max="700" value="${mapX}" step="1"
                        oninput="document.getElementById('ing-map-x-val').textContent=this.value; window.core.ui._setMinimapX(this.value)">
                </div>
                <div>
                    <label>Offset Y: <span id="ing-map-y-val">${mapY}</span></label>
                    <input type="range" id="ing-map-y" min="0" max="300" value="${mapY}" step="1"
                        oninput="document.getElementById('ing-map-y-val').textContent=this.value; window.core.ui._setMinimapY(this.value)">
                </div>
                <div>
                    <label>Tamaño celda: <span id="ing-map-cell-val">${cellSize}</span></label>
                    <input type="range" id="ing-map-cell" min="10" max="40" value="${cellSize}" step="1"
                        oninput="document.getElementById('ing-map-cell-val').textContent=this.value; window.core.ui._setMapCellSize(this.value)">
                </div>

                <hr>

                <!-- CONFIGURACIÓN DE COMBATE -->
                <h4 style="color:#0f0;">COMBATE</h4>
                <div>
                    <label>Usar dados: <input type="checkbox" id="ing-use-dice" ${useDice ? 'checked' : ''}
                        onchange="window.core.currentModuleObj.archConfig.combat.useDice = this.checked; window.core.ui._updateCombatDice(this.checked)">
                        (aleatoriedad)</label>
                </div>
            </div>
        `;
    }
};