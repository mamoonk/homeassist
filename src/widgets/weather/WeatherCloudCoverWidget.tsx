import { useWeatherContext } from '../../hooks/WeatherContext';
import { WidgetCard } from '../../components/grid/WidgetCard';

function CloudIcon({ opacity }: { opacity: number }) {
  return (
    <svg viewBox="0 0 24 24" width={40} height={40} fill="none">
      <path
        d="M6.5 18a4.5 4.5 0 0 1-.4-8.98A5.5 5.5 0 0 1 16.9 8a4 4 0 0 1 .6 7.98V18H6.5Z"
        fill="#cbd5e1"
        opacity={opacity}
      />
    </svg>
  );
}

export function WeatherCloudCoverWidget() {
  const { weather, loading } = useWeatherContext();

  if (loading && !weather) return <WidgetCard centered>Loading…</WidgetCard>;
  if (!weather) return <WidgetCard centered>Weather unavailable</WidgetCard>;

  const pct = weather.current.cloudCover;
  const label = pct < 25 ? 'Clear' : pct < 75 ? 'Partly cloudy' : 'Cloudy';
  const caption = pct < 25 ? 'Mostly clear sky' : pct < 75 ? 'Mixed clouds' : 'Mostly cloudy sky';

  return (
    <WidgetCard title="Cloud cover" centered>
      <CloudIcon opacity={0.3 + (pct / 100) * 0.7} />
      <span className="text-2xl font-bold">{Math.round(pct)}%</span>
      <span className="text-sm text-slate-300">{label}</span>
      <span className="text-xs text-slate-500">{caption}</span>
    </WidgetCard>
  );
}
