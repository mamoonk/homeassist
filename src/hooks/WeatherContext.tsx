import { createContext, useContext, type ReactNode } from 'react';
import type { WeatherData } from '../types';

export interface WeatherContextValue {
  weather: WeatherData | null;
  loading: boolean;
  isOverridden: boolean;
}

const WeatherContext = createContext<WeatherContextValue | null>(null);

export function WeatherProvider({ value, children }: { value: WeatherContextValue; children: ReactNode }) {
  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
}

export function useWeatherContext(): WeatherContextValue {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeatherContext must be used within WeatherProvider');
  return ctx;
}
