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
        if (!this.container) {
            console.warn('⚠️ Elemento #inv-render no encontrado');
        } else {
            console.log('✅ InventoryPanel listo');
        }
    },

    update(inventory) {
        if (!this.container) return;
        let html = '<div style="display:flex; flex-direction:column; gap:5px;">';
        inventory.forEach(inv => {
            const item = inv.data || {};
            html += `
                <div style="border-left:3px solid #0f0; background:#111; padding:5px;">
                    <div style="display:flex; justify-content:space-between;">
                        <b>${inv.nombre} x${inv.cantidad}</b>
                        ${item.ranura ? `<button class="equip-btn" onclick="window.core.modules.rpg.inventory.equiparItem('${inv.item_id}')">EQUIPAR</button>` : ''}
                        ${item.tipo === 'consumible' ? `<button class="equip-btn" onclick="window.core.modules.rpg.inventory.aplicarEfecto(${JSON.stringify(item).replace(/'/g, "&apos;")})">USAR</button>` : ''}
                    </div>
                </div>
            `;
        });
        html += '</div>';
        this.container.innerHTML = html;
    }
};