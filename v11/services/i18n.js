// ============================================
// i18n.js - Internacionalización
// ============================================
console.log('🔥 i18n.js se está ejecutando');
const dictionaries = {
    es: {
        name: "Español",
        tabs: {
            aventura: "AVENTURA",
            heroe: "HÉROE",
            taller: "TALLER",
            tactica: "ECOS",
            log: "REGISTRO",
            misiones: "MISIONES",
            bestiario: "BESTIARIO",
            ingenieria: "INGENIERÍA"
        },
        system: {
            title: "TORRE PROFUNDA",
            loading: "Cargando...",
            game_over: "💀 HAS CAÍDO...",
            lang_selector: "Seleccionar Idioma"
        },
        exploration: {
            north: "Norte",
            south: "Sur",
            east: "Este",
            west: "Oeste",
            examine: "Examinar Sala",
            go_down: "Bajar de Piso",
            go_up: "Subir de Piso",
            trap: "⚠️ ¡TRAMPA!"
        },
        combat: {
            your_turn: "Tu turno",
            enemy_turn: "Turno enemigo",
            attack: "Atacar",
            skill: "Habilidad",
            flee: "Huir",
            victory: "¡VICTORIA!",
            defeat: "DERROTA"
        }
        // ... se puede completar con el resto del diccionario
    },
    en: {
        name: "English",
        tabs: {
            aventura: "ADVENTURE",
            heroe: "HERO",
            taller: "WORKSHOP",
            tactica: "ECHOES",
            log: "LOG",
            misiones: "MISSIONS",
            bestiario: "BESTIARY",
            ingenieria: "ENGINEERING"
        },
        system: {
            title: "DEEP TOWER",
            loading: "Loading...",
            game_over: "💀 YOU DIED...",
            lang_selector: "Select Language"
        },
        exploration: {
            north: "North",
            south: "South",
            east: "East",
            west: "West",
            examine: "Examine Room",
            go_down: "Go Downstairs",
            go_up: "Go Upstairs",
            trap: "⚠️ TRAP!"
        },
        combat: {
            your_turn: "Your turn",
            enemy_turn: "Enemy turn",
            attack: "Attack",
            skill: "Skill",
            flee: "Flee",
            victory: "VICTORY!",
            defeat: "DEFEAT"
        }
    }
};

export const i18n = {
    core: null,
    currentLang: 'es',
    dict: dictionaries.es,

    init(core) {
        this.core = core;
        this.setLanguage('es'); // por defecto
    },

    setLanguage(lang) {
        if (dictionaries[lang]) {
            this.currentLang = lang;
            this.dict = dictionaries[lang];
            this.core.emit('language:changed', lang);
        }
    },

    t(key, fallback = '') {
        const parts = key.split('.');
        let current = this.dict;
        for (let part of parts) {
            if (current[part] === undefined) return fallback || key;
            current = current[part];
        }
        return current;
    }
};