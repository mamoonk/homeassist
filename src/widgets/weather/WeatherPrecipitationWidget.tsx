import { useWeatherContext } from '../../hooks/WeatherContext';
import { WidgetCard } from '../../components/grid/WidgetCard';

export function WeatherPrecipitationWidget() {
  const { weather, loading } = useWeatherContext();

  if (loading && !weather) return <WidgetCard centered>Loading…</WidgetCard>;
  if (!weather) return <WidgetCard centered>Weather unavailable</WidgetCard>;

  const value = weather.current.precipitation;

  return (
    <WidgetCard title="Precipitation" centered>
      <span style={{ fontSize: 32, opacity: value === 0 ? 0.5 : 1 }}>🌧️</span>
      <span className="text-2xl font-bold">{value.toFixed(2)} in</span>
      <span className="text-xs text-slate-500">next 24h · {value > 0 ? 'Precipitation expected' : 'No precipitation'}</span>
    </WidgetCard>
  );
}
