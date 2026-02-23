// ============================================
// imagemanager.js - Gestor centralizado de imágenes
// ============================================
export class ImageManager {
    constructor(core) {
        this.core = core;
        this.cache = new Map();
    }

    async get(path) {
        if (this.cache.has(path)) return this.cache.get(path);
        try {
            const img = await this.core.assets.getImage(path);
            this.cache.set(path, img);
            return img;
        } catch (e) {
            console.error(`Error cargando imagen ${path}:`, e);
            return this.getPlaceholder();
        }
    }

    async getPlaceholder() {
        if (this.cache.has('__placeholder')) return this.cache.get('__placeholder');
        return new Promise(resolve => {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ff00ff';
            ctx.fillRect(0, 0, 64, 64);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 30px monospace';
            ctx.fillText('?', 20, 45);
            const img = new Image();
            img.onload = () => {
                this.cache.set('__placeholder', img);
                resolve(img);
            };
            img.src = canvas.toDataURL();
        });
    }

    clear() {
        this.cache.clear();
    }
}