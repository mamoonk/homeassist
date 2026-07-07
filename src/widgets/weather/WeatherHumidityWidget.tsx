import { useWeatherContext } from '../../hooks/WeatherContext';
import { WidgetCard } from '../../components/grid/WidgetCard';

export function WeatherHumidityWidget() {
  const { weather, loading } = useWeatherContext();

  if (loading && !weather) return <WidgetCard centered>Loading…</WidgetCard>;
  if (!weather) return <WidgetCard centered>Weather unavailable</WidgetCard>;

  const pct = weather.current.humidity;
  const label = pct < 30 ? 'Low' : pct < 60 ? 'Normal' : 'High';

  return (
    <WidgetCard title="Humidity" centered>
      <div className="flex items-end gap-3">
        <div className="relative h-16 w-5 overflow-hidden rounded-full border border-sky-400/50 bg-slate-800">
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-sky-500 to-sky-300"
            style={{ height: `${pct}%` }}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold">{Math.round(pct)}%</span>
          <span className="text-xs text-slate-400">{label}</span>
        </div>
      </div>
    </WidgetCard>
  );
}
