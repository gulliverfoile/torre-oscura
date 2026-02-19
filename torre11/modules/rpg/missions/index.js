// ============================================
// modules/rpg/missions/index.js - Sistema de misiones
// ============================================

export const missionManager = {
    rpg: null,
    core: null,
    misiones: [], // Lista de misiones activas
    completadas: new Set(),

    init(rpg) {
        this.rpg = rpg;
        this.core = rpg.core;
        console.log('📜 MissionManager iniciado');
        this.core.on('enemy:defeated', (data) => this.onEnemyDefeated(data));
        this.core.on('room:entered', () => this.onRoomEntered());
    },

    onEnemyDefeated(data) {
        console.log('👾 Evento enemy:defeated recibido', data.enemigo.id);
        // Lógica para misiones de combate
        // Por implementar según diseño
    },

    onRoomEntered() {
        // Lógica para misiones de exploración
    },

    completarMision(id) {
        if (this.completadas.has(id)) return;
        this.completadas.add(id);
        console.log(`🎉 Misión completada: ${id}`);
        this.core.emit('mission:completed', id);
    }
};