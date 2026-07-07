import type { CityDetails } from '../types';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export interface GeocodingResult {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  timezone: string;
}

interface GeocodingResponse {
  results?: Array<{
    name: string;
    country: string;
    latitude: number;
    longitude: number;
    admin1?: string;
    timezone: string;
  }>;
}

export async function searchCities(query: string): Promise<GeocodingResult[]> {
  if (query.trim().length < 2) return [];
  const params = new URLSearchParams({ name: query, count: '12', language: 'en', format: 'json' });
  const res = await fetch(`${GEOCODING_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`Geocoding search failed: ${res.status}`);
  const data: GeocodingResponse = await res.json();
  return (data.results ?? []).map((r) => ({
    name: r.name,
    country: r.country,
    latitude: r.latitude,
    longitude: r.longitude,
    admin1: r.admin1,
    timezone: r.timezone,
  }));
}

// Fallback coordinates for common IANA zones when the user hasn't picked an
// exact city via search. Note: UTC intentionally maps to London, matching
// the original app's behavior (documented quirk #13).
export const TIMEZONE_LOCATIONS: Record<string, CityDetails> = {
  UTC: { name: 'London', lat: 51.5074, lon: -0.1278 },
  'America/New_York': { name: 'New York', lat: 40.7128, lon: -74.006 },
  'America/Chicago': { name: 'Chicago', lat: 41.8781, lon: -87.6298 },
  'America/Denver': { name: 'Denver', lat: 39.7392, lon: -104.9903 },
  'America/Los_Angeles': { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
  'America/Anchorage': { name: 'Anchorage', lat: 61.2181, lon: -149.9003 },
  'America/Sao_Paulo': { name: 'São Paulo', lat: -23.5505, lon: -46.6333 },
  'America/Mexico_City': { name: 'Mexico City', lat: 19.4326, lon: -99.1332 },
  'America/Toronto': { name: 'Toronto', lat: 43.6511, lon: -79.3832 },
  'Europe/London': { name: 'London', lat: 51.5074, lon: -0.1278 },
  'Europe/Paris': { name: 'Paris', lat: 48.8566, lon: 2.3522 },
  'Europe/Berlin': { name: 'Berlin', lat: 52.52, lon: 13.405 },
  'Europe/Madrid': { name: 'Madrid', lat: 40.4168, lon: -3.7038 },
  'Europe/Rome': { name: 'Rome', lat: 41.9028, lon: 12.4964 },
  'Europe/Moscow': { name: 'Moscow', lat: 55.7558, lon: 37.6173 },
  'Europe/Copenhagen': { name: 'Esbjerg', lat: 55.4765, lon: 8.4594 },
  'Europe/Istanbul': { name: 'Istanbul', lat: 41.0082, lon: 28.9784 },
  'Africa/Cairo': { name: 'Cairo', lat: 30.0444, lon: 31.2357 },
  'Asia/Dubai': { name: 'Dubai', lat: 25.2048, lon: 55.2708 },
  'Asia/Karachi': { name: 'Islamabad', lat: 33.6844, lon: 73.0479 },
  'Asia/Kolkata': { name: 'New Delhi', lat: 28.6139, lon: 77.209 },
  'Asia/Dhaka': { name: 'Dhaka', lat: 23.8103, lon: 90.4125 },
  'Asia/Bangkok': { name: 'Bangkok', lat: 13.7563, lon: 100.5018 },
  'Asia/Singapore': { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
  'Asia/Shanghai': { name: 'Shanghai', lat: 31.2304, lon: 121.4737 },
  'Asia/Tokyo': { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  'Asia/Seoul': { name: 'Seoul', lat: 37.5665, lon: 126.978 },
  'Asia/Riyadh': { name: 'Riyadh', lat: 24.7136, lon: 46.6753 },
  'Asia/Jakarta': { name: 'Jakarta', lat: -6.2088, lon: 106.8456 },
  'Australia/Sydney': { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
  'Australia/Perth': { name: 'Perth', lat: -31.9505, lon: 115.8605 },
  'Pacific/Auckland': { name: 'Auckland', lat: -36.8485, lon: 174.7633 },
};

export const COMMON_ZONES = Object.keys(TIMEZONE_LOCATIONS);

export function zoneLabel(zoneId: string, cityDetails: Record<string, CityDetails>): string {
  if (cityDetails[zoneId]?.name) return cityDetails[zoneId].name;
  if (TIMEZONE_LOCATIONS[zoneId]) return TIMEZONE_LOCATIONS[zoneId].name;
  const last = zoneId.split('/').pop() ?? zoneId;
  return last.replace(/_/g, ' ');
}
