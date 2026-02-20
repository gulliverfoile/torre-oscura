// ============================================
// audio-manager.js - Gestión de audio (con Tone.js)
// ============================================

import * as Tone from 'tone';

export const audioManager = {
    core: null,
    initialized: false,
    masterVolume: null,
    synth: null,

    init(core) {
        this.core = core;
        // Desbloquear audio con interacción del usuario
        const unlock = () => {
            if (Tone.context.state !== 'running') {
                Tone.start();
                this.initialized = true;
                console.log('🔊 Audio activado');
            }
            document.removeEventListener('click', unlock);
            document.removeEventListener('keydown', unlock);
        };
        document.addEventListener('click', unlock);
        document.addEventListener('keydown', unlock);

        this.masterVolume = new Tone.Volume(-6).toDestination();
        this.synth = new Tone.PolySynth(Tone.Synth).connect(this.masterVolume);
    },

    playNote(note = 'C4', duration = '8n') {
        if (!this.initialized) return;
        this.synth.triggerAttackRelease(note, duration);
    },

    playHit() {
        if (!this.initialized) return;
        const hit = new Tone.MembraneSynth().connect(this.masterVolume);
        hit.triggerAttackRelease('C2', '32n');
    },

    playSlash() {
        if (!this.initialized) return;
        const noise = new Tone.NoiseSynth().connect(this.masterVolume);
        noise.triggerAttackRelease('16n');
    },

    playMagic() {
        if (!this.initialized) return;
        const synth = new Tone.Synth().connect(this.masterVolume);
        synth.triggerAttackRelease('E5', '8n');
    },

    playCoin() {
        if (!this.initialized) return;
        const synth = new Tone.Synth().connect(this.masterVolume);
        synth.triggerAttackRelease('C5', '16n');
    },

    playDiscovery() {
        if (!this.initialized) return;
        const synth = new Tone.Synth().connect(this.masterVolume);
        synth.triggerAttackRelease(['C5', 'E5', 'G5'], '4n');
    },

    playMusic(mode = 'explore') {
        // Aquí se podría implementar música de fondo con loops
        // Por simplicidad, no implementado
    },

    stopMusic() {
        // No implementado
    }
};