import { Asciify } from '@sister.software/asciify';

export const asciiRenderer = {
    core: null,
    enabled: false,
    asciifier: null,

    init(core) {
        this.core = core;
        try {
            this.asciifier = new Asciify(core.canvas, {
                characterSet: ' .:-=+*#%@',
                foregroundColor: '#0f0',
                backgroundColor: '#000',
                cellWidth: 12,
                cellHeight: 18
            });
            console.log('✅ Asciify iniciado');
        } catch (e) {
            console.error('❌ Error al inicializar Asciify', e);
        }
    },

    toggle() {
        this.enabled = !this.enabled;
        this.core.log(`Modo ASCII: ${this.enabled ? 'ON' : 'OFF'}`, 'info');
    },

    setTheme(theme) {
        // Aquí podrías cambiar opciones si quieres
        this.core.log(`Tema ${theme} no implementado aún`, 'info');
    },

    draw(ctx) {
        if (!this.enabled || !this.asciifier) return;
        // Asciify ya transforma el canvas automáticamente,
        // pero podemos añadir una marca.
        ctx.fillStyle = '#0f0';
        ctx.font = '10px monospace';
        ctx.fillText('ASCII MODE', 10, 10);
    }
};