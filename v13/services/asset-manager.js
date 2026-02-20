// ============================================
// services/asset-manager.js - Gestión unificada de assets (imágenes)
// ============================================

export const assetManager = {
    core: null,
    cache: new Map(),

    init(core) {
        this.core = core;
        console.log('📦 AssetManager iniciado');
    },

    async getAsset(path, type = 'image') {
        if (this.cache.has(path)) return this.cache.get(path);

        // Si es una URL externa, usarla directamente; si no, ruta local
        const url = path.startsWith('http') ? path : `./assets/${path}`;
        console.log(`🔍 Cargando asset: ${url}`);

        try {
            let asset;
            if (type === 'image') {
                asset = await this._loadImage(url);
            } else {
                // Para otros tipos (audio, etc.) se puede extender después
                asset = await fetch(url).then(r => r.blob());
            }
            this.cache.set(path, asset);
            console.log(`✅ Asset cargado: ${path}`);
            return asset;
        } catch (e) {
            console.warn(`⚠️ Error cargando asset ${path}, usando placeholder`);
            return this._getPlaceholder();
        }
    },

    _loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    },

    _getPlaceholder() {
        if (this.cache.has('__placeholder')) return this.cache.get('__placeholder');
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ff00ff'; // Magenta para que sea obvio
        ctx.fillRect(0, 0, 64, 64);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 30px monospace';
        ctx.fillText('?', 20, 45);
        const img = new Image();
        img.src = canvas.toDataURL();
        this.cache.set('__placeholder', img);
        console.log('🔄 Usando placeholder');
        return img;
    },

    clear() {
        this.cache.clear();
        console.log('🧹 Caché de assets limpiada');
    }
};