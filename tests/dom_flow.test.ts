import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OurHourApp } from '../src/ui/app';

describe('OurHourApp Full DOM Lifecycle Integration', () => {
  let app: OurHourApp;

  beforeEach(() => {
    // Setup a mock DOM environment
    const domElements: Record<string, any> = {
      'city-select': { value: 'santiago', addEventListener: vi.fn() },
      'date-picker': { value: '', addEventListener: vi.fn(), focus: vi.fn(), showPicker: vi.fn() },
      'civil-time-input': { value: '', addEventListener: vi.fn(), focus: vi.fn(), showPicker: vi.fn() },
      'btn-reset-now': { classList: { add: vi.fn(), remove: vi.fn() }, textContent: '', addEventListener: vi.fn() },
      'btn-crown-live': { querySelector: vi.fn().mockReturnValue({ style: {} }), addEventListener: vi.fn() },
      'btn-gps': { addEventListener: vi.fn(), textContent: '' },
      'time-slider': { value: '', addEventListener: vi.fn() },
      'virtual-clock-time': { textContent: '' },
      'real-clock-time': { textContent: '' },
      'ctx-city': { textContent: '' },
      'ctx-date': { textContent: '' },
      'ctx-civil-time': { textContent: '' },
      'solar-phase-badge': { textContent: '' },
      'dilation-rate-badge': { textContent: '' },
      'stat-sunrise': { textContent: '' },
      'stat-noon': { textContent: '' },
      'stat-sunset': { textContent: '' },
      'stat-daylength': { textContent: '' },
      'btn-jump-sunrise': { addEventListener: vi.fn() },
      'btn-jump-noon': { addEventListener: vi.fn() },
      'btn-jump-sunset': { addEventListener: vi.fn() },
      'btn-jump-midnight': { addEventListener: vi.fn() },
      'circadian-canvas': {
        getContext: vi.fn().mockReturnValue({
          scale: vi.fn(),
          resetTransform: vi.fn(),
          setTransform: vi.fn(),
          save: vi.fn(),
          restore: vi.fn(),
          clearRect: vi.fn(),
          createRadialGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
          createLinearGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
          beginPath: vi.fn(),
          arc: vi.fn(),
          fill: vi.fn(),
          stroke: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
        }),
        width: 440,
        height: 440,
      }
    };

    (globalThis as any).document = {
      getElementById: (id: string) => domElements[id] || null,
      querySelector: (sel: string) => {
        if (sel === '.pill-date') return { addEventListener: vi.fn() };
        return null;
      },
      addEventListener: vi.fn(),
    };

    (globalThis as any).window = {
      devicePixelRatio: 2,
      addEventListener: vi.fn(),
      setInterval: vi.fn().mockReturnValue(123),
      clearInterval: vi.fn(),
    };

    app = new OurHourApp();
  });

  it('initializes without errors and populates all date/time DOM fields', () => {
    app.init();

    const datePicker = (globalThis as any).document.getElementById('date-picker');
    const civilTimeInput = (globalThis as any).document.getElementById('civil-time-input');
    const realClock = (globalThis as any).document.getElementById('real-clock-time');
    const virtualClock = (globalThis as any).document.getElementById('virtual-clock-time');
    const ctxCity = (globalThis as any).document.getElementById('ctx-city');
    const ctxDate = (globalThis as any).document.getElementById('ctx-date');
    const ctxCivilTime = (globalThis as any).document.getElementById('ctx-civil-time');

    console.log('DOM date-picker.value:', datePicker.value);
    console.log('DOM civil-time-input.value:', civilTimeInput.value);
    console.log('DOM real-clock-time.textContent:', realClock.textContent);
    console.log('DOM virtual-clock-time.textContent:', virtualClock.textContent);
    console.log('DOM ctx-city:', ctxCity.textContent);
    console.log('DOM ctx-date:', ctxDate.textContent);
    console.log('DOM ctx-civil-time:', ctxCivilTime.textContent);

    expect(datePicker.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(civilTimeInput.value).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    expect(realClock.textContent).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    expect(virtualClock.textContent).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    expect(ctxCity.textContent).toBe('Santiago (Chile)');
    expect(ctxDate.textContent).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(ctxCivilTime.textContent).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });
});
