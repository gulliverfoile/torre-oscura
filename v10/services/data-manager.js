// ============================================
// data-manager.js - Carga de YAML
// ============================================

export const dataManager = {
    core: null,
    cache: {},

    init(core) {
        this.core = core;
    },

    async load(name) {
        if (this.cache[name]) return this.cache[name];
        const url = `./data/${name}.yaml`;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('No encontrado');
            const text = await res.text();
            const data = window.jsyaml.load(text);
            this.cache[name] = data;
            console.log(`✅ ${name}.yaml cargado`);
            return data;
        } catch (e) {
            console.error(`Error cargando ${name}:`, e);
            return null;
        }
    }
};