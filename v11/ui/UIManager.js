// ============================================
// ui/uimanager.js - Gestor de interfaz de usuario
// ============================================
export class UIManager {
    constructor(core) {
        this.core = core;
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.controlMode = this.isMobile ? 'mobile' : 'pc';
        this.uiConfig = {
            tabOrder: ['aventura', 'mochila', 'heroe', 'taller', 'tactica', 'log', 'misiones', 'bestiario', 'ingenieria'],
            panelWidth: 380,
            barPosition: 'left',
            colors: { hp: '#e94560', mp: '#44aaff', sanity: '#b19cd9' }
        };
        this.developerMode = false;

        this.initStyles();
        this.setupListeners();
        this.createControls();
        this.createDeveloperOverlay();
        this.createFloatingLog();
        
        const saved = localStorage.getItem('ui_panel_hidden');
        if (saved === 'true') {
            document.querySelector('.right-panel').style.display = 'none';
        }
    }

    initStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .persistent-vitals { left: ${this.uiConfig.barPosition === 'left' ? '20px' : 'auto'}; right: ${this.uiConfig.barPosition === 'right' ? '20px' : 'auto'}; }
            .right-panel { width: ${this.uiConfig.panelWidth}px; }
            #floating-log {
                position: fixed;
                bottom: 20px;
                left: 20px;
                width: 400px;
                height: 150px;
                background: rgba(0,0,0,0.8);
                border: 1px solid #0f0;
                color: #0f0;
                padding: 5px;
                overflow-y: auto;
                font-size: 11px;
                z-index: 1000;
                pointer-events: none;
                border-radius: 5px;
                font-family: monospace;
            }
            .log-entry { margin-bottom: 2px; }
        `;
        document.head.appendChild(style);
    }

    setupListeners() {
        this.core.on('player:updated', (player) => this.updateBars(player));
        this.core.on('inventory:changed', () => this.refreshTab('mochila'));
        this.core.on('mission:completed', (mission) => {
            this.core.log(`🎉 Misión completada: ${mission.name}`, 'positivo');
            this.refreshTab('misiones');
        });
        this.core.on('ui:configChanged', (config) => {
            Object.assign(this.uiConfig, config);
            this.initStyles();
            this.reorderTabs();
        });
    }

    createFloatingLog() {
        const logDiv = document.createElement('div');
        logDiv.id = 'floating-log';
        document.body.appendChild(logDiv);
        // Redirigir el log del core a este elemento
        const originalLog = this.core.log;
        this.core.log = (msg, type) => {
            originalLog.call(this.core, msg, type);
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            entry.textContent = msg;
            logDiv.appendChild(entry);
            logDiv.scrollTop = logDiv.scrollHeight;
            if (logDiv.children.length > 50) {
                logDiv.removeChild(logDiv.firstChild);
            }
        };
    }

    createControls() {
        const controlsDiv = document.createElement('div');
        controlsDiv.id = 'ui-controls';
        controlsDiv.innerHTML = `
            <button class="ui-control-btn" id="toggle-panel-btn" title="Ocultar/Mostrar panel">👁️</button>
            <button class="ui-control-btn" id="toggle-dev-btn" title="Modo desarrollador">🛠️</button>
        `;
        document.body.appendChild(controlsDiv);

        document.getElementById('toggle-panel-btn')?.addEventListener('click', () => this.toggleRightPanel());
        document.getElementById('toggle-dev-btn')?.addEventListener('click', () => this.toggleDeveloperMode());
    }

    createDeveloperOverlay() {
        const devOverlay = document.createElement('div');
        devOverlay.id = 'developer-overlay';
        devOverlay.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="color:#0f0;">🛠️ DEV TOOLS</span>
                <button id="dev-close" style="background:transparent; border:none; color:#f00; cursor:pointer; font-size:16px;">✕</button>
            </div>
            <div id="dev-info" style="margin:5px 0;"></div>
            <div style="display:flex; flex-direction:column; gap:5px;">
                <button class="dev-btn" id="dev-heal">❤️ Curar</button>
                <button class="dev-btn" id="dev-gold">💰 +100 Esencia</button>
                <button class="dev-btn" id="dev-item">📦 Añadir espada</button>
                <button class="dev-btn" id="dev-next-floor">⬇️ Bajar piso</button>
                <button class="dev-btn" id="dev-kill">💀 Matar enemigos</button>
                <hr style="border-color:#0f0; width:100%;">
                <div style="color:#0f0;">Configuración minimapa</div>
                <div>
                    <label>Offset X: <input type="range" id="dev-map-x" min="0" max="700" value="500" step="1"></label>
                    <span id="dev-map-x-val">500</span>
                </div>
                <div>
                    <label>Offset Y: <input type="range" id="dev-map-y" min="0" max="300" value="10" step="1"></label>
                    <span id="dev-map-y-val">10</span>
                </div>
                <div>
                    <label>Tamaño celda: <input type="range" id="dev-map-cell" min="10" max="40" value="20" step="1"></label>
                    <span id="dev-map-cell-val">20</span>
                </div>
            </div>
        `;
        devOverlay.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0,0,0,0.9);
            border: 2px solid #0f0;
            color: #0f0;
            padding: 15px;
            border-radius: 10px;
            font-family: monospace;
            font-size: 12px;
            z-index: 1001;
            display: none;
            pointer-events: auto;
            min-width: 250px;
            box-shadow: 0 0 20px rgba(0,255,0,0.3);
        `;
        document.body.appendChild(devOverlay);

        document.getElementById('dev-close')?.addEventListener('click', () => this.toggleDeveloperMode());
        document.getElementById('dev-heal')?.addEventListener('click', () => this._devHeal());
        document.getElementById('dev-gold')?.addEventListener('click', () => this._devAddGold());
        document.getElementById('dev-item')?.addEventListener('click', () => this._devAddItem());
        document.getElementById('dev-next-floor')?.addEventListener('click', () => this._devNextFloor());
        document.getElementById('dev-kill')?.addEventListener('click', () => this._devKillEnemies());

        document.getElementById('dev-map-x').addEventListener('input', (e) => {
            document.getElementById('dev-map-x-val').textContent = e.target.value;
            this._setMinimapX(parseInt(e.target.value));
        });
        document.getElementById('dev-map-y').addEventListener('input', (e) => {
            document.getElementById('dev-map-y-val').textContent = e.target.value;
            this._setMinimapY(parseInt(e.target.value));
        });
        document.getElementById('dev-map-cell').addEventListener('input', (e) => {
            document.getElementById('dev-map-cell-val').textContent = e.target.value;
            this._setMapCellSize(parseInt(e.target.value));
        });
    }

    toggleRightPanel() {
        const panel = document.querySelector('.right-panel');
        if (panel) {
            const isHidden = panel.style.display === 'none';
            panel.style.display = isHidden ? 'flex' : 'none';
            localStorage.setItem('ui_panel_hidden', !isHidden);
        }
    }

    toggleDeveloperMode() {
        this.developerMode = !this.developerMode;
        const overlay = document.getElementById('developer-overlay');
        if (overlay) {
            overlay.style.display = this.developerMode ? 'block' : 'none';
            if (this.developerMode) {
                this.startDevInfoUpdates();
            } else {
                if (this._devInterval) clearInterval(this._devInterval);
            }
        }
    }

    startDevInfoUpdates() {
        this._devInterval = setInterval(() => {
            const module = this.core.currentModuleObj;
            if (!module || !this.developerMode) return;
            const player = module.player;
            const piso = module.exploration?.pisoActual;
            const sala = module.exploration?.salaActual;
            const info = `
                <b>📍 Posición:</b> ${sala ? `(${sala.pos[0]},${sala.pos[1]})` : 'N/A'}<br>
                <b>📊 Piso:</b> ${piso !== undefined ? piso + 1 : 'N/A'}<br>
                <b>❤️ HP:</b> ${player?.hpCurrent}/${player?.hpMax}<br>
                <b>🔮 MP:</b> ${player?.mpCurrent}/${player?.mpMax}<br>
                <b>🧠 Cordura:</b> ${player?.sanity || 0}/${player?.sanityMax || 100}<br>
                <b>⚔️ Combate:</b> ${module.combat?.combateActivo ? 'Sí' : 'No'}<br>
                <b>🕒 FPS:</b> ${Math.round(this.core.lastFPS || 60)}
            `;
            document.getElementById('dev-info').innerHTML = info;
        }, 200);
    }

    _devHeal() {
        const module = this.core.currentModuleObj;
        if (module?.player) {
            module.player.hpCurrent = module.player.hpMax;
            module.player.mpCurrent = module.player.mpMax;
            module.player.sanity = module.player.sanityMax || 100;
            this.core.emit('player:updated', module.player);
            this.core.log('❤️ Modo desarrollador: Jugador curado.', 'sistema');
        }
    }

    _devAddGold() {
        const module = this.core.currentModuleObj;
        if (module?.player) {
            module.player.esencia = (module.player.esencia || 0) + 100;
            this.core.emit('player:updated', module.player);
            this.core.log('💰 +100 Esencia', 'sistema');
        }
    }

    _devAddItem() {
        const module = this.core.currentModuleObj;
        if (module?.inventory) {
            module.inventory.anyadirItem('espada_hierro', 1);
        }
    }

    _devNextFloor() {
        const module = this.core.currentModuleObj;
        if (module?.exploration) {
            module.exploration.cambiarPiso(1);
        }
    }

    _devKillEnemies() {
        const module = this.core.currentModuleObj;
        if (module?.combat && module.combat.combateActivo) {
            module.combat.enemigos = [];
            module.combat.combateActivo = false;
            this.core.log('💀 Enemigos eliminados.', 'sistema');
            this.core.emit('combat:ended', 'dev');
        }
    }

    _setMinimapX(val) {
        const module = this.core.currentModuleObj;
        if (module?.exploration) {
            module.exploration.setMapOffsetX(val);
        }
    }

    _setMinimapY(val) {
        const module = this.core.currentModuleObj;
        if (module?.exploration) {
            module.exploration.setMapOffsetY(val);
        }
    }

    _setMapCellSize(val) {
        const module = this.core.currentModuleObj;
        if (module?.exploration) {
            module.exploration.setMapCellSize(val);
        }
    }

    _updateCombatDice(checked) {
        // Este método se llama desde el checkbox en ingeniería
        const module = this.core.currentModuleObj;
        if (module?.combat) {
            module.archConfig.combat.useDice = checked;
        }
    }

    updateBars(player) {
        if (!player) return;
        const hpMax = this.core.getVidaMax?.() || player.hpMax;
        const mpMax = this.core.getManaMax?.() || player.mpMax;
        const sanMax = player.sanityMax || 100;
        const hpPct = (player.hpCurrent / hpMax) * 100;
        const mpPct = (player.mpCurrent / mpMax) * 100;
        const sanPct = (player.sanity / sanMax) * 100;
        const expPct = (player.exp / player.expParaSubir) * 100;

        document.getElementById('pers-hp-val').textContent = `${Math.floor(player.hpCurrent)}/${hpMax}`;
        document.getElementById('pers-mp-val').textContent = `${Math.floor(player.mpCurrent)}/${mpMax}`;
        document.getElementById('pers-san-val').textContent = `${Math.floor(player.sanity)}/${sanMax}`;
        document.getElementById('pers-exp-val').textContent = `Lv.${player.nivel}`;
        document.getElementById('pers-esencia-val').textContent = `${Math.floor(player.esencia || 0)}`;

        document.getElementById('pers-hp-fill').style.width = hpPct + '%';
        document.getElementById('pers-mp-fill').style.width = mpPct + '%';
        document.getElementById('pers-san-fill').style.width = sanPct + '%';
        document.getElementById('pers-exp-fill').style.width = expPct + '%';
    }

    onTabChanged(tabId) {
        const module = this.core.currentModuleObj;
        if (!module) return;
        if (tabId === 'mochila') {
            this.renderInventory(module.inventory?.getInventoryList() || []);
        } else if (tabId === 'heroe') {
            this.renderCharacter(module.character);
        } else if (tabId === 'ingenieria') {
            if (module.renderIngenieria) module.renderIngenieria();
        }
    }

    refreshTab(tabId) {
        this.onTabChanged(tabId);
    }

    renderInventory(inventory) {
        const container = document.getElementById('inv-render');
        if (!container) return;
        let html = '<div class="inv-container">';
        inventory.forEach(inv => {
            const item = inv.data;
            html += `
                <div class="item-card" style="border-left-color: ${item?.color || '#7a5c3a'}">
                    <div style="display:flex; justify-content:space-between;">
                        <b>${inv.nombre} x${inv.cantidad}</b>
                        ${item?.tipo === 'consumible' ? `<button class="equip-btn" onclick="window.core.currentModuleObj.inventory.aplicarEfecto(item, window.core.currentModuleObj.player)">USAR</button>` : ''}
                        ${item?.ranura ? `<button class="equip-btn" onclick="window.core.currentModuleObj.inventory.equiparItem('${inv.item_id}', '${inv.nombre}')">EQUIPAR</button>` : ''}
                    </div>
                    <div style="font-size:10px;">${item?.descripcion || ''}</div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    renderCharacter(character) {
        const container = document.getElementById('stats-render');
        if (!container) return;
        const player = character.player;
        const stats = character.getEffectiveStats();
        let html = `
            <div class="character-sheet">
                <h3 style="color:#ffd700;">${player.nombre} <span style="color:#fff;">Lv.${player.nivel}</span></h3>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div>F: ${stats.F}</div>
                    <div>D: ${stats.D}</div>
                    <div>I: ${stats.I}</div>
                    <div>S: ${stats.S}</div>
                </div>
                <div style="margin-top:10px;">
                    <div>❤️ HP: ${player.hpCurrent}/${player.hpMax}</div>
                    <div>🔮 MP: ${player.mpCurrent}/${player.mpMax}</div>
                    <div>🧠 San: ${player.sanity}/${player.sanityMax}</div>
                </div>
                <h4 style="color:#ffd700;">Equipo</h4>
                <div>
                    ${Object.entries(player.equipo).map(([slot, item]) => `
                        <div><b>${slot}:</b> ${item?.nombre || 'vacío'} ${item ? `<button class="equip-btn" onclick="window.core.currentModuleObj.inventory.desequiparItem('${slot}')">DES</button>` : ''}</div>
                    `).join('')}
                </div>
                <h4 style="color:#ffd700;">Habilidades</h4>
                <div>
                    ${player.habilidadesActivas.map(id => {
                        const h = this.core.currentModuleObj?.data?.enciclopedia?.habilidades?.find(h => h.id === id);
                        return `<div>${h?.icono || '✨'} ${h?.nombre || id}</div>`;
                    }).join('')}
                </div>
                ${player.puntosMejora > 0 ? `<div style="color:#9fdf9f;">Puntos mejora: ${player.puntosMejora}</div>` : ''}
            </div>
        `;
        container.innerHTML = html;
    }

    reorderTabs() {
        const container = document.getElementById('tabs-container');
        const children = Array.from(container.children);
        const order = this.uiConfig.tabOrder;
        order.forEach(tabId => {
            const tab = children.find(child => child.dataset.tab === tabId);
            if (tab) container.appendChild(tab);
        });
    }
}