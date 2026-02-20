// ============================================
// modules/rpg/faction-manager.js - Sistema de facciones y reputación
// ============================================

export const factionManager = {
    parent: null,
    core: null,
    reputacion: {},

    init(parent) {
        this.parent = parent;
        this.core = parent.core;
    },

    modificarReputacion(faccionId, valor) {
        this.reputacion[faccionId] = (this.reputacion[faccionId] || 0) + valor;
        this.core.log(`🤝 Reputación con ${faccionId}: ${valor > 0 ? '+' : ''}${valor}`, valor > 0 ? 'positivo' : 'negativo');
        this.core.emit('reputation:changed', { faccion: faccionId, valor: this.reputacion[faccionId] });
    },

    getReaccion(faccionId) {
        const rep = this.reputacion[faccionId] || 0;

        if (faccionId === 'varrick') {
            if (rep >= 50) return "¡Hah! Mis yunques cantan mejor con tu presencia, camarada.";
            if (rep >= 20) return "El acero que forjamos aguantará lo que sea.";
            if (rep <= -20) return "No toques mis herramientas. Tu eco huele a traición.";
            return "Solo acero y fuego. ¿Qué necesitas?";
        }
        if (faccionId === 'silas') {
            if (rep >= 50) return "Tus hilos están entrelazados con los del Vacío... Eres parte de nosotros.";
            if (rep >= 20) return "Sigue alimentando a la Torre y ella te alimentará a ti.";
            if (rep <= -20) return "Tus pasos hacen demasiado ruido. El Vacío no te quiere aquí.";
            return "Los ecos son solo sombras de lo que fuimos. No te pierdas en ellas.";
        }
        return "Saludos, viajero.";
    },

    getBonificadorTienda(faccionId) {
        const rep = this.reputacion[faccionId] || 0;
        // 10% descuento cada 25 puntos, máximo 30%
        return 1 - Math.min(0.3, Math.max(0, Math.floor(rep / 25) * 0.1));
    },

    checkHostilidad(faccionId) {
        const rep = this.reputacion[faccionId] || 0;
        if (rep <= -50) {
            this.core.log(`⚠️ ¡La facción ${faccionId} te considera enemigo!`, 'critico');
            // Generar enemigos según facción
            let enemigos = [];
            if (faccionId === 'varrick') enemigos = ['centinela_laton', 'centinela_laton'];
            if (faccionId === 'silas') enemigos = ['sombra_eco', 'sombra_eco'];
            setTimeout(() => {
                this.parent.combat.iniciarCombate(enemigos);
            }, 1200);
            return true;
        }
        return false;
    },

    checkBeneficios(faccionId) {
        const rep = this.reputacion[faccionId] || 0;
        if (rep >= 75 && !this.parent.player.beneficiosFaccion?.[faccionId]) {
            if (!this.parent.player.beneficiosFaccion) this.parent.player.beneficiosFaccion = {};
            this.parent.player.beneficiosFaccion[faccionId] = true;

            if (faccionId === 'varrick') {
                this.parent.player.stats.F += 2;
                this.core.log("🛡️ Varrick te otorga el 'SELLO DEL MAESTRO FORJADOR'. +2 F", 'positivo');
            } else if (faccionId === 'silas') {
                this.parent.player.stats.I += 2;
                this.core.log("🌌 Silas te susurra secretos del Nexo. +2 I", 'positivo');
            }
            this.core.emit('player:updated', this.parent.player);
            return true;
        }
        return false;
    }
};