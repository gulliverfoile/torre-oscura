// ============================================
// ui/components/dialog-modal.js - Modal de diálogo con estilo
// ============================================

export const dialogModal = {
  core: null,
  ui: null,
  overlay: null,
  callback: null,

  init(core, ui) {
    this.core = core;
    this.ui = ui;
    this.overlay = document.getElementById('dialog-overlay');
    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.id = 'dialog-overlay';
      this.overlay.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2000;
        display: none;
        align-items: center;
        justify-content: center;
      `;
      document.body.appendChild(this.overlay);
    }
    console.log('💬 DialogModal listo');
  },

  show(options, callback) {
    this.callback = callback;
    this.overlay.innerHTML = `
      <div style="
        background: #1b1528;
        border: 2px solid #7a5c3a;
        border-radius: 15px;
        padding: 20px;
        max-width: 400px;
        box-shadow: 0 0 30px rgba(0,0,0,0.8);
        font-family: 'Courier Prime', monospace;
        color: #e0d9d0;
      ">
        <h3 style="color: #ffd700; margin-top: 0; font-family: 'Press Start 2P', cursive; font-size: 14px;">${options.titulo || 'Diálogo'}</h3>
        ${options.mensaje ? `<p style="color: #aaa; margin-bottom: 20px;">${options.mensaje}</p>` : ''}
        <div style="display: flex; gap: 10px; justify-content: center;">
          ${options.opciones.map((opt, i) => `
            <button class="dialog-btn" data-index="${i}" style="
              background: #4a3a2a;
              border: 1px solid #ffd700;
              color: #ffd700;
              padding: 8px 20px;
              cursor: pointer;
              font-family: 'Press Start 2P', cursive;
              font-size: 10px;
              border-radius: 5px;
              transition: all 0.3s;
              flex: 1;
            ">${opt.texto}</button>
          `).join('')}
        </div>
      </div>
    `;
    this.overlay.style.display = 'flex';
    this.overlay.querySelectorAll('.dialog-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.target.dataset.index;
        this.overlay.style.display = 'none';
        if (this.callback) this.callback(options.opciones[idx].valor);
      });
    });
  },

  hide() {
    this.overlay.style.display = 'none';
  }
};