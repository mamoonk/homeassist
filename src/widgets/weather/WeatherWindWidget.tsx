import { useWeatherContext } from '../../hooks/WeatherContext';
import { WidgetCard } from '../../components/grid/WidgetCard';
import { beaufortForce, compassDirection } from '../../services/windCompass';

export function WeatherWindWidget() {
  const { weather, loading } = useWeatherContext();

  if (loading && !weather) return <WidgetCard centered>Loading…</WidgetCard>;
  if (!weather) return <WidgetCard centered>Weather unavailable</WidgetCard>;

  const { windSpeed, windDirection } = weather.current;
  const needleAngle = windDirection;

  return (
    <WidgetCard title="Wind" centered>
      <svg viewBox="0 0 100 100" width={72} height={72}>
        <circle cx={50} cy={50} r={46} fill="none" stroke="#334155" strokeWidth={2} />
        <text x={50} y={14} textAnchor="middle" fontSize={10} fill="#94a3b8">N</text>
        <text x={90} y={54} textAnchor="middle" fontSize={10} fill="#94a3b8">E</text>
        <text x={50} y={92} textAnchor="middle" fontSize={10} fill="#94a3b8">S</text>
        <text x={10} y={54} textAnchor="middle" fontSize={10} fill="#94a3b8">W</text>
        <g transform={`rotate(${needleAngle} 50 50)`}>
          <line x1={50} y1={50} x2={50} y2={16} stroke="#f59e0b" strokeWidth={3} strokeLinecap="round" />
          <circle cx={50} cy={16} r={3} fill="#f59e0b" />
        </g>
      </svg>
      <span className="text-sm">From {compassDirection(windDirection)} ({Math.round(windDirection)}°)</span>
      <span className="text-lg font-semibold">{Math.round(windSpeed)} mph</span>
      <span className="text-xs text-slate-500">Force {beaufortForce(windSpeed)} (Beaufort)</span>
    </WidgetCard>
  );
}
