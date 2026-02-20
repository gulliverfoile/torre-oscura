// managers/audiomanager.js
import * as Tone from 'tone';

export class AudioManager {
    constructor(core) {
        this.core = core;
        this.initialized = false;
        this.masterVolume = new Tone.Volume(-6).toDestination();
        this.synth = new Tone.PolySynth(Tone.Synth).connect(this.masterVolume);
        
        // Desbloquear audio con interacción del usuario
        const unlock = () => {
            if (Tone.context.state !== 'running') {
                Tone.start();
                this.initialized = true;
            }
            document.removeEventListener('click', unlock);
        };
        document.addEventListener('click', unlock);
    }

    playSound(note = 'C4', duration = '8n') {
        this.synth.triggerAttackRelease(note, duration);
    }

    playHit() {
        const hit = new Tone.MembraneSynth().connect(this.masterVolume);
        hit.triggerAttackRelease('C2', '32n');
    }

    playSlash() {
        const noise = new Tone.NoiseSynth().connect(this.masterVolume);
        noise.triggerAttackRelease('32n');
    }

    playCoin() {
        const synth = new Tone.Synth().connect(this.masterVolume);
        synth.triggerAttackRelease('E6', '64n');
        synth.triggerAttackRelease('G6', '64n', '+0.05');
    }

    startMusic(mode = 'exploration') {
        // Ejemplo de música simple con bucle
        const loop = new Tone.Loop((time) => {
            this.synth.triggerAttackRelease('C3', '2n', time);
        }, '4n').start(0);
        Tone.Transport.start();
    }

    stopMusic() {
        Tone.Transport.stop();
        Tone.Transport.cancel();
    }
}