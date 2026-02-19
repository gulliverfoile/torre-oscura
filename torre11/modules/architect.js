// ============================================
// modules/architect.js - Modo Arquitecto mejorado
// ============================================
export const architectModule = {
    core: null,
    panel: null,
    visible: false,
    targetModule: null,

    init(core) {
        this.core = core;
        this.createUI();
        console.log('📐 Módulo Arquitecto iniciado');
    },

    createUI() {
        this.panel = document.createElement('div');
        this.panel.id = 'architect-panel';
        this.panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 400px;
            max-height: 90vh;
            overflow-y: auto;
            background: rgba(10, 10, 12, 0.98);
            border: 2px solid #0f0;
            color: #0f0;
            padding: 15px;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 10000;
            display: none;
            box-shadow: 0 0 30px rgba(0,255,0,0.4);
            backdrop-filter: blur(5px);
        `;
        this.panel.innerHTML = `
            <h3 style="margin-top:0; display:flex; justify-content:space-between;">
                <span>🔧 MODO ARQUITECTO</span>
                <button id="arch-close" style="background:transparent; border:1px solid #f00; color:#f00; cursor:pointer;">✕</button>
            </h3>
            <div style="margin-bottom:10px;">
                <label>Módulo objetivo: <span id="arch-target">rpg</span></label>
            </div>
            <hr>
            <div style="display:flex; gap:5px; margin-bottom:10px; flex-wrap:wrap;">
                <button class="arch-tab active" data-tab="hud">HUD</button>
                <button class="arch-tab" data-tab="player">Jugador</button>
                <button class="arch-tab" data-tab="enemy">Enemigos</button>
                <button class="arch-tab" data-tab="minimap">Minimapa</button>
                <button class="arch-tab" data-tab="combat">Combate</button>
                <button class="arch-tab" data-tab="debug">Debug</button>
            </div>
            <div id="arch-content"></div>
            <hr>
            <div style="display:flex; justify-content:space-between;">
                <span>[F2] Cerrar</span>
                <button id="arch-reset" style="background:#4a3a2a; border:1px solid #ffd700; color:#ffd700; cursor:pointer;">Restaurar valores</button>
            </div>
        `;
        document.body.appendChild(this.panel);

        const style = document.createElement('style');
        style.textContent = `
            .arch-tab {
                background: #1a1a1a;
                border: 1px solid #0f0;
                color: #0f0;
                padding: 4px 8px;
                cursor: pointer;
                font-size: 10px;
                border-radius: 3px;
            }
            .arch-tab.active {
                background: #0f0;
                color: #000;
            }
            .arch-section {
                display: none;
                flex-direction: column;
                gap: 10px;
                padding: 10px 0;
            }
            .arch-section.active {
                display: flex;
            }
            .arch-control {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .arch-control input[type=range] {
                width: 200px;
            }
            .arch-control span {
                min-width: 40px;
                text-align: right;
            }
        `;
        document.head.appendChild(style);

        const content = document.getElementById('arch-content');
        content.innerHTML = `
            <div class="arch-section active" id="arch-section-hud">
                <div class="arch-control">
                    <label>Estilo:</label>
                    <select id="arch-hud-style">
                        <option value="bars">Barras</option>
                        <option value="circles">Círculos</option>
                    </select>
                </div>
                <div class="arch-control">
                    <label>Posición X:</label>
                    <input type="range" id="arch-hud-x" min="0" max="800" value="20" step="1">
                    <span id="arch-hud-x-val">20</span>
                </div>
                <div class="arch-control">
                    <label>Posición Y:</label>
                    <input type="range" id="arch-hud-y" min="0" max="400" value="20" step="1">
                    <span id="arch-hud-y-val">20</span>
                </div>
                <div class="arch-control">
                    <label>Tamaño:</label>
                    <input type="range" id="arch-hud-size" min="10" max="50" value="20" step="1">
                    <span id="arch-hud-size-val">20</span>
                </div>
                <div class="arch-control">
                    <label>Espaciado:</label>
                    <input type="range" id="arch-hud-spacing" min="10" max="80" value="30" step="1">
                    <span id="arch-hud-spacing-val">30</span>
                </div>
                <div class="arch-control">
                    <label>Color HP:</label>
                    <input type="color" id="arch-color-hp" value="#e94560">
                </div>
                <div class="arch-control">
                    <label>Color MP:</label>
                    <input type="color" id="arch-color-mp" value="#44aaff">
                </div>
                <div class="arch-control">
                    <label>Color Sanity:</label>
                    <input type="color" id="arch-color-sanity" value="#b19cd9">
                </div>
            </div>
            <div class="arch-section" id="arch-section-player">
                <div class="arch-control">
                    <label>Posición X:</label>
                    <input type="range" id="arch-player-x" min="0" max="800" value="300" step="1">
                    <span id="arch-player-x-val">300</span>
                </div>
                <div class="arch-control">
                    <label>Posición Y:</label>
                    <input type="range" id="arch-player-y" min="0" max="400" value="200" step="1">
                    <span id="arch-player-y-val">200</span>
                </div>
                <div class="arch-control">
                    <label>Tamaño sprite:</label>
                    <input type="range" id="arch-player-size" min="32" max="128" value="64" step="1">
                    <span id="arch-player-size-val">64</span>
                </div>
            </div>
            <div class="arch-section" id="arch-section-enemy">
                <div class="arch-control">
                    <label>Posición X base:</label>
                    <input type="range" id="arch-enemy-x" min="0" max="800" value="600" step="1">
                    <span id="arch-enemy-x-val">600</span>
                </div>
                <div class="arch-control">
                    <label>Posición Y base:</label>
                    <input type="range" id="arch-enemy-y" min="0" max="400" value="200" step="1">
                    <span id="arch-enemy-y-val">200</span>
                </div>
                <div class="arch-control">
                    <label>Tamaño sprite:</label>
                    <input type="range" id="arch-enemy-size" min="32" max="128" value="64" step="1">
                    <span id="arch-enemy-size-val">64</span>
                </div>
            </div>
            <div class="arch-section" id="arch-section-minimap">
                <div class="arch-control">
                    <label>Offset X:</label>
                    <input type="range" id="arch-minimap-x" min="0" max="700" value="500" step="1">
                    <span id="arch-minimap-x-val">500</span>
                </div>
                <div class="arch-control">
                    <label>Offset Y:</label>
                    <input type="range" id="arch-minimap-y" min="0" max="300" value="10" step="1">
                    <span id="arch-minimap-y-val">10</span>
                </div>
                <div class="arch-control">
                    <label>Tamaño celda:</label>
                    <input type="range" id="arch-minimap-cell" min="10" max="40" value="20" step="1">
                    <span id="arch-minimap-cell-val">20</span>
                </div>
            </div>
            <div class="arch-section" id="arch-section-combat">
                <div class="arch-control">
                    <label>Velocidad ataque:</label>
                    <input type="range" id="arch-combat-speed" min="0.05" max="0.5" value="0.1" step="0.01">
                    <span id="arch-combat-speed-val">0.10</span>
                </div>
                <div class="arch-control">
                    <label>Distancia ataque:</label>
                    <input type="range" id="arch-combat-distance" min="0" max="100" value="20" step="1">
                    <span id="arch-combat-distance-val">20</span>
                </div>
                <div class="arch-control">
                    <label>Usar dados:</label>
                    <input type="checkbox" id="arch-combat-dice" ${this.targetModule?.archConfig.combat.useDice ? 'checked' : ''}>
                </div>
            </div>
            <div class="arch-section" id="arch-section-debug">
                <div class="arch-control">
                    <label>Modo desarrollador:</label>
                    <button id="arch-toggle-dev" style="background:#4a3a2a; border:1px solid #0f0; color:#0f0;">Activar</button>
                </div>
                <div class="arch-control">
                    <label>Ocultar panel UI:</label>
                    <button id="arch-toggle-panel" style="background:#4a3a2a; border:1px solid #0f0; color:#0f0;">Alternar</button>
                </div>
                <hr>
                <div style="font-size:10px; color:#888;">
                    <div>FPS: <span id="arch-fps">0</span></div>
                    <div>Memoria: <span id="arch-memory">0</span> MB</div>
                </div>
            </div>
        `;

        document.querySelectorAll('.arch-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.arch-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                const tabId = e.target.dataset.tab;
                document.querySelectorAll('.arch-section').forEach(s => s.classList.remove('active'));
                document.getElementById(`arch-section-${tabId}`).classList.add('active');
            });
        });

        document.getElementById('arch-hud-style').addEventListener('change', (e) => {
            this.updateHUDConfig({ style: e.target.value });
        });
        document.getElementById('arch-hud-x').addEventListener('input', (e) => {
            document.getElementById('arch-hud-x-val').textContent = e.target.value;
            this.updateHUDConfig({ x: parseInt(e.target.value) });
        });
        document.getElementById('arch-hud-y').addEventListener('input', (e) => {
            document.getElementById('arch-hud-y-val').textContent = e.target.value;
            this.updateHUDConfig({ y: parseInt(e.target.value) });
        });
        document.getElementById('arch-hud-size').addEventListener('input', (e) => {
            document.getElementById('arch-hud-size-val').textContent = e.target.value;
            this.updateHUDConfig({ size: parseInt(e.target.value) });
        });
        document.getElementById('arch-hud-spacing').addEventListener('input', (e) => {
            document.getElementById('arch-hud-spacing-val').textContent = e.target.value;
            this.updateHUDConfig({ spacing: parseInt(e.target.value) });
        });
        document.getElementById('arch-color-hp').addEventListener('input', (e) => {
            this.updateHUDConfig({ colors: { hp: e.target.value } });
        });
        document.getElementById('arch-color-mp').addEventListener('input', (e) => {
            this.updateHUDConfig({ colors: { mp: e.target.value } });
        });
        document.getElementById('arch-color-sanity').addEventListener('input', (e) => {
            this.updateHUDConfig({ colors: { sanity: e.target.value } });
        });

        document.getElementById('arch-player-x').addEventListener('input', (e) => {
            document.getElementById('arch-player-x-val').textContent = e.target.value;
            this.updatePlayerConfig({ x: parseInt(e.target.value) });
        });
        document.getElementById('arch-player-y').addEventListener('input', (e) => {
            document.getElementById('arch-player-y-val').textContent = e.target.value;
            this.updatePlayerConfig({ y: parseInt(e.target.value) });
        });
        document.getElementById('arch-player-size').addEventListener('input', (e) => {
            document.getElementById('arch-player-size-val').textContent = e.target.value;
            this.updatePlayerConfig({ size: parseInt(e.target.value) });
        });

        document.getElementById('arch-enemy-x').addEventListener('input', (e) => {
            document.getElementById('arch-enemy-x-val').textContent = e.target.value;
            this.updateEnemyConfig({ x: parseInt(e.target.value) });
        });
        document.getElementById('arch-enemy-y').addEventListener('input', (e) => {
            document.getElementById('arch-enemy-y-val').textContent = e.target.value;
            this.updateEnemyConfig({ y: parseInt(e.target.value) });
        });
        document.getElementById('arch-enemy-size').addEventListener('input', (e) => {
            document.getElementById('arch-enemy-size-val').textContent = e.target.value;
            this.updateEnemyConfig({ size: parseInt(e.target.value) });
        });

        document.getElementById('arch-minimap-x').addEventListener('input', (e) => {
            document.getElementById('arch-minimap-x-val').textContent = e.target.value;
            this.updateMinimapConfig({ offsetX: parseInt(e.target.value) });
        });
        document.getElementById('arch-minimap-y').addEventListener('input', (e) => {
            document.getElementById('arch-minimap-y-val').textContent = e.target.value;
            this.updateMinimapConfig({ offsetY: parseInt(e.target.value) });
        });
        document.getElementById('arch-minimap-cell').addEventListener('input', (e) => {
            document.getElementById('arch-minimap-cell-val').textContent = e.target.value;
            this.updateMinimapConfig({ cellSize: parseInt(e.target.value) });
        });

        document.getElementById('arch-combat-speed').addEventListener('input', (e) => {
            document.getElementById('arch-combat-speed-val').textContent = parseFloat(e.target.value).toFixed(2);
            this.updateCombatConfig({ attackSpeed: parseFloat(e.target.value) });
        });
        document.getElementById('arch-combat-distance').addEventListener('input', (e) => {
            document.getElementById('arch-combat-distance-val').textContent = e.target.value;
            this.updateCombatConfig({ attackDistance: parseInt(e.target.value) });
        });
        document.getElementById('arch-combat-dice').addEventListener('change', (e) => {
            this.updateCombatConfig({ useDice: e.target.checked });
        });

        document.getElementById('arch-toggle-dev').addEventListener('click', () => {
            if (this.core.ui) this.core.ui.toggleDeveloperMode();
        });
        document.getElementById('arch-toggle-panel').addEventListener('click', () => {
            if (this.core.ui) this.core.ui.toggleRightPanel();
        });

        document.getElementById('arch-close').addEventListener('click', () => this.toggle());
        document.getElementById('arch-reset').addEventListener('click', () => this.resetToDefaults());

        window.addEventListener('keydown', (e) => {
            if (e.key === 'F2') {
                e.preventDefault();
                this.toggle();
            }
        });
    },

    toggle() {
        this.visible = !this.visible;
        this.panel.style.display = this.visible ? 'block' : 'none';
        if (this.visible) {
            this.syncWithModule();
        }
    },

    syncWithModule() {
        this.targetModule = this.core.currentModuleObj;
        if (!this.targetModule) return;

        const hud = this.targetModule.hudConfig;
        document.getElementById('arch-hud-style').value = hud.style;
        document.getElementById('arch-hud-x').value = hud.x;
        document.getElementById('arch-hud-x-val').textContent = hud.x;
        document.getElementById('arch-hud-y').value = hud.y;
        document.getElementById('arch-hud-y-val').textContent = hud.y;
        document.getElementById('arch-hud-size').value = hud.size;
        document.getElementById('arch-hud-size-val').textContent = hud.size;
        document.getElementById('arch-hud-spacing').value = hud.spacing;
        document.getElementById('arch-hud-spacing-val').textContent = hud.spacing;
        document.getElementById('arch-color-hp').value = hud.colors.hp;
        document.getElementById('arch-color-mp').value = hud.colors.mp;
        document.getElementById('arch-color-sanity').value = hud.colors.sanity;

        const arch = this.targetModule.archConfig;
        document.getElementById('arch-player-x').value = arch.player.x;
        document.getElementById('arch-player-x-val').textContent = arch.player.x;
        document.getElementById('arch-player-y').value = arch.player.y;
        document.getElementById('arch-player-y-val').textContent = arch.player.y;
        document.getElementById('arch-player-size').value = arch.player.size;
        document.getElementById('arch-player-size-val').textContent = arch.player.size;

        document.getElementById('arch-enemy-x').value = arch.enemy.x;
        document.getElementById('arch-enemy-x-val').textContent = arch.enemy.x;
        document.getElementById('arch-enemy-y').value = arch.enemy.y;
        document.getElementById('arch-enemy-y-val').textContent = arch.enemy.y;
        document.getElementById('arch-enemy-size').value = arch.enemy.size;
        document.getElementById('arch-enemy-size-val').textContent = arch.enemy.size;

        document.getElementById('arch-minimap-x').value = arch.minimap.offsetX;
        document.getElementById('arch-minimap-x-val').textContent = arch.minimap.offsetX;
        document.getElementById('arch-minimap-y').value = arch.minimap.offsetY;
        document.getElementById('arch-minimap-y-val').textContent = arch.minimap.offsetY;
        document.getElementById('arch-minimap-cell').value = arch.minimap.cellSize;
        document.getElementById('arch-minimap-cell-val').textContent = arch.minimap.cellSize;

        document.getElementById('arch-combat-speed').value = arch.combat.attackSpeed;
        document.getElementById('arch-combat-speed-val').textContent = arch.combat.attackSpeed.toFixed(2);
        document.getElementById('arch-combat-distance').value = arch.combat.attackDistance;
        document.getElementById('arch-combat-distance-val').textContent = arch.combat.attackDistance;
        document.getElementById('arch-combat-dice').checked = arch.combat.useDice;
    },

    updateHUDConfig(changes) {
        if (!this.targetModule) return;
        Object.assign(this.targetModule.hudConfig, changes);
        if (this.targetModule.hud) {
            this.targetModule.hud.updateConfig(this.targetModule.hudConfig);
        }
    },

    updatePlayerConfig(changes) {
        if (!this.targetModule) return;
        Object.assign(this.targetModule.archConfig.player, changes);
        if (this.targetModule.exploration) {
            this.targetModule.exploration.fixedPlayerX = this.targetModule.archConfig.player.x;
            this.targetModule.exploration.fixedPlayerY = this.targetModule.archConfig.player.y;
        }
        if (this.targetModule.combat) {
            this.targetModule.combat.playerBaseX = this.targetModule.archConfig.player.x;
            this.targetModule.combat.playerBaseY = this.targetModule.archConfig.player.y;
        }
    },

    updateEnemyConfig(changes) {
        if (!this.targetModule) return;
        Object.assign(this.targetModule.archConfig.enemy, changes);
        if (this.targetModule.combat) {
            this.targetModule.combat.enemyBaseX = this.targetModule.archConfig.enemy.x;
            this.targetModule.combat.enemyBaseY = this.targetModule.archConfig.enemy.y;
            if (this.targetModule.combat.enemigos) {
                this.targetModule.combat.enemigos.forEach(e => {
                    e.x = this.targetModule.archConfig.enemy.x;
                    e.y = this.targetModule.archConfig.enemy.y;
                });
            }
        }
    },

    updateMinimapConfig(changes) {
        if (!this.targetModule) return;
        Object.assign(this.targetModule.archConfig.minimap, changes);
        if (this.targetModule.exploration) {
            if (changes.offsetX !== undefined) this.targetModule.exploration.mapOffsetX = changes.offsetX;
            if (changes.offsetY !== undefined) this.targetModule.exploration.mapOffsetY = changes.offsetY;
            if (changes.cellSize !== undefined) this.targetModule.exploration.mapCellSize = changes.cellSize;
        }
    },

    updateCombatConfig(changes) {
        if (!this.targetModule) return;
        Object.assign(this.targetModule.archConfig.combat, changes);
        if (this.targetModule.combat) {
            if (changes.attackSpeed !== undefined) this.targetModule.combat.attackSpeed = changes.attackSpeed;
            if (changes.attackDistance !== undefined) this.targetModule.combat.attackDistance = changes.attackDistance;
        }
    },

    resetToDefaults() {
        if (!this.targetModule) return;
        const defaultHUD = {
            style: 'bars',
            x: 20,
            y: 20,
            size: 20,
            spacing: 30,
            colors: { hp: '#e94560', mp: '#44aaff', sanity: '#b19cd9' }
        };
        const defaultArch = {
            player: { x: 300, y: 200, size: 64 },
            enemy: { x: 600, y: 200, size: 64 },
            minimap: { offsetX: 500, offsetY: 10, cellSize: 20 },
            combat: { attackSpeed: 0.1, attackDistance: 20, useDice: false }
        };
        Object.assign(this.targetModule.hudConfig, defaultHUD);
        Object.assign(this.targetModule.archConfig, defaultArch);
        this.syncWithModule();
        this.updatePlayerConfig({});
        this.updateEnemyConfig({});
        this.updateMinimapConfig({});
        this.updateCombatConfig({});
        this.updateHUDConfig({});
    }
};