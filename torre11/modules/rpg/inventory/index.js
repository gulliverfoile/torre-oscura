// ============================================
// modules/rpg/inventory/index.js - Inventario y equipo
// ============================================

export const inventoryManager = {
    rpg: null,
    core: null,

    init(rpg) {
        this.rpg = rpg;
        this.core = rpg.core;
        console.log('🎒 InventoryManager iniciado');
    },

    anyadirItem(itemId, cant = 1, itemData = null) {
        const player = this.rpg.character.player;
        if (!player) return;
        let itemObj = itemData;
        if (!itemObj) {
            itemObj = this.rpg.data.enciclopedia.objetos?.find(o => o.id === itemId);
        }
        if (!itemObj) {
            console.warn('⚠️ Objeto no encontrado en enciclopedia:', itemId);
            itemObj = { id: itemId, nombre: 'Objeto desconocido', tipo: 'unknown' };
        }

        if (itemObj.tipo === 'consumible') {
            this.aplicarEfecto(itemObj);
            return;
        }

        const existente = player.inventario.find(i => i.item_id === itemId);
        if (existente) {
            existente.cantidad += cant;
        } else {
            player.inventario.push({
                item_id: itemId,
                nombre: itemObj.nombre,
                cantidad: cant,
                data: itemObj,
                tipo: itemObj.tipo
            });
        }
        this.core.log(`📦 Añadido ${itemObj.nombre} x${cant}`, 'info');
        this.core.emit('inventory:changed', player.inventario);
        this.core.emit('player:updated', player);
    },

    aplicarEfecto(item) {
        const player = this.rpg.character.player;
        if (item.id === 'pocion_vida') {
            player.hpCurrent = Math.min(player.hpMax, player.hpCurrent + 20);
            this.core.log('❤️ Recuperas 20 HP', 'positivo');
        } else if (item.id === 'pocion_mana') {
            player.mpCurrent = Math.min(player.mpMax, player.mpCurrent + 20);
            this.core.log('🔮 Recuperas 20 MP', 'positivo');
        }
        this.core.emit('player:updated', player);
    },

    equiparItem(itemId, nombre = null) {
        const player = this.rpg.character.player;
        const invIdx = player.inventario.findIndex(inv => inv.item_id === itemId && (nombre === null || inv.nombre === nombre));
        if (invIdx === -1) return;
        const invEntry = player.inventario[invIdx];
        const item = invEntry.data;
        if (!item || !item.ranura) return;
        const slot = item.ranura;
        const current = player.equipo[slot];
        invEntry.cantidad--;
        if (invEntry.cantidad <= 0) player.inventario.splice(invIdx, 1);
        if (current) {
            this.anyadirItem(current.id, 1, current);
        }
        player.equipo[slot] = item;
        this.core.log(`⚔️ Equipado: ${item.nombre} en ${slot}`, 'positivo');
        this.core.emit('inventory:changed', player.inventario);
        this.core.emit('player:updated', player);
    },

    desequiparItem(slot) {
        const player = this.rpg.character.player;
        const item = player.equipo[slot];
        if (!item) return;
        delete player.equipo[slot];
        this.anyadirItem(item.id, 1, item);
        this.core.log(`🛡️ Desequipado: ${item.nombre}`, 'sistema');
        this.core.emit('inventory:changed', player.inventario);
        this.core.emit('player:updated', player);
    },

    getInventoryList() {
        return this.rpg.character.player?.inventario || [];
    },

    getEquipment() {
        return this.rpg.character.player?.equipo || {};
    }
};