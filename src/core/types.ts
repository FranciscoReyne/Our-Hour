/**
 * OurHour - Core Types & Interfaces
 * Normalized Circadian Time Engine
 */

export interface GeoLocation {
  latitude: number;
  longitude: number;
  timezone?: string;
  name?: string;
  country?: string;
}

export type DayPhase = 'DAY' | 'NIGHT' | 'POLAR_DAY' | 'POLAR_NIGHT';

export interface SolarTimes {
  /** UTC timestamp of astronomical sunrise */
  sunrise: Date | null;
  /** UTC timestamp of astronomical sunset */
  sunset: Date | null;
  /** UTC timestamp of solar noon (sun highest in sky) */
  solarNoon: Date;
  /** UTC timestamp of solar nadir / midnight */
  solarMidnight: Date;
  /** Civil dawn (sun at -6° below horizon) */
  civilDawn: Date | null;
  /** Civil dusk (sun at -6° below horizon) */
  civilDusk: Date | null;
  /** Next calendar day sunrise */
  nextSunrise: Date | null;
  /** Previous calendar day sunset */
  prevSunset: Date | null;
  /** Duration of current daylight period in milliseconds */
  daylightDurationMs: number;
  /** Duration of current night period in milliseconds */
  nightDurationMs: number;
  /** True if sun never sets (24h daylight) */
  isPolarDay: boolean;
  /** True if sun never rises (24h darkness) */
  isPolarNight: boolean;
}

export interface NormalizedTime {
  /** Decimal virtual hour in [0.0, 24.0) */
  virtualHour: number;
  /** Virtual integer hours (0-23) */
  virtualHours: number;
  /** Virtual integer minutes (0-59) */
  virtualMinutes: number;
  /** Virtual integer seconds (0-59) */
  virtualSeconds: number;
  /** Formatted "HH:MM:SS" virtual time string */
  virtualTimeStr: string;
  /** Formatted "HH:MM" virtual time string */
  virtualTimeShort: string;
  /** Current solar phase */
  phase: DayPhase;
  /**
   * Time dilation factor (virtual hours elapsed per 1 real civil hour).
   * > 1.0 means virtual time runs faster than civil time (e.g. short winter day).
   * < 1.0 means virtual time runs slower than civil time (e.g. long summer day).
   */
  dilationFactor: number;
  /** Progress through the current phase from 0.000 to 1.000 (0% to 100%) */
  phaseProgress: number;
  /** Solar altitude in degrees above horizon (-90° to +90°) */
  solarAltitudeDeg: number;
  /** Solar azimuth in degrees (0° = North, 90° = East, 180° = South, 270° = West) */
  solarAzimuthDeg: number;
  /** Associated real civil Date */
  realDate: Date;
  /** Formatted real time "HH:MM:SS" */
  realTimeStr: string;
  /** Associated solar landmarks */
  solarTimes: SolarTimes;
  /** Geographic location used for calculation */
  location: GeoLocation;
}

export type TaskCategory =
  | 'deep_work'
  | 'meeting'
  | 'exercise'
  | 'solar_recharge'
  | 'learning'
  | 'rest'
  | 'creative'
  | 'custom';

export interface ScheduleTask {
  id: string;
  title: string;
  category: TaskCategory;
  /** Virtual start hour, e.g. 8.5 = 08:30 Virtual */
  virtualStart: number;
  /** Virtual end hour, e.g. 11.0 = 11:00 Virtual */
  virtualEnd: number;
  color: string;
  completed: boolean;
  notes?: string;
}

export interface RealTimeScheduleTask extends ScheduleTask {
  /** Computed real civil start time */
  realStart: Date;
  /** Computed real civil end time */
  realEnd: Date;
  /** Formatted real time span, e.g. "09:12 - 11:45" */
  realTimeSpanStr: string;
  /** Formatted virtual time span, e.g. "08:30 - 11:00 Virtual" */
  virtualTimeSpanStr: string;
  /** Duration in real minutes */
  realDurationMinutes: number;
  /** Duration in virtual hours */
  virtualDurationHours: number;
}
