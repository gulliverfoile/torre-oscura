// ============================================
// modules/rpg/transcendence-manager.js - Mejora y evolución de equipo
// ============================================

export const transcendenceManager = {
    parent: null,
    core: null,
    maxRefinementLevel: 5,

    init(parent) {
        this.parent = parent;
        this.core = parent.core;
    },

    openMaestria(slot) {
        const item = this.parent.player.equipo[slot];
        if (!item) return;

        const nivel = item.nivel || 1;
        const esMax = nivel >= this.maxRefinementLevel;

        const html = `
            <div style="text-align:center; margin-bottom:10px;">
                <div>Nivel: ${nivel}/${this.maxRefinementLevel}</div>
                <div>Puntos Maestría: ${this.parent.player.puntosMaestria}</div>
            </div>
            ${!esMax ? `
                <button class="equip-btn" onclick="window.core.modules.rpg.transcendence.refinar('${slot}')">
                    REFINAR (-1 Punto Maestría)
                </button>
            ` : `
                <div style="color:#0af;">ALCANZADO NIVEL MÁXIMO</div>
                <button class="equip-btn" onclick="window.core.modules.rpg.transcendence.abrirTrascendencia('${slot}')">
                    TRASCENDER (1 Éter Absoluto)
                </button>
            `}
        `;

        // Mostrar en un overlay (usando DialogManager)
        this.core.emit('ui:show-modal', {
            title: `Maestría: ${item.nombre}`,
            content: html
        });
    },

    refinar(slot) {
        if (this.parent.player.puntosMaestria <= 0) {
            this.core.log("❌ No tienes puntos de maestría.", 'negativo');
            return;
        }
        const item = this.parent.player.equipo[slot];
        if (!item) return;

        item.nivel = (item.nivel || 1) + 1;
        this.parent.player.puntosMaestria--;

        if (item.modificadores) {
            for (let m in item.modificadores) {
                item.modificadores[m] = Math.floor(item.modificadores[m] * 1.2) + 1;
            }
        }
        this.core.log(`✨ ${item.nombre} refinado a nivel ${item.nivel}`, 'positivo');
        this.core.emit('player:updated', this.parent.player);
    },

    abrirTrascendencia(slot) {
        const materialReq = 'eter_absoluto';
        const count = this.parent.inventory.getItemCount(materialReq);
        if (count < 1) {
            this.core.log('❌ Necesitas 1 Éter Absoluto', 'negativo');
            return;
        }

        const html = `
            <div>Elige una senda para tu equipo trascendido:</div>
            <button class="equip-btn" onclick="window.core.modules.rpg.transcendence.trascender('${slot}', 'poder')">⚔️ PODER</button>
            <button class="equip-btn" onclick="window.core.modules.rpg.transcendence.trascender('${slot}', 'eco')">🌌 ECO</button>
            <button class="equip-btn" onclick="window.core.modules.rpg.transcendence.trascender('${slot}', 'vacio')">👁️ VACÍO</button>
        `;

        this.core.emit('ui:show-modal', {
            title: 'Trascendencia',
            content: html
        });
    },

    trascender(slot, senda) {
        const item = this.parent.player.equipo[slot];
        if (!item) return;

        const materialReq = 'eter_absoluto';
        this.parent.inventory.quitarItem(materialReq, 1);

        item.trascendido = true;
        item.senda = senda;
        item.nombre = `[${senda}] ${item.nombre}`;

        if (senda === 'poder') {
            if (item.modificadores) {
                for (let m in item.modificadores) item.modificadores[m] = Math.floor(item.modificadores[m] * 1.5);
            }
        } else if (senda === 'eco') {
            item.echoPath = true;
        } else if (senda === 'vacio') {
            if (!item.modificadores) item.modificadores = {};
            item.modificadores.LUC = (item.modificadores.LUC || 0) + 5;
        }

        this.core.log(`✨ ¡${item.nombre} trascendido!`, 'critico');
        this.core.emit('player:updated', this.parent.player);
        this._checkAllTranscended();
    },

    _checkAllTranscended() {
        const slots = ['cabeza', 'pecho', 'arma', 'piernas'];
        const all = slots.every(slot => this.parent.player.equipo[slot]?.trascendido);
        if (all && !this.parent.player.habilidades.includes('trascendencia_total')) {
            this.parent.player.habilidades.push('trascendencia_total');
            if (this.parent.player.habilidadesActivas && !this.parent.player.habilidadesActivas.includes('trascendencia_total')) {
                this.parent.player.habilidadesActivas.push('trascendencia_total');
            }
            this.core.log("💠 ¡TRASCENDENCIA TOTAL desbloqueada!", 'critico');
        }
    }
};