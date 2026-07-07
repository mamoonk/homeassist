import { useWeatherContext } from '../../hooks/WeatherContext';
import { WidgetCard } from '../../components/grid/WidgetCard';

const MIN_PRESSURE = 980;
const MAX_PRESSURE = 1040;

export function WeatherPressureWidget() {
  const { weather, loading } = useWeatherContext();

  if (loading && !weather) return <WidgetCard centered>Loading…</WidgetCard>;
  if (!weather) return <WidgetCard centered>Weather unavailable</WidgetCard>;

  const pressure = weather.current.pressure;
  const rising = pressure >= 1010;
  const pct = Math.min(1, Math.max(0, (pressure - MIN_PRESSURE) / (MAX_PRESSURE - MIN_PRESSURE))) * 100;

  return (
    <WidgetCard title="Pressure" centered>
      <span
        style={{ fontSize: 28, display: 'inline-block', transform: rising ? 'rotate(0deg)' : 'rotate(180deg)' }}
      >
        ↑
      </span>
      {/* Fix #4: the API returns hPa, so it's labeled hPa instead of "in". */}
      <span className="text-2xl font-bold">{pressure.toFixed(0)} hPa</span>
      <span className="text-xs text-slate-400">{rising ? 'Rising' : 'Falling'}</span>
      <div className="mt-1 h-1.5 w-full max-w-[8rem] rounded-full bg-slate-700">
        <div className="h-1.5 rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
      </div>
    </WidgetCard>
  );
}
