import { useEffect, useState } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { useDataStore } from '../store/dataStore';
import { fetchWeather } from '../services/weather';
import type { WeatherData } from '../types';

export function useWeather(refetchIntervalMs: number) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const temperatureUnit = useSettingsStore((s) => s.temperatureUnit);
  const settingsLat = useSettingsStore((s) => s.weatherLatitude);
  const settingsLon = useSettingsStore((s) => s.weatherLongitude);
  const settingsName = useSettingsStore((s) => s.weatherLocationName);
  const override = useDataStore((s) => s.weatherLocationOverride);

  const latitude = override?.lat ?? settingsLat;
  const longitude = override?.lon ?? settingsLon;
  const locationName = override?.name ?? settingsName;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await fetchWeather(latitude, longitude, locationName, temperatureUnit);
        if (!cancelled) setWeather(data);
      } catch {
        if (!cancelled) setWeather(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const id = setInterval(load, refetchIntervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [latitude, longitude, locationName, temperatureUnit, refetchIntervalMs]);

  return { weather, loading, isOverridden: Boolean(override) };
}
