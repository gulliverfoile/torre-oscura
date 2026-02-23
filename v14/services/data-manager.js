// ============================================
// services/data-manager.js - Carga de archivos YAML (versión con más logs)
// ============================================

export const dataManager = {
    core: null,
    cache: {},

    init(core) {
        this.core = core;
        console.log('📁 DataManager iniciado');
    },

    async load(name) {
        if (this.cache[name]) return this.cache[name];
        const url = `./data/${name}.yaml`;
        console.log(`📂 Intentando cargar: ${name}.yaml desde`, url);
        try {
            const res = await fetch(url);
            if (!res.ok) {
                console.error(`❌ Error HTTP ${res.status}: ${res.statusText} al cargar ${name}.yaml`);
                return null;
            }
            const text = await res.text();
            console.log(`📄 Contenido recibido (primeros 100 caracteres):`, text.substring(0, 100));
            console.log(`📄 Longitud del contenido: ${text.length} caracteres`);
            const data = window.jsyaml.load(text);
            this.cache[name] = data;
            console.log(`✅ ${name}.yaml cargado correctamente`);
            return data;
        } catch (e) {
            console.error(`❌ Error cargando ${name}:`, e);
            console.error('Mensaje del error:', e.message);
            console.error('Stack:', e.stack);
            return null;
        }
    }
};