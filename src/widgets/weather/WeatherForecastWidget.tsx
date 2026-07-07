import { useWeatherContext } from '../../hooks/WeatherContext';
import { weatherEmoji } from '../../services/weatherIcon';
import { WidgetCard } from '../../components/grid/WidgetCard';
import dayjs from '../../services/dayjsSetup';

export function WeatherForecastWidget() {
  const { weather, loading } = useWeatherContext();

  if (loading && !weather) return <WidgetCard centered>Loading…</WidgetCard>;
  if (!weather) return <WidgetCard centered>Weather unavailable</WidgetCard>;

  return (
    <WidgetCard title="7-day forecast">
      <div className="flex h-full gap-2 overflow-x-auto" style={{ fontSize: 'clamp(0.5rem, 4cqw, 1.5rem)' }}>
        {weather.daily.slice(0, 7).map((day) => (
          <div
            key={day.date}
            className="flex flex-shrink-0 flex-col items-center gap-1 rounded-lg px-2 py-1 text-center transition hover:bg-white/5"
          >
            <span className="text-slate-300">{dayjs(day.date).format('ddd')}</span>
            <span style={{ fontSize: '1.5em', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }}>
              {weatherEmoji(day.weatherCode, true)}
            </span>
            <span className="font-semibold text-amber-400">{Math.round(day.temperatureMax)}°</span>
            <span className="text-slate-500">{Math.round(day.temperatureMin)}°</span>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
