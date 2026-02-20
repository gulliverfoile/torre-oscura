// ============================================
// renderers/ascii/index.js - Renderizado ASCII con modo locura (Matrix)
// ============================================

import { Asciify } from '@sister.software/asciify';

export const asciiRenderer = {
    core: null,
    enabled: false,
    asciifier: null,
    themes: {}, // Se llenará desde YAML o por defecto
    currentTheme: 'classic',

    // Modo locura (efecto Matrix)
    modoLocura: {
        activo: false,
        intensidad: 0, // 0-1
        columnas: [],
        ultimaActualizacion: 0,
        numColumnas: 40,
        velocidadBase: 3,
        maxCaracteresPorColumna: 25
    },

    async init(core) {
        this.core = core;
        console.log('📟 Renderer ASCII iniciado, cargando temas...');
        try {
            const temasData = await core.data.load('temas');
            if (temasData && temasData.temas) {
                this.themes = temasData.temas;
                console.log('✅ Temas cargados:', Object.keys(this.themes));
            } else {
                console.warn('⚠️ No se encontraron temas, usando fallback');
                this._cargarTemasPorDefecto();
            }
        } catch (e) {
            console.error('❌ Error cargando temas, usando fallback', e);
            this._cargarTemasPorDefecto();
        }

        this._aplicarTema(this.currentTheme);
        this._initModoLocura(); // Inicializar columnas
    },

    _cargarTemasPorDefecto() {
        this.themes = {
            classic: { chars: ' .:-=+*#%@', fg: '#0f0', bg: '#000' },
            retro: { chars: '█▓▒░ ', fg: '#ff0', bg: '#000' },
            matrix: { chars: '01', fg: '#0f0', bg: '#000' },
            fire: { chars: ' .:;+=xX$&', fg: '#ff4500', bg: '#000' }
        };
    },

    _aplicarTema(nombre) {
        const tema = this.themes[nombre];
        if (!tema) return;
        try {
            if (!this.asciifier) {
                this.asciifier = new Asciify(this.core.canvas, {
                    characterSet: tema.chars,
                    foregroundColor: tema.fg,
                    backgroundColor: tema.bg,
                    cellWidth: 12,
                    cellHeight: 18
                });
            } else {
                this.asciifier.setCharacterSet(tema.chars);
                this.asciifier.setForegroundColor(tema.fg);
                this.asciifier.setBackgroundColor(tema.bg);
            }
            console.log(`🎨 Tema aplicado: ${nombre}`);
        } catch (e) {
            console.error('❌ Error al aplicar tema', e);
        }
    },

    toggle() {
        this.enabled = !this.enabled;
        this.core.log(`Modo ASCII: ${this.enabled ? 'ON' : 'OFF'}`, 'info');
    },

    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            this._aplicarTema(themeName);
        }
    },

    // ================== MODO LOCURA (MATRIX) ==================
    _initModoLocura() {
        const canvas = this.core.canvas;
        this.modoLocura.columnas = [];
        for (let i = 0; i < this.modoLocura.numColumnas; i++) {
            this.modoLocura.columnas.push({
                x: (i / this.modoLocura.numColumnas) * canvas.width,
                caracteres: [],
                velocidad: this.modoLocura.velocidadBase + Math.random() * 5,
                ultimoCaracter: ''
            });
        }
        console.log('🌀 Modo locura inicializado con', this.modoLocura.numColumnas, 'columnas');
    },

    _actualizarModoLocura() {
        const ahora = Date.now();
        // Actualizar cada 50ms (~20 FPS) para no sobrecargar
        if (ahora - this.modoLocura.ultimaActualizacion > 50) {
            this.modoLocura.columnas.forEach(col => {
                // Añadir carácter nuevo arriba (con cierta probabilidad para que no sea demasiado denso)
                if (Math.random() < 0.3) {
                    const nuevoChar = String.fromCharCode(33 + Math.floor(Math.random() * 94)); // Caracteres imprimibles ! a ~
                    col.caracteres.unshift({
                        char: nuevoChar,
                        y: 0,
                        brillo: 1.0 // brillo inicial
                    });
                }

                // Mover todos hacia abajo
                col.caracteres.forEach(c => c.y += col.velocidad);

                // Eliminar los que se salgan de la pantalla
                col.caracteres = col.caracteres.filter(c => c.y < this.core.canvas.height + 20);

                // Limitar longitud máxima por columna
                if (col.caracteres.length > this.modoLocura.maxCaracteresPorColumna) {
                    col.caracteres.splice(this.modoLocura.maxCaracteresPorColumna);
                }
            });
            this.modoLocura.ultimaActualizacion = ahora;
        }
    },

    _dibujarModoLocura(ctx) {
        if (!this.modoLocura.activo || this.modoLocura.intensidad <= 0) return;

        ctx.save();
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.globalAlpha = this.modoLocura.intensidad;

        this.modoLocura.columnas.forEach(col => {
            col.caracteres.forEach((c, index) => {
                // Degradado: más brillante arriba (más reciente)
                const alpha = 1 - (index / col.caracteres.length) * 0.7;
                ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
                ctx.fillText(c.char, col.x, c.y);
            });
        });
        ctx.restore();
    },

    // Método para activar/desactivar el modo locura desde fuera
    setModoLocura(activo, intensidad) {
        this.modoLocura.activo = activo;
        if (intensidad !== undefined) {
            this.modoLocura.intensidad = Math.min(1, Math.max(0, intensidad));
        }
    },

    // ================== DIBUJADO PRINCIPAL ==================
    draw(ctx) {
        if (!this.enabled || !this.asciifier) return;

        // Primero, dibujar la escena normal (Asciify lo hace automáticamente)
        // No necesitamos hacer nada especial, Asciify ya transforma el canvas.

        // Luego, si el modo locura está activo, dibujar el efecto encima
        this._actualizarModoLocura();
        this._dibujarModoLocura(ctx);
    }
};