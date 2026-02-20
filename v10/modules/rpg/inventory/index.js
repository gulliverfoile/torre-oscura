// ============================================
// modules/rpg/inventory/index.js - Inventario y equipo
// ============================================

export const inventoryManager = {
    parent: null,
    core: null,

    init(parent) {
        this.parent = parent;
        this.core = parent.core;
    },

    anyadirItem(itemId, cant = 1, itemData = null) {
        const player = this.parent.player;
        if (!player) return;

        let itemObj = itemData;
        if (!itemObj) {
            const enciclopedia = this.parent.data.enciclopedia;
            itemObj = enciclopedia.objetos?.find(o => o.id === itemId) ||
                      enciclopedia.materiales?.find(m => m.id === itemId);
        }
        if (!itemObj) {
            itemObj = { id: itemId, nombre: 'Objeto desconocido', tipo: 'unknown' };
        }

        if (itemObj.tipo === 'consumible') {
            this._aplicarEfecto(itemObj, player);
            this.core.log(`🧪 Usado: ${itemObj.nombre}`, 'info');
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
                peso: itemObj.peso || 0.1,
                data: itemObj,
                tipo: itemObj.tipo
            });
        }
        this.core.log(`📦 Añadido ${itemObj.nombre} x${cant}`, 'info');
        this.core.emit('inventory:changed', player.inventario);
        this.core.emit('player:updated', player);
    },

    _aplicarEfecto(item, player) {
        if (item.id === 'pocion_vida') {
            player.hpCurrent = Math.min(player.hpMax, player.hpCurrent + 20);
            this.core.log('❤️ +20 HP', 'positivo');
        } else if (item.id === 'pocion_mana') {
            player.mpCurrent = Math.min(player.mpMax, player.mpCurrent + 20);
            this.core.log('🔮 +20 MP', 'positivo');
        }
    },

    quitarItem(itemId, cant = 1) {
        const player = this.parent.player;
        if (!player) return;
        const idx = player.inventario.findIndex(i => i.item_id === itemId);
        if (idx !== -1) {
            const item = player.inventario[idx];
            item.cantidad -= cant;
            if (item.cantidad <= 0) {
                player.inventario.splice(idx, 1);
            }
            this.core.log(`🗑️ Eliminado ${item.nombre} x${cant}`, 'info');
            this.core.emit('inventory:changed', player.inventario);
            this.core.emit('player:updated', player);
        }
    },

    equiparItem(itemId) {
        const player = this.parent.player;
        const idx = player.inventario.findIndex(i => i.item_id === itemId);
        if (idx === -1) return;
        const item = player.inventario[idx];
        const itemData = item.data;
        if (!itemData.ranura) return;

        const slot = itemData.ranura;
        const currentEquipped = player.equipo[slot];

        item.cantidad--;
        if (item.cantidad <= 0) player.inventario.splice(idx, 1);

        if (currentEquipped) {
            this.anyadirItem(currentEquipped.id, 1, currentEquipped);
        }

        player.equipo[slot] = itemData;
        this.core.log(`⚔️ Equipado: ${itemData.nombre} en ${slot}`, 'positivo');
        this.core.emit('inventory:changed', player.inventario);
        this.core.emit('player:updated', player);
    },

    desequiparItem(slot) {
        const player = this.parent.player;
        const item = player.equipo[slot];
        if (!item) return;
        delete player.equipo[slot];
        this.anyadirItem(item.id, 1, item);
        this.core.log(`🛡️ Desequipado: ${item.nombre}`, 'sistema');
        this.core.emit('inventory:changed', player.inventario);
        this.core.emit('player:updated', player);
    },

    getInventoryList() {
        return this.parent.player?.inventario || [];
    },

    getEquipment() {
        return this.parent.player?.equipo || {};
    }
};