import type { TemperatureUnit, WeatherCurrent, WeatherDaily, WeatherData, WeatherHourly } from '../types';
import { fetchAirQuality } from './airQuality';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export const WMO_LABELS: Record<number, string> = {
  0: 'Clear',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Freezing drizzle',
  61: 'Slight rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Freezing rain',
  71: 'Slight snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

export function weatherCodeLabel(code: number): string {
  return WMO_LABELS[code] ?? 'Unknown';
}

interface OpenMeteoResponse {
  timezone: string;
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    weather_code: number;
    cloud_cover: number;
    pressure_msl: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    visibility: number | null;
    uv_index: number | null;
    is_day: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: number[];
    precipitation: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

export async function fetchWeather(
  latitude: number,
  longitude: number,
  locationName: string,
  unit: TemperatureUnit,
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,visibility,uv_index,is_day',
    hourly: 'temperature_2m,apparent_temperature,precipitation_probability,precipitation',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    // The forecast widget's longest tab; Open-Meteo allows up to 16.
    forecast_days: '14',
    timezone: 'auto',
    temperature_unit: unit,
    wind_speed_unit: 'mph',
    precipitation_unit: 'inch',
  });

  const res = await fetch(`${FORECAST_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
  const data: OpenMeteoResponse = await res.json();

  // Fix #3: AQI is fetched from Open-Meteo's separate air-quality endpoint
  // instead of being permanently undefined.
  const aqi = await fetchAirQuality(latitude, longitude).catch(() => undefined);

  const current: WeatherCurrent = {
    temperature: data.current.temperature_2m,
    apparentTemperature: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    precipitation: data.current.precipitation,
    weatherCode: data.current.weather_code,
    cloudCover: data.current.cloud_cover,
    pressure: data.current.pressure_msl,
    windSpeed: data.current.wind_speed_10m,
    windDirection: data.current.wind_direction_10m,
    visibility: data.current.visibility ?? 10,
    uvIndex: data.current.uv_index ?? 0,
    isDay: data.current.is_day === 1,
    aqi,
    dewPoint: 0,
  };

  const hourly: WeatherHourly[] = data.hourly.time.slice(0, 24).map((time, i) => ({
    time,
    temperature: data.hourly.temperature_2m[i],
    apparentTemperature: data.hourly.apparent_temperature[i],
    precipitationProbability: data.hourly.precipitation_probability[i],
    precipitation: data.hourly.precipitation[i],
  }));

  const daily: WeatherDaily[] = data.daily.time.map((date, i) => ({
    date,
    weatherCode: data.daily.weather_code[i],
    temperatureMax: data.daily.temperature_2m_max[i],
    temperatureMin: data.daily.temperature_2m_min[i],
  }));

  return {
    locationName,
    latitude,
    longitude,
    timezone: data.timezone,
    current,
    hourly,
    daily,
    fetchedAt: Date.now(),
  };
}
