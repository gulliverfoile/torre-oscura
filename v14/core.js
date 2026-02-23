// ============================================
// core.js - Núcleo del motor (eventos, módulos, servicios)
// ============================================

import { assetManager } from './services/asset-manager.js';
import { audioManager } from './services/audio-manager.js';
import { dataManager } from './services/data-manager.js';
import { i18n } from './services/i18n.js';
import { sceneManager } from './services/scene-manager.js';
import { controlsModule } from './services/controls.js';

export const core = {
  // Propiedades
  canvas: null,
  ctx: null,
  logElement: null,
  modules: {},
  currentModule: null,
  currentModuleObj: null,
  nextModule: null,
  moduleParams: {},
  events: {},
  running: true,               // Control de pausa (game over)
  lastTimestamp: 0,
  _updatingUI: false,          // Flag anti-bucle

  // Servicios
  assets: assetManager,
  audio: audioManager,
  data: dataManager,
  i18n: i18n,
  scene: sceneManager,
  controls: controlsModule,

  // Estadísticas de partida (para game over)
  stats_partida: {
    enemigos_derrotados: 0,
    salas_exploradas: 0
  },

  // Inicialización
  init(canvasId, logId) {
    console.log('🟢 Inicializando core...');
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error('❌ Canvas no encontrado');
      return;
    }
    this.ctx = this.canvas.getContext('2d');
    this.canvas.focus(); // Importante para eventos de teclado
    this.logElement = document.getElementById(logId);

    // Inicializar servicios
    this.assets.init(this);
    this.audio.init(this);
    this.data.init(this);
    this.i18n.init(this);
    this.scene.init(this);
    this.controls.init(this);

    this.running = true;
    requestAnimationFrame((t) => this.loop(t));
    console.log('✅ Core inicializado');
  },

  // Eventos
  on(event, callback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  },

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(cb => cb(data));
    }
  },

  // Módulos
  registerModule(name, moduleObj) {
    this.modules[name] = moduleObj;
    if (moduleObj.init) moduleObj.init(this);
    console.log(`📦 Módulo registrado: ${name}`);
  },

  switchModule(name, params = {}) {
    if (!this.modules[name]) {
      console.error(`❌ Módulo ${name} no registrado`);
      return;
    }
    if (this.currentModule) {
      const old = this.modules[this.currentModule];
      if (old.onExit) old.onExit();
    }
    this.nextModule = name;
    this.moduleParams = params;
    console.log(`🔄 Cambiando a módulo: ${name}`);
  },

  // Bucle principal
  loop(timestamp) {
    if (!this.running) {
      // Si está pausado, seguir pidiendo frames pero no ejecutar lógica
      requestAnimationFrame((t) => this.loop(t));
      return;
    }

    const delta = Math.min(100, timestamp - this.lastTimestamp);
    this.lastTimestamp = timestamp;

    // Cambio de módulo si es necesario
    if (this.nextModule) {
      this.currentModule = this.nextModule;
      this.currentModuleObj = this.modules[this.currentModule];
      if (this.currentModuleObj.onEnter) {
        this.currentModuleObj.onEnter(this.moduleParams);
      }
      this.nextModule = null;
      this.moduleParams = {};
    }

    // Actualizar el módulo actual (consulta teclas)
    if (this.currentModuleObj?.update) {
      this.currentModuleObj.update(delta, this.controls);
    }

    // Dibujar usando el renderer activo (sprites o ascii)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const renderer = Object.values(this.modules).find(
      m => m.enabled && (m === this.modules['renderer-sprites'] || m === this.modules['renderer-ascii'])
    );
    if (renderer) {
      renderer.draw(this.ctx);
    } else {
      console.warn('⚠️ No hay renderer activo');
    }

    // Resetear estado de controles para el próximo frame
    this.controls.update();

    requestAnimationFrame((t) => this.loop(t));
  },

  // Log
  log(msg, type = 'info') {
    if (!this.logElement) return;
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = msg;
    this.logElement.appendChild(entry);
    this.logElement.scrollTop = this.logElement.scrollHeight;
    if (this.logElement.children.length > 50) {
      this.logElement.removeChild(this.logElement.firstChild);
    }
  },

  // Utilidades
  getPlayer() {
    return this.currentModuleObj?.player;
  },

  updateUI(player) {
    if (this._updatingUI) return;
    this._updatingUI = true;
    if (player) this.emit('player:updated', player);
    this._updatingUI = false;
  }
};