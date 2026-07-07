import { CalculationMethod, Coordinates, PrayerTimes } from 'adhan';
import type { CalculationMethodName, PrayerName } from '../types';

const OVERRIDES: Partial<Record<CalculationMethodName, { fajrAngle: number; ishaAngle: number; ishaInterval?: number }>> = {
  MuslimWorldLeague: { fajrAngle: 18, ishaAngle: 17 },
  NorthAmerica: { fajrAngle: 15, ishaAngle: 15 },
  UmmAlQura: { fajrAngle: 18.5, ishaAngle: 0, ishaInterval: 90 },
  Egyptian: { fajrAngle: 19.5, ishaAngle: 17.5 },
  Karachi: { fajrAngle: 18, ishaAngle: 18 },
  Turkey: { fajrAngle: 18, ishaAngle: 17 },
};

const LIBRARY_PRESET_METHODS = new Set<CalculationMethodName>([
  'Dubai',
  'Qatar',
  'Kuwait',
  'MoonsightingCommittee',
  'Singapore',
  'Tehran',
]);

function resolveParameters(methodName: CalculationMethodName) {
  const factory = LIBRARY_PRESET_METHODS.has(methodName)
    ? CalculationMethod[methodName as keyof typeof CalculationMethod]
    : CalculationMethod.MuslimWorldLeague;

  const params = factory ? factory() : CalculationMethod.MuslimWorldLeague();

  const override = OVERRIDES[methodName];
  if (override) {
    params.fajrAngle = override.fajrAngle;
    params.ishaAngle = override.ishaAngle;
    if (override.ishaInterval !== undefined) {
      params.ishaInterval = override.ishaInterval;
    }
  }
  return params;
}

export interface PrayerTimesResult {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

export function getPrayerTimes(latitude: number, longitude: number, date: Date, method: CalculationMethodName): PrayerTimesResult {
  const coordinates = new Coordinates(latitude, longitude);
  const params = resolveParameters(method);
  const times = new PrayerTimes(coordinates, date, params);
  return {
    fajr: times.fajr,
    sunrise: times.sunrise,
    dhuhr: times.dhuhr,
    asr: times.asr,
    maghrib: times.maghrib,
    isha: times.isha,
  };
}

export const PRAYER_NAMES: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export function getFivePrayers(times: PrayerTimesResult): Array<{ name: PrayerName; time: Date }> {
  return [
    { name: 'Fajr', time: times.fajr },
    { name: 'Dhuhr', time: times.dhuhr },
    { name: 'Asr', time: times.asr },
    { name: 'Maghrib', time: times.maghrib },
    { name: 'Isha', time: times.isha },
  ];
}

export function getCurrentPrayer(
  prayers: Array<{ name: PrayerName; time: Date }>,
  now: Date,
): { name: PrayerName; time: Date } | null {
  const past = prayers.filter((p) => p.time.getTime() <= now.getTime());
  return past.length ? past[past.length - 1] : null;
}

export function getNextPrayer(
  prayers: Array<{ name: PrayerName; time: Date }>,
  now: Date,
): { name: PrayerName; time: Date } | null {
  const future = prayers.filter((p) => p.time.getTime() > now.getTime());
  return future.length ? future[0] : null;
}

export const CALCULATION_METHODS: CalculationMethodName[] = [
  'MuslimWorldLeague',
  'NorthAmerica',
  'UmmAlQura',
  'Egyptian',
  'Karachi',
  'Turkey',
  'Dubai',
  'Qatar',
  'Kuwait',
  'MoonsightingCommittee',
  'Singapore',
  'Tehran',
];
