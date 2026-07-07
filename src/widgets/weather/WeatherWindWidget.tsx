import { useId } from 'react';
import { useWeatherContext } from '../../hooks/WeatherContext';
import { WidgetCard } from '../../components/grid/WidgetCard';
import { beaufortForce, compassDirection } from '../../services/windCompass';

export function WeatherWindWidget() {
  const uid = useId().replace(/:/g, '');
  const { weather, loading } = useWeatherContext();

  if (loading && !weather) return <WidgetCard centered>Loading…</WidgetCard>;
  if (!weather) return <WidgetCard centered>Weather unavailable</WidgetCard>;

  const { windSpeed, windDirection } = weather.current;
  const ticks = Array.from({ length: 36 }, (_, i) => i * 10);

  return (
    <WidgetCard title="Wind" centered>
      <svg viewBox="0 0 100 100" width={84} height={84} style={{ filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.45))' }}>
        <defs>
          <radialGradient id={`windFace-${uid}`} cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#3b4a63" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
          <linearGradient id={`windBezel-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
          <linearGradient id={`windNorth-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        <circle cx={50} cy={50} r={48} fill={`url(#windBezel-${uid})`} />
        <circle cx={50} cy={50} r={44} fill={`url(#windFace-${uid})`} />

        {ticks.map((deg) => {
          const major = deg % 90 === 0;
          const rad = ((deg - 90) * Math.PI) / 180;
          const r1 = major ? 37 : 40;
          const r2 = 42.5;
          return (
            <line
              key={deg}
              x1={50 + r1 * Math.cos(rad)}
              y1={50 + r1 * Math.sin(rad)}
              x2={50 + r2 * Math.cos(rad)}
              y2={50 + r2 * Math.sin(rad)}
              stroke={major ? '#e2e8f0' : '#475569'}
              strokeWidth={major ? 1.4 : 0.6}
            />
          );
        })}

        <text x={50} y={20} textAnchor="middle" fontSize={9.5} fontWeight="bold" fill="#f59e0b">N</text>
        <text x={83} y={53.5} textAnchor="middle" fontSize={8} fill="#94a3b8">E</text>
        <text x={50} y={87} textAnchor="middle" fontSize={8} fill="#94a3b8">S</text>
        <text x={17} y={53.5} textAnchor="middle" fontSize={8} fill="#94a3b8">W</text>

        {/* compass needle: warm north tip, slate tail */}
        <g
          className="gauge-needle"
          style={{ transform: `rotate(${windDirection}deg)`, transformOrigin: '50px 50px' }}
        >
          <polygon
            points="50,15 45.5,50 54.5,50"
            fill={`url(#windNorth-${uid})`}
            style={{ filter: 'drop-shadow(0 0 3px rgba(245,158,11,0.7))' }}
          />
          <polygon points="50,85 45.5,50 54.5,50" fill="#64748b" />
        </g>

        <circle cx={50} cy={50} r={5} fill="#1e293b" stroke="#94a3b8" strokeWidth={1} />
        <circle cx={48.5} cy={48.5} r={1.5} fill="#e2e8f0" opacity={0.8} />

        {/* glass highlight */}
        <ellipse cx={50} cy={30} rx={32} ry={16} fill="#ffffff" opacity={0.05} />
      </svg>
      <span className="text-sm">From {compassDirection(windDirection)} ({Math.round(windDirection)}°)</span>
      <span className="text-lg font-semibold text-amber-400">{Math.round(windSpeed)} mph</span>
      <span className="text-xs text-slate-500">Force {beaufortForce(windSpeed)} (Beaufort)</span>
    </WidgetCard>
  );
}
