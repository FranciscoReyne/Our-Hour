/**
 * OurHour - Normalized Time Engine
 * Core transformation algorithms: Real Civil Time <-> Solar Normalized Virtual Time
 */

import { GeoLocation, NormalizedTime, DayPhase, SolarTimes } from './types';
import { computeSolarTimesForDate, getSolarPosition } from './solar';

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

export class NormalizedTimeEngine {
  private cache: Map<string, SolarTimes> = new Map();

  /**
   * Converts real timestamp and location into Normalized Virtual Time.
   */
  public toVirtualTime(realDate: Date, location: GeoLocation): NormalizedTime {
    const solarTimes = this.getSolarTimes(realDate, location);
    const pos = getSolarPosition(realDate, location.latitude, location.longitude);

    let virtualHour: number;
    let phase: DayPhase;
    let dilationFactor: number;
    let phaseProgress: number;

    const t = realDate.getTime();

    // 1. Polar Day Handling (24h continuous sunlight)
    if (solarTimes.isPolarDay) {
      phase = 'POLAR_DAY';
      dilationFactor = 1.0;
      const nadir = solarTimes.solarMidnight.getTime();
      
      // Solar noon is 12:00, Solar nadir is 00:00
      let diffFromNadir = (t - nadir) % DAY_MS;
      if (diffFromNadir < 0) diffFromNadir += DAY_MS;
      virtualHour = (diffFromNadir / DAY_MS) * 24.0;
      phaseProgress = (virtualHour % 24.0) / 24.0;
    }
    // 2. Polar Night Handling (24h continuous darkness)
    else if (solarTimes.isPolarNight) {
      phase = 'POLAR_NIGHT';
      dilationFactor = 1.0;
      const nadir = solarTimes.solarMidnight.getTime();
      let diffFromNadir = (t - nadir) % DAY_MS;
      if (diffFromNadir < 0) diffFromNadir += DAY_MS;
      virtualHour = (diffFromNadir / DAY_MS) * 24.0;
      phaseProgress = (virtualHour % 24.0) / 24.0;
    }
    // 3. Normal Piecewise Daylight / Night cycle
    else {
      const sunrise = solarTimes.sunrise!.getTime();
      const sunset = solarTimes.sunset!.getTime();

      // Case A: Real Daylight period [sunrise, sunset]
      if (t >= sunrise - 1000 && t <= sunset + 1000) {
        phase = 'DAY';
        const dayDuration = sunset - sunrise;
        phaseProgress = dayDuration > 0 ? Math.max(0, Math.min(1, (t - sunrise) / dayDuration)) : 0;
        virtualHour = 6.0 + phaseProgress * 12.0;
        // 12 virtual hours divided by real daylight hours
        dilationFactor = dayDuration > 0 ? (12 * HOUR_MS) / dayDuration : 1.0;
      }
      // Case B: Real Night after sunset [sunset, nextSunrise]
      else if (t > sunset) {
        phase = 'NIGHT';
        const nextSunrise = solarTimes.nextSunrise
          ? solarTimes.nextSunrise.getTime()
          : sunset + DAY_MS / 2;
        const nightDuration = nextSunrise - sunset;
        phaseProgress = nightDuration > 0 ? Math.max(0, Math.min(1, (t - sunset) / nightDuration)) : 0;
        virtualHour = (18.0 + phaseProgress * 12.0) % 24.0;
        dilationFactor = nightDuration > 0 ? (12 * HOUR_MS) / nightDuration : 1.0;
      }
      // Case C: Real Night before sunrise [prevSunset, sunrise]
      else {
        phase = 'NIGHT';
        const prevSunset = solarTimes.prevSunset
          ? solarTimes.prevSunset.getTime()
          : sunrise - DAY_MS / 2;
        const nightDuration = sunrise - prevSunset;
        phaseProgress = nightDuration > 0 ? Math.max(0, Math.min(1, (t - prevSunset) / nightDuration)) : 0;
        virtualHour = (18.0 + phaseProgress * 12.0) % 24.0;
        dilationFactor = nightDuration > 0 ? (12 * HOUR_MS) / nightDuration : 1.0;
      }
    }

    // Keep virtualHour strictly in [0.0, 24.0)
    virtualHour = ((virtualHour % 24) + 24) % 24;

    const vH = Math.floor(virtualHour);
    const vRemainingMinutes = (virtualHour - vH) * 60;
    const vM = Math.floor(vRemainingMinutes);
    const vS = Math.floor((vRemainingMinutes - vM) * 60);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const virtualTimeStr = `${pad(vH)}:${pad(vM)}:${pad(vS)}`;
    const virtualTimeShort = `${pad(vH)}:${pad(vM)}`;

    const rH = realDate.getHours();
    const rM = realDate.getMinutes();
    const rS = realDate.getSeconds();
    const realTimeStr = `${pad(rH)}:${pad(rM)}:${pad(rS)}`;

    return {
      virtualHour,
      virtualHours: vH,
      virtualMinutes: vM,
      virtualSeconds: vS,
      virtualTimeStr,
      virtualTimeShort,
      phase,
      dilationFactor,
      phaseProgress,
      solarAltitudeDeg: pos.altitudeDeg,
      solarAzimuthDeg: pos.azimuthDeg,
      realDate,
      realTimeStr,
      solarTimes,
      location
    };
  }

  /**
   * Converts a Virtual Time (hour 0.0 - 24.0) on a given reference date back into Real Civil Date.
   */
  public toRealTime(virtualHour: number, referenceDate: Date, location: GeoLocation): Date {
    const solarTimes = this.getSolarTimes(referenceDate, location);
    const v = ((virtualHour % 24) + 24) % 24;

    // Polar day / night linear fallback
    if (solarTimes.isPolarDay || solarTimes.isPolarNight) {
      const nadir = solarTimes.solarMidnight.getTime();
      const msFromNadir = (v / 24.0) * DAY_MS;
      return new Date(nadir + msFromNadir);
    }

    const sunrise = solarTimes.sunrise!.getTime();
    const sunset = solarTimes.sunset!.getTime();

    // Virtual Daylight: 06:00 -> 18:00
    if (v >= 6.0 && v <= 18.0) {
      const progress = (v - 6.0) / 12.0;
      const dayDuration = sunset - sunrise;
      return new Date(sunrise + progress * dayDuration);
    }
    // Virtual Evening Night: 18:00 -> 24:00 (00:00)
    else if (v > 18.0) {
      const progress = (v - 18.0) / 12.0;
      const nextSunrise = solarTimes.nextSunrise
        ? solarTimes.nextSunrise.getTime()
        : sunset + DAY_MS / 2;
      const nightDuration = nextSunrise - sunset;
      return new Date(sunset + progress * nightDuration);
    }
    // Virtual Morning Night: 00:00 -> 06:00
    else {
      // v is in [0.0, 6.0). Progress through night is (v + 6.0) / 12.0
      // If we are looking for the morning of the referenceDate:
      const prevSunset = solarTimes.prevSunset
        ? solarTimes.prevSunset.getTime()
        : sunrise - DAY_MS / 2;
      const nightDuration = sunrise - prevSunset;
      const progress = (v + 6.0) / 12.0;
      return new Date(prevSunset + progress * nightDuration);
    }
  }

  /**
   * Cached lookup of solar times
   */
  public getSolarTimes(date: Date, location: GeoLocation): SolarTimes {
    const localSolarOffsetMs = (location.longitude / 360) * DAY_MS;
    const localSolarDate = new Date(date.getTime() + localSolarOffsetMs);
    const key = `${localSolarDate.getUTCFullYear()}-${localSolarDate.getUTCMonth()}-${localSolarDate.getUTCDate()}_${location.latitude.toFixed(3)}_${location.longitude.toFixed(3)}`;
    const cached = this.cache.get(key);
    if (cached) return cached;

    const computed = computeSolarTimesForDate(date, location);
    this.cache.set(key, computed);
    return computed;
  }

  /**
   * Clear cache if needed (e.g. on massive batch or memory cleanup)
   */
  public clearCache(): void {
    this.cache.clear();
  }
}

export const defaultEngine = new NormalizedTimeEngine();
