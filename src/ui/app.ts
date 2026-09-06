/**
 * OurHour - Smartwatch App State Controller
 */

import { NormalizedTimeEngine } from '../core/engine';
import { PRESET_CITIES, CityPreset } from '../core/cities';
import { CircadianDial } from './dial';

export class OurHourApp {
  private engine: NormalizedTimeEngine = new NormalizedTimeEngine();
  private currentLocation: CityPreset = PRESET_CITIES[0]; // Santiago default
  private isLiveMode: boolean = true;
  private customDateStr: string = '';
  private customTimeMinutes: number = 720; // 12:00 default in minutes
  private dial!: CircadianDial;
  private timerId: number | null = null;

  public init(): void {
    this.setupCitySelector();
    this.setupDial();
    this.setupControls();
    this.setupKeyboardShortcuts();
    this.startLiveTick();
  }

  public destroy(): void {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private setupCitySelector(): void {
    const select = document.getElementById('city-select') as HTMLSelectElement | null;
    if (!select) return;

    select.value = this.currentLocation.id;
    select.addEventListener('change', () => {
      const selected = PRESET_CITIES.find(c => c.id === select.value);
      if (selected) {
        this.currentLocation = selected;
        this.customDateStr = this.getLocalDateStringForTimezone(new Date(), this.currentLocation.timezone);
        const parts = this.getTimePartsForTimezone(new Date(), this.currentLocation.timezone);
        this.customTimeMinutes = parts.hours * 60 + parts.minutes + parts.seconds / 60;
        this.updateUI();
      }
    });
  }

  private setupDial(): void {
    const canvas = document.getElementById('circadian-canvas') as HTMLCanvasElement | null;
    if (canvas) {
      this.dial = new CircadianDial(canvas);
    }
  }

  private setupControls(): void {
    const dateInput = document.getElementById('date-picker') as HTMLInputElement | null;
    const timeInput = document.getElementById('civil-time-input') as HTMLInputElement | null;
    const liveBtn = document.getElementById('btn-reset-now') as HTMLButtonElement | null;
    const crownBtn = document.getElementById('btn-crown-live') as HTMLButtonElement | null;
    const gpsBtn = document.getElementById('btn-gps') as HTMLButtonElement | null;
    const slider = document.getElementById('time-slider') as HTMLInputElement | null;

    // Initialize date and time to current city timezone immediately
    const initialNow = new Date();
    const initialParts = this.getTimePartsForTimezone(initialNow, this.currentLocation.timezone);
    this.customDateStr = this.getLocalDateStringForTimezone(initialNow, this.currentLocation.timezone);
    this.customTimeMinutes = initialParts.hours * 60 + initialParts.minutes + initialParts.seconds / 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedInitialTime = `${pad(initialParts.hours)}:${pad(initialParts.minutes)}:${pad(initialParts.seconds)}`;

    if (dateInput) {
      dateInput.value = this.customDateStr;
      dateInput.addEventListener('change', () => {
        if (dateInput.value) {
          this.customDateStr = dateInput.value;
          this.isLiveMode = false;
          this.updateLiveButtonState();
          this.updateUI();
        }
      });
    }

    // Click anywhere on date pill opens picker
    const datePill = document.querySelector('.pill-date') as HTMLElement | null;
    if (datePill && dateInput) {
      datePill.addEventListener('click', (e) => {
        if (e.target !== dateInput && typeof (dateInput as any).showPicker === 'function') {
          try {
            (dateInput as any).showPicker();
          } catch {
            dateInput.focus();
          }
        }
      });
    }

    // Direct Time Input Listener
    if (timeInput) {
      timeInput.value = formattedInitialTime;
      timeInput.addEventListener('input', () => {
        const val = timeInput.value;
        if (val) {
          const [h, m, s] = val.split(':').map(Number);
          this.customTimeMinutes = (h || 0) * 60 + (m || 0) + (s || 0) / 60;
          this.isLiveMode = false;
          this.updateLiveButtonState();
          this.updateUI();
        }
      });
    }

    // Scrubber Slider
    if (slider) {
      slider.value = (initialParts.hours * 60 + initialParts.minutes).toString();
      slider.addEventListener('input', () => {
        this.customTimeMinutes = Number(slider.value);
        this.isLiveMode = false;
        this.updateLiveButtonState();
        this.updateUI();
      });
    }

    // Live Mode Toggles
    const toggleLive = () => {
      this.isLiveMode = !this.isLiveMode;
      this.updateLiveButtonState();
      this.updateUI();
    };

    if (liveBtn) liveBtn.addEventListener('click', toggleLive);
    if (crownBtn) crownBtn.addEventListener('click', toggleLive);

    // GPS Locate
    if (gpsBtn) {
      gpsBtn.addEventListener('click', () => {
        if ('geolocation' in navigator) {
          gpsBtn.textContent = '🛰️ ...';
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              this.currentLocation = {
                id: 'custom-gps',
                name: 'My GPS',
                country: 'Local',
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                description: 'Local Device Coordinates'
              };
              gpsBtn.textContent = '📍 GPS';
              this.updateUI();
            },
            () => {
              gpsBtn.textContent = '📍 GPS';
            }
          );
        }
      });
    }

    // Landmark Jump Buttons
    const jumpSunrise = document.getElementById('btn-jump-sunrise');
    const jumpNoon = document.getElementById('btn-jump-noon');
    const jumpSunset = document.getElementById('btn-jump-sunset');
    const jumpMidnight = document.getElementById('btn-jump-midnight');

    const jumpToSolarEvent = (event: 'sunrise' | 'noon' | 'sunset' | 'midnight') => {
      const activeDate = this.getActiveUtcDate();
      const solarTimes = this.engine.getSolarTimes(activeDate, this.currentLocation);
      let targetDate: Date | null = null;

      if (event === 'sunrise') targetDate = solarTimes.sunrise;
      else if (event === 'noon') targetDate = solarTimes.solarNoon;
      else if (event === 'sunset') targetDate = solarTimes.sunset;
      else if (event === 'midnight') targetDate = solarTimes.solarMidnight;

      if (targetDate) {
        const parts = this.getTimePartsForTimezone(targetDate, this.currentLocation.timezone);
        this.customTimeMinutes = parts.hours * 60 + parts.minutes + parts.seconds / 60;
        this.isLiveMode = false;
        this.updateLiveButtonState();
        this.updateUI();
      }
    };

    if (jumpSunrise) jumpSunrise.addEventListener('click', () => jumpToSolarEvent('sunrise'));
    if (jumpNoon) jumpNoon.addEventListener('click', () => jumpToSolarEvent('noon'));
    if (jumpSunset) jumpSunset.addEventListener('click', () => jumpToSolarEvent('sunset'));
    if (jumpMidnight) jumpMidnight.addEventListener('click', () => jumpToSolarEvent('midnight'));
  }

  private setupKeyboardShortcuts(): void {
    window.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        this.isLiveMode = !this.isLiveMode;
        this.updateLiveButtonState();
        this.updateUI();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const delta = e.shiftKey ? 30 : 1;
        this.customTimeMinutes = (this.customTimeMinutes + delta) % 1440;
        this.isLiveMode = false;
        this.updateLiveButtonState();
        this.updateUI();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const delta = e.shiftKey ? 30 : 1;
        this.customTimeMinutes = (this.customTimeMinutes - delta + 1440) % 1440;
        this.isLiveMode = false;
        this.updateLiveButtonState();
        this.updateUI();
      }
    });
  }

  private startLiveTick(): void {
    this.updateUI();
    this.timerId = window.setInterval(() => {
      if (this.isLiveMode) {
        this.updateUI();
      }
    }, 1000);
  }

  private updateLiveButtonState(): void {
    const liveBtn = document.getElementById('btn-reset-now');
    const crownBtn = document.getElementById('btn-crown-live');

    if (liveBtn) {
      if (this.isLiveMode) {
        liveBtn.classList.remove('btn-snap');
        liveBtn.classList.add('btn-live');
        liveBtn.textContent = '⚡ LIVE';
      } else {
        liveBtn.classList.remove('btn-live');
        liveBtn.classList.add('btn-snap');
        liveBtn.textContent = '⚡ SNAP';
      }
    }

    if (crownBtn) {
      const led = crownBtn.querySelector('.pusher-led') as HTMLElement | null;
      if (led) {
        led.style.background = this.isLiveMode ? '#10B981' : '#F59E0B';
        led.style.boxShadow = this.isLiveMode ? '0 0 8px #10B981' : '0 0 8px #F59E0B';
      }
    }
  }

  private getActiveUtcDate(): Date {
    if (this.isLiveMode) return new Date();

    const [year, month, day] = this.customDateStr.split('-').map(Number);
    const totalSec = Math.floor(this.customTimeMinutes * 60);
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    return this.createDateInTimezone(
      year || new Date().getFullYear(),
      month ? month - 1 : new Date().getMonth(),
      day || new Date().getDate(),
      hours,
      minutes,
      seconds,
      this.currentLocation.timezone
    );
  }

  private updateUI(): void {
    const activeDate = this.getActiveUtcDate();
    const data = this.engine.toVirtualTime(activeDate, this.currentLocation);
    const cityTimeParts = this.getTimePartsForTimezone(activeDate, this.currentLocation.timezone);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedCivilTime = `${pad(cityTimeParts.hours)}:${pad(cityTimeParts.minutes)}:${pad(cityTimeParts.seconds)}`;
    const formattedDate = this.getLocalDateStringForTimezone(activeDate, this.currentLocation.timezone);

    // 1. Digital Displays
    const virtualClock = document.getElementById('virtual-clock-time');
    if (virtualClock) virtualClock.textContent = data.virtualTimeStr;

    const realClock = document.getElementById('real-clock-time');
    if (realClock) realClock.textContent = formattedCivilTime;

    // Active Context Badges (City, Date, Civil Time)
    const ctxCity = document.getElementById('ctx-city');
    if (ctxCity) ctxCity.textContent = `${this.currentLocation.name} (${this.currentLocation.country})`;

    const ctxDate = document.getElementById('ctx-date');
    if (ctxDate) ctxDate.textContent = formattedDate;

    const ctxCivilTime = document.getElementById('ctx-civil-time');
    if (ctxCivilTime) ctxCivilTime.textContent = formattedCivilTime;

    // 2. Solar Phase Badge
    const phaseBadge = document.getElementById('solar-phase-badge');
    if (phaseBadge) {
      const isDay = data.phase === 'DAY' || data.phase === 'POLAR_DAY';
      phaseBadge.textContent = `${isDay ? '☀️' : '🌙'} ${data.phase.replace('_', ' ')}`;
    }

    // 3. Dilation Rate Pill
    const dilationBadge = document.getElementById('dilation-rate-badge');
    if (dilationBadge) {
      dilationBadge.textContent = `⚡ ${data.dilationFactor.toFixed(2)}x SPEED`;
    }

    // 4. Synchronize Inputs
    const dateInput = document.getElementById('date-picker') as HTMLInputElement | null;
    if (dateInput && this.isLiveMode) {
      dateInput.value = formattedDate;
    }

    const timeInput = document.getElementById('civil-time-input') as HTMLInputElement | null;
    if (timeInput && this.isLiveMode) {
      timeInput.value = formattedCivilTime;
    }

    const slider = document.getElementById('time-slider') as HTMLInputElement | null;
    if (slider && this.isLiveMode) {
      slider.value = (cityTimeParts.hours * 60 + cityTimeParts.minutes).toString();
    }

    // 5. Solar Ephemeris Mini-Matrix
    const formatSolar = (d: Date | null) => {
      if (!d) return '--:--';
      const p = this.getTimePartsForTimezone(d, this.currentLocation.timezone);
      return `${pad(p.hours)}:${pad(p.minutes)}`;
    };

    const sunriseEl = document.getElementById('stat-sunrise');
    if (sunriseEl) sunriseEl.textContent = formatSolar(data.solarTimes.sunrise);

    const noonEl = document.getElementById('stat-noon');
    if (noonEl) noonEl.textContent = formatSolar(data.solarTimes.solarNoon);

    const sunsetEl = document.getElementById('stat-sunset');
    if (sunsetEl) sunsetEl.textContent = formatSolar(data.solarTimes.sunset);

    const daylightHours = (data.solarTimes.daylightDurationMs / (1000 * 60 * 60)).toFixed(1);
    const dayLenEl = document.getElementById('stat-daylength');
    if (dayLenEl) dayLenEl.textContent = `${daylightHours}h`;

    // 6. Canvas Dial Render
    if (this.dial) {
      this.dial.render(data);
    }
  }

  private getTimePartsForTimezone(date: Date, timeZone?: string): { hours: number; minutes: number; seconds: number } {
    if (!timeZone) {
      return { hours: date.getHours(), minutes: date.getMinutes(), seconds: date.getSeconds() };
    }
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      const parts = formatter.formatToParts(date);
      const getVal = (t: string) => Number(parts.find(p => p.type === t)?.value || 0);
      let h = getVal('hour');
      if (h === 24) h = 0;
      return { hours: h, minutes: getVal('minute'), seconds: getVal('second') };
    } catch {
      return { hours: date.getHours(), minutes: date.getMinutes(), seconds: date.getSeconds() };
    }
  }

  private getLocalDateStringForTimezone(date: Date, timeZone?: string): string {
    if (!timeZone) {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(date);
      const y = parts.find(p => p.type === 'year')?.value;
      const m = parts.find(p => p.type === 'month')?.value;
      const d = parts.find(p => p.type === 'day')?.value;
      return `${y}-${m}-${d}`;
    } catch {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }
  }

  private createDateInTimezone(
    year: number,
    month: number,
    day: number,
    hours: number,
    minutes: number,
    seconds: number,
    timeZone?: string
  ): Date {
    if (!timeZone) {
      return new Date(year, month, day, hours, minutes, seconds);
    }
    try {
      const utcGuess = new Date(Date.UTC(year, month, day, hours, minutes, seconds));
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      const parts = formatter.formatToParts(utcGuess);
      const getVal = (t: string) => Number(parts.find(p => p.type === t)?.value || 0);
      let formattedHour = getVal('hour');
      if (formattedHour === 24) formattedHour = 0;

      const targetAsUtc = Date.UTC(year, month, day, hours, minutes, seconds);
      const formattedAsUtc = Date.UTC(getVal('year'), getVal('month') - 1, getVal('day'), formattedHour, getVal('minute'), getVal('second'));
      const offsetDiffMs = targetAsUtc - formattedAsUtc;

      return new Date(utcGuess.getTime() + offsetDiffMs);
    } catch {
      return new Date(year, month, day, hours, minutes, seconds);
    }
  }
}
