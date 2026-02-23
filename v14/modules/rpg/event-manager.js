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
      this.iniciarEvento(room);
    }
  },

  iniciarEvento(room) {
    // Aquí se cargaría el evento desde datos (por ahora simulamos)
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
    if (this.core.ui && this.core.ui.components.dialogModal) {
      this.core.ui.components.dialogModal.show({
        titulo: evento.nombre,
        mensaje: evento.descripcion,
        opciones: evento.opciones.map((opt, idx) => ({ texto: opt.texto, valor: idx }))
      }, (seleccion) => {
        this._resolverOpcion(evento, seleccion);
      });
    } else {
      console.warn('DialogModal no disponible');
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
    const player = this.rpg.character.player;
    if (r.cordura) {
      player.sanity = Math.min(player.sanityMax, player.sanity + r.cordura);
      this.core.log(`🧠 Cordura: ${r.cordura > 0 ? '+' : ''}${r.cordura}`, r.cordura > 0 ? 'positivo' : 'negativo');
    }
    if (r.item) {
      this.rpg.inventory.anyadirItem(r.item, 1);
    }
    if (r.exp) {
      this.rpg.character.addExp(r.exp);
    }
    if (r.danio) {
      player.hpCurrent -= r.danio;
      this.core.log(`💥 Recibes ${r.danio} de daño.`, 'negativo');
      if (player.hpCurrent <= 0) {
        this.core.log('💀 Has muerto...', 'gameover');
      }
    }
    this.core.emit('player:updated', player);
  }
};