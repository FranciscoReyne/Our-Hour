import { describe, it, expect } from 'vitest';
import { NormalizedTimeEngine } from '../src/core/engine';
import { PRESET_CITIES } from '../src/core/cities';

describe('App Startup Engine Validation', () => {
  const engine = new NormalizedTimeEngine();
  const santiago = PRESET_CITIES[0];

  it('calculates virtual time for current date and Santiago without throwing', () => {
    const now = new Date();
    console.log('Testing with now:', now.toISOString());
    const data = engine.toVirtualTime(now, santiago);
    console.log('Calculated virtual time:', data.virtualTimeStr, 'phase:', data.phase, 'dilation:', data.dilationFactor);
    expect(data.virtualTimeStr).toBeDefined();
    expect(data.virtualHour).toBeGreaterThanOrEqual(0);
    expect(data.virtualHour).toBeLessThan(24);
  });
});
