/**
 * OurHour - High-DPI Circadian & Celestial Dial
 * Renders sub-pixel solar trajectory, daylight arcs, and orbital Sun/Moon LED indicator.
 */

import { NormalizedTime } from '../core/types';

export class CircadianDial {
  private ctx: CanvasRenderingContext2D;
  private dpr: number;

  constructor(private canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Failed to get 2D canvas context');
    this.ctx = context;
    this.dpr = window.devicePixelRatio || 1;
    this.setupCanvas();

    window.addEventListener('resize', () => {
      this.setupCanvas();
    });
  }

  private setupCanvas(): void {
    const size = 440;
    this.canvas.width = size * this.dpr;
    this.canvas.height = size * this.dpr;
    if (typeof this.ctx.resetTransform === 'function') {
      this.ctx.resetTransform();
    } else {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    this.ctx.scale(this.dpr, this.dpr);
  }

  public render(data: NormalizedTime): void {
    const ctx = this.ctx;
    const cx = 220;
    const cy = 220;
    const outerRadius = 202;
    const innerRadius = 186;

    ctx.save();
    ctx.clearRect(0, 0, 440, 440);

    const isDay = data.phase === 'DAY' || data.phase === 'POLAR_DAY';

    // 1. Ambient Background Glow
    const bgGrad = ctx.createRadialGradient(cx, cy, 60, cx, cy, outerRadius * 1.05);
    if (isDay) {
      bgGrad.addColorStop(0, 'rgba(245, 158, 11, 0.12)');
      bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else {
      bgGrad.addColorStop(0, 'rgba(99, 102, 241, 0.12)');
      bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius * 1.05, 0, Math.PI * 2);
    ctx.fill();

    // 2. Base Bezel Dark Groove
    ctx.beginPath();
    ctx.arc(cx, cy, (outerRadius + innerRadius) / 2, 0, Math.PI * 2);
    ctx.strokeStyle = '#111622';
    ctx.lineWidth = outerRadius - innerRadius;
    ctx.stroke();

    // 3. Virtual Daylight Arc (06:00 to 18:00 = Top Half: Math.PI to 0)
    const dayGrad = ctx.createLinearGradient(cx - outerRadius, cy, cx + outerRadius, cy);
    dayGrad.addColorStop(0, '#F59E0B');
    dayGrad.addColorStop(0.5, '#FBBF24');
    dayGrad.addColorStop(1, '#F97316');

    ctx.beginPath();
    ctx.arc(cx, cy, (outerRadius + innerRadius) / 2, Math.PI, 0, false);
    ctx.strokeStyle = dayGrad;
    ctx.lineWidth = outerRadius - innerRadius;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 4. Virtual Night Arc (18:00 to 06:00 = Bottom Half: 0 to Math.PI)
    const nightGrad = ctx.createLinearGradient(cx + outerRadius, cy, cx - outerRadius, cy);
    nightGrad.addColorStop(0, '#6366F1');
    nightGrad.addColorStop(0.5, '#8B5CF6');
    nightGrad.addColorStop(1, '#38BDF8');

    ctx.beginPath();
    ctx.arc(cx, cy, (outerRadius + innerRadius) / 2, 0, Math.PI, false);
    ctx.strokeStyle = nightGrad;
    ctx.lineWidth = outerRadius - innerRadius;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 5. Cardinal Hour Ticks (06:00, 12:00, 18:00, 00:00)
    for (let h = 0; h < 24; h += 3) {
      const angle = ((h - 18) / 24) * Math.PI * 2;
      const isMajor = h % 6 === 0;
      const r1 = outerRadius + 2;
      const r2 = outerRadius + (isMajor ? 8 : 4);

      const x1 = cx + Math.cos(angle) * r1;
      const y1 = cy + Math.sin(angle) * r1;
      const x2 = cx + Math.cos(angle) * r2;
      const y2 = cy + Math.sin(angle) * r2;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = isMajor ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)';
      ctx.lineWidth = isMajor ? 2 : 1;
      ctx.stroke();
    }

    // 6. Orbital Sun / Moon LED Node
    const currentAngle = ((data.virtualHour - 18) / 24) * Math.PI * 2;
    const needleR = (outerRadius + innerRadius) / 2;
    const orbX = cx + Math.cos(currentAngle) * needleR;
    const orbY = cy + Math.sin(currentAngle) * needleR;

    // Glowing Halo
    ctx.beginPath();
    ctx.arc(orbX, orbY, 10, 0, Math.PI * 2);
    ctx.fillStyle = isDay ? '#FDE68A' : '#C7D2FE';
    ctx.shadowColor = isDay ? '#F59E0B' : '#6366F1';
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Center Core LED
    ctx.beginPath();
    ctx.arc(orbX, orbY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    ctx.restore();
  }
}
