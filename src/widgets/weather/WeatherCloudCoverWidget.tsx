import { useId } from 'react';
import { useWeatherContext } from '../../hooks/WeatherContext';
import { WidgetCard } from '../../components/grid/WidgetCard';

export function WeatherCloudCoverWidget() {
  const uid = useId().replace(/:/g, '');
  const { weather, loading } = useWeatherContext();

  if (loading && !weather) return <WidgetCard centered>Loading…</WidgetCard>;
  if (!weather) return <WidgetCard centered>Weather unavailable</WidgetCard>;

  const pct = weather.current.cloudCover;
  const label = pct < 25 ? 'Clear' : pct < 75 ? 'Partly cloudy' : 'Cloudy';
  const caption = pct < 25 ? 'Mostly clear sky' : pct < 75 ? 'Mixed clouds' : 'Mostly cloudy sky';
  const sunOpacity = 1 - (pct / 100) * 0.75;
  const cloudOpacity = 0.35 + (pct / 100) * 0.65;

  return (
    <WidgetCard title="Cloud cover" centered>
      <svg viewBox="0 0 64 44" width={72} height={50}>
        <defs>
          <radialGradient id={`sunGrad-${uid}`} cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="55%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </radialGradient>
          <linearGradient id={`cloudFront-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <linearGradient id={`cloudBack-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
        </defs>

        {/* sun with slowly rotating rays */}
        <g opacity={sunOpacity} style={{ filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.7))' }}>
          <g
            className="anim-sun"
            style={{ animation: 'sun-spin 24s linear infinite', transformOrigin: '24px 16px' }}
          >
            {Array.from({ length: 8 }, (_, i) => {
              const rad = (i * 45 * Math.PI) / 180;
              return (
                <line
                  key={i}
                  x1={24 + 10.5 * Math.cos(rad)}
                  y1={16 + 10.5 * Math.sin(rad)}
                  x2={24 + 14 * Math.cos(rad)}
                  y2={16 + 14 * Math.sin(rad)}
                  stroke="#fbbf24"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                />
              );
            })}
          </g>
          <circle cx={24} cy={16} r={8} fill={`url(#sunGrad-${uid})`} />
        </g>

        {/* back cloud drifting left */}
        <g
          className="anim-cloud-back"
          opacity={cloudOpacity * 0.7}
          style={{ animation: 'cloud-drift-back 7s ease-in-out infinite' }}
        >
          <path
            d="M20 30a5.5 5.5 0 0 1 .5-10.97A6.7 6.7 0 0 1 33.6 17.6 4.9 4.9 0 0 1 34.3 27.4V30H20Z"
            fill={`url(#cloudBack-${uid})`}
          />
        </g>

        {/* front cloud drifting right */}
        <g
          className="anim-cloud-front"
          opacity={cloudOpacity}
          style={{ animation: 'cloud-drift 6s ease-in-out infinite', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }}
        >
          <path
            d="M26 40a7 7 0 0 1 .6-13.96A8.5 8.5 0 0 1 43.2 24.3 6.2 6.2 0 0 1 44.1 36.7V40H26Z"
            fill={`url(#cloudFront-${uid})`}
          />
        </g>
      </svg>
      <span className="text-2xl font-bold text-slate-100">{Math.round(pct)}%</span>
      <span className="text-sm text-slate-300">{label}</span>
      <span className="text-xs text-slate-500">{caption}</span>
    </WidgetCard>
  );
}
