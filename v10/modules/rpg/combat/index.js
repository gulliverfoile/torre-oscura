// ============================================
// modules/rpg/combat/index.js - Gestión de combate
// ============================================

export const combatManager = {
    parent: null,
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
    _enemigoTimeout: null,
    _ataqueRealizado: false,

    init(parent) {
        this.parent = parent;
        this.core = parent.core;
    },

    async iniciarCombate(ids) {
        this.enemigos = await Promise.all(ids.map(async id => {
            const base = this.parent.data.enciclopedia.enemigos.find(e => e.id === id);
            if (!base) return null;
            const enemigo = {
                ...base,
                saludActual: base.salud,
                estados: {},
                img: null,
                x: this.parent.config.arch.enemy.x,
                y: this.parent.config.arch.enemy.y
            };
            try {
                enemigo.img = await this.core.assets.getAsset(`enemies/${id}.png`);
            } catch (e) {
                console.warn(`No se pudo cargar sprite para ${id}`);
            }
            return enemigo;
        }));
        this.enemigos = this.enemigos.filter(e => e !== null);
        if (this.enemigos.length === 0) return;

        this.active = true;
        this.turno = 'jugador';
        this.core.log(`⚔️ Combate contra ${this.enemigos.map(e => e.nombre).join(', ')}`, 'combate');
        this.core.emit('combat:started', this.enemigos);
    },

    update(delta, input) {
        if (!this.active) return;

        if (this.animating) {
            this.animProgress += this.parent.config.arch.combat.attackSpeed;
            if (this.animProgress >= 1) {
                this.animProgress = 1;
                if (this.animPhase === 'going') {
                    if (this.attacker === 'player') {
                        this.aplicarDanioJugador();
                        this.attackerStart = { x: this.attackerTarget.x, y: this.attackerTarget.y };
                        this.attackerTarget = { x: this.parent.config.arch.player.x, y: this.parent.config.arch.player.y };
                    } else {
                        this.aplicarDanioEnemigo();
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
                this.iniciarAtaqueJugador();
                this._ataqueRealizado = true;
                setTimeout(() => this._ataqueRealizado = false, 300);
            }
        } else if (this.turno === 'enemigo') {
            if (!this._enemigoTimeout) {
                this._enemigoTimeout = setTimeout(() => {
                    this.iniciarAtaqueEnemigo();
                    this._enemigoTimeout = null;
                }, 1000);
            }
        }
    },

    iniciarAtaqueJugador() {
        if (this.enemigos.length === 0) {
            this.active = false;
            return;
        }
        this.attacker = 'player';
        this.animPhase = 'going';
        this.animProgress = 0;
        this.animating = true;
        this.attackerStart = { x: this.parent.config.arch.player.x, y: this.parent.config.arch.player.y };
        this.attackerTarget = { x: this.enemigos[0].x - this.parent.config.arch.combat.attackDistance, y: this.enemigos[0].y };
    },

    aplicarDanioJugador() {
        if (this.enemigos.length === 0) return;
        const enemigo = this.enemigos[0];
        const dmg = this.parent.config.arch.combat.useDice
            ? this.calcularDanio(this.parent.player, enemigo, false, true)
            : 15;
        enemigo.saludActual -= dmg;
        this.core.log(`💥 Atacas a ${enemigo.nombre} por ${dmg} daño.`, 'positivo');

        if (enemigo.saludActual <= 0) {
            this.core.log(`💀 ¡${enemigo.nombre} ha caído!`, 'positivo');
            // Generar loot (simplificado)
            const loot = []; // this.parent.loot.generarLoot(1, false);
            if (loot.length > 0) {
                loot.forEach(item => this.parent.inventory.anyadirItem(item.id, 1, item));
            }
            this.enemigos = this.enemigos.filter(e => e.saludActual > 0);
            if (this.enemigos.length === 0) {
                this.core.log('🏆 Victoria!', 'positivo');
                this.active = false;
                this.core.emit('combat:ended', 'victory');
                this.core.emit('enemy:defeated', { exp: enemigo.exp || 20, loot });
                return;
            }
        }
        this.turno = 'enemigo';
    },

    iniciarAtaqueEnemigo() {
        if (this.enemigos.length === 0) {
            this.active = false;
            return;
        }
        this.attacker = 'enemy';
        this.animPhase = 'going';
        this.animProgress = 0;
        this.animating = true;
        this.attackerStart = { x: this.enemigos[0].x, y: this.enemigos[0].y };
        this.attackerTarget = { x: this.parent.config.arch.player.x + this.parent.config.arch.combat.attackDistance, y: this.parent.config.arch.player.y };
    },

    aplicarDanioEnemigo() {
        const enemigo = this.enemigos[0];
        const dmg = enemigo.ataque || 5;
        this.parent.player.hpCurrent -= dmg;
        this.core.log(`💥 ${enemigo.nombre} te ataca por ${dmg} daño.`, 'negativo');
        this.core.emit('player:updated', this.parent.player);

        if (this.parent.player.hpCurrent <= 0) {
            this.core.log('💀 Has muerto...', 'gameover');
            this.active = false;
            this.core.emit('combat:ended', 'defeat');
        } else {
            this.turno = 'jugador';
        }
    },

    calcularDanio(atacante, defensor, esCritico, isPlayer) {
        // Implementación básica (se puede mejorar con dados y reglas)
        const atk = isPlayer ? (atacante.stats?.F || 10) : atacante.ataque;
        const def = defensor.defensa || 0;
        let dmg = Math.max(1, atk - def);
        if (esCritico) dmg = Math.floor(dmg * 1.5);
        return dmg;
    },

    draw(ctx) {
        if (!this.active) return;

        const playerSize = this.parent.config.arch.player.size;
        const enemySize = this.parent.config.arch.enemy.size;

        // Dibujar jugador
        let playerX = this.parent.config.arch.player.x;
        let playerY = this.parent.config.arch.player.y;
        if (this.animating && this.attacker === 'player') {
            playerX = this.attackerStart.x + (this.attackerTarget.x - this.attackerStart.x) * this.animProgress;
            playerY = this.attackerStart.y + (this.attackerTarget.y - this.attackerStart.y) * this.animProgress;
        }

        if (this.parent.player.sprite) {
            ctx.drawImage(this.parent.player.sprite, playerX, playerY, playerSize, playerSize);
        } else {
            ctx.fillStyle = '#00f';
            ctx.fillRect(playerX, playerY, playerSize, playerSize);
        }

        // Dibujar enemigos
        this.enemigos.forEach((enemigo, i) => {
            let x = enemigo.x;
            let y = enemigo.y;
            if (this.animating && this.attacker === 'enemy' && i === 0) {
                x = this.attackerStart.x + (this.attackerTarget.x - this.attackerStart.x) * this.animProgress;
                y = this.attackerStart.y + (this.attackerTarget.y - this.attackerStart.y) * this.animProgress;
            }
            if (enemigo.img) {
                ctx.drawImage(enemigo.img, x, y, enemySize, enemySize);
            } else {
                ctx.fillStyle = '#f00';
                ctx.fillRect(x, y, enemySize, enemySize);
            }

            // Barra de vida
            const pct = enemigo.saludActual / enemigo.salud;
            ctx.fillStyle = '#333';
            ctx.fillRect(x, y - 15, enemySize, 5);
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(x, y - 15, enemySize * pct, 5);
        });
    }
};