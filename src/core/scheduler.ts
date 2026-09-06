/**
 * OurHour - Task & Habit Circadian Scheduler
 * Converts virtual time blocks to real calendar appointments and exports to .ics
 */

import { GeoLocation, ScheduleTask, RealTimeScheduleTask, TaskCategory } from './types';
import { NormalizedTimeEngine } from './engine';

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  deep_work: '#F59E0B',      // Amber
  meeting: '#3B82F6',        // Blue
  exercise: '#10B981',       // Emerald
  solar_recharge: '#EF4444',  // Coral / Red
  learning: '#8B5CF6',       // Purple
  rest: '#6366F1',           // Indigo
  creative: '#EC4899',       // Pink
  custom: '#64748B'          // Slate
};

export const DEFAULT_TASKS: ScheduleTask[] = [
  {
    id: 'task-1',
    title: 'Morning Sun Alignment & Hydration',
    category: 'solar_recharge',
    virtualStart: 6.0, // 06:00 (Directly at Sunrise)
    virtualEnd: 7.0,   // 07:00
    color: CATEGORY_COLORS.solar_recharge,
    completed: false,
    notes: 'View natural sunlight within 1 hour of sunrise to anchor circadian clock.'
  },
  {
    id: 'task-2',
    title: 'Deep Focus & High-Cognitive Work',
    category: 'deep_work',
    virtualStart: 8.0,  // 08:00
    virtualEnd: 11.5, // 11:30
    color: CATEGORY_COLORS.deep_work,
    completed: false,
    notes: 'Peak cortisol & alertness window.'
  },
  {
    id: 'task-3',
    title: 'Solar Zenith Lunch & Walk',
    category: 'exercise',
    virtualStart: 11.75, // 11:45
    virtualEnd: 12.75, // 12:45 (Solar Noon)
    color: CATEGORY_COLORS.exercise,
    completed: false,
    notes: 'Peak solar altitude outdoor movement.'
  },
  {
    id: 'task-4',
    title: 'Collaborative Sync & Creative Sprint',
    category: 'creative',
    virtualStart: 13.5, // 13:30
    virtualEnd: 16.5, // 16:30
    color: CATEGORY_COLORS.creative,
    completed: false,
    notes: 'Afternoon circadian rhythm work block.'
  },
  {
    id: 'task-5',
    title: 'Sunset Reflection & Circadian Wind-Down',
    category: 'rest',
    virtualStart: 18.0, // 18:00 (Sunset)
    virtualEnd: 19.5, // 19:30
    color: CATEGORY_COLORS.rest,
    completed: false,
    notes: 'Dim artificial lighting and transition to rest.'
  }
];

export class Scheduler {
  constructor(private engine: NormalizedTimeEngine) {}

  /**
   * Translates an array of virtual tasks to exact real civil times for a given date and location.
   */
  public resolveScheduleForDate(
    tasks: ScheduleTask[],
    date: Date,
    location: GeoLocation
  ): RealTimeScheduleTask[] {
    return tasks.map((task) => {
      const realStart = this.engine.toRealTime(task.virtualStart, date, location);
      const realEnd = this.engine.toRealTime(task.virtualEnd, date, location);

      const realDurationMinutes = Math.max(0, Math.round((realEnd.getTime() - realStart.getTime()) / 60000));
      const virtualDurationHours = Math.max(0, task.virtualEnd - task.virtualStart);

      const pad = (n: number) => n.toString().padStart(2, '0');
      const formatTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
      const formatVirtual = (v: number) => {
        const h = Math.floor(v);
        const m = Math.round((v - h) * 60);
        return `${pad(h)}:${pad(m)}`;
      };

      return {
        ...task,
        realStart,
        realEnd,
        realTimeSpanStr: `${formatTime(realStart)} - ${formatTime(realEnd)}`,
        virtualTimeSpanStr: `${formatVirtual(task.virtualStart)} - ${formatVirtual(task.virtualEnd)} Virtual`,
        realDurationMinutes,
        virtualDurationHours
      };
    });
  }

  /**
   * Generates a standard .ics (iCalendar) file string for export to Google Calendar, Apple Calendar, Outlook.
   */
  public generateICalendar(
    resolvedTasks: RealTimeScheduleTask[],
    location: GeoLocation
  ): string {
    const formatDateToICS = (d: Date) => {
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//OurHour//Circadian Normalized Schedule//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:OurHour Circadian Schedule'
    ];

    for (const task of resolvedTasks) {
      const startICS = formatDateToICS(task.realStart);
      const endICS = formatDateToICS(task.realEnd);
      const uid = `ourhour-${task.id}-${task.realStart.getTime()}@ourhour.org`;

      lines.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${formatDateToICS(new Date())}`,
        `DTSTART:${startICS}`,
        `DTEND:${endICS}`,
        `SUMMARY:[OurHour] ${task.title} (${task.virtualTimeSpanStr})`,
        `DESCRIPTION:Scheduled using OurHour Solar Normalized Time.\\nVirtual Time: ${task.virtualTimeSpanStr}\\nCivil Time: ${task.realTimeSpanStr}\\nLocation: ${location.name || 'Custom Coordinates'} (${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)})\\nNotes: ${task.notes || ''}`,
        `CATEGORIES:${task.category.toUpperCase()}`,
        `STATUS:CONFIRMED`,
        'END:VEVENT'
      );
    }

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }
}
