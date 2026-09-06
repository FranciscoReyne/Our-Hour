/**
 * Preset Cities and Locations for OurHour
 */

import { GeoLocation } from './types';

export interface CityPreset extends GeoLocation {
  id: string;
  name: string;
  country: string;
  description: string;
}

export const PRESET_CITIES: CityPreset[] = [
  {
    id: 'santiago',
    name: 'Santiago',
    country: 'Chile',
    latitude: -33.4489,
    longitude: -70.6693,
    timezone: 'America/Santiago',
    description: 'Southern Hemisphere • Andean Solar Arc'
  },
  {
    id: 'new-york',
    name: 'New York',
    country: 'United States',
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: 'America/New_York',
    description: 'Northern Hemisphere • Eastern Seaboard'
  },
  {
    id: 'london',
    name: 'London',
    country: 'United Kingdom',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
    description: 'Greenwich Prime Meridian • Variable Twilight'
  },
  {
    id: 'madrid',
    name: 'Madrid',
    country: 'Spain',
    latitude: 40.4168,
    longitude: -3.7038,
    timezone: 'Europe/Madrid',
    description: 'Iberian Peninsula • Late Sunset Offset'
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    latitude: 35.6762,
    longitude: 139.6503,
    timezone: 'Asia/Tokyo',
    description: 'Far East • Early Sunrise Arc'
  },
  {
    id: 'quito',
    name: 'Quito',
    country: 'Ecuador',
    latitude: -0.1807,
    longitude: -78.4678,
    timezone: 'America/Guayaquil',
    description: 'Equatorial Line • Exactly 12h Civil Daylight Year-Round'
  },
  {
    id: 'tromso',
    name: 'Tromsø',
    country: 'Norway',
    latitude: 69.6492,
    longitude: 18.9553,
    timezone: 'Europe/Oslo',
    description: 'Arctic Circle • Midnight Sun & Polar Night Simulation'
  },
  {
    id: 'reykjavik',
    name: 'Reykjavík',
    country: 'Iceland',
    latitude: 64.1466,
    longitude: -21.9426,
    timezone: 'Atlantic/Reykjavik',
    description: 'Sub-Arctic • Extended Summer Twilights'
  },
  {
    id: 'singapore',
    name: 'Singapore',
    country: 'Singapore',
    latitude: 1.3521,
    longitude: 103.8198,
    timezone: 'Asia/Singapore',
    description: 'Tropical Equator • Constant Circadian Rhythm'
  },
  {
    id: 'sydney',
    name: 'Sydney',
    country: 'Australia',
    latitude: -33.8688,
    longitude: 151.2093,
    timezone: 'Australia/Sydney',
    description: 'Oceania • Southern Daylight Cycle'
  }
];
