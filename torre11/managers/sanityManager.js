// ============================================
// sanityManager.js - Lógica de cordura
// ============================================

export class SanityManager {
    constructor(core) {
        this.core = core;
        this.sanity = 100;
        this.maxSanity = 100;
        this.decayRate = 1;
    }

    tickExploration() {
        this.modifySanity(-this.decayRate);
    }

    modifySanity(amount) {
        const old = this.sanity;
        this.sanity = Math.max(0, Math.min(this.maxSanity, this.sanity + amount));
        if (this.sanity !== old) {
            this.core.emit('sanityChanged', this.sanity / this.maxSanity);
        }
        if (this.sanity <= 0) {
            this.core.emit('gameOver', 'cordura');
        }
    }

    getLootBonus() {
        return (1 - (this.sanity / this.maxSanity)) * 0.5;
    }
}