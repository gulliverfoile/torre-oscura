// ============================================
// lootmanager.js - Generación de loot (con tablas y prefijos)
// ============================================
export class LootManager {
    constructor(enciclopedia, core) {
        this.enciclopedia = enciclopedia;
        this.core = core;
        this.tablas = {
            estandar: { comun: 70, raro: 24, epico: 5, legendario: 1 },
            cofre: { comun: 30, raro: 40, epico: 25, legendario: 5 },
            boss: { comun: 0, raro: 10, epico: 60, legendario: 30 }
        };
        this.colores = { comun: '#e0d9d0', raro: '#50b0ff', epico: '#9b59b6', legendario: '#ffd700' };
        this.prefijos = [
            { nombre: "Resistente", mod: { defensa: 2 } },
            { nombre: "Ligero", mod: { esquiva: 5, peso: -0.5 } },
            { nombre: "Vigoroso", mod: { vidaMax: 15 } },
        ];
        this.sufijos = [
            { nombre: "del Verdugo", mod: { F: 2 } },
            { nombre: "del Sabio", mod: { I: 2 } },
            { nombre: "de la Sombra", mod: { D: 2 } },
        ];
    }

    generar(tipoTabla = 'estandar', luckFactor = 1.0, piso = 0) {
        const tabla = { ...this.tablas[tipoTabla] || this.tablas.estandar };
        if (luckFactor > 1.0) {
            // Ajustar probabilidades
            for (let r in tabla) tabla[r] *= luckFactor;
        }

        const rng = Math.random() * 100;
        let acumulado = 0;
        let rareza = 'comun';
        for (const [r, prob] of Object.entries(tabla)) {
            acumulado += prob;
            if (rng <= acumulado) {
                rareza = r;
                break;
            }
        }

        const items = this.enciclopedia.objetos?.filter(o => o.rareza === rareza) || [];
        if (items.length === 0) return { id: 'objeto_dummy', nombre: 'Objeto misterioso', rareza, color: this.colores[rareza] };

        const base = { ...items[Math.floor(Math.random() * items.length)] };
        base.rareza = rareza;
        base.color = this.colores[rareza];

        if (rareza === 'raro' && Math.random() > 0.5) {
            const p = this.prefijos[Math.floor(Math.random() * this.prefijos.length)];
            this._aplicarModificador(base, p);
        } else if (rareza === 'epico') {
            const p = this.prefijos[Math.floor(Math.random() * this.prefijos.length)];
            const s = this.sufijos[Math.floor(Math.random() * this.sufijos.length)];
            this._aplicarModificador(base, p);
            this._aplicarModificador(base, s);
        } else if (rareza === 'legendario') {
            for (let i = 0; i < 2; i++) {
                const p = this.prefijos[Math.floor(Math.random() * this.prefijos.length)];
                this._aplicarModificador(base, p);
            }
            for (let i = 0; i < 2; i++) {
                const s = this.sufijos[Math.floor(Math.random() * this.sufijos.length)];
                this._aplicarModificador(base, s);
            }
        }

        return base;
    }

    _aplicarModificador(item, mod) {
        if (!item.modificadores) item.modificadores = {};
        for (let [key, val] of Object.entries(mod.mod)) {
            item.modificadores[key] = (item.modificadores[key] || 0) + val;
        }
        if (mod.nombre.startsWith('del ')) {
            item.nombre = `${item.nombre} ${mod.nombre}`;
        } else {
            item.nombre = `${mod.nombre} ${item.nombre}`;
        }
    }

    generarLoot(nivel, esBoss = false) {
        const loot = [];
        const probObjeto = esBoss ? 1.0 : 0.4;
        if (Math.random() < probObjeto) {
            loot.push(this.generar(esBoss ? 'boss' : 'estandar', 1.0, nivel));
        }
        return loot;
    }
}