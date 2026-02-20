// ============================================
// missionmanager.js - Gestión de misiones
// ============================================
export class MissionManager {
    constructor(core) {
        this.core = core;
        this.missions = [
            { id: 'first_steps', name: 'Primeros Pasos', desc: 'Explora 5 habitaciones.', reward: { exp: 50 }, check: () => this.core.stats_partida?.salas_exploradas >= 5 },
            { id: 'slayer', name: 'Cazador de Ecos', desc: 'Derrota a 3 enemigos.', reward: { exp: 100 }, check: () => this.core.stats_partida?.enemigos_derrotados >= 3 },
            { id: 'depths', name: 'Hacia lo Profundo', desc: 'Alcanza el piso 5.', reward: { exp: 200, pointsMaestria: 1 }, check: () => this.core.currentModuleObj?.exploration?.pisoActual >= 4 },
        ];
        this.completed = new Set();

        // Escuchar eventos
        this.core.on('enemy:defeated', (data) => {
            this.core.stats_partida.enemigos_derrotados = (this.core.stats_partida.enemigos_derrotados || 0) + 1;
            this._checkAll();
        });
        this.core.on('room:entered', () => {
            this.core.stats_partida.salas_exploradas = (this.core.stats_partida.salas_exploradas || 0) + 1;
            this._checkAll();
        });
        this.core.on('floor:changed', (floor) => {
            // Para misión de piso
            this._checkAll();
        });
    }

    _checkAll() {
        this.missions.forEach(m => {
            if (!this.completed.has(m.id) && m.check()) {
                this.completeMission(m);
            }
        });
    }

    completeMission(m) {
        this.completed.add(m.id);
        this.core.log(`📜 MISIÓN COMPLETADA: ${m.name}`, 'positivo');
        if (m.reward.exp) {
            this.core.currentModuleObj?.character?.addExp(m.reward.exp);
        }
        if (m.reward.pointsMaestria) {
            const p = this.core.currentModuleObj?.player;
            if (p) {
                p.puntosMaestria += m.reward.pointsMaestria;
                this.core.emit('player:updated', p);
            }
        }
        this.core.emit('mission:completed', m);
    }
}