import { useId } from 'react';
import { useWeatherContext } from '../../hooks/WeatherContext';
import { WidgetCard } from '../../components/grid/WidgetCard';

function aqiInfo(aqi: number): { color: string; soft: string; label: string } {
  if (aqi <= 50) return { color: '#22c55e', soft: '#86efac', label: 'Good' };
  if (aqi <= 100) return { color: '#eab308', soft: '#fde047', label: 'Moderate' };
  if (aqi <= 150) return { color: '#f97316', soft: '#fdba74', label: 'Unhealthy for sensitive' };
  return { color: '#ef4444', soft: '#fca5a5', label: 'Unhealthy' };
}

const MAX_AQI = 200;
const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function WeatherAqiWidget() {
  const uid = useId().replace(/:/g, '');
  const { weather, loading } = useWeatherContext();

  if (loading && !weather) return <WidgetCard centered>Loading…</WidgetCard>;
  if (!weather) return <WidgetCard centered>Weather unavailable</WidgetCard>;

  const aqi = weather.current.aqi;

  if (aqi === undefined) {
    return (
      <WidgetCard title="Air quality" centered>
        <span className="text-sm text-slate-400">No data (enable in API)</span>
      </WidgetCard>
    );
  }

  const { color, soft, label } = aqiInfo(aqi);
  const pct = Math.min(1, aqi / MAX_AQI);
  const dashOffset = CIRCUMFERENCE * (1 - pct);

  return (
    <WidgetCard title="Air quality" centered>
      <svg viewBox="0 0 80 80" width={84} height={84}>
        <defs>
          <linearGradient id={`aqiGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={soft} />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
          <radialGradient id={`aqiFace-${uid}`} cx="50%" cy="42%" r="65%">
            <stop offset="0%" stopColor="#293548" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
        </defs>
        <circle cx={40} cy={40} r={RADIUS - 5} fill={`url(#aqiFace-${uid})`} />
        <circle cx={40} cy={40} r={RADIUS} fill="none" stroke="#0b1220" strokeWidth={9} />
        <circle
          className="gauge-fill"
          cx={40}
          cy={40}
          r={RADIUS}
          fill="none"
          stroke={`url(#aqiGrad-${uid})`}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 40 40)"
          style={{ filter: `drop-shadow(0 0 5px ${color}99)` }}
        />
        <text
          x={40}
          y={44}
          textAnchor="middle"
          fontSize={18}
          fontWeight="bold"
          fill="#f1f5f9"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.7))' }}
        >
          {Math.round(aqi)}
        </text>
        <text x={40} y={53} textAnchor="middle" fontSize={5.5} fill="#94a3b8" letterSpacing={1}>
          US AQI
        </text>
      </svg>
      <span className="text-xs font-medium" style={{ color, textShadow: `0 0 10px ${color}55` }}>
        {label}
      </span>
    </WidgetCard>
  );
}
