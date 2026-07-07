import { useId } from 'react';
import { useWeatherContext } from '../../hooks/WeatherContext';
import { WidgetCard } from '../../components/grid/WidgetCard';

function uvLabel(uv: number): string {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very high';
  return 'Extreme';
}

function uvColor(uv: number): string {
  if (uv <= 2) return '#22c55e';
  if (uv <= 5) return '#facc15';
  if (uv <= 7) return '#f97316';
  if (uv <= 10) return '#ef4444';
  return '#a855f7';
}

export function WeatherUvWidget() {
  const uid = useId().replace(/:/g, '');
  const { weather, loading } = useWeatherContext();

  if (loading && !weather) return <WidgetCard centered>Loading…</WidgetCard>;
  if (!weather) return <WidgetCard centered>Weather unavailable</WidgetCard>;

  const uv = weather.current.uvIndex;
  const clamped = Math.min(11, Math.max(0, uv));
  const sweep = (clamped / 11) * 180;
  const color = uvColor(uv);

  return (
    <WidgetCard title="UV index" centered>
      <svg viewBox="0 0 100 62" width={104} height={64}>
        <defs>
          <linearGradient id={`uvGradient-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="25%" stopColor="#a3e635" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="75%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        {/* recessed track */}
        <path d="M 8 52 A 42 42 0 0 1 92 52" fill="none" stroke="#0b1220" strokeWidth={10} strokeLinecap="round" />
        <path
          d="M 8 52 A 42 42 0 0 1 92 52"
          fill="none"
          stroke={`url(#uvGradient-${uid})`}
          strokeWidth={7}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
        />

        {/* scale ticks */}
        {Array.from({ length: 12 }, (_, i) => {
          const rad = ((-180 + (i / 11) * 180) * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={50 + 34.5 * Math.cos(rad)}
              y1={52 + 34.5 * Math.sin(rad)}
              x2={50 + 36.5 * Math.cos(rad)}
              y2={52 + 36.5 * Math.sin(rad)}
              stroke="#0f172a"
              strokeWidth={1}
              opacity={0.6}
            />
          );
        })}

        {/* needle */}
        <g className="gauge-needle" style={{ transform: `rotate(${sweep}deg)`, transformOrigin: '50px 52px' }}>
          <line
            x1={50}
            y1={52}
            x2={16}
            y2={52}
            stroke="#f1f5f9"
            strokeWidth={2.2}
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }}
          />
          <circle cx={16} cy={52} r={3} fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
        </g>
        <circle cx={50} cy={52} r={4.5} fill="#1e293b" stroke="#64748b" strokeWidth={1} />
        <circle cx={48.8} cy={50.8} r={1.3} fill="#e2e8f0" opacity={0.8} />
      </svg>
      <span className="text-2xl font-bold" style={{ color, textShadow: `0 0 12px ${color}66` }}>
        {uv.toFixed(1)}
      </span>
      <span className="text-xs" style={{ color }}>
        {uvLabel(uv)}
      </span>
    </WidgetCard>
  );
}
