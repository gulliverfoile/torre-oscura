// ============================================
// sanityVisual.js - Efectos visuales de cordura
// ============================================

export class SanityVisual {
    constructor(core) {
        this.core = core;
        this.container = document.getElementById('game-container');
        this.logArea = document.getElementById('log-area');
        this.vignette = document.querySelector('.sanity-vignette');
        this.init();
    }

    init() {
        this.core.on('sanityChanged', (ratio) => this.applyEffects(ratio));
    }

    applyEffects(ratio) {
        if (!this.container) return;

        // Limpiar clases anteriores
        this.container.classList.remove('flicker-active', 'chromatic-aberration', 'glitch-active', 'madness-red', 'madness-void');
        if (this.logArea) this.logArea.classList.remove('glitch-text');
        if (this.vignette) this.vignette.classList.remove('active');
        this.container.style.filter = '';

        if (ratio > 0.85) return; // Todo bien

        const intensity = 1 - ratio;

        if (ratio <= 0.85) {
            if (this.vignette) {
                this.vignette.classList.add('active');
                this.vignette.style.opacity = intensity * 0.8;
            }
            this.container.style.filter = `grayscale(${intensity * 0.3}) sepia(${intensity * 0.2})`;
        }

        if (ratio < 0.6) {
            this.container.classList.add('chromatic-aberration');
            // Alternar según el piso (esto debería venir del módulo RPG)
            const piso = this.core.currentModuleObj?.exploration?.pisoActual || 0;
            if (piso % 2 === 0) this.container.classList.add('madness-red');
            else this.container.classList.add('madness-void');
        }

        if (ratio < 0.4) {
            this.container.style.filter += ` blur(${intensity * 0.8}px) contrast(${1 + intensity * 0.5})`;
            this.container.classList.add('flicker-active');
            if (this.logArea) this.logArea.classList.add('glitch-text');
        }

        if (ratio < 0.2) {
            this.container.classList.add('glitch-active');
            this.container.style.filter += ` hue-rotate(${Math.sin(Date.now() / 500) * 30}deg)`;
            if (Math.random() < 0.05) this.core.emit('screenShake');
        }
    }
}