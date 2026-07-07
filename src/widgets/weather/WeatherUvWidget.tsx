import { useWeatherContext } from '../../hooks/WeatherContext';
import { WidgetCard } from '../../components/grid/WidgetCard';

function uvLabel(uv: number): string {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very high';
  return 'Extreme';
}

export function WeatherUvWidget() {
  const { weather, loading } = useWeatherContext();

  if (loading && !weather) return <WidgetCard centered>Loading…</WidgetCard>;
  if (!weather) return <WidgetCard centered>Weather unavailable</WidgetCard>;

  const uv = weather.current.uvIndex;
  const clamped = Math.min(11, Math.max(0, uv));
  const angle = -180 + (clamped / 11) * 180;
  const rad = (angle * Math.PI) / 180;
  const needleX = 50 + 34 * Math.cos(rad);
  const needleY = 50 + 34 * Math.sin(rad);

  return (
    <WidgetCard title="UV index" centered>
      <svg viewBox="0 0 100 60" width={100} height={60}>
        <defs>
          <linearGradient id="uvGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="25%" stopColor="#a3e635" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="75%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        <path d="M 8 50 A 42 42 0 0 1 92 50" fill="none" stroke="url(#uvGradient)" strokeWidth={8} strokeLinecap="round" />
        <line x1={50} y1={50} x2={needleX} y2={needleY} stroke="#e2e8f0" strokeWidth={2} strokeLinecap="round" />
        <circle cx={50} cy={50} r={3} fill="#e2e8f0" />
      </svg>
      <span className="text-2xl font-bold">{uv.toFixed(1)}</span>
      <span className="text-xs text-slate-400">{uvLabel(uv)}</span>
    </WidgetCard>
  );
}
