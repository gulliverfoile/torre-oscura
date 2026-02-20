// ============================================
// combatmanager.js - Combate con loot automático y dados opcionales
// ============================================
export class CombatManager {
    constructor(core, enciclopedia, lootManager, characterManager, inventoryManager, archConfig, reglas) {
        this.core = core;
        this.enciclopedia = enciclopedia;
        this.loot = lootManager;
        this.character = characterManager;
        this.inventory = inventoryManager;
        this.archConfig = archConfig;
        this.reglas = reglas;
        this.combateActivo = false;
        this.enemigos = [];
        this.turno = 'jugador';
        this._enemigoTimeout = null;
        this._ataqueRealizado = false;

        this.playerBaseX = archConfig.player.x;
        this.playerBaseY = archConfig.player.y;
        this.enemyBaseX = archConfig.enemy.x;
        this.enemyBaseY = archConfig.enemy.y;
        this.attackSpeed = archConfig.combat.attackSpeed;
        this.attackDistance = archConfig.combat.attackDistance;

        this.animating = false;
        this.animPhase = null;
        this.animProgress = 0;
        this.attacker = null;
        this.attackerStart = { x: 0, y: 0 };
        this.attackerTarget = { x: 0, y: 0 };
        this.defenderIndex = 0;
    }

    async iniciarCombate(ids) {
        console.log('⚔️ iniciarCombate llamado con ids:', ids);
        this.enemigos = await Promise.all(ids.map(async id => {
            const base = this.enciclopedia.enemigos.find(e => e.id === id);
            if (!base) return null;
            const enemigo = {
                ...base,
                saludActual: base.salud,
                estados: {},
                img: null,
                x: this.enemyBaseX,
                y: this.enemyBaseY
            };
            try {
                enemigo.img = await this.core.images.get(`enemies/${id}.png`);
            } catch (e) {
                console.warn(`No se pudo cargar sprite para ${id}, usando rectángulo`);
            }
            return enemigo;
        }));

        this.enemigos = this.enemigos.filter(e => e !== null);
        if (this.enemigos.length === 0) {
            this.core.log('No hay enemigos válidos.', 'error');
            return;
        }

        this.combateActivo = true;
        this.turno = 'jugador';
        this.animating = false;
        this.core.log(`⚔️ ¡Combate contra ${this.enemigos.map(e => e.nombre).join(', ')}!`, 'combate');
        this.core.emit('combat:started', this.enemigos);
    }

    tirarD20() {
        return Math.floor(Math.random() * 20) + 1;
    }

    calcularDanio(atacante, defensor, esCritico, isPlayer) {
        if (!this.archConfig.combat.useDice) {
            // Daño fijo
            return isPlayer ? 15 : (atacante.ataque || 5);
        }
        // Daño con dados (simplificado)
        const stats = isPlayer ? this.character.getEffectiveStats() : atacante;
        const ataque = isPlayer ? stats.F : atacante.ataque;
        const defensa = isPlayer ? defensor.defensa : (this.character.getEffectiveStats().defensa || 0);
        let dmg = Math.max(1, ataque - defensa);
        if (esCritico) dmg = Math.floor(dmg * 1.5);
        // Variabilidad con d10
        const variabilidad = Math.floor(Math.random() * 10) - 4; // -4 a +5
        dmg += variabilidad;
        return Math.max(1, dmg);
    }

    update(delta, input) {
        if (!this.combateActivo) return;

        if (this.animating) {
            this.animProgress += this.attackSpeed;
            if (this.animProgress >= 1) {
                this.animProgress = 1;
                if (this.animPhase === 'going') {
                    if (this.attacker === 'player') {
                        this.aplicarDanioJugador();
                        this.attackerStart = { x: this.attackerTarget.x, y: this.attackerTarget.y };
                        this.attackerTarget = { x: this.playerBaseX, y: this.playerBaseY };
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
                console.log('⚔️ Atacando con J');
                this.iniciarAtaqueJugador();
                this._ataqueRealizado = true;
                setTimeout(() => { this._ataqueRealizado = false; }, 300);
            }
        } else if (this.turno === 'enemigo') {
            if (!this._enemigoTimeout) {
                this._enemigoTimeout = setTimeout(() => {
                    this.iniciarAtaqueEnemigo();
                    this._enemigoTimeout = null;
                }, 1000);
            }
        }
    }

    iniciarAtaqueJugador() {
        if (this.enemigos.length === 0) {
            this.combateActivo = false;
            return;
        }
        this.attacker = 'player';
        this.animPhase = 'going';
        this.animProgress = 0;
        this.animating = true;
        this.attackerStart = { x: this.playerBaseX, y: this.playerBaseY };
        this.attackerTarget = { x: this.enemigos[0].x - this.attackDistance, y: this.enemigos[0].y };
        this.defenderIndex = 0;
    }

    aplicarDanioJugador() {
        if (this.enemigos.length === 0) return;
        const enemigo = this.enemigos[0];
        const esCritico = this.archConfig.combat.useDice ? (this.tirarD20() === 20) : false;
        const dmg = this.calcularDanio(this.character.player, enemigo, esCritico, true);
        enemigo.saludActual -= dmg;
        this.core.log(`💥 Atacas a ${enemigo.nombre} por ${dmg} daño.${esCritico ? ' ¡CRÍTICO!' : ''}`, 'positivo');

        if (enemigo.saludActual <= 0) {
            this.core.log(`💀 ¡${enemigo.nombre} ha caído!`, 'positivo');
            const loot = this.loot.generarLoot(1, false);
            if (loot.length > 0) {
                loot.forEach(item => {
                    this.inventory.anyadirItem(item.id, 1, item);
                    this.core.log(`✨ Obtienes: ${item.nombre}`, 'info');
                });
            }
            this.enemigos = this.enemigos.filter(e => e.saludActual > 0);
            if (this.enemigos.length === 0) {
                this.core.log('🏆 ¡Victoria!', 'positivo');
                this.combateActivo = false;
                this.core.emit('combat:ended', 'victory');
                this.core.emit('enemy:defeated', { exp: enemigo.exp || 20, loot });
                return;
            }
        }
        this.turno = 'enemigo';
    }

    iniciarAtaqueEnemigo() {
        if (this.enemigos.length === 0) {
            this.combateActivo = false;
            return;
        }
        this.attacker = 'enemy';
        this.animPhase = 'going';
        this.animProgress = 0;
        this.animating = true;
        this.attackerStart = { x: this.enemigos[0].x, y: this.enemigos[0].y };
        this.attackerTarget = { x: this.playerBaseX + this.attackDistance, y: this.playerBaseY };
    }

    aplicarDanioEnemigo() {
        const enemigo = this.enemigos[0];
        const dmg = this.calcularDanio(enemigo, this.character.player, false, false);
        const player = this.character.player;
        player.hpCurrent -= dmg;
        this.core.log(`💥 ${enemigo.nombre} te ataca por ${dmg} daño.`, 'negativo');
        this.core.emit('player:updated', player);

        if (player.hpCurrent <= 0) {
            this.core.log('💀 Has muerto...', 'gameover');
            this.combateActivo = false;
            this.core.emit('combat:ended', 'defeat');
        } else {
            this.turno = 'jugador';
        }
    }

    draw(ctx) {
        if (!this.combateActivo) return;

        const playerSize = this.archConfig.player.size;
        const enemySize = this.archConfig.enemy.size;

        let playerX = this.playerBaseX;
        let playerY = this.playerBaseY;
        if (this.animating && this.attacker === 'player') {
            playerX = this.attackerStart.x + (this.attackerTarget.x - this.attackerStart.x) * this.animProgress;
            playerY = this.attackerStart.y + (this.attackerTarget.y - this.attackerStart.y) * this.animProgress;
        }

        const playerSprite = this.character?.player?.sprite;
        if (playerSprite && playerSprite instanceof HTMLImageElement && playerSprite.complete && playerSprite.naturalWidth > 0) {
            try {
                ctx.drawImage(playerSprite, playerX, playerY, playerSize, playerSize);
            } catch (e) {
                ctx.fillStyle = '#00f';
                ctx.fillRect(playerX, playerY, playerSize, playerSize);
            }
        } else {
            ctx.fillStyle = '#00f';
            ctx.fillRect(playerX, playerY, playerSize, playerSize);
        }

        for (let i = 0; i < this.enemigos.length; i++) {
            const enemigo = this.enemigos[i];
            let x = enemigo.x;
            let y = enemigo.y;
            if (this.animating && this.attacker === 'enemy' && i === 0) {
                x = this.attackerStart.x + (this.attackerTarget.x - this.attackerStart.x) * this.animProgress;
                y = this.attackerStart.y + (this.attackerTarget.y - this.attackerStart.y) * this.animProgress;
            }

            if (enemigo.img && enemigo.img instanceof HTMLImageElement) {
                try {
                    ctx.drawImage(enemigo.img, x, y, enemySize, enemySize);
                } catch (e) {
                    ctx.fillStyle = '#ff0000';
                    ctx.fillRect(x, y, enemySize, enemySize);
                }
            } else {
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(x, y, enemySize, enemySize);
            }

            const vidaPct = enemigo.saludActual / enemigo.salud;
            ctx.fillStyle = '#333';
            ctx.fillRect(x, y - 15, enemySize, 5);
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(x, y - 15, enemySize * vidaPct, 5);
            ctx.fillStyle = '#fff';
            ctx.font = '10px monospace';
            ctx.fillText(enemigo.nombre, x, y - 20);
            ctx.fillText(`${Math.floor(enemigo.saludActual)}/${enemigo.salud}`, x, y - 5);
        }
    }
}