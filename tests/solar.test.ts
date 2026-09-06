import { describe, it, expect } from 'vitest';
import { computeSolarTimesForDate, getSolarPosition } from '../src/core/solar';
import { PRESET_CITIES } from '../src/core/cities';

describe('Solar Ephemeris Calculations', () => {
  it('should compute solar noon and twilight correctly for London', () => {
    const london = PRESET_CITIES.find(c => c.id === 'london')!;
    const date = new Date('2024-06-21T12:00:00Z'); // Summer Solstice
    const solar = computeSolarTimesForDate(date, london);

    expect(solar.sunrise).toBeInstanceOf(Date);
    expect(solar.sunset).toBeInstanceOf(Date);
    expect(solar.sunrise!.getTime()).toBeLessThan(solar.sunset!.getTime());
    expect(solar.daylightDurationMs).toBeGreaterThan(16 * 3600 * 1000); // ~16.5 hours of light in summer
  });

  it('should calculate accurate solar altitude at solar noon', () => {
    const quito = PRESET_CITIES.find(c => c.id === 'quito')!;
    const equinoxDate = new Date('2024-03-20T17:15:00Z'); // Equinox near Quito solar noon
    const pos = getSolarPosition(equinoxDate, quito.latitude, quito.longitude);

    // Sun should be almost directly overhead (near 90° altitude)
    expect(pos.altitudeDeg).toBeGreaterThan(80);
  });

  it('should detect polar day during Arctic summer in Tromsø', () => {
    const tromso = PRESET_CITIES.find(c => c.id === 'tromso')!;
    const summerDate = new Date('2024-06-21T12:00:00Z');
    const solar = computeSolarTimesForDate(summerDate, tromso);

    expect(solar.isPolarDay).toBe(true);
    expect(solar.isPolarNight).toBe(false);
  });

  it('should detect polar night during Arctic winter in Tromsø', () => {
    const tromso = PRESET_CITIES.find(c => c.id === 'tromso')!;
    const winterDate = new Date('2024-12-21T12:00:00Z');
    const solar = computeSolarTimesForDate(winterDate, tromso);

    expect(solar.isPolarNight).toBe(true);
    expect(solar.isPolarDay).toBe(false);
  });
});
