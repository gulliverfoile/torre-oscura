// ============================================
// modules/rpg/missions/index.js - Sistema de misiones
// ============================================

export const missionManager = {
    parent: null,
    core: null,
    misiones: [],
    completadas: new Set(),

    init(parent) {
        this.parent = parent;
        this.core = parent.core;
        // Suscribirse a eventos
        this.core.on('enemy:defeated', (data) => this.onEnemyDefeated(data));
        this.core.on('room:entered', (room) => this.onRoomEntered(room));
    },

    cargarMisiones(enciclopedia) {
        this.misiones = enciclopedia.misiones || [];
    },

    onEnemyDefeated(data) {
        // Incrementar contadores de misiones que requieran matar enemigos
        this.misiones.forEach(m => {
            if (m.tipo === 'matar' && m.enemigo === data.id && !this.completadas.has(m.id)) {
                m.progreso = (m.progreso || 0) + 1;
                if (m.progreso >= m.cantidad) {
                    this.completarMision(m);
                }
            }
        });
    },

    onRoomEntered(room) {
        this.misiones.forEach(m => {
            if (m.tipo === 'explorar' && room.pos.join(',') === m.sala && !this.completadas.has(m.id)) {
                this.completarMision(m);
            }
        });
    },

    completarMision(m) {
        this.completadas.add(m.id);
        this.core.log(`🎉 Misión completada: ${m.nombre}`, 'positivo');
        // Dar recompensas
        if (m.recompensa.exp) this.parent.character.addExp(m.recompensa.exp);
        if (m.recompensa.items) {
            m.recompensa.items.forEach(item => this.parent.inventory.anyadirItem(item.id, item.cant));
        }
        this.core.emit('mission:completed', m);
    },

    getMisionesActivas() {
        return this.misiones.filter(m => !this.completadas.has(m.id));
    }
};