import { useWeatherContext } from '../../hooks/WeatherContext';
import { WidgetCard } from '../../components/grid/WidgetCard';

const FEET_PER_MILE = 5280;

export function WeatherVisibilityWidget() {
  const { weather, loading } = useWeatherContext();

  if (loading && !weather) return <WidgetCard centered>Loading…</WidgetCard>;
  if (!weather) return <WidgetCard centered>Weather unavailable</WidgetCard>;

  // Fix #4: with wind_speed_unit=mph, Open-Meteo returns visibility in feet
  // (see current_units.visibility), not miles — convert properly instead of
  // treating the raw number as already-miles.
  const miles = weather.current.visibility / FEET_PER_MILE;
  const label = miles >= 10 ? 'Excellent' : miles >= 5 ? 'Good' : miles >= 2 ? 'Fair' : 'Poor';

  return (
    <WidgetCard title="Visibility" centered>
      <span style={{ fontSize: 32 }}>👁️</span>
      <span className="text-2xl font-bold">{miles.toFixed(1)} mi</span>
      <span className="text-xs text-slate-400">{label}</span>
    </WidgetCard>
  );
}
