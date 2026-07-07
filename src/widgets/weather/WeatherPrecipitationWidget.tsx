import { useId } from 'react';
import { useWeatherContext } from '../../hooks/WeatherContext';
import { WidgetCard } from '../../components/grid/WidgetCard';

export function WeatherPrecipitationWidget() {
  const uid = useId().replace(/:/g, '');
  const { weather, loading } = useWeatherContext();

  if (loading && !weather) return <WidgetCard centered>Loading…</WidgetCard>;
  if (!weather) return <WidgetCard centered>Weather unavailable</WidgetCard>;

  const value = weather.current.precipitation;
  const raining = value > 0;
  const dropOpacity = raining ? 1 : 0.25;

  return (
    <WidgetCard title="Precipitation" centered>
      <svg viewBox="0 0 56 48" width={64} height={55}>
        <defs>
          <linearGradient id={`rainCloud-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={raining ? '#94a3b8' : '#cbd5e1'} />
            <stop offset="100%" stopColor={raining ? '#475569' : '#64748b'} />
          </linearGradient>
          <linearGradient id={`rainDrop-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>

        <path
          d="M14 26a8 8 0 0 1 .7-15.96A9.8 9.8 0 0 1 33.8 8.3 7 7 0 0 1 34.9 22.2V26H14Z"
          fill={`url(#rainCloud-${uid})`}
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.45))' }}
        />

        {/* falling drops */}
        {[
          { x: 17, delay: 0, dur: 1.3 },
          { x: 25, delay: 0.5, dur: 1.5 },
          { x: 33, delay: 0.9, dur: 1.2 },
        ].map((d, i) => (
          <path
            key={i}
            className="anim-drop"
            d={`M${d.x} 30 q1.6 2.6 0 4.4 q-1.6 -1.8 0 -4.4Z`}
            fill={`url(#rainDrop-${uid})`}
            opacity={dropOpacity}
            style={{
              animation: raining ? `drop-fall ${d.dur}s linear ${d.delay}s infinite` : 'none',
              filter: 'drop-shadow(0 0 2px rgba(56,189,248,0.6))',
            }}
          />
        ))}
      </svg>
      <span className={`text-2xl font-bold ${raining ? 'text-sky-300' : 'text-slate-100'}`}>
        {value.toFixed(2)} in
      </span>
      <span className="text-xs text-slate-500">next 24h · {raining ? 'Precipitation expected' : 'No precipitation'}</span>
    </WidgetCard>
  );
}
