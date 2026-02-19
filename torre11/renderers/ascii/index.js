// ============================================
// renderers/ascii/index.js - Renderizado ASCII
// ============================================

import { Asciify } from '@sister.software/asciify';

export const asciiRenderer = {
    core: null,
    enabled: false,
    asciifier: null,
    themes: {
        classic: { chars: ' .:-=+*#%@', fg: '#0f0', bg: '#000' },
        retro: { chars: '█▓▒░ ', fg: '#ff0', bg: '#000' },
        matrix: { chars: '01', fg: '#0f0', bg: '#000' },
        fire: { chars: ' .:;+=xX$&', fg: '#ff4500', bg: '#000' }
    },
    currentTheme: 'classic',

    init(core) {
        this.core = core;
        console.log('📟 Renderer ASCII iniciado');
        try {
            this.asciifier = new Asciify(core.canvas, {
                characterSet: this.themes.classic.chars,
                foregroundColor: this.themes.classic.fg,
                backgroundColor: this.themes.classic.bg,
                cellWidth: 12,
                cellHeight: 18
            });
            console.log('✅ Asciify listo');
        } catch (e) {
            console.error('❌ Error al inicializar Asciify', e);
        }
    },

    toggle() {
        this.enabled = !this.enabled;
        this.core.log(`Modo ASCII: ${this.enabled ? 'ON' : 'OFF'}`, 'info');
        console.log(`📟 Modo ASCII ${this.enabled ? 'activado' : 'desactivado'}`);
    },

    setTheme(themeName) {
        if (!this.themes[themeName]) return;
        this.currentTheme = themeName;
        const theme = this.themes[themeName];
        if (this.asciifier) {
            this.asciifier.setCharacterSet(theme.chars);
            this.asciifier.setForegroundColor(theme.fg);
            this.asciifier.setBackgroundColor(theme.bg);
            console.log(`📟 Tema cambiado a: ${themeName}`);
        }
    },

    draw(ctx) {
        if (!this.enabled || !this.asciifier) return;
        // Asciify transforma el canvas automáticamente, solo añadimos una marca
        ctx.fillStyle = '#0f0';
        ctx.font = '10px monospace';
        ctx.fillText('ASCII MODE', 10, 10);
    }
};