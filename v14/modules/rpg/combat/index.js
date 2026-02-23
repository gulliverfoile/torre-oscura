// ============================================
// modules/rpg/combat/index.js - Sistema de combate
// ============================================

export const combatManager = {
  rpg: null,
  core: null,
  active: false,
  enemigos: [],
  turno: 'jugador',
  animating: false,
  animProgress: 0,
  animPhase: null,
  attacker: null,
  attackerStart: { x: 0, y: 0 },
  attackerTarget: { x: 0, y: 0 },
  defenderIndex: 0,
  _enemigoTimeout: null,
  _ataqueRealizado: false,

  init(rpg) {
    this.rpg = rpg;
    this.core = rpg.core;
    console.log('⚔️ CombatManager iniciado');
  },

  async iniciarCombate(ids) {
    console.log('⚔️ iniciarCombate', ids);
    this.enemigos = await Promise.all(ids.map(async id => {
      const base = this.rpg.data.enciclopedia.enemigos.find(e => e.id === id);
      if (!base) return null;
      const enemigo = {
        ...base,
        saludActual: base.salud,
        estados: {},
        img: null,
        x: this.rpg.config.arch.enemy.x,
        y: this.rpg.config.arch.enemy.y
      };
      try {
        enemigo.img = await this.core.assets.getAsset(`enemies/${id}.png`);
      } catch (e) {
        console.warn(`⚠️ No se pudo cargar sprite para ${id}`);
      }
      return enemigo;
    }));
    this.enemigos = this.enemigos.filter(e => e !== null);
    if (this.enemigos.length === 0) {
      this.core.log('No hay enemigos válidos.', 'error');
      return;
    }
    this.active = true;
    this.turno = 'jugador';
    this.animating = false;
    this.core.log(`⚔️ ¡Combate contra ${this.enemigos.map(e => e.nombre).join(', ')}!`, 'combate');
    this.core.emit('combat:started', this.enemigos);
  },

  update(delta, input) {
    if (!this.active) return;

    if (this.animating) {
      this.animProgress += this.rpg.config.arch.combat.attackSpeed;
      if (this.animProgress >= 1) {
        this.animProgress = 1;
        if (this.animPhase === 'going') {
          if (this.attacker === 'player') {
            this._aplicarDanioJugador();
            this.attackerStart = { x: this.attackerTarget.x, y: this.attackerTarget.y };
            this.attackerTarget = { x: this.rpg.config.arch.player.x, y: this.rpg.config.arch.player.y };
          } else {
            this._aplicarDanioEnemigo();
            this.attackerStart = { x: this.attackerTarget.x, y: this.attackerTarget.y };
            this.attackerTarget = { x: this.enemigos[0].x, y: this.enemigos[0].y };
          }
          this.animPhase = 'returning';
          this.animProgress = 0;
        } else if (this.animPhase === 'returning') {
          this.animating = false;
          this.animPhase = null;
        }
      }
      return;
    }

    if (this.turno === 'jugador') {
      if (input.isDown('j') && !this._ataqueRealizado) {
        console.log('⚔️ Atacando con J');
        this._iniciarAtaqueJugador();
        this._ataqueRealizado = true;
        setTimeout(() => { this._ataqueRealizado = false; }, 300);
      }
    } else if (this.turno === 'enemigo') {
      if (!this._enemigoTimeout) {
        this._enemigoTimeout = setTimeout(() => {
          console.log('🤖 Turno enemigo');
          this._iniciarAtaqueEnemigo();
          this._enemigoTimeout = null;
        }, 1000);
      }
    }
  },

  _iniciarAtaqueJugador() {
    if (this.enemigos.length === 0) {
      this.active = false;
      return;
    }
    this.attacker = 'player';
    this.animPhase = 'going';
    this.animProgress = 0;
    this.animating = true;
    this.attackerStart = { x: this.rpg.config.arch.player.x, y: this.rpg.config.arch.player.y };
    this.attackerTarget = {
      x: this.enemigos[0].x - this.rpg.config.arch.combat.attackDistance,
      y: this.enemigos[0].y
    };
    this.defenderIndex = 0;
  },

  _aplicarDanioJugador() {
    if (this.enemigos.length === 0) return;
    const enemigo = this.enemigos[0];
    const dmg = this._calcularDanio(this.rpg.character.player, enemigo, true);
    enemigo.saludActual -= dmg;
    this.core.log(`💥 Atacas a ${enemigo.nombre} por ${dmg} daño.`, 'positivo');
    this.core.emit('combat:damage', {
      cantidad: dmg,
      tipo: 'daño',
      x: enemigo.x,
      y: enemigo.y,
      esCritico: false
    });
    if (enemigo.saludActual <= 0) {
      this.core.log(`💀 ${enemigo.nombre} ha caído!`, 'positivo');
      this.core.emit('enemy:defeated', { enemigo, loot: this._generarLoot() });
      this.enemigos = this.enemigos.filter(e => e.saludActual > 0);
      if (this.enemigos.length === 0) {
        this.core.log('🏆 ¡Victoria!', 'positivo');
        this.active = false;
        this.core.emit('combat:ended', 'victory');
        this._ganarRecompensa();
        return;
      }
    }
    this.turno = 'enemigo';
  },

  _iniciarAtaqueEnemigo() {
    if (this.enemigos.length === 0) {
      this.active = false;
      return;
    }
    this.attacker = 'enemy';
    this.animPhase = 'going';
    this.animProgress = 0;
    this.animating = true;
    this.attackerStart = { x: this.enemigos[0].x, y: this.enemigos[0].y };
    this.attackerTarget = {
      x: this.rpg.config.arch.player.x + this.rpg.config.arch.combat.attackDistance,
      y: this.rpg.config.arch.player.y
    };
  },

  _aplicarDanioEnemigo() {
    const enemigo = this.enemigos[0];
    const dmg = this._calcularDanio(enemigo, this.rpg.character.player, false);
    this.rpg.character.player.hpCurrent -= dmg;
    this.core.log(`💥 ${enemigo.nombre} te ataca por ${dmg} daño.`, 'negativo');

    // Obtener posición del jugador para el daño flotante
    const playerPos = this.rpg.exploration?.getPlayerScreenPosition() || {
      x: this.rpg.config.arch.player.x,
      y: this.rpg.config.arch.player.y
    };

    this.core.emit('combat:damage', {
      cantidad: dmg,
      tipo: 'daño',
      x: playerPos.x,
      y: playerPos.y,
      esCritico: false
    });

    this.core.emit('player:updated', this.rpg.character.player);

    if (this.rpg.character.player.hpCurrent <= 0) {
      this.core.log('💀 Has muerto...', 'gameover');
      this.active = false;
      this.core.emit('combat:ended', 'defeat');
      this.core.emit('player:dead', {
        piso: this.rpg.exploration?.pisoActual + 1 || 0,
        enemigos: this.core.stats_partida?.enemigos_derrotados || 0,
        salas: this.core.stats_partida?.salas_exploradas || 0
      });
    } else {
      this.turno = 'jugador';
    }
  },

  _calcularDanio(atacante, defensor, esJugador) {
    if (!this.rpg.config.arch.combat.useDice) {
      return esJugador ? 15 : (atacante.ataque || 5);
    }
    const stats = esJugador ? this.rpg.character.getEffectiveStats() : atacante;
    const ataque = esJugador ? stats.F : atacante.ataque;
    const defensa = esJugador ? defensor.defensa : (this.rpg.character.getEffectiveStats().defensa || 0);
    let dmg = Math.max(1, ataque - defensa);
    dmg += Math.floor(Math.random() * 10) - 4;
    return Math.max(1, dmg);
  },

  _generarLoot() {
    // Loot básico de ejemplo
    const loot = [];
    if (Math.random() < 0.5) {
      loot.push({ id: 'pocion_vida', nombre: 'Poción de vida', cantidad: 1 });
    }
    return loot;
  },

  _ganarRecompensa() {
    const loot = this._generarLoot();
    loot.forEach(item => this.rpg.inventory.anyadirItem(item.id, item.cantidad, item));
  },

  draw(ctx) {
    if (!this.active) return;
    const pSize = this.rpg.config.arch.player.size;
    const eSize = this.rpg.config.arch.enemy.size;

    let px = this.rpg.config.arch.player.x;
    let py = this.rpg.config.arch.player.y;
    if (this.animating && this.attacker === 'player') {
      px = this.attackerStart.x + (this.attackerTarget.x - this.attackerStart.x) * this.animProgress;
      py = this.attackerStart.y + (this.attackerTarget.y - this.attackerStart.y) * this.animProgress;
    }
    if (this.rpg.character.player.sprite) {
      ctx.drawImage(this.rpg.character.player.sprite, px, py, pSize, pSize);
    } else {
      ctx.fillStyle = '#00f';
      ctx.fillRect(px, py, pSize, pSize);
    }

    this.enemigos.forEach((enemigo, i) => {
      let ex = enemigo.x;
      let ey = enemigo.y;
      if (this.animating && this.attacker === 'enemy' && i === 0) {
        ex = this.attackerStart.x + (this.attackerTarget.x - this.attackerStart.x) * this.animProgress;
        ey = this.attackerStart.y + (this.attackerTarget.y - this.attackerStart.y) * this.animProgress;
      }
      if (enemigo.img) {
        ctx.drawImage(enemigo.img, ex, ey, eSize, eSize);
      } else {
        ctx.fillStyle = '#f00';
        ctx.fillRect(ex, ey, eSize, eSize);
      }
      const vidaPct = enemigo.saludActual / enemigo.salud;
      ctx.fillStyle = '#333';
      ctx.fillRect(ex, ey - 15, eSize, 5);
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(ex, ey - 15, eSize * vidaPct, 5);
    });
  }
};