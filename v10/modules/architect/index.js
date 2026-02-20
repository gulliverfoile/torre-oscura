// ============================================
// modules/architect/index.js - Modo Arquitecto (configuración en tiempo real)
// ============================================

export const architectModule = {
    core: null,
    panel: null,
    visible: false,

    init(core) {
        this.core = core;
        this._crearPanel();
    },

    _crearPanel() {
        this.panel = document.createElement('div');
        this.panel.id = 'architect-panel';
        this.panel.style.cssText = `
            position: fixed; top:20px; right:20px; width:300px; background:#000; border:2px solid #0f0;
            color:#0f0; padding:10px; z-index:10000; display:none;
        `;
        this.panel.innerHTML = `
            <h3>ARQUITECTO</h3>
            <div id="arch-content"></div>
            <button id="arch-close">Cerrar [F2]</button>
        `;
        document.body.appendChild(this.panel);

        // Cargar contenido inicial
        this._cargarControles();

        document.getElementById('arch-close').addEventListener('click', () => this.toggle());

        window.addEventListener('keydown', (e) => {
            if (e.key === 'F2') {
                e.preventDefault();
                this.toggle();
            }
        });
    },

    _cargarControles() {
        const content = document.getElementById('arch-content');
        const rpg = this.core.modules.rpg;
        if (!rpg) return;
        const config = rpg.config.arch;
        content.innerHTML = `
            <div>
                <h4>Jugador</h4>
                X: <input type="range" id="arch-player-x" min="0" max="800" value="${config.player.x}">
                Y: <input type="range" id="arch-player-y" min="0" max="400" value="${config.player.y}">
                Tamaño: <input type="range" id="arch-player-size" min="32" max="128" value="${config.player.size}">
            </div>
            <div>
                <h4>Enemigos</h4>
                X: <input type="range" id="arch-enemy-x" min="0" max="800" value="${config.enemy.x}">
                Y: <input type="range" id="arch-enemy-y" min="0" max="400" value="${config.enemy.y}">
                Tamaño: <input type="range" id="arch-enemy-size" min="32" max="128" value="${config.enemy.size}">
            </div>
            <div>
                <h4>Minimapa</h4>
                Offset X: <input type="range" id="arch-map-x" min="0" max="700" value="${config.minimap.offsetX}">
                Offset Y: <input type="range" id="arch-map-y" min="0" max="300" value="${config.minimap.offsetY}">
                Celda: <input type="range" id="arch-map-cell" min="10" max="40" value="${config.minimap.cellSize}">
            </div>
            <div>
                <h4>Combate</h4>
                Velocidad: <input type="range" id="arch-combat-speed" min="0.05" max="0.5" step="0.01" value="${config.combat.attackSpeed}">
                Distancia: <input type="range" id="arch-combat-distance" min="0" max="100" value="${config.combat.attackDistance}">
                <label><input type="checkbox" id="arch-combat-dice" ${config.combat.useDice ? 'checked' : ''}> Usar dados</label>
            </div>
        `;

        // Eventos
        document.getElementById('arch-player-x').addEventListener('input', (e) => {
            config.player.x = parseInt(e.target.value);
            if (rpg.exploration) rpg.exploration.fixedPlayerX = config.player.x;
            if (rpg.combat) rpg.combat.playerBaseX = config.player.x;
        });
        // ... similar para los demás controles
    },

    toggle() {
        this.visible = !this.visible;
        this.panel.style.display = this.visible ? 'block' : 'none';
    }
};