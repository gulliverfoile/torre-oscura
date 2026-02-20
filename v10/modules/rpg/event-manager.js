// ============================================
// modules/rpg/event-manager.js - Gestión de eventos narrativos
// ============================================

export const eventManager = {
    parent: null,
    core: null,
    eventoActual: null,

    init(parent) {
        this.parent = parent;
        this.core = parent.core;
    },

    onRoomEntered(room) {
        if (room.tipo === 'evento' && room.evento_id) {
            this.iniciarEvento(room.evento_id);
        }
    },

    iniciarEvento(eventoId) {
        const evento = this._getEvento(eventoId);
        if (!evento) return;

        // Comprobar facción
        if (evento.faccion) {
            const hostil = this.parent.factions.checkHostilidad(evento.faccion);
            if (hostil) return; // El combate se inicia dentro de checkHostilidad
            this.parent.factions.checkBeneficios(evento.faccion);
        }

        this.eventoActual = evento;
        this.core.log(`✨ EVENTO: ${this.core.i18n.t(`eventos.${eventoId}.nombre`, evento.nombre)}`, 'narrativa');

        if (evento.faccion) {
            const reaccion = this.parent.factions.getReaccion(evento.faccion);
            this.core.log(`🗣️ ${reaccion}`, 'sistema');
        }

        this.core.log(this.core.i18n.t(`eventos.${eventoId}.desc`, evento.descripcion), 'narrativa');
        this._mostrarOpciones(evento);
    },

    _mostrarOpciones(evento) {
        // Usar el DialogManager (que está en ui/components/dialog-modal.js)
        // Por simplicidad, aquí emitimos un evento para que la UI lo muestre
        this.core.emit('event:show-options', {
            evento,
            opciones: evento.opciones.map((opt, idx) => ({
                texto: this.core.i18n.t(`eventos.${evento.id}.opciones.${idx}`, opt.texto),
                accion: () => this._resolverOpcion(opt, idx, evento.id)
            }))
        });
    },

    _resolverOpcion(opt, idx, eventoId) {
        this.core.log(`> ${this.core.i18n.t(`eventos.${eventoId}.opciones.${idx}`, opt.texto)}`, 'sistema');

        if (opt.resultado_exito?.tienda) {
            this.core.emit('shop:open');
            return;
        }

        // Si hay chequeo de misión (materiales)
        if (opt.chequeo_mision) {
            const tieneMateriales = this._verificarMateriales(opt.chequeo_mision);
            this._completarResolucion(opt, tieneMateriales, idx, eventoId);
            return;
        }

        // Si hay minijuego
        if (opt.minigame) {
            this.core.log('🛠️ Iniciando minijuego...', 'sistema');
            // Emitir evento para iniciar minijuego
            this.core.emit('minigame:start', opt.minigame, (exito) => {
                this._completarResolucion(opt, exito, idx, eventoId);
            });
            return;
        }

        // Si hay chequeo de stats
        if (opt.chequeo) {
            this.core.log(`🎲 Chequeo de ${opt.chequeo.stat} (DC ${opt.chequeo.dc})...`, 'sistema');
            // Simular tirada (se puede mejorar con un dado)
            const exito = Math.random() > 0.5; // placeholder
            this._completarResolucion(opt, exito, idx, eventoId);
        } else {
            // Sin chequeo, éxito automático
            this._completarResolucion(opt, true, idx, eventoId);
        }
    },

    _completarResolucion(opt, exito, idx, eventoId) {
        const respuesta = exito ? opt.resultado_exito : opt.resultado_fallo;
        const msgKey = exito ? `eventos.${eventoId}.resultados.${idx}.exito` : `eventos.${eventoId}.resultados.${idx}.fallo`;
        this.core.log(this.core.i18n.t(msgKey, respuesta.mensaje), 'narrativa');

        if (respuesta.recompensa) {
            this._aplicarRecompensa(respuesta.recompensa);
        }

        this.eventoActual = null;
        this.core.emit('event:finished');
    },

    _aplicarRecompensa(r) {
        if (r.cordura) {
            if (r.cordura < 0) {
                this.parent.player.sanity += r.cordura; // negativo
            } else {
                this.parent.player.sanity = Math.min(this.parent.player.sanityMax, this.parent.player.sanity + r.cordura);
            }
            this.core.log(`🧠 Cordura: ${r.cordura > 0 ? '+' : ''}${r.cordura}`, 'info');
        }
        if (r.item) {
            this.parent.inventory.anyadirItem(r.item, 1);
        }
        if (r.habilidad) {
            if (!this.parent.player.habilidades.includes(r.habilidad)) {
                this.parent.player.habilidades.push(r.habilidad);
                this.core.log(`🌌 Aprendida: ${r.habilidad}`, 'critico');
            } else {
                this.parent.player.puntosMaestria++;
            }
        }
        if (r.danio) {
            this.parent.player.hpCurrent -= r.danio;
            this.core.log(`💥 ${r.danio} daño`, 'negativo');
            if (this.parent.player.hpCurrent <= 0) this.core.emit('game-over');
        }
        if (r.exp) {
            this.parent.character.addExp(r.exp);
        }
        if (r.reputacion) {
            const faccion = r.reputacion.faccion;
            const valor = r.reputacion.valor;
            this.parent.factions.modificarReputacion(faccion, valor);
        }
        this.core.emit('player:updated', this.parent.player);
    },

    _getEvento(eventoId) {
        // Cargar desde un archivo YAML o desde una base de datos interna
        // Por ahora, devolvemos un ejemplo
        return {
            id: eventoId,
            nombre: 'Evento de prueba',
            descripcion: 'Descripción de prueba',
            opciones: [
                { texto: 'Opción 1', resultado_exito: { mensaje: 'Bien', recompensa: { exp: 10 } }, resultado_fallo: { mensaje: 'Mal' } }
            ]
        };
    },

    _verificarMateriales(misionId) {
        // Implementar según necesidad
        return true;
    }
};