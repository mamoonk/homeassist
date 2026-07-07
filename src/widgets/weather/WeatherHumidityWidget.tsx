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
        {/* glass tube */}
        <div
          className="relative h-20 w-6 overflow-hidden rounded-full"
          style={{
            background: 'linear-gradient(to right, #1e293b, #0f172a 40%, #1e293b)',
            border: '1px solid rgba(125, 211, 252, 0.35)',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.35)',
          }}
        >
          {/* liquid */}
          <div
            className="gauge-fill absolute bottom-0 left-0 right-0"
            style={{
              height: `${pct}%`,
              background: 'linear-gradient(to top, #0369a1, #0ea5e9 55%, #7dd3fc)',
              boxShadow: '0 0 10px rgba(14,165,233,0.55)',
            }}
          >
            <div className="absolute -top-0.5 left-0 right-0 h-1 rounded-[100%] bg-sky-200/80" />
          </div>
          {/* rising bubbles */}
          <span
            className="anim-bubble absolute bottom-1 left-1 h-1 w-1 rounded-full bg-white/50"
            style={{ animation: 'bubble-rise 3.2s ease-in infinite' }}
          />
          <span
            className="anim-bubble absolute bottom-1 left-3 h-1.5 w-1.5 rounded-full bg-white/40"
            style={{ animation: 'bubble-rise 4.1s ease-in 1.2s infinite' }}
          />
          <span
            className="anim-bubble absolute bottom-1 left-2 h-0.5 w-0.5 rounded-full bg-white/60"
            style={{ animation: 'bubble-rise 2.7s ease-in 2s infinite' }}
          />
          {/* glass highlight */}
          <div className="absolute bottom-1 left-0.5 top-1 w-1 rounded-full bg-white/20 blur-[1px]" />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-sky-300" style={{ textShadow: '0 0 12px rgba(56,189,248,0.4)' }}>
            {Math.round(pct)}%
          </span>
          <span className="text-xs text-slate-400">{label}</span>
        </div>
      </div>
    </WidgetCard>
  );
}
