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
  const accent = rising ? '#34d399' : '#fb7185';

  return (
    <WidgetCard title="Pressure" centered>
      {/* 3D badge with direction arrow */}
      <div
        className="anim-float flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 30%, ${rising ? '#6ee7b7' : '#fda4af'}, ${
            rising ? '#059669' : '#e11d48'
          })`,
          boxShadow: `0 0 14px ${accent}66, inset 0 -2px 4px rgba(0,0,0,0.35), 0 3px 5px rgba(0,0,0,0.4)`,
        }}
      >
        <span
          className="text-2xl font-bold text-white"
          style={{
            display: 'inline-block',
            transform: rising ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.7s cubic-bezier(0.34, 1.3, 0.5, 1)',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          ↑
        </span>
      </div>
      {/* Fix #4: the API returns hPa, so it's labeled hPa instead of "in". */}
      <span className="text-2xl font-bold" style={{ color: accent, textShadow: `0 0 12px ${accent}55` }}>
        {pressure.toFixed(0)} hPa
      </span>
      <span className="text-xs text-slate-400">{rising ? 'Rising' : 'Falling'}</span>
      <div
        className="relative mt-1 h-2 w-full max-w-[8rem] rounded-full"
        style={{
          background: 'linear-gradient(to right, #6366f1, #38bdf8, #22c55e, #fbbf24)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.55)',
        }}
      >
        <div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full"
          style={{
            left: `calc(${pct}% - 7px)`,
            background: 'radial-gradient(circle at 35% 30%, #ffffff, #e2e8f0 55%, #94a3b8)',
            border: `2px solid ${accent}`,
            boxShadow: `0 0 8px ${accent}aa, 0 2px 3px rgba(0,0,0,0.5)`,
            transition: 'left 0.9s cubic-bezier(0.34, 1.3, 0.5, 1)',
          }}
        />
      </div>
    </WidgetCard>
  );
}
