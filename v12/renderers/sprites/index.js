// ============================================
// renderers/sprites/index.js - Renderizado con sprites
// ============================================

export const spritesRenderer = {
    core: null,
    enabled: true,
    fondoPorDefecto: null, // Imagen por defecto precargada

    init(core) {
        this.core = core;
        console.log('🖼️ Renderer sprites iniciado');
        // Precargar fondo por defecto (opcional, pero recomendado)
        this.core.assets.getAsset('backgrounds/default.png').then(img => {
            this.fondoPorDefecto = img;
        }).catch(() => {
            console.warn('⚠️ No se encontró fondo por defecto, se usará color negro');
        });
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
            // 1. DIBUJAR FONDO (sala actual o por defecto)
            this._drawBackground(ctx, module);

            // 2. Exploración (minimapa y texto)
            if (module.exploration) {
                module.exploration.draw(ctx);
            }

            // 3. Combate o jugador
            if (module.combat && module.combat.active) {
                module.combat.draw(ctx);
            } else if (module.character && module.character.player) {
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
    },

    _drawBackground(ctx, module) {
        // Intentar obtener el fondo de la sala actual
        let imagenFondo = null;
        if (module.exploration?.salaActual?.fondo) {
            imagenFondo = this.core.assets.cache.get(module.exploration.salaActual.fondo);
        }

        // Si no hay, usar el fondo por defecto
        if (!imagenFondo && this.fondoPorDefecto) {
            imagenFondo = this.fondoPorDefecto;
        }

        // Dibujar si tenemos imagen
        if (imagenFondo) {
            ctx.drawImage(imagenFondo, 0, 0, ctx.canvas.width, ctx.canvas.height);
        } else {
            // Fallback a color negro
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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