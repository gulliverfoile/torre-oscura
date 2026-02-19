// ============================================
// core.js - Núcleo universal del motor
// Versión: 3.1 (con soporte para js-yaml global)
// ============================================

import { controlsModule } from './modules/controls.js';
import { ImageManager } from './managers/imageManager.js';
import { AudioManager } from './managers/audiomanager.js';

export class GameCore {
    constructor(canvasId, uiPanelId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas?.getContext('2d');
        if (!this.ctx) console.error('Canvas no encontrado o sin contexto 2D');

        this.uiPanel = document.getElementById(uiPanelId);
        this.logArea = document.getElementById('log-area');

        // --- Servicios básicos ---
        this.dataManager = {
            cache: {},
            async load(name) {
                if (this.cache[name]) return this.cache[name];
                const url = `./data/${name}.yaml`;
                try {
                    const res = await fetch(url);
                    if (!res.ok) throw new Error('No encontrado');
                    const text = await res.text();
                    // Verificar que js-yaml esté disponible
                    if (!window.jsyaml) {
                        throw new Error('js-yaml no está cargado. Añade el script en index.html');
                    }
                    const data = window.jsyaml.load(text);
                    this.cache[name] = data;
                    console.log(`✅ ${name}.yaml cargado`);
                    return data;
                } catch (e) {
                    console.error(`Error cargando ${name}:`, e);
                    return null;
                }
            }
        };

        this.assets = new AssetLoader(this);
        this.images = new ImageManager(this);
        this.audio = new AudioManager(this);

        this.controls = controlsModule;
        this.controls.init(this);

        // Estadísticas de la partida
        this.stats_partida = {
            enemigos_derrotados: 0,
            salas_exploradas: 0,
            habilidades_halladas: 0
        };

        // --- Bus de eventos ---
        this.events = {};

        // --- Gestión de módulos ---
        this.modules = {};
        this.currentModule = null;
        this.currentModuleObj = null;
        this.nextModule = null;
        this.moduleParams = {};

        // --- Elementos UI (referencias) ---
        this.hpSpan = document.getElementById('pers-hp-val');
        this.mpSpan = document.getElementById('pers-mp-val');
        this.sanitySpan = document.getElementById('pers-san-val');
        this.locationSpan = document.getElementById('location');
        this.hpBar = document.getElementById('pers-hp-fill');
        this.mpBar = document.getElementById('pers-mp-fill');
        this.sanityBar = document.getElementById('pers-san-fill');
        this.expBar = document.getElementById('pers-exp-fill');
        this.expSpan = document.getElementById('pers-exp-val');
        this.esenciaSpan = document.getElementById('pers-esencia-val');

        this.running = false;
        this.lastTimestamp = 0;

        this.init();
    }

    init() {
        this.running = true;
        requestAnimationFrame((t) => this.loop(t));
    }

    // --- Módulos ---
    registerModule(name, moduleObj) {
        this.modules[name] = moduleObj;
        if (moduleObj.init) moduleObj.init(this);
    }

    switchModule(name, params = {}) {
        if (!this.modules[name]) {
            console.error(`Módulo '${name}' no registrado`);
            return;
        }
        if (this.currentModule) {
            const oldModule = this.modules[this.currentModule];
            if (oldModule.onExit) oldModule.onExit();
        }
        this.nextModule = name;
        this.moduleParams = params;
    }

    // --- Bucle principal ---
    loop(timestamp) {
        if (!this.running) return;
        const delta = Math.min(100, timestamp - this.lastTimestamp);
        this.lastTimestamp = timestamp;

        if (this.nextModule) {
            this.currentModule = this.nextModule;
            this.currentModuleObj = this.modules[this.currentModule];
            if (this.currentModuleObj.onEnter) {
                this.currentModuleObj.onEnter(this.moduleParams);
            }
            this.nextModule = null;
            this.moduleParams = {};
        }

        this.controls.update();

        if (this.currentModuleObj && this.currentModuleObj.update) {
            this.currentModuleObj.update(delta, this.controls);
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.currentModuleObj && this.currentModuleObj.draw) {
            this.currentModuleObj.draw(this.ctx);
        }

        requestAnimationFrame((t) => this.loop(t));
    }

    // --- Eventos ---
    on(event, callback) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(callback);
    }

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(cb => cb(data));
        }
    }

    // --- Log ---
    log(msg, type = 'info') {
        if (!this.logArea) return;
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.innerHTML = `<div class="log-content">${msg}</div>`;
        this.logArea.appendChild(entry);
        this.logArea.scrollTop = this.logArea.scrollHeight;
        if (this.logArea.children.length > 100) {
            this.logArea.removeChild(this.logArea.firstChild);
        }
    }

    // --- Actualización de UI ---
    updateUI(player) {
        if (!player) return;
        const hpMax = this.getVidaMax?.() || player.hpMax;
        const mpMax = this.getManaMax?.() || player.mpMax;
        const sanMax = player.sanityMax || 100;
        const hpPct = (player.hpCurrent / hpMax) * 100;
        const mpPct = (player.mpCurrent / mpMax) * 100;
        const sanPct = (player.sanity / sanMax) * 100;
        const expPct = (player.exp / player.expParaSubir) * 100;

        if (this.hpSpan) this.hpSpan.textContent = `${Math.floor(player.hpCurrent)}/${hpMax}`;
        if (this.mpSpan) this.mpSpan.textContent = `${Math.floor(player.mpCurrent)}/${mpMax}`;
        if (this.sanitySpan) this.sanitySpan.textContent = `${Math.floor(player.sanity)}/${sanMax}`;
        if (this.expSpan) this.expSpan.textContent = `Lv.${player.nivel}`;
        if (this.esenciaSpan) this.esenciaSpan.textContent = `${Math.floor(player.esencia || 0)}`;

        if (this.hpBar) this.hpBar.style.width = hpPct + '%';
        if (this.mpBar) this.mpBar.style.width = mpPct + '%';
        if (this.sanityBar) this.sanityBar.style.width = sanPct + '%';
        if (this.expBar) this.expBar.style.width = expPct + '%';
    }

    getPlayer() {
        return this.currentModuleObj?.player;
    }

    anyadirLog(msg, type) { this.log(msg, type); }
}

// ============================================
// AssetLoader (simplificado, con soporte local/remoto)
// ============================================
class AssetLoader {
    constructor(core) {
        this.core = core;
        this.cache = new Map();
        this.mode = localStorage.getItem('torre_profunda_asset_pack') || 'local';
    }

    setMode(mode) {
        this.mode = mode;
        localStorage.setItem('torre_profunda_asset_pack', mode);
        this.cache.clear();
    }

    async getImage(path) {
        if (this.cache.has(path)) return this.cache.get(path);
        const url = this.mode === 'default' ? path : `./assets/${path}`;
        try {
            const img = await this.loadImage(url);
            this.cache.set(path, img);
            return img;
        } catch (e) {
            console.warn(`No se pudo cargar ${url}, usando placeholder`);
            return this.getPlaceholder();
        }
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    getPlaceholder() {
        if (this.cache.has('__placeholder')) return this.cache.get('__placeholder');
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#e94560';
        ctx.fillRect(0, 0, 64, 64);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 30px monospace';
        ctx.fillText('?', 20, 45);
        const img = new Image();
        img.src = canvas.toDataURL();
        this.cache.set('__placeholder', img);
        return img;
    }
}