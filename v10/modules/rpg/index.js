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
import { transcendenceManager } from './transcendence-manager.js';

export const rpgModule = {
    core: null,
    player: null,
    data: {},

    combat: combatManager,
    exploration: explorationManager,
    character: characterManager,
    inventory: inventoryManager,
    missions: missionManager,
    events: eventManager,
    factions: factionManager,
    transcendence: transcendenceManager,

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
            minimap: { offsetX: 10, offsetY: 10, cellSize: 20 },
            combat: { attackSpeed: 0.1, attackDistance: 20, useDice: false }
        }
    },

    init(core) {
        this.core = core;
        // Inicializar submódulos
        this.combat.init(this);
        this.exploration.init(this);
        this.character.init(this);
        this.inventory.init(this);
        this.missions.init(this);
        this.events.init(this);
        this.factions.init(this);
        this.transcendence.init(this);
    },

    async onEnter() {
        this.core.log('Cargando datos...', 'info');
        this.data.mundo = await this.core.data.load('mundo');
        this.data.enciclopedia = await this.core.data.load('enciclopedia');
        this.data.reglas = await this.core.data.load('reglas');

        // Inicializar personaje
        this.character.createDefault();

        // Cargar sprite del jugador
        this.player.sprite = await this.core.assets.getAsset('characters/player.png');

        // Iniciar exploración en sala 0,0
        this.exploration.entrarHabitacion(0, 0);

        // Suscribirse a eventos
        this.core.on('player:updated', (player) => {
            this.player = player;
            this.core.updateUI(player);
        });
        this.core.on('room:entered', (room) => this.events.onRoomEntered(room));
    },

    update(delta, input) {
        if (this.combat.active) {
            this.combat.update(delta, input);
        } else {
            this.exploration.update(delta, input);
        }
    },

    draw(ctx) {
        // El renderer se encarga de dibujar, pero podemos mantener un draw básico
        // para cuando no haya renderer activo
        if (this.exploration) this.exploration.draw(ctx);
        if (this.combat.active) this.combat.draw(ctx);
    }
};