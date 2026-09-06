import { describe, it, expect } from 'vitest';
import { NormalizedTimeEngine } from '../src/core/engine';
import { Scheduler, DEFAULT_TASKS } from '../src/core/scheduler';
import { PRESET_CITIES } from '../src/core/cities';

describe('Scheduler & iCalendar Integration', () => {
  const engine = new NormalizedTimeEngine();
  const scheduler = new Scheduler(engine);
  const santiago = PRESET_CITIES.find(c => c.id === 'santiago')!;
  const testDate = new Date('2024-10-15T12:00:00Z');

  it('should resolve virtual tasks to real civil timestamps', () => {
    const resolved = scheduler.resolveScheduleForDate(DEFAULT_TASKS, testDate, santiago);

    expect(resolved.length).toBe(DEFAULT_TASKS.length);
    for (const task of resolved) {
      expect(task.realStart).toBeInstanceOf(Date);
      expect(task.realEnd).toBeInstanceOf(Date);
      expect(task.realEnd.getTime()).toBeGreaterThan(task.realStart.getTime());
      expect(task.realDurationMinutes).toBeGreaterThan(0);
      expect(task.realTimeSpanStr).toMatch(/\d{2}:\d{2} - \d{2}:\d{2}/);
    }
  });

  it('should export valid iCalendar standard text (.ics)', () => {
    const resolved = scheduler.resolveScheduleForDate(DEFAULT_TASKS, testDate, santiago);
    const icsContent = scheduler.generateICalendar(resolved, santiago);

    expect(icsContent).toContain('BEGIN:VCALENDAR');
    expect(icsContent).toContain('VERSION:2.0');
    expect(icsContent).toContain('PRODID:-//OurHour//Circadian Normalized Schedule//EN');
    expect(icsContent).toContain('BEGIN:VEVENT');
    expect(icsContent).toContain('END:VEVENT');
    expect(icsContent).toContain('END:VCALENDAR');
    expect(icsContent).toContain('SUMMARY:[OurHour]');
  });
});
