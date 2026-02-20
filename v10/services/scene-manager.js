// ============================================
// scene-manager.js - Gestión de coordenadas y proyección
// ============================================

export const sceneManager = {
    core: null,
    worldWidth: 1000,
    worldHeight: 1000,
    viewportWidth: 800,
    viewportHeight: 400,
    offsetX: 0,
    offsetY: 0,
    scale: 1,

    init(core) {
        this.core = core;
        this.viewportWidth = core.canvas.width;
        this.viewportHeight = core.canvas.height;
    },

    // Convierte coordenadas del mundo a pantalla
    worldToScreen(worldX, worldY) {
        return {
            x: (worldX - this.offsetX) * this.scale,
            y: (worldY - this.offsetY) * this.scale
        };
    },

    // Establece el centro de la cámara en un punto del mundo
    setCenter(worldX, worldY) {
        this.offsetX = worldX - this.viewportWidth / (2 * this.scale);
        this.offsetY = worldY - this.viewportHeight / (2 * this.scale);
    },

    // Ajusta el zoom
    setZoom(scale) {
        this.scale = scale;
    }
};