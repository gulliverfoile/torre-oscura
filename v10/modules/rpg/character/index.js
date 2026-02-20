// ============================================
// modules/rpg/character/index.js - Gestión del personaje
// ============================================

export const characterManager = {
    parent: null,
    core: null,
    player: null,

    init(parent) {
        this.parent = parent;
        this.core = parent.core;
    },

    createDefault() {
        this.player = {
            nombre: 'Héroe',
            hpMax: 100,
            hpCurrent: 100,
            mpMax: 50,
            mpCurrent: 50,
            sanity: 100,
            sanityMax: 100,
            stats: { F:10, D:10, I:10, S:10 },
            inventario: [],
            equipo: {},
            habilidades: ['golpe_basico'],
            habilidadesActivas: ['golpe_basico'],
            nivel: 1,
            exp: 0,
            expParaSubir: 100,
            puntosMejora: 0,
            puntosMaestria: 0,
            esencia: 0,
            sprite: null
        };
        this.parent.player = this.player;
    },

    addExp(amount) {
        this.player.exp += amount;
        this.core.log(`📈 EXP obtenida: ${amount}`, 'sistema');
        if (this.player.exp >= this.player.expParaSubir) {
            this.levelUp();
        }
        this.core.emit('player:updated', this.player);
    },

    levelUp() {
        this.player.nivel++;
        this.player.exp -= this.player.expParaSubir;
        this.player.expParaSubir = Math.floor(this.player.expParaSubir * 1.5);
        this.player.puntosMejora += 5;
        this.player.puntosMaestria += 1;
        this.player.hpMax += 15;
        this.player.hpCurrent = this.player.hpMax;
        this.player.mpMax += 10;
        this.player.mpCurrent = this.player.mpMax;
        this.core.log(`🌟 ¡Nivel ${this.player.nivel}!`, 'positivo');
        this.core.emit('player:levelUp', this.player.nivel);
        this.core.emit('player:updated', this.player);
    },

    upgradeStat(stat) {
        if (this.player.puntosMejora > 0) {
            this.player.stats[stat]++;
            this.player.puntosMejora--;
            this.core.log(`✨ ${stat} +1`, 'positivo');
            if (stat === 'F') { this.player.hpMax += 5; this.player.hpCurrent += 5; }
            if (stat === 'I') { this.player.mpMax += 5; this.player.mpCurrent += 5; }
            this.core.emit('player:updated', this.player);
        }
    },

    getEffectiveStats() {
        let stats = { ...this.player.stats };
        Object.values(this.player.equipo).forEach(item => {
            if (item?.modificadores) {
                for (let s in item.modificadores) {
                    if (stats[s] !== undefined) stats[s] += item.modificadores[s];
                }
            }
        });
        return stats;
    }
};