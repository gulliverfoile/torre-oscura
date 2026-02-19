// ============================================
// renderers/sprites/index.js - Renderizado con sprites PNG
// ============================================

export const spritesRenderer = {
    core: null,
    enabled: true,

    init(core) {
        this.core = core;
        console.log('🖼️ Renderer sprites iniciado');
    },

    draw(ctx) {
        const module = this.core.currentModuleObj;
        if (!module) return;

        // Menú de inicio
        if (module === this.core.modules['menu-inicio']) {
            this._drawMenu(ctx);
        }
        // Módulo RPG
        else if (module === this.core.modules['rpg']) {
            // Fondo negro
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            // Exploración (minimapa y texto)
            if (module.exploration) {
                module.exploration.draw(ctx);
            }

            // Combate (si está activo)
            if (module.combat && module.combat.active) {
                module.combat.draw(ctx);
            } else {
                // Jugador en exploración
                if (module.character && module.character.player) {
                    const pos = module.exploration?.getPlayerScreenPosition() || { x: 300, y: 200 };
                    const size = module.config?.arch?.player?.size || 64;
                    const sprite = module.character.player.sprite;

                    if (sprite && sprite.complete) {
                        ctx.drawImage(sprite, pos.x, pos.y, size, size);
                    } else {
                        ctx.fillStyle = '#f0f';
                        ctx.fillRect(pos.x, pos.y, size, size);
                    }
                }
            }
        }
    },

    _drawMenu(ctx) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = '#0f0';
        ctx.font = '30px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('TORRE PROFUNDA', ctx.canvas.width / 2, 100);
        ctx.font = '16px monospace';
        ctx.fillText('Presiona cualquier tecla para continuar...', ctx.canvas.width / 2, 200);
    }
};