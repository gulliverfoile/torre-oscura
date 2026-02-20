// ============================================
// services/theme-manager.js - Gestión de temas de la UI
// ============================================

export const themeManager = {
  core: null,
  themes: {},
  currentTheme: 'gothic',

  async init(core) {
    this.core = core;
    console.log('🎨 ThemeManager iniciado');
    try {
      const temasData = await core.data.load('ui-themes');
      if (temasData && temasData.themes) {
        this.themes = temasData.themes;
        console.log('✅ Temas UI cargados:', Object.keys(this.themes));
      } else {
        this._cargarTemasPorDefecto();
      }
    } catch (e) {
      console.warn('⚠️ Error cargando temas UI, usando fallback', e);
      this._cargarTemasPorDefecto();
    }
    this.aplicarTema(this.currentTheme);
  },

  _cargarTemasPorDefecto() {
    this.themes = {
      gothic: {
        name: 'Estilo Gótico',
        colors: {
          primary: '#8b7355',
          secondary: '#4a0404',
          text: '#d1d1d1',
          background: '#0a0a0c',
          accent: '#ffd700'
        },
        bars: {
          hp: '█▓▒░',
          mp: '█▓▒░',
          sanity: '█▓▒░',
          exp: '█▓▒░'
        },
        fonts: {
          main: "'Courier Prime', monospace",
          title: "'Press Start 2P', cursive"
        }
      },
      retro: {
        name: 'Retro',
        colors: {
          primary: '#0f0',
          secondary: '#00f',
          text: '#0f0',
          background: '#000',
          accent: '#ff0'
        },
        bars: {
          hp: '█▓▒░',
          mp: '█▓▒░',
          sanity: '█▓▒░',
          exp: '█▓▒░'
        },
        fonts: {
          main: "'Courier New', monospace",
          title: "'Courier New', monospace"
        }
      }
    };
  },

  aplicarTema(nombre) {
    if (!this.themes[nombre]) return;
    this.currentTheme = nombre;
    const tema = this.themes[nombre];
    // Aplicar variables CSS
    const root = document.documentElement;
    root.style.setProperty('--ui-primary', tema.colors.primary);
    root.style.setProperty('--ui-secondary', tema.colors.secondary);
    root.style.setProperty('--ui-text', tema.colors.text);
    root.style.setProperty('--ui-background', tema.colors.background);
    root.style.setProperty('--ui-accent', tema.colors.accent);
    root.style.setProperty('--ui-font-main', tema.fonts.main);
    root.style.setProperty('--ui-font-title', tema.fonts.title);
    // Guardar en localStorage
    localStorage.setItem('torre_ui_theme', nombre);
    this.core.emit('ui:theme-changed', nombre);
  },

  getTemaActual() {
    return this.themes[this.currentTheme];
  },

  getBarChars(barType) {
    const tema = this.getTemaActual();
    return tema.bars[barType] || '█▓▒░';
  }
};