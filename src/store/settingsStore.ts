import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GlossSettings } from '../types';

const DEFAULT_SETTINGS: GlossSettings = {
  theme: 'dark',
  fontScale: 1,
  orientationLock: 'any',

  backgroundType: 'color',
  backgroundColor: '#0f172a',
  backgroundImageUrl: '',

  glassOpacity: 0.5,
  glassBlur: 8,
  contentBlur: 0,

  smartMirrorEnabled: false,
  smartMirrorDeviceId: '',

  dashboardShowPalette: true,
  dashboardAutoArrange: false,
  homeWidgetIds: ['clock', 'weather-header', 'weather-forecast'],

  weatherLocationName: 'Morrisville, NC',
  weatherLatitude: 35.8235,
  weatherLongitude: -78.8256,
  temperatureUnit: 'fahrenheit',

  calendarShowOnDashboard: false,
  calendarScale: 1,
  calendarShowUsHolidays: true,
  calendarShowIslamicHolidays: true,
  calendarShowHijri: false,

  worldClocksEnabled: false,
  clockDisplayType: 'digital',
  clockScale: 1,
  worldClockZones: ['America/New_York', 'Europe/London', 'Asia/Tokyo', 'Asia/Dubai', 'UTC'],
  worldClockCityDetails: {},

  clockWidgetDisplayType: 'digital',
  clockWidgetShowHourNumbers: true,
  clockWidgetDialStyle: 1,
  clockDigitalScale: 1,
  clockAnalogDigitalScale: 1,
  clockAnalogDialScale: 1,
  clockAnalogScaleLinked: false,

  // Fix #1: no hardcoded API key shipped as a default.
  stocksApiKey: '',
  stocksWatchlist: ['AAPL', 'GOOGL', 'MSFT'],
  stocksShowOnDashboard: false,
  stocksScale: 1,

  dexcomEnabled: false,
  dexcomUseMockData: true,
  dexcomApiBase: 'sandbox',
  dexcomClientId: '',
  dexcomClientSecret: '',
  dexcomRedirectUri: '',
  dexcomAccessToken: '',
  dexcomShowOnDashboard: false,
  dexcomScale: 1,

  azanEnabled: false,
  playAzanAtPrayerTime: true,
  prayerTimesScale: 1,
  azanLatitude: 35.8235,
  azanLongitude: -78.8256,
  azanCalculationMethod: 'MuslimWorldLeague',
  azanVolume: 0.8,
  azanChoice: 1,
  azanByPrayer: { Fajr: 1, Dhuhr: 1, Asr: 1, Maghrib: 1, Isha: 1 },

  healthShowOnDashboard: false,
};

interface SettingsStore extends GlossSettings {
  update: (patch: Partial<GlossSettings>) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      update: (patch) => set(patch),
      reset: () => set(DEFAULT_SETTINGS),
    }),
    { name: 'gloss-settings' },
  ),
);
