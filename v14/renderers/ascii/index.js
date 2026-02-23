// ============================================
// renderers/ascii/index.js - Renderizado ASCII con temas y modo locura
// ============================================

import { Asciify } from '@sister.software/asciify';

export const asciiRenderer = {
  core: null,
  enabled: false,
  asciifier: null,
  themes: {},
  currentTheme: 'classic',
  
  modoLocura: {
    activo: false,
    intensidad: 0,
    columnas: [],
    ultimaActualizacion: 0,
    numColumnas: 40,
    velocidadBase: 3,
    maxCaracteresPorColumna: 25
  },

  async init(core) {
    this.core = core;
    console.log('[ASCII] Renderer ASCII iniciado, cargando temas...');
    try {
      const temasData = await core.data.load('temas');
      if (temasData && temasData.temas) {
        this.themes = temasData.temas;
        console.log('[ASCII] Temas cargados:', Object.keys(this.themes));
      } else {
        console.warn('[ASCII] No se encontraron temas, usando fallback');
        this._cargarTemasPorDefecto();
      }
    } catch (e) {
      console.error('[ASCII] Error cargando temas, usando fallback', e);
      this._cargarTemasPorDefecto();
    }
    this._aplicarTema(this.currentTheme);
    this._initModoLocura();
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
    if (!tema) {
      console.warn(`[ASCII] Tema ${nombre} no encontrado`);
      return;
    }
    try {
      this.asciifier = new Asciify(this.core.canvas, {
        characterSet: tema.chars,
        foregroundColor: tema.fg,
        backgroundColor: tema.bg,
        cellWidth: 12,
        cellHeight: 18
      });
      console.log(`[ASCII] Tema aplicado: ${nombre} - asciifier creado`);
    } catch (e) {
      console.error('[ASCII] Error al crear Asciify:', e);
      this.asciifier = null; // Aseguramos que sea null si falla
    }
  },

  toggle() {
    this.enabled = !this.enabled;
    console.log('[ASCII] Modo ASCII:', this.enabled);
    this.core.log(`Modo ASCII: ${this.enabled ? 'ON' : 'OFF'}`, 'info');
  },

  setTheme(themeName) {
    if (this.themes[themeName]) {
      this.currentTheme = themeName;
      this._aplicarTema(themeName);
    } else {
      console.warn(`[ASCII] Tema ${themeName} no existe`);
    }
  },

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
    console.log('[ASCII] Modo locura inicializado con', this.modoLocura.numColumnas, 'columnas');
  },

  _actualizarModoLocura() {
    const ahora = Date.now();
    if (ahora - this.modoLocura.ultimaActualizacion > 50) {
      this.modoLocura.columnas.forEach(col => {
        if (Math.random() < 0.3) {
          const nuevoChar = String.fromCharCode(33 + Math.floor(Math.random() * 94));
          col.caracteres.unshift({ char: nuevoChar, y: 0 });
        }
        col.caracteres.forEach(c => c.y += col.velocidad);
        col.caracteres = col.caracteres.filter(c => c.y < this.core.canvas.height + 20);
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
        const alpha = 1 - (index / col.caracteres.length) * 0.7;
        ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
        ctx.fillText(c.char, col.x, c.y);
      });
    });
    ctx.restore();
  },

  setModoLocura(activo, intensidad) {
    this.modoLocura.activo = activo;
    if (intensidad !== undefined) {
      this.modoLocura.intensidad = Math.min(1, Math.max(0, intensidad));
    }
    console.log(`[ASCII] Modo locura: ${activo ? 'activado' : 'desactivado'}, intensidad: ${this.modoLocura.intensidad}`);
  },

  draw(ctx) {
    if (!this.enabled || !this.asciifier) {
      if (this.enabled && !this.asciifier) {
        console.warn('[ASCII] asciifier no disponible, no se puede dibujar');
      }
      return;
    }
    // Asciify transforma el canvas automáticamente, no necesitamos hacer nada más
    this._actualizarModoLocura();
    this._dibujarModoLocura(ctx);
  }
};