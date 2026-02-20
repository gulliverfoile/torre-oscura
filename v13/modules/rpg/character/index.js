export const characterManager = {
    rpg: null,
    core: null,
    player: null,

    init(rpg) { this.rpg = rpg; this.core = rpg.core; },

    createDefault() {
        this.player = {
            nombre: 'Héroe', nivel: 1, exp: 0, expParaSubir: 100,
            stats: { F:10, D:10, I:10, S:10 },
            hpMax: 100, hpCurrent: 100,
            mpMax: 50, mpCurrent: 50,
            sanity: 100, sanityMax: 100,
            inventario: [], equipo: {},
            habilidades: ['golpe_basico'], habilidadesActivas: ['golpe_basico'],
            puntosMejora: 0, puntosMaestria: 0, esencia: 0, sprite: null
        };
        this.core.emit('player:updated', this.player);
    },

    addExp(amount) {
        this.player.exp += amount;
        if (this.player.exp >= this.player.expParaSubir) this.levelUp();
        this.core.emit('player:updated', this.player);
    },

    levelUp() {
        this.player.nivel++;
        this.player.exp -= this.player.expParaSubir;
        this.player.expParaSubir = Math.floor(this.player.expParaSubir * 1.5);
        this.player.puntosMejora += 5;
        this.player.puntosMaestria += 1;
        this.player.hpMax += 15; this.player.hpCurrent = this.player.hpMax;
        this.player.mpMax += 10; this.player.mpCurrent = this.player.mpMax;
        this.core.emit('player:levelup', this.player.nivel);
        this.core.emit('player:updated', this.player);
    },

    upgradeStat(stat) {
        if (this.player.puntosMejora > 0) {
            this.player.stats[stat]++;
            this.player.puntosMejora--;
            if (stat === 'F') { this.player.hpMax += 5; this.player.hpCurrent += 5; }
            if (stat === 'I') { this.player.mpMax += 5; this.player.mpCurrent += 5; }
            this.core.emit('player:updated', this.player);
        }
    },

    getEffectiveStats() {
        let stats = { ...this.player.stats };
        Object.values(this.player.equipo).forEach(item => {
            if (item && item.modificadores) {
                for (let s in item.modificadores) {
                    if (stats[s] !== undefined) stats[s] += item.modificadores[s];
                }
            }
        });
        return stats;
    }
};