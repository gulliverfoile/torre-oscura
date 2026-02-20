// ============================================
// modules/asciiMode.js - Modo ASCII para el juego
// ============================================
import { Asciify } from '@sister.software/asciify';

export const asciiModule = {
    core: null,
    enabled: false,
    asciifier: null,
    canvas: null,
    themes: {
        classic: { chars: ' .:-=+*#%@', fg: '#0f0', bg: '#000', size: 12 },
        retro: { chars: '█▓▒░ ', fg: '#ff0', bg: '#000', size: 14 },
        matrix: { chars: '01', fg: '#0f0', bg: '#000', size: 10 },
        fire:   { chars: ' .:;+=xX$&', fg: '#ff4500', bg: '#000', size: 12 } // Nuevo tema
    },
    currentTheme: 'classic',

    init(core) {
        this.core = core;
        this.canvas = core.canvas;
        console.log('📟 Módulo ASCII iniciado');
        try {
            this.asciifier = new Asciify(this.canvas);
            this._applyTheme(this.currentTheme);
        } catch (e) {
            console.error('Error al inicializar Asciify:', e);
        }
    },

    toggle() {
        this.enabled = !this.enabled;
        this.core.log(`Modo ASCII: ${this.enabled ? 'ON' : 'OFF'}`, 'info');
    },

    apply() {
        if (this.enabled && this.asciifier) {
            const gl = this.canvas.getContext('webgl');
            if (gl) {
                this.asciifier.rasterizeWebGLRenderer(gl, gl);
            }
        }
    },

    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            this._applyTheme(themeName);
        }
    },

    _applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (this.asciifier) {
            this.asciifier.setCharacterSet(theme.chars);
            this.asciifier.setForegroundColor(theme.fg);
            this.asciifier.setBackgroundColor(theme.bg);
            // Opcional: ajustar tamaño (si la librería lo permite)
            // this.asciifier.setFontSize?.(theme.size);
        }
    }
};