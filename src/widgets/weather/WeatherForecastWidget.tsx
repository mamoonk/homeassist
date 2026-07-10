import { useState } from 'react';
import { useWeatherContext } from '../../hooks/WeatherContext';
import { weatherEmoji } from '../../services/weatherIcon';
import { WidgetCard } from '../../components/grid/WidgetCard';
import dayjs from '../../services/dayjsSetup';

const DAY_OPTIONS = [7, 14] as const;

export function WeatherForecastWidget() {
  const { weather, loading } = useWeatherContext();
  const [days, setDays] = useState<(typeof DAY_OPTIONS)[number]>(7);

  if (loading && !weather) return <WidgetCard centered>Loading…</WidgetCard>;
  if (!weather) return <WidgetCard centered>Weather unavailable</WidgetCard>;

  const tabClass = (d: number) =>
    `rounded px-2 py-0.5 text-xs min-h-0 min-w-0 transition ${
      days === d ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:bg-white/5'
    }`;

  return (
    <div className="widget-container flex h-full flex-col gap-1 p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
        Forecast
        <span className="ml-auto flex gap-1 normal-case tracking-normal">
          {DAY_OPTIONS.map((d) => (
            <button key={d} type="button" className={tabClass(d)} onClick={() => setDays(d)}>
              {d}d
            </button>
          ))}
        </span>
      </div>
      {/* Cells flex to fit so every selected day is visible without
          horizontal scrolling (touch-swipe inside grid items starts a drag). */}
      <div
        className="flex min-h-0 flex-1 gap-1"
        style={{ fontSize: `clamp(0.4rem, ${days === 7 ? 4 : 2.1}cqw, 1.5rem)` }}
      >
        {weather.daily.slice(0, days).map((day) => (
          <div
            key={day.date}
            className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-0.5 py-1 text-center transition hover:bg-white/5"
          >
            <span className="text-slate-300">{dayjs(day.date).format('ddd')}</span>
            <span className="text-slate-500">{dayjs(day.date).format('M/D')}</span>
            <span style={{ fontSize: '1.5em', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }}>
              {weatherEmoji(day.weatherCode, true)}
            </span>
            <span className="font-semibold text-amber-400">{Math.round(day.temperatureMax)}°</span>
            <span className="text-slate-500">{Math.round(day.temperatureMin)}°</span>
          </div>
        ))}
      </div>
    </div>
  );
}
