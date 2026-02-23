// ============================================
// ui/components/floating-damage.js - Mensajes flotantes de daño
// ============================================

export const floatingDamage = {
  core: null,
  ui: null,
  container: null,

  init(core, ui) {
    this.core = core;
    this.ui = ui;
    this.container = document.createElement('div');
    this.container.id = 'floating-damage-container';
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 3000;
      overflow: hidden;
    `;
    document.body.appendChild(this.container);
    console.log('💥 FloatingDamage listo');
  },

  mostrar(texto, tipo = 'daño', x, y) {
    if (x === undefined || y === undefined) {
      x = window.innerWidth * 0.5;
      y = window.innerHeight * 0.4;
    }

    const colors = {
      daño: '#ff4b4b',
      critico: '#ffd700',
      curacion: '#9fdf9f',
      esencia: '#50b0ff'
    };
    const color = colors[tipo] || '#ffffff';

    const el = document.createElement('div');
    el.textContent = texto;
    el.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      font-family: 'Press Start 2P', cursive;
      font-size: 16px;
      color: ${color};
      text-shadow: 2px 2px 0 #000;
      transform: translate(-50%, -50%);
      animation: floatUp 1.5s ease-out forwards;
      pointer-events: none;
      z-index: 3001;
      white-space: nowrap;
    `;
    this.container.appendChild(el);

    setTimeout(() => {
      if (el.parentNode) el.remove();
    }, 1500);
  }
};

// Añadir la animación CSS si no existe
if (!document.getElementById('floatUp-style')) {
  const style = document.createElement('style');
  style.id = 'floatUp-style';
  style.textContent = `
    @keyframes floatUp {
      0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      70% { opacity: 0.7; transform: translate(-50%, -120px) scale(1.2); }
      100% { opacity: 0; transform: translate(-50%, -150px) scale(0.8); }
    }
  `;
  document.head.appendChild(style);
}