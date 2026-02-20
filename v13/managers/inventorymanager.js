// ============================================
// inventorymanager.js - Gestión de inventario y equipo
// ============================================
export class InventoryManager {
    constructor(core) {
        this.core = core;
    }

    anyadirItem(itemId, cant = 1, itemData = null) {
        const player = this.core.currentModuleObj?.player;
        if (!player) return;

        let itemObj = itemData;
        if (!itemObj) {
            const enciclopedia = this.core.currentModuleObj?.data?.enciclopedia;
            if (enciclopedia) {
                itemObj = enciclopedia.objetos?.find(o => o.id === itemId) || enciclopedia.materiales?.find(m => m.id === itemId);
            }
        }
        if (!itemObj) {
            itemObj = { id: itemId, nombre: 'Objeto desconocido', tipo: 'unknown' };
        }

        if (itemObj.tipo === 'consumible') {
            this.aplicarEfecto(itemObj, player);
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
    }

    aplicarEfecto(item, player) {
        if (item.id === 'pocion_vida') {
            player.hpCurrent = Math.min(player.hpMax, player.hpCurrent + 20);
            this.core.log('❤️ Recuperas 20 HP', 'positivo');
        } else if (item.id === 'pocion_mana') {
            player.mpCurrent = Math.min(player.mpMax, player.mpCurrent + 20);
            this.core.log('🔮 Recuperas 20 MP', 'positivo');
        }
    }

    quitarItem(itemId, cant = 1) {
        const player = this.core.currentModuleObj?.player;
        if (!player) return;
        const idx = player.inventario.findIndex(i => i.item_id === itemId);
        if (idx !== -1) {
            const itemNombre = player.inventario[idx].nombre;
            player.inventario[idx].cantidad -= cant;
            if (player.inventario[idx].cantidad <= 0) {
                player.inventario.splice(idx, 1);
            }
            this.core.log(`🗑️ Eliminado ${itemNombre} x${cant}`, 'info');
            this.core.emit('inventory:changed', player.inventario);
            this.core.emit('player:updated', player);
        }
    }

    getItemCount(itemId) {
        const player = this.core.currentModuleObj?.player;
        if (!player) return 0;
        const item = player.inventario.find(i => i.item_id === itemId);
        return item ? item.cantidad : 0;
    }

    equiparItem(itemId, nombre = null) {
        const player = this.core.currentModuleObj?.player;
        if (!player) return;
        const invIdx = player.inventario.findIndex(inv => 
            inv.item_id === itemId && (nombre === null || inv.nombre === nombre)
        );
        if (invIdx === -1) return;

        const invEntry = player.inventario[invIdx];
        const item = invEntry.data || this.core.currentModuleObj?.data?.enciclopedia.objetos.find(o => o.id === itemId);
        if (!item) return;

        const slot = item.ranura;
        const currentEquipped = player.equipo[slot];

        invEntry.cantidad--;
        if (invEntry.cantidad <= 0) player.inventario.splice(invIdx, 1);

        if (currentEquipped) {
            this.anyadirItem(currentEquipped.id, 1, currentEquipped);
        }

        player.equipo[slot] = item;
        this.core.log(`⚔️ Equipado: ${item.nombre} en ${slot}`, 'positivo');
        this.core.emit('inventory:changed', player.inventario);
        this.core.emit('player:updated', player);
    }

    desequiparItem(slot) {
        const player = this.core.currentModuleObj?.player;
        if (!player) return;
        const item = player.equipo[slot];
        if (!item) return;

        delete player.equipo[slot];
        this.anyadirItem(item.id, 1, item);
        this.core.log(`🛡️ Desequipado: ${item.nombre}`, 'sistema');
        this.core.emit('inventory:changed', player.inventario);
        this.core.emit('player:updated', player);
    }

    getInventoryList() {
        return this.core.currentModuleObj?.player?.inventario || [];
    }

    getEquipment() {
        return this.core.currentModuleObj?.player?.equipo || {};
    }
}