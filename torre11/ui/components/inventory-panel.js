// ============================================
// ui/components/inventory-panel.js - Panel de inventario
// ============================================

export const inventoryPanel = {
    core: null,
    ui: null,
    container: null,

    init(core, ui) {
        this.core = core;
        this.ui = ui;
        this.container = document.getElementById('inv-render');
        if (!this.container) console.warn('⚠️ Elemento #inv-render no encontrado');
        console.log('🎒 InventoryPanel listo');
    },

    update(inventory) {
        if (!this.container) return;
        let html = '<div class="inv-container">';
        inventory.forEach(inv => {
            const item = inv.data;
            html += `
                <div class="item-card">
                    <div><b>${inv.nombre} x${inv.cantidad}</b></div>
                    ${item?.ranura ? `<button class="equip-btn" onclick="window.core.modules.rpg.inventory.equiparItem('${inv.item_id}')">EQUIPAR</button>` : ''}
                    ${item?.tipo === 'consumible' ? `<button class="equip-btn" onclick="window.core.modules.rpg.inventory.aplicarEfecto(${JSON.stringify(item)})">USAR</button>` : ''}
                </div>
            `;
        });
        html += '</div>';
        this.container.innerHTML = html;
    }
};