import { useWeatherContext } from '../../hooks/WeatherContext';
import { WidgetCard } from '../../components/grid/WidgetCard';
import { moonIllumination, nextFullMoon } from '../../services/moon';
import { getPrayerTimes } from '../../services/azan';
import dayjs from '../../services/dayjsSetup';

export function WeatherMoonWidget() {
  const { weather, loading } = useWeatherContext();

  if (loading && !weather) return <WidgetCard centered>Loading…</WidgetCard>;
  if (!weather) return <WidgetCard centered>Weather unavailable</WidgetCard>;

  const now = new Date();
  const illumination = moonIllumination(now);
  const fullMoonDate = nextFullMoon(now);
  const times = getPrayerTimes(weather.latitude, weather.longitude, now, 'MuslimWorldLeague');

  const clipWidth = 20 * (1 - illumination);

  return (
    <WidgetCard title="Moon" centered>
      <svg viewBox="0 0 40 40" width={48} height={48}>
        <defs>
          <clipPath id="moonClip">
            <rect x={0} y={0} width={clipWidth} height={40} />
          </clipPath>
        </defs>
        <circle cx={20} cy={20} r={18} fill="#e2e8f0" />
        <circle cx={20} cy={20} r={18} fill="#0f172a" clipPath="url(#moonClip)" />
      </svg>
      <span className="text-lg font-bold">{Math.round(illumination * 100)}%</span>
      <span className="text-xs text-slate-400">Next full moon {dayjs(fullMoonDate).format('MMM D')}</span>
      <div className="mt-1 flex gap-3 text-xs text-slate-400">
        <span>Sunrise {dayjs(times.sunrise).format('h:mm A')}</span>
        <span>Sunset {dayjs(times.maghrib).format('h:mm A')}</span>
      </div>
    </WidgetCard>
  );
}
