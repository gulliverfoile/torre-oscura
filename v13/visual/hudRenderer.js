// ============================================
// hudRenderer.js - Dibuja HUD configurable
// ============================================

export class HUDRenderer {
    constructor(core, config) {
        this.core = core;
        this.config = config;
    }

    draw(ctx, player) {
        if (!player) return;
        const stats = [
            { key: 'hp', label: '❤️', current: player.hpCurrent, max: player.hpMax, color: this.config.colors.hp },
            { key: 'mp', label: '🔮', current: player.mpCurrent, max: player.mpMax, color: this.config.colors.mp },
            { key: 'sanity', label: '🧠', current: player.sanity, max: player.sanityMax, color: this.config.colors.sanity }
        ];
        stats.forEach((stat, i) => {
            const y = this.config.y + i * (this.config.size + this.config.spacing);
            if (this.config.style === 'bars') {
                this.drawBar(ctx, this.config.x, y, this.config.size, stat);
            } else {
                this.drawCircle(ctx, this.config.x + this.config.size/2, y + this.config.size/2, this.config.size, stat);
            }
        });
    }

    drawBar(ctx, x, y, height, stat) {
        const width = 150;
        const pct = stat.current / stat.max;
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, width, height);
        ctx.fillStyle = stat.color;
        ctx.fillRect(x, y, width * pct, height);
        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.fillText(`${stat.label} ${Math.floor(stat.current)}/${stat.max}`, x + width + 5, y + height - 2);
    }

    drawCircle(ctx, cx, cy, radius, stat) {
        const pct = stat.current / stat.max;
        const angle = pct * 2 * Math.PI;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#333';
        ctx.fill();
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, 0, angle);
        ctx.closePath();
        ctx.fillStyle = stat.color;
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.round(pct*100)}%`, cx, cy);
    }
}