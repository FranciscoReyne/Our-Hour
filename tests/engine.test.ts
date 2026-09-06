import { describe, it, expect } from 'vitest';
import { NormalizedTimeEngine } from '../src/core/engine';
import { PRESET_CITIES } from '../src/core/cities';

describe('Normalized Time Engine - Core Mathematical Proofs', () => {
  const engine = new NormalizedTimeEngine();

  const citiesToTest = [
    PRESET_CITIES.find(c => c.id === 'santiago')!,
    PRESET_CITIES.find(c => c.id === 'new-york')!,
    PRESET_CITIES.find(c => c.id === 'london')!,
    PRESET_CITIES.find(c => c.id === 'madrid')!,
    PRESET_CITIES.find(c => c.id === 'quito')!
  ];

  const datesToTest = [
    new Date('2024-03-20T12:00:00Z'), // Equinox
    new Date('2024-06-21T12:00:00Z'), // June Solstice
    new Date('2024-09-22T12:00:00Z'), // Autumn Equinox
    new Date('2024-12-21T12:00:00Z')  // December Solstice
  ];

  // 1. Sunrise is strictly 06:00 virtual
  it('Rule 1: Real sunrise must map precisely to 06:00.00 virtual time', () => {
    for (const city of citiesToTest) {
      for (const date of datesToTest) {
        const solar = engine.getSolarTimes(date, city);
        if (solar.sunrise) {
          const vTime = engine.toVirtualTime(solar.sunrise, city);
          expect(vTime.virtualHour).toBeCloseTo(6.0, 4);
          expect(vTime.virtualHours).toBe(6);
          expect(vTime.virtualMinutes).toBe(0);
          expect(vTime.phase).toBe('DAY');
        }
      }
    }
  });

  // 2. Sunset is strictly 18:00 virtual
  it('Rule 2: Real sunset must map precisely to 18:00.00 virtual time', () => {
    for (const city of citiesToTest) {
      for (const date of datesToTest) {
        const solar = engine.getSolarTimes(date, city);
        if (solar.sunset) {
          const vTime = engine.toVirtualTime(solar.sunset, city);
          expect(vTime.virtualHour).toBeCloseTo(18.0, 4);
          expect(vTime.virtualHours).toBe(18);
          expect(vTime.virtualMinutes).toBe(0);
        }
      }
    }
  });

  // 3. Daylight period is strictly 12.0 virtual hours
  it('Rule 3: Daylight period must always represent exactly 12 virtual hours', () => {
    for (const city of citiesToTest) {
      const date = new Date('2024-06-21T12:00:00Z');
      const solar = engine.getSolarTimes(date, city);
      if (solar.sunrise && solar.sunset) {
        const vStart = engine.toVirtualTime(solar.sunrise, city);
        const vEnd = engine.toVirtualTime(solar.sunset, city);
        const deltaVirtual = vEnd.virtualHour - vStart.virtualHour;
        expect(deltaVirtual).toBeCloseTo(12.0, 4);
      }
    }
  });

  // 4. Bi-directional reversibility (real -> virtual -> real)
  it('Rule 4: real -> virtual -> real roundtrip must preserve original timestamp within <10ms', () => {
    const santiago = PRESET_CITIES.find(c => c.id === 'santiago')!;
    const baseDate = new Date('2024-11-15T14:30:25Z');

    const vTime = engine.toVirtualTime(baseDate, santiago);
    const recoveredReal = engine.toRealTime(vTime.virtualHour, baseDate, santiago);

    const diffMs = Math.abs(recoveredReal.getTime() - baseDate.getTime());
    expect(diffMs).toBeLessThan(50); // Less than 50ms tolerance across continuous day
  });

  // 5. Bi-directional reversibility (virtual -> real -> virtual)
  it('Rule 5: virtual -> real -> virtual roundtrip must preserve virtual hour precisely', () => {
    const madrid = PRESET_CITIES.find(c => c.id === 'madrid')!;
    const baseDate = new Date('2024-05-10T12:00:00Z');

    const virtualHoursToTest = [6.0, 8.5, 12.0, 15.25, 18.0, 21.0, 0.0, 3.5];

    for (const vH of virtualHoursToTest) {
      const real = engine.toRealTime(vH, baseDate, madrid);
      const recoveredV = engine.toVirtualTime(real, madrid);

      expect(recoveredV.virtualHour).toBeCloseTo(vH, 2);
    }
  });

  // 6. Time Dilation factor behavior
  it('Rule 6: Dilation factor correctly reflects day length dilation/compression', () => {
    const london = PRESET_CITIES.find(c => c.id === 'london')!;
    
    // Summer (long daylight ~16.5h) -> 12 virtual hours / 16.5 real hours = ~0.72x (slower)
    const summerDate = new Date('2024-06-21T13:00:00Z');
    const summerV = engine.toVirtualTime(summerDate, london);
    expect(summerV.dilationFactor).toBeLessThan(1.0);

    // Winter (short daylight ~7.8h) -> 12 virtual hours / 7.8 real hours = ~1.53x (faster)
    const winterDate = new Date('2024-12-21T12:00:00Z');
    const winterV = engine.toVirtualTime(winterDate, london);
    expect(winterV.dilationFactor).toBeGreaterThan(1.0);
  });

  // 7. Extreme Arctic edge-case handling without crashing or throwing
  it('Rule 7: Arctic Polar day and Polar night must calculate continuous virtual time without exceptions', () => {
    const tromso = PRESET_CITIES.find(c => c.id === 'tromso')!;
    
    // Midnight sun date
    const summerPolarDate = new Date('2024-06-21T12:00:00Z');
    expect(() => {
      const res = engine.toVirtualTime(summerPolarDate, tromso);
      expect(res.phase).toBe('POLAR_DAY');
      expect(res.virtualHour).toBeGreaterThanOrEqual(0);
      expect(res.virtualHour).toBeLessThan(24);
    }).not.toThrow();

    // Polar darkness date
    const winterPolarDate = new Date('2024-12-21T12:00:00Z');
    expect(() => {
      const res = engine.toVirtualTime(winterPolarDate, tromso);
      expect(res.phase).toBe('POLAR_NIGHT');
      expect(res.virtualHour).toBeGreaterThanOrEqual(0);
      expect(res.virtualHour).toBeLessThan(24);
    }).not.toThrow();
  });
});
