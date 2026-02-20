// ============================================
// modules/rpg/faction-manager.js - Facciones y reputación
// ============================================

export const factionManager = {
    rpg: null,
    core: null,
    facciones: {},

    init(rpg) {
        this.rpg = rpg;
        this.core = rpg.core;
        console.log('🤝 FactionManager iniciado');
    },

    getReaccion(faccionId) {
        const rep = this.facciones[faccionId] || 0;
        if (faccionId === 'varrick') {
            if (rep >= 50) return "¡Hah! Mis yunques cantan mejor con tu presencia.";
            if (rep >= 20) return "El acero que forjamos aguantará.";
            if (rep <= -20) return "No toques mis herramientas.";
            return "Solo acero y fuego.";
        }
        if (faccionId === 'silas') {
            if (rep >= 50) return "Tus hilos están entrelazados con los del Vacío...";
            if (rep >= 20) return "Sigue alimentando a la Torre.";
            if (rep <= -20) return "Tus pasos hacen demasiado ruido.";
            return "Los ecos son solo sombras.";
        }
        return "Saludos.";
    },

    getBonificadorTienda(faccionId) {
        const rep = this.facciones[faccionId] || 0;
        const descuento = Math.min(0.3, Math.max(0, Math.floor(rep / 25) * 0.1));
        return 1.0 - descuento;
    },

    checkHostilidad(faccionId) {
        const rep = this.facciones[faccionId] || 0;
        if (rep <= -50) {
            this.core.log(`⚠️ ¡La facción ${faccionId} te ataca!`, 'critico');
            // Generar enemigos según facción
            let enemigos = faccionId === 'varrick' ? ['centinela_laton', 'centinela_laton'] : ['sombra_eco', 'sombra_eco'];
            this.rpg.combat.iniciarCombate(enemigos);
            return true;
        }
        return false;
    },

    checkBeneficios(faccionId) {
        const rep = this.facciones[faccionId] || 0;
        if (rep >= 75 && !this.rpg.character.player.beneficiosFaccion?.[faccionId]) {
            if (!this.rpg.character.player.beneficiosFaccion) this.rpg.character.player.beneficiosFaccion = {};
            this.rpg.character.player.beneficiosFaccion[faccionId] = true;
            if (faccionId === 'varrick') {
                this.rpg.character.player.stats.F += 2;
                this.core.log("🛡️ Varrick te otorga +2 Fuerza permanente.", "positivo");
            } else if (faccionId === 'silas') {
                this.rpg.character.player.stats.I += 2;
                this.core.log("🌌 Silas te otorga +2 Inteligencia permanente.", "positivo");
            }
            this.core.emit('player:updated', this.rpg.character.player);
            return true;
        }
        return false;
    },

    modificarReputacion(faccionId, cantidad) {
        if (!this.facciones[faccionId]) this.facciones[faccionId] = 0;
        this.facciones[faccionId] += cantidad;
        console.log(`📈 Reputación con ${faccionId}: ${cantidad > 0 ? '+' : ''}${cantidad} (ahora ${this.facciones[faccionId]})`);
        this.core.emit('reputation:changed', { faccion: faccionId, valor: this.facciones[faccionId] });
    }
};