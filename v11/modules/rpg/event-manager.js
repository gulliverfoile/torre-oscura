// ============================================
// modules/rpg/event-manager.js - Eventos narrativos
// ============================================

export const eventManager = {
    rpg: null,
    core: null,
    eventoActual: null,

    init(rpg) {
        this.rpg = rpg;
        this.core = rpg.core;
        console.log('📖 EventManager iniciado');
        this.core.on('room:entered', (room) => this.onRoomEntered(room));
    },

    onRoomEntered(room) {
        if (room.tipo === 'evento') {
            console.log('📌 Sala de evento detectada:', room.evento_id);
            this.iniciarEvento(room);
        }
    },

    iniciarEvento(room) {
        // Aquí se cargaría el evento desde datos (YAML o hardcodeado)
        // Por simplicidad, creamos un evento genérico
        const evento = {
            id: room.evento_id || 'evento_generico',
            nombre: room.nombre || 'Evento misterioso',
            descripcion: room.descripcion || 'Algo ocurre...',
            opciones: room.opciones || [
                { texto: 'Aceptar', resultado: { mensaje: 'Has aceptado.' } },
                { texto: 'Rechazar', resultado: { mensaje: 'Has rechazado.' } }
            ]
        };

        this.eventoActual = evento;
        this.core.log(`✨ <b>EVENTO: ${evento.nombre}</b>`, 'narrativa');
        this.core.log(evento.descripcion, 'narrativa');
        this._mostrarOpciones(evento);
    },

    _mostrarOpciones(evento) {
        // Usar el DialogManager para mostrar opciones
        const opciones = evento.opciones.map((opt, idx) => ({
            texto: opt.texto,
            valor: idx
        }));
        // Asumiendo que el módulo UI tiene un componente dialog
        if (this.core.ui && this.core.ui.components.dialogModal) {
            this.core.ui.components.dialogModal.mostrarOpciones({
                titulo: evento.nombre,
                mensaje: evento.descripcion,
                opciones: opciones
            }, (seleccion) => {
                this._resolverOpcion(evento, seleccion);
            });
        } else {
            console.warn('⚠️ DialogModal no disponible');
        }
    },

    _resolverOpcion(evento, idx) {
        const opt = evento.opciones[idx];
        this.core.log(`> ${opt.texto}`, 'sistema');
        if (opt.resultado.mensaje) {
            this.core.log(opt.resultado.mensaje, 'narrativa');
        }
        if (opt.resultado.recompensa) {
            this._aplicarRecompensa(opt.resultado.recompensa);
        }
        this.eventoActual = null;
    },

    _aplicarRecompensa(r) {
        if (r.cordura) {
            this.rpg.character.player.sanity = Math.min(this.rpg.character.player.sanityMax, this.rpg.character.player.sanity + r.cordura);
            console.log(`🧠 Cordura: ${r.cordura > 0 ? '+' : ''}${r.cordura}`);
        }
        if (r.item) {
            this.rpg.inventory.anyadirItem(r.item, 1);
        }
        if (r.exp) {
            this.rpg.character.addExp(r.exp);
        }
        if (r.danio) {
            this.rpg.character.player.hpCurrent -= r.danio;
            console.log(`💥 Daño recibido: ${r.danio}`);
            if (this.rpg.character.player.hpCurrent <= 0) {
                this.core.log('💀 Has muerto...', 'gameover');
                // Manejar game over
            }
        }
        this.core.emit('player:updated', this.rpg.character.player);
    }
};