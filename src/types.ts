export type Theme = 'light' | 'dark' | 'circadian' | 'gamified';
export type EffectiveTheme = 'light' | 'dark' | 'gamified';

export type TemperatureUnit = 'fahrenheit' | 'celsius';
export type ClockDisplayType = 'digital' | 'analog';
export type DialStyle = 1 | 2 | 3 | 4 | 5;
export type BackgroundType = 'color' | 'image';
export type OrientationLock = 'any' | 'portrait' | 'landscape';

export type CalculationMethodName =
  | 'MuslimWorldLeague'
  | 'NorthAmerica'
  | 'UmmAlQura'
  | 'Egyptian'
  | 'Karachi'
  | 'Turkey'
  | 'Dubai'
  | 'Qatar'
  | 'Kuwait'
  | 'MoonsightingCommittee'
  | 'Singapore'
  | 'Tehran';

export type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface CityDetails {
  name: string;
  lat: number;
  lon: number;
}

export interface WeatherLocationOverride {
  lat: number;
  lon: number;
  name: string;
  zoneId: string;
}

export interface WidgetLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export type BreakpointKey = 'lg' | 'md' | 'sm';
export type LayoutsByBreakpoint = Record<BreakpointKey, WidgetLayoutItem[]>;
export type LayoutsByTab = Record<string, LayoutsByBreakpoint>;

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  color?: string;
}

export interface HolidayEvent extends CalendarEvent {
  holiday: true;
  allDay: true;
}

export interface Task {
  id: string;
  title: string;
  done: boolean;
}

export interface HealthMetric {
  id: string;
  date: string;
  steps?: number;
  sleepHours?: number;
  weight?: number;
  notes?: string;
}

export interface WeatherCurrent {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  weatherCode: number;
  cloudCover: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  uvIndex: number;
  isDay: boolean;
  aqi?: number;
  dewPoint: number;
}

export interface WeatherHourly {
  time: string;
  temperature: number;
  apparentTemperature: number;
  precipitationProbability: number;
  precipitation: number;
}

export interface WeatherDaily {
  date: string;
  weatherCode: number;
  temperatureMax: number;
  temperatureMin: number;
}

export interface WeatherData {
  locationName: string;
  latitude: number;
  longitude: number;
  current: WeatherCurrent;
  hourly: WeatherHourly[];
  daily: WeatherDaily[];
  fetchedAt: number;
}

export type DexcomApiBase = 'sandbox' | 'us' | 'eu' | 'jp';

export type DexcomTrend =
  | 'doubleUp'
  | 'singleUp'
  | 'fortyFiveUp'
  | 'flat'
  | 'fortyFiveDown'
  | 'singleDown'
  | 'doubleDown'
  | 'notComputable'
  | 'rateOutOfRange'
  | 'none';

export interface DexcomEgv {
  systemTime: string;
  displayTime: string;
  value: number;
  trend: DexcomTrend;
  unit: string;
}

export type DexcomTimeRangeHours = 3 | 6 | 12 | 24;

export interface StockQuote {
  symbol: string;
  current: number;
  change: number;
  percentChange: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

export interface StockCandlePoint {
  time: number;
  close: number;
}

export interface GlossSettings {
  theme: Theme;
  fontScale: number;
  orientationLock: OrientationLock;

  backgroundType: BackgroundType;
  backgroundColor: string;
  backgroundImageUrl: string;

  glassOpacity: number;
  glassBlur: 0 | 4 | 8 | 12;
  contentBlur: number;

  smartMirrorEnabled: boolean;
  smartMirrorDeviceId: string;

  dashboardShowPalette: boolean;
  dashboardAutoArrange: boolean;
  homeWidgetIds: string[];

  weatherLocationName: string;
  weatherLatitude: number;
  weatherLongitude: number;
  temperatureUnit: TemperatureUnit;

  calendarShowOnDashboard: boolean;
  calendarScale: number;
  calendarShowUsHolidays: boolean;
  calendarShowIslamicHolidays: boolean;
  calendarShowHijri: boolean;

  worldClocksEnabled: boolean;
  clockDisplayType: ClockDisplayType;
  clockScale: number;
  worldClockZones: string[];
  worldClockCityDetails: Record<string, CityDetails>;

  clockWidgetDisplayType: ClockDisplayType;
  clockWidgetShowHourNumbers: boolean;
  clockWidgetDialStyle: DialStyle;
  clockDigitalScale: number;
  clockAnalogDigitalScale: number;

  stocksApiKey: string;
  stocksWatchlist: string[];
  stocksShowOnDashboard: boolean;
  stocksScale: number;

  dexcomEnabled: boolean;
  dexcomUseMockData: boolean;
  dexcomApiBase: DexcomApiBase;
  dexcomClientId: string;
  dexcomClientSecret: string;
  dexcomRedirectUri: string;
  dexcomAccessToken: string;
  dexcomShowOnDashboard: boolean;
  dexcomScale: number;

  azanEnabled: boolean;
  playAzanAtPrayerTime: boolean;
  prayerTimesScale: number;
  azanLatitude: number;
  azanLongitude: number;
  azanCalculationMethod: CalculationMethodName;
  azanVolume: number;
  azanChoice: 1 | 2 | 3 | 4 | 5;
  azanByPrayer: Record<PrayerName, 1 | 2 | 3 | 4 | 5>;

  healthShowOnDashboard: boolean;
}
