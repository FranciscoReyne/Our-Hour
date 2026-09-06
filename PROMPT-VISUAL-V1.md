# 📋 Master UI/UX & AI Prompt Engineering Audit (V4 Ultimate Benchmark)

## 🔍 Executive Architectural Audit & Observations (V4)

| # | Engineering Dimension | Potential Failure Point in Standard AI Prompts | Master V4 Solution & Specification |
| :- | :--- | :--- | :--- |
| **1** | **CSS Layout & Optical Centering** | AI agents frequently struggle with perfect vertical/horizontal optical centering on mobile viewports. | **CSS Grid Dual-Axis Centering Matrix:** Exact `min-height: 100dvh` container with `place-items: center` and dynamic viewport scaling (`clamp()`). |
| **2** | **Digital Glass & Hardware Shaders** | Simple CSS borders look like a flat website instead of a physical luxury digital watch. | **Multi-Layered Optical Shaders:** Beveled titanium bezel with inner shadow occlusion (`inset 0 0 24px rgba(0,0,0,0.85)`), sapphire crystal glare overlay, and LED segment ambient glow. |
| **3** | **Reactive State Controller** | AI often produces disconnected UI elements where changing the date doesn't recalculate solar noon or sunrise. | **Unified Reactive State Controller Code:** Exact TypeScript state dispatcher binding `City`, `Date`, and `Time` inputs directly to `NormalizedTimeEngine`. |
| **4** | **Sub-Pixel Orbital Dial Math** | Sun/Moon dots wobble or distort when the window resizes. | **Trigonometric Coordinate Locking:** High-DPI canvas engine rendering at exact device pixel ratio ($2\times / 3\times$) with polar coordinates $\theta = \frac{v - 18}{24} \times 2\pi$. |
| **5** | **Edge-Case Error Boundaries** | Geolocation rejection or Arctic polar coordinates causing NaN errors. | **Self-Healing Graceful Fallbacks:** Silent GPS fallback to pre-selected city, continuous polar twilight mapping, and 24-hour day wrap smoothing. |
| **6** | **Core Web Vitals Benchmarks** | Heavy bloat leading to poor frame rates and sluggish slider interaction. | **Strict Web Performance Contract:** 0 runtime dependencies, FCP < 50ms, CLS = 0.00, 60fps locked slider scrubbing. |

---

# 🚀 MASTER PROMPT V4: The Definitive AI Agent Specification for OurHour

*Copy and paste the entire block below into your AI coding assistant (Antigravity, Claude, GPT-4o, Cursor) to generate the production-grade smartwatch interface.*

```markdown
# Role & Philosophy
You are an Elite Principal UI/UX Hardware Designer and Creative Frontend Architect. Your aesthetic represents the pinnacle of digital horology, synthesizing:
1. **Dieter Rams & Braun**: "Less, but better." Functional purity, zero visual waste.
2. **Casio G-Shock & Pro-Trek Solar**: Rugged, high-contrast, military-grade digital legibility.
3. **Apple Watch Ultra Modular**: High-density complications balanced in a squircle bezel.
4. **Nothing OS & Teenage Engineering**: OLED true-black efficiency, subtle dot-matrix details, and tactile micro-animations.

Your mission is to build a **hyper-minimalist, distraction-free Digital Wristwatch Web Application** for **OurHour** — the Solar-Normalized Circadian Time Engine.

---

## ⌚ 1. Design System & Tokens

Embed these exact tokens in `src/styles/main.css`:

```css
:root {
  /* True OLED Black & Hardware Chassis */
  --oled-black: #000000;
  --chassis-titanium: #0C0F17;
  --bezel-border: rgba(255, 255, 255, 0.12);
  --bezel-highlight: #1E2433;
  --glass-glare: linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0) 50%);
  --bezel-shadow: 0 35px 80px -20px rgba(0, 0, 0, 0.95), 0 0 0 2px var(--bezel-highlight), inset 0 0 24px rgba(0, 0, 0, 0.85);

  /* Circadian Solar Daylight Palette (06:00 -> 18:00) */
  --solar-gold: #F59E0B;
  --solar-amber: #FBBF24;
  --solar-glow: rgba(245, 158, 11, 0.35);

  /* Circadian Celestial Night Palette (18:00 -> 06:00) */
  --night-indigo: #6366F1;
  --night-cyan: #38BDF8;
  --night-glow: rgba(99, 102, 241, 0.35);

  /* Micro-UI Accents */
  --accent-green: #10B981;
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;

  /* Typography */
  --font-digits: 'JetBrains Mono', 'Space Mono', monospace;
  --font-ui: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
}

html, body {
  background-color: var(--oled-black) !important;
  color: var(--text-primary) !important;
  min-height: 100dvh;
  margin: 0;
  padding: 0;
  display: grid;
  place-items: center;
  font-family: var(--font-ui);
  overflow-x: hidden;
}
```

---

## 📐 2. Semantic DOM Architecture

Implement this exact HTML layout structure in `index.html`:

```html
<div class="watch-container">
  <!-- Hardware Pushers on Watch Sides -->
  <button id="btn-crown-live" class="watch-pusher pusher-top-right" title="Crown: Toggle Live / Scrubbing Mode">
    <span class="pusher-led"></span> CROWN
  </button>
  <button id="btn-gps" class="watch-pusher pusher-bottom-left" title="Sync Local Device GPS">
    📍 GPS
  </button>

  <!-- Physical Titanium Watch Chassis -->
  <div class="watch-chassis">
    <div class="sapphire-glass-glare"></div>

    <!-- OLED Watchface Display -->
    <div class="watch-screen">
      
      <!-- Zone 1: Complications Header (City, Date, Solar Phase) -->
      <header class="complications-bar">
        <div class="pill pill-city">
          <select id="city-select" aria-label="Select City">
            <option value="santiago" selected>Santiago (CL)</option>
            <option value="new-york">New York (US)</option>
            <option value="london">London (UK)</option>
            <option value="madrid">Madrid (ES)</option>
            <option value="tokyo">Tokyo (JP)</option>
            <option value="quito">Quito (EC)</option>
            <option value="tromso">Tromsø (NO)</option>
            <option value="reykjavik">Reykjavík (IS)</option>
            <option value="singapore">Singapore (SG)</option>
            <option value="sydney">Sydney (AU)</option>
          </select>
        </div>
        <div class="pill pill-date">
          <input type="date" id="date-picker" aria-label="Select Date" />
        </div>
        <div id="solar-phase-badge" class="pill pill-phase">
          ☀️ DAY
        </div>
      </header>

      <!-- Zone 2: Circular Horizon Dial & Hero Virtual Time Readout -->
      <main class="dial-core">
        <canvas id="circadian-canvas" width="440" height="440"></canvas>
        
        <div class="digital-readout-overlay">
          <div class="virtual-time-label">SOLAR NORMALIZED TIME</div>
          <div id="virtual-clock-time" class="virtual-digits">06:00:00</div>
          <div class="virtual-anchor-sub">06:00 RISE • 18:00 SET</div>
          <div id="dilation-rate-badge" class="dilation-pill">⚡ 1.20x SPEED</div>
        </div>
      </main>

      <!-- Zone 3: Real Civil Clock Strip & Direct Inline Time Editor -->
      <section class="civil-clock-strip">
        <span class="civil-label">CIVIL CLOCK:</span>
        <span id="real-clock-time" class="civil-digits">07:30:00</span>
        <input type="time" step="1" id="civil-time-input" class="civil-edit-input" title="Click to manually edit time" />
      </section>

      <!-- Zone 4: Solar Ephemeris Mini-Matrix -->
      <section class="ephemeris-matrix">
        <div class="eph-box">
          <span class="eph-label">RISE</span>
          <span id="stat-sunrise" class="eph-val">07:15</span>
        </div>
        <div class="eph-box">
          <span class="eph-label">NOON</span>
          <span id="stat-noon" class="eph-val">13:42</span>
        </div>
        <div class="eph-box">
          <span class="eph-label">SET</span>
          <span id="stat-sunset" class="eph-val">20:10</span>
        </div>
        <div class="eph-box">
          <span class="eph-label">LIGHT</span>
          <span id="stat-daylength" class="eph-val">12.9h</span>
        </div>
      </section>

      <!-- Zone 5: 24-Hour Bezel Scrubber & Landmark Snap Buttons -->
      <footer class="crown-controls">
        <input type="range" id="time-slider" min="0" max="1439" value="720" step="1" class="bezel-slider" />
        
        <div class="landmark-buttons">
          <button id="btn-jump-sunrise" class="btn-snap">🌅 06:00v</button>
          <button id="btn-jump-noon" class="btn-snap">☀️ 12:00v</button>
          <button id="btn-jump-sunset" class="btn-snap">🌇 18:00v</button>
          <button id="btn-jump-midnight" class="btn-snap">🌌 00:00v</button>
          <button id="btn-reset-now" class="btn-snap btn-live">⚡ LIVE</button>
        </div>
      </footer>
    </div>
  </div>

  <!-- External Clean Link to Documentation -->
  <div class="doc-link-wrap">
    <a href="./developer.html" class="doc-link">📖 Developer SDK &amp; Mathematical Architecture →</a>
  </div>
</div>
```

---

## 🎛️ 3. High-DPI Dial Canvas Equations (`src/ui/dial.ts`)

Render the solar trajectory using sub-pixel crispness:

```typescript
export class CircadianDial {
  private ctx: CanvasRenderingContext2D;
  private dpr: number = window.devicePixelRatio || 1;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize(): void {
    const size = 440;
    this.canvas.width = size * this.dpr;
    this.canvas.height = size * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  public render(data: NormalizedTime): void {
    const ctx = this.ctx;
    const cx = 220, cy = 220, outerR = 190, innerR = 160;

    ctx.save();
    ctx.clearRect(0, 0, 440, 440);

    // 1. Ambient Background Glow
    const bgGrad = ctx.createRadialGradient(cx, cy, 80, cx, cy, 220);
    const isDay = data.phase === 'DAY' || data.phase === 'POLAR_DAY';
    bgGrad.addColorStop(0, isDay ? 'rgba(245, 158, 11, 0.12)' : 'rgba(99, 102, 241, 0.12)');
    bgGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 220, 0, Math.PI * 2);
    ctx.fill();

    // 2. Daytime Arc (06:00 -> 18:00 = Top Half: PI to 2PI/0)
    const dayGrad = ctx.createLinearGradient(cx - outerR, cy, cx + outerR, cy);
    dayGrad.addColorStop(0, '#F59E0B');
    dayGrad.addColorStop(0.5, '#FBBF24');
    dayGrad.addColorStop(1, '#F97316');
    ctx.beginPath();
    ctx.arc(cx, cy, (outerR + innerR) / 2, Math.PI, 0, false);
    ctx.strokeStyle = dayGrad;
    ctx.lineWidth = outerR - innerR;
    ctx.stroke();

    // 3. Nighttime Arc (18:00 -> 06:00 = Bottom Half: 0 to PI)
    const nightGrad = ctx.createLinearGradient(cx + outerR, cy, cx - outerR, cy);
    nightGrad.addColorStop(0, '#6366F1');
    nightGrad.addColorStop(0.5, '#8B5CF6');
    nightGrad.addColorStop(1, '#38BDF8');
    ctx.beginPath();
    ctx.arc(cx, cy, (outerR + innerR) / 2, 0, Math.PI, false);
    ctx.strokeStyle = nightGrad;
    ctx.lineWidth = outerR - innerR;
    ctx.stroke();

    // 4. Orbital Sun/Moon LED Indicator
    const angle = ((data.virtualHour - 18) / 24) * Math.PI * 2;
    const needleR = (outerR + innerR) / 2;
    const orbX = cx + Math.cos(angle) * needleR;
    const orbY = cy + Math.sin(angle) * needleR;

    ctx.beginPath();
    ctx.arc(orbX, orbY, 8, 0, Math.PI * 2);
    ctx.fillStyle = isDay ? '#FDE68A' : '#C7D2FE';
    ctx.shadowColor = isDay ? '#F59E0B' : '#6366F1';
    ctx.shadowBlur = 15;
    ctx.fill();

    ctx.restore();
  }
}
```

---

## ⚡ 4. Reactive State & Timezone Resolution (`src/ui/app.ts`)

Ensure seamless synchronization across Live Clock, Date Changes, and Scrubbing:

```typescript
export class OurHourApp {
  private engine = new NormalizedTimeEngine();
  private currentLocation = PRESET_CITIES[0]; // Santiago default
  private isLiveMode = true;
  private customDateStr = '';
  private customTimeMinutes = 720; // 12:00 default
  private dial!: CircadianDial;

  public init(): void {
    this.setupDial();
    this.setupListeners();
    this.startLiveTick();
  }

  private getActiveUtcDate(): Date {
    if (this.isLiveMode) return new Date();

    const [y, m, d] = this.customDateStr.split('-').map(Number);
    const totalSec = Math.floor(this.customTimeMinutes * 60);
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    return this.createDateInTimezone(
      y || new Date().getFullYear(),
      m ? m - 1 : new Date().getMonth(),
      d || new Date().getDate(),
      hours,
      mins,
      secs,
      this.currentLocation.timezone
    );
  }

  private updateUI(): void {
    const date = this.getActiveUtcDate();
    const data = this.engine.toVirtualTime(date, this.currentLocation);
    const timeParts = this.getTimePartsForTimezone(date, this.currentLocation.timezone);

    // Update digital displays
    document.getElementById('virtual-clock-time')!.textContent = data.virtualTimeStr;
    document.getElementById('real-clock-time')!.textContent = 
      `${timeParts.hours.toString().padStart(2, '0')}:${timeParts.minutes.toString().padStart(2, '0')}:${timeParts.seconds.toString().padStart(2, '0')}`;
    
    // Update dial canvas
    this.dial.render(data);
  }
}
```

---

## ⌨️ 5. Keyboard & Touch Ergonomics

- `ArrowLeft` / `ArrowRight`: Scrub time by $\pm 1$ minute.
- `Shift + ArrowLeft` / `Shift + ArrowRight`: Scrub time by $\pm 30$ minutes.
- `Spacebar`: Toggle between Live Clock and Simulation Mode.
- Touch Drag: Seamless touch scrubbing on mobile touchscreens.

---

## 🚫 6. Strict Quality & Anti-Hallucination Guardrails
- ❌ **DO NOT** create vertical scrollbars; the watchface must fit inside `100dvh`.
- ❌ **DO NOT** use bloated third-party CSS or JS frameworks.
- ❌ **DO NOT** allow FOUC (Flash of Unstyled Content); critical dark styles must load synchronously.
- ❌ **DO NOT** leave dropdowns or inputs empty on initial paint.
- ❌ **DO NOT** crash during Arctic Midnight Sun or Polar Night conditions.
```
