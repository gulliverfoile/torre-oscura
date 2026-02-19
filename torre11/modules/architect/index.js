// ============================================
// modules/architect/index.js - Modo Arquitecto (configuración en tiempo real)
// ============================================

export const architectModule = {
    core: null,
    panel: null,
    visible: false,

    init(core) {
        this.core = core;
        console.log('🟢 Módulo arquitecto iniciado');
        this._crearPanel();
    },

    _crearPanel() {
        this.panel = document.createElement('div');
        this.panel.id = 'architect-panel';
        this.panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 300px;
            background: #000;
            border: 2px solid #0f0;
            color: #0f0;
            padding: 10px;
            z-index: 10000;
            display: none;
            font-family: monospace;
        `;
        this.panel.innerHTML = `
            <h3>🔧 ARQUITECTO</h3>
            <div id="arch-content"></div>
            <button id="arch-close" style="background:#1a1a1a; border:1px solid #0f0; color:#0f0; padding:5px; margin-top:10px;">Cerrar [F2]</button>
        `;
        document.body.appendChild(this.panel);

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
        if (!rpg) {
            content.innerHTML = '<p>Módulo RPG no activo</p>';
            return;
        }
        const config = rpg.config.arch;
        content.innerHTML = `
            <div style="margin-bottom:10px;">
                <h4 style="color:#0f0;">Jugador</h4>
                X: <input type="range" id="arch-player-x" min="0" max="800" value="${config.player.x}" style="width:100%;">
                Y: <input type="range" id="arch-player-y" min="0" max="400" value="${config.player.y}" style="width:100%;">
                Tamaño: <input type="range" id="arch-player-size" min="32" max="128" value="${config.player.size}" style="width:100%;">
            </div>
            <div style="margin-bottom:10px;">
                <h4 style="color:#0f0;">Enemigos</h4>
                X: <input type="range" id="arch-enemy-x" min="0" max="800" value="${config.enemy.x}" style="width:100%;">
                Y: <input type="range" id="arch-enemy-y" min="0" max="400" value="${config.enemy.y}" style="width:100%;">
                Tamaño: <input type="range" id="arch-enemy-size" min="32" max="128" value="${config.enemy.size}" style="width:100%;">
            </div>
            <div style="margin-bottom:10px;">
                <h4 style="color:#0f0;">Minimapa</h4>
                Offset X: <input type="range" id="arch-map-x" min="0" max="700" value="${config.minimap.offsetX}" style="width:100%;">
                Offset Y: <input type="range" id="arch-map-y" min="0" max="300" value="${config.minimap.offsetY}" style="width:100%;">
                Celda: <input type="range" id="arch-map-cell" min="10" max="40" value="${config.minimap.cellSize}" style="width:100%;">
            </div>
            <div style="margin-bottom:10px;">
                <h4 style="color:#0f0;">Combate</h4>
                Velocidad: <input type="range" id="arch-combat-speed" min="0.05" max="0.5" step="0.01" value="${config.combat.attackSpeed}" style="width:100%;">
                Distancia: <input type="range" id="arch-combat-distance" min="0" max="100" value="${config.combat.attackDistance}" style="width:100%;">
                <label><input type="checkbox" id="arch-combat-dice" ${config.combat.useDice ? 'checked' : ''}> Usar dados</label>
            </div>
        `;

        // Eventos de los sliders
        document.getElementById('arch-player-x').addEventListener('input', (e) => {
            config.player.x = parseInt(e.target.value);
            if (rpg.exploration) rpg.exploration.fixedPlayerX = config.player.x;
            if (rpg.combat) rpg.combat.playerBaseX = config.player.x;
            console.log('⚙️ Posición jugador X:', config.player.x);
        });
        document.getElementById('arch-player-y').addEventListener('input', (e) => {
            config.player.y = parseInt(e.target.value);
            if (rpg.exploration) rpg.exploration.fixedPlayerY = config.player.y;
            if (rpg.combat) rpg.combat.playerBaseY = config.player.y;
            console.log('⚙️ Posición jugador Y:', config.player.y);
        });
        document.getElementById('arch-player-size').addEventListener('input', (e) => {
            config.player.size = parseInt(e.target.value);
            console.log('⚙️ Tamaño jugador:', config.player.size);
        });
        document.getElementById('arch-enemy-x').addEventListener('input', (e) => {
            config.enemy.x = parseInt(e.target.value);
            if (rpg.combat) rpg.combat.enemyBaseX = config.enemy.x;
            console.log('⚙️ Posición enemigos X:', config.enemy.x);
        });
        document.getElementById('arch-enemy-y').addEventListener('input', (e) => {
            config.enemy.y = parseInt(e.target.value);
            if (rpg.combat) rpg.combat.enemyBaseY = config.enemy.y;
            console.log('⚙️ Posición enemigos Y:', config.enemy.y);
        });
        document.getElementById('arch-enemy-size').addEventListener('input', (e) => {
            config.enemy.size = parseInt(e.target.value);
            console.log('⚙️ Tamaño enemigos:', config.enemy.size);
        });
        document.getElementById('arch-map-x').addEventListener('input', (e) => {
            config.minimap.offsetX = parseInt(e.target.value);
            if (rpg.exploration) rpg.exploration.mapOffsetX = config.minimap.offsetX;
            console.log('⚙️ Offset minimapa X:', config.minimap.offsetX);
        });
        document.getElementById('arch-map-y').addEventListener('input', (e) => {
            config.minimap.offsetY = parseInt(e.target.value);
            if (rpg.exploration) rpg.exploration.mapOffsetY = config.minimap.offsetY;
            console.log('⚙️ Offset minimapa Y:', config.minimap.offsetY);
        });
        document.getElementById('arch-map-cell').addEventListener('input', (e) => {
            config.minimap.cellSize = parseInt(e.target.value);
            if (rpg.exploration) rpg.exploration.mapCellSize = config.minimap.cellSize;
            console.log('⚙️ Tamaño celda minimapa:', config.minimap.cellSize);
        });
        document.getElementById('arch-combat-speed').addEventListener('input', (e) => {
            config.combat.attackSpeed = parseFloat(e.target.value);
            console.log('⚙️ Velocidad ataque:', config.combat.attackSpeed);
        });
        document.getElementById('arch-combat-distance').addEventListener('input', (e) => {
            config.combat.attackDistance = parseInt(e.target.value);
            console.log('⚙️ Distancia ataque:', config.combat.attackDistance);
        });
        document.getElementById('arch-combat-dice').addEventListener('change', (e) => {
            config.combat.useDice = e.target.checked;
            console.log('⚙️ Usar dados:', config.combat.useDice);
        });
    },

    toggle() {
        this.visible = !this.visible;
        this.panel.style.display = this.visible ? 'block' : 'none';
        if (this.visible) {
            console.log('🔧 Abriendo panel arquitecto');
            this._cargarControles();
        } else {
            console.log('🔧 Cerrando panel arquitecto');
        }
    }
};