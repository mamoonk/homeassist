import { create } from 'zustand';
import type { WeatherLocationOverride } from '../types';

interface DataStore {
  weatherLocationOverride: WeatherLocationOverride | null;
  setWeatherLocationOverride: (override: WeatherLocationOverride | null) => void;
  toggleWeatherLocationOverride: (override: WeatherLocationOverride) => void;
}

export const useDataStore = create<DataStore>()((set, get) => ({
  weatherLocationOverride: null,
  setWeatherLocationOverride: (override) => set({ weatherLocationOverride: override }),
  toggleWeatherLocationOverride: (override) => {
    const current = get().weatherLocationOverride;
    set({
      weatherLocationOverride: current?.zoneId === override.zoneId ? null : override,
    });
  },
}));
