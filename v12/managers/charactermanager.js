// ============================================
// charactermanager.js - Gestión del personaje
// ============================================
export class CharacterManager {
    constructor(core) {
        this.core = core;
        this.player = null;
    }

    initialize(data) {
        this.player = {
            nombre: data.nombre || 'Héroe',
            especialidad: data.especialidad || 'errante',
            nivel: data.nivel || 1,
            exp: data.exp || 0,
            expParaSubir: data.expParaSubir || 100,
            stats: { ...(data.stats || { F:10, D:10, I:10, S:10 }) },
            hpMax: data.hpMax || 100,
            hpCurrent: data.hpCurrent || 100,
            mpMax: data.mpMax || 50,
            mpCurrent: data.mpCurrent || 50,
            sanity: data.sanity || 100,
            sanityMax: data.sanityMax || 100,
            inventario: data.inventario || [],
            equipo: data.equipo || {},
            habilidades: data.habilidades || ['golpe_basico'],
            habilidadesActivas: data.habilidadesActivas || ['golpe_basico'],
            sprite: data.sprite || 'player',
            puntosMejora: data.puntosMejora || 0,
            puntosMaestria: data.puntosMaestria || 0,
            esencia: data.esencia || 0,
            pisoActual: 0
        };
    }

    addExp(amount) {
        this.player.exp += amount;
        this.core.log(`📈 EXP obtenida: ${amount}.`, 'sistema');
        if (this.player.exp >= this.player.expParaSubir) {
            this.levelUp();
        }
        this.core.emit('player:updated', this.player);
    }

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
        this.core.log(`🌟 ¡SUBIDA DE NIVEL! Ahora eres Nivel ${this.player.nivel}!`, 'positivo');
        this.core.emit('player:levelUp', this.player.nivel);
        this.core.emit('player:updated', this.player);
    }

    upgradeStat(stat) {
        if (this.player.puntosMejora > 0) {
            this.player.stats[stat]++;
            this.player.puntosMejora--;
            this.core.log(`✨ ${stat} aumentado a ${this.player.stats[stat]}.`, 'positivo');
            if (stat === 'F') { this.player.hpMax += 5; this.player.hpCurrent += 5; }
            if (stat === 'I') { this.player.mpMax += 5; this.player.mpCurrent += 5; }
            this.core.emit('player:updated', this.player);
        }
    }

    getEffectiveStats() {
        let stats = { ...this.player.stats };
        Object.values(this.player.equipo || {}).forEach(item => {
            if (item && item.modificadores) {
                for (let s in item.modificadores) {
                    if (stats[s] !== undefined) stats[s] += item.modificadores[s];
                }
            }
        });
        return stats;
    }
}