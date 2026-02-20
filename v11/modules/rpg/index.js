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
// transcendenceManager se puede añadir después

export const rpgModule = {
    core: null,
    player: null,
    data: { mundo: null, enciclopedia: null, reglas: null },

    // Submódulos
    combat: combatManager,
    exploration: explorationManager,
    character: characterManager,
    inventory: inventoryManager,
    missions: missionManager,
    events: eventManager,
    factions: factionManager,

    // Configuración (modificable por arquitecto)
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

        // Inicializar submódulos
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

        // Cargar YAMLs
        this.data.mundo = await this.core.data.load('mundo');
        this.data.enciclopedia = await this.core.data.load('enciclopedia');
        this.data.reglas = await this.core.data.load('reglas');

        if (!this.data.mundo || !this.data.enciclopedia) {
            this.core.log('❌ Error al cargar datos. Revisa la consola.', 'error');
            return;
        }

        // Crear personaje por defecto
        this.character.createDefault();

        // Cargar sprite del jugador (si existe)
        try {
            this.character.player.sprite = await this.core.assets.getAsset('characters/player.png');
            console.log('🖼️ Sprite del jugador cargado');
        } catch (e) {
            console.warn('⚠️ Usando placeholder para sprite del jugador');
        }

        // Entrar en la primera sala
        this.exploration.entrarHabitacion(0, 0);

        // Eventos del core
        this.core.on('player:updated', (player) => {
            this.player = player;
            this.core.updateUI(player);
        });

        console.log('✅ RPG listo');
    },

    update(delta, input) {
        // Delegar en el submódulo activo (combate o exploración)
        if (this.combat.active) {
            this.combat.update(delta, input);
        } else {
            this.exploration.update(delta, input);
        }
    },

    // El draw se delega al renderer, no se usa directamente

    renderIngenieria() {
        const area = document.getElementById('ingenieria-render');
        if (!area) return;
        const ascii = this.core.modules['renderer-ascii'];
        const enabled = ascii ? ascii.enabled : false;
        area.innerHTML = `
            <h3 style="color:#0f0;">🔧 PANEL DE INGENIERÍA</h3>
            <div style="margin-bottom:10px;">
                <button class="equip-btn" onclick="window.core.modules['renderer-ascii'].toggle()">
                    ${enabled ? 'Desactivar' : 'Activar'} ASCII
                </button>
            </div>
            <div style="color:#0f0; font-size:10px;">
                <p>Offset minimapa X: ${this.exploration.mapOffsetX}</p>
                <p>Offset minimapa Y: ${this.exploration.mapOffsetY}</p>
                <p>Tamaño celda: ${this.exploration.mapCellSize}</p>
            </div>
        `;
    }
};