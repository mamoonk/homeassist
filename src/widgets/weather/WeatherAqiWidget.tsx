import { useWeatherContext } from '../../hooks/WeatherContext';
import { WidgetCard } from '../../components/grid/WidgetCard';

function aqiInfo(aqi: number): { color: string; label: string } {
  if (aqi <= 50) return { color: '#22c55e', label: 'Good' };
  if (aqi <= 100) return { color: '#eab308', label: 'Moderate' };
  if (aqi <= 150) return { color: '#f97316', label: 'Unhealthy for sensitive' };
  return { color: '#ef4444', label: 'Unhealthy' };
}

const MAX_AQI = 200;
const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function WeatherAqiWidget() {
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

  const { color, label } = aqiInfo(aqi);
  const pct = Math.min(1, aqi / MAX_AQI);
  const dashOffset = CIRCUMFERENCE * (1 - pct);

  return (
    <WidgetCard title="Air quality" centered>
      <svg viewBox="0 0 80 80" width={80} height={80}>
        <circle cx={40} cy={40} r={RADIUS} fill="none" stroke="#334155" strokeWidth={8} />
        <circle
          cx={40}
          cy={40}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 40 40)"
        />
        <text x={40} y={44} textAnchor="middle" fontSize={18} fontWeight="bold" fill="#f1f5f9">
          {Math.round(aqi)}
        </text>
      </svg>
      <span className="text-xs text-slate-400" style={{ color }}>
        {label}
      </span>
    </WidgetCard>
  );
}
