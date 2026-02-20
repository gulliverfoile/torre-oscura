// ============================================
// modules/menuInicio.js - Pantalla de inicio con precarga
// ============================================

export const menuInicio = {
    core: null,
    bgImage: null,
    progress: 0,
    assetsToLoad: [
        'characters/player.png',
        'enemies/slime.png',
        'enemies/esqueleto.png',
        'enemies/orco.png',
        'backgrounds/bg_default.png',
        'backgrounds/menu_bg.png'
    ],
    loadedCount: 0,
    btn: null,
    keyHandler: null,
    gameStarting: false,

    init(core) {
        this.core = core;
        console.log('🏠 Módulo menú inicio iniciado');
    },

    async onEnter(params) {
        console.log('🏠 onEnter menú inicio');
        this.gameStarting = false;
        this.createButton();

        this.progress = 0;
        this.loadedCount = 0;
        this.updateProgress(0);

        for (let asset of this.assetsToLoad) {
            try {
                await this.core.images.get(asset);
                this.loadedCount++;
                const percent = Math.floor((this.loadedCount / this.assetsToLoad.length) * 100);
                this.updateProgress(percent);
            } catch (e) {
                console.warn(`No se pudo cargar ${asset}, usando placeholder`);
                this.loadedCount++;
                const percent = Math.floor((this.loadedCount / this.assetsToLoad.length) * 100);
                this.updateProgress(percent);
            }
        }

        try {
            this.bgImage = await this.core.images.get('backgrounds/menu_bg.png');
        } catch (e) {
            console.warn('No se pudo cargar menu_bg.png, se usará color sólido');
            this.bgImage = null;
        }

        const progressDiv = document.getElementById('menu-progress');
        if (progressDiv) progressDiv.style.display = 'none';
        if (this.btn) this.btn.style.display = 'block';

        this.keyHandler = (e) => {
            if (this.gameStarting) return;
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.startGame();
            }
        };
        window.addEventListener('keydown', this.keyHandler);
    },

    onExit() {
        if (this.keyHandler) {
            window.removeEventListener('keydown', this.keyHandler);
        }
        if (this.btn && this.btn.parentNode) {
            this.btn.parentNode.removeChild(this.btn);
        }
        const progressDiv = document.getElementById('menu-progress');
        if (progressDiv) progressDiv.remove();
    },

    createButton() {
        const container = document.createElement('div');
        container.id = 'menu-container';
        container.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            z-index: 100;
        `;

        this.btn = document.createElement('button');
        this.btn.textContent = '▶ JUGAR';
        this.btn.style.cssText = `
            padding: 20px 40px;
            font-size: 24px;
            background: #4a6cf7;
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            box-shadow: 0 0 20px rgba(74,108,247,0.5);
            display: none;
        `;
        this.btn.addEventListener('click', () => this.startGame());

        const progressDiv = document.createElement('div');
        progressDiv.id = 'menu-progress';
        progressDiv.innerHTML = `
            <div style="color: white; margin-bottom: 10px;">Cargando recursos...</div>
            <div style="width: 300px; height: 20px; background: #333; border-radius: 10px; overflow: hidden;">
                <div id="progress-bar" style="width: 0%; height: 100%; background: #4a6cf7; transition: width 0.3s;"></div>
            </div>
            <div id="progress-text" style="color: white; margin-top: 5px;">0%</div>
        `;

        container.appendChild(progressDiv);
        container.appendChild(this.btn);
        document.body.appendChild(container);
    },

    updateProgress(percent) {
        const bar = document.getElementById('progress-bar');
        const text = document.getElementById('progress-text');
        if (bar) bar.style.width = percent + '%';
        if (text) text.textContent = percent + '%';
        console.log('Progreso:', percent + '%');
    },

    startGame() {
        if (this.gameStarting) return;
        this.gameStarting = true;
        console.log('Iniciando juego...');
        this.core.switchModule('rpg');
    },

    draw(ctx) {
        if (this.bgImage) {
            ctx.drawImage(this.bgImage, 0, 0, ctx.canvas.width, ctx.canvas.height);
        } else {
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 40px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('TORRE PROFUNDA', ctx.canvas.width/2, 100);
    }
};