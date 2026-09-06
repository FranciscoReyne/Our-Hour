/**
 * OurHour - Astronomical Solar Calculations
 * High-precision ephemeris algorithms based on standard NOAA & Jean Meeus Astronomical Algorithms.
 * Zero external dependencies.
 */

import { GeoLocation, SolarTimes } from './types';

// Constants
const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;
const J1970 = 2440587.5;
const J2000 = 2451545.0;
const DAY_MS = 1000 * 60 * 60 * 24;

// Standard solar altitude angles (degrees below horizon)
const SUN_ALT_OFFICIAL = -0.833; // Sun upper limb with atmospheric refraction
const SUN_ALT_CIVIL = -6.0;      // Civil twilight

export function toJulian(date: Date): number {
  return date.getTime() / DAY_MS + J1970;
}

export function fromJulian(j: number): Date {
  return new Date((j - J1970) * DAY_MS);
}

export function toDays(date: Date): number {
  return toJulian(date) - J2000;
}

function rightAscension(l: number, b: number): number {
  return Math.atan2(Math.sin(l) * Math.cos(23.4397 * RAD) - Math.tan(b) * Math.sin(23.4397 * RAD), Math.cos(l));
}

function declination(l: number, b: number): number {
  return Math.asin(Math.sin(b) * Math.cos(23.4397 * RAD) + Math.cos(b) * Math.sin(23.4397 * RAD) * Math.sin(l));
}

function solarMeanAnomaly(d: number): number {
  return RAD * (357.5291 + 0.98560028 * d);
}

function eclipticLongitude(M: number): number {
  const C = RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M)); // equation of center
  const P = RAD * 102.9372; // perihelion of the Earth
  return M + C + P + Math.PI;
}

function sunCoords(d: number): { dec: number; ra: number } {
  const M = solarMeanAnomaly(d);
  const L = eclipticLongitude(M);
  return {
    dec: declination(L, 0),
    ra: rightAscension(L, 0)
  };
}

function siderealTime(d: number, lw: number): number {
  return RAD * (280.16 + 360.9856235 * d) - lw;
}

function altitude(H: number, phi: number, dec: number): number {
  return Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
}

function azimuth(H: number, phi: number, dec: number): number {
  return Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi)) + Math.PI;
}

/**
 * Calculates current solar position (altitude and azimuth in degrees)
 */
export function getSolarPosition(date: Date, lat: number, lng: number): { altitudeDeg: number; azimuthDeg: number } {
  const lw = -lng * RAD;
  const phi = lat * RAD;
  const d = toDays(date);
  const c = sunCoords(d);
  const H = siderealTime(d, lw) - c.ra;

  const alt = altitude(H, phi, c.dec);
  const az = azimuth(H, phi, c.dec);

  return {
    altitudeDeg: alt * DEG,
    azimuthDeg: ((az * DEG + 180) % 360 + 360) % 360 // 0° = North, 90° = East, 180° = South, 270° = West
  };
}

function julianCycle(d: number, lw: number): number {
  return Math.round(d - 0.0009 - lw / (2 * Math.PI));
}

function approxTransit(Ht: number, lw: number, n: number): number {
  return 0.0009 + (Ht + lw) / (2 * Math.PI) + n;
}

function solarTransitJ(ds: number, M: number, L: number): number {
  return J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
}

function hourAngle(h0: number, phi: number, dec: number): number | null {
  const num = Math.sin(h0) - Math.sin(phi) * Math.sin(dec);
  const denom = Math.cos(phi) * Math.cos(dec);
  const cosH0 = num / denom;

  if (cosH0 > 1) return null; // Always below horizon (Polar night)
  if (cosH0 < -1) return null; // Always above horizon (Polar day)
  return Math.acos(cosH0);
}

/**
 * Computes solar times for a given day and location without recursion
 */
export function computeSolarTimesForDate(date: Date, location: GeoLocation): SolarTimes {
  const { latitude: lat, longitude: lng } = location;
  const lw = -lng * RAD;
  const phi = lat * RAD;

  // Align date to local solar day using longitude offset
  const localSolarOffsetMs = (lng / 360) * DAY_MS;
  const localSolarDate = new Date(date.getTime() + localSolarOffsetMs);
  const baseUtc = new Date(Date.UTC(localSolarDate.getUTCFullYear(), localSolarDate.getUTCMonth(), localSolarDate.getUTCDate(), 12, 0, 0));
  const d = toDays(baseUtc);
  const n = julianCycle(d, lw);
  const ds = approxTransit(0, lw, n);

  const M = solarMeanAnomaly(ds);
  const L = eclipticLongitude(M);
  const dec = declination(L, 0);

  const Jnoon = solarTransitJ(ds, M, L);
  const solarNoon = fromJulian(Jnoon);
  const solarMidnight = fromJulian(Jnoon - 0.5);

  // Check solar transit altitude at noon and nadir to detect polar phenomena
  const noonAlt = (Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec)) * DEG);
  const nadirAlt = (Math.asin(Math.sin(phi) * Math.sin(dec) - Math.cos(phi) * Math.cos(dec)) * DEG);

  const isPolarDay = nadirAlt >= SUN_ALT_OFFICIAL;
  const isPolarNight = noonAlt < SUN_ALT_OFFICIAL;

  // Calculate official sunrise / sunset
  const hAngleOfficial = hourAngle(SUN_ALT_OFFICIAL * RAD, phi, dec);
  let sunrise: Date | null = null;
  let sunset: Date | null = null;

  if (hAngleOfficial !== null) {
    const Jset = solarTransitJ(approxTransit(hAngleOfficial, lw, n), M, L);
    const Jrise = solarTransitJ(approxTransit(-hAngleOfficial, lw, n), M, L);
    sunrise = fromJulian(Jrise);
    sunset = fromJulian(Jset);
  }

  // Civil Twilight (-6°)
  const hAngleCivil = hourAngle(SUN_ALT_CIVIL * RAD, phi, dec);
  let civilDawn: Date | null = null;
  let civilDusk: Date | null = null;

  if (hAngleCivil !== null) {
    civilDawn = fromJulian(solarTransitJ(approxTransit(-hAngleCivil, lw, n), M, L));
    civilDusk = fromJulian(solarTransitJ(approxTransit(hAngleCivil, lw, n), M, L));
  }

  // Non-recursive Next Sunrise (n + 1)
  let nextSunrise: Date | null = null;
  const nNext = n + 1;
  const dsNext = approxTransit(0, lw, nNext);
  const MNext = solarMeanAnomaly(dsNext);
  const LNext = eclipticLongitude(MNext);
  const decNext = declination(LNext, 0);
  const hAngleNext = hourAngle(SUN_ALT_OFFICIAL * RAD, phi, decNext);
  if (hAngleNext !== null) {
    nextSunrise = fromJulian(solarTransitJ(approxTransit(-hAngleNext, lw, nNext), MNext, LNext));
  }

  // Non-recursive Previous Sunset (n - 1)
  let prevSunset: Date | null = null;
  const nPrev = n - 1;
  const dsPrev = approxTransit(0, lw, nPrev);
  const MPrev = solarMeanAnomaly(dsPrev);
  const LPrev = eclipticLongitude(MPrev);
  const decPrev = declination(LPrev, 0);
  const hAnglePrev = hourAngle(SUN_ALT_OFFICIAL * RAD, phi, decPrev);
  if (hAnglePrev !== null) {
    prevSunset = fromJulian(solarTransitJ(approxTransit(hAnglePrev, lw, nPrev), MPrev, LPrev));
  }

  // Compute daylight and night durations in ms
  let daylightDurationMs: number;
  let nightDurationMs: number;

  if (isPolarDay) {
    daylightDurationMs = DAY_MS;
    nightDurationMs = 0;
  } else if (isPolarNight) {
    daylightDurationMs = 0;
    nightDurationMs = DAY_MS;
  } else if (sunrise && sunset) {
    daylightDurationMs = sunset.getTime() - sunrise.getTime();
    if (nextSunrise) {
      nightDurationMs = nextSunrise.getTime() - sunset.getTime();
    } else {
      nightDurationMs = DAY_MS - daylightDurationMs;
    }
  } else {
    daylightDurationMs = DAY_MS / 2;
    nightDurationMs = DAY_MS / 2;
  }

  return {
    sunrise,
    sunset,
    solarNoon,
    solarMidnight,
    civilDawn,
    civilDusk,
    nextSunrise,
    prevSunset,
    daylightDurationMs,
    nightDurationMs,
    isPolarDay,
    isPolarNight
  };
}
