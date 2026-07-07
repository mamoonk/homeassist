import { useId } from 'react';
import { useWeatherContext } from '../../hooks/WeatherContext';
import { WidgetCard } from '../../components/grid/WidgetCard';
import { moonIllumination, nextFullMoon } from '../../services/moon';
import { getPrayerTimes } from '../../services/azan';
import dayjs from '../../services/dayjsSetup';

export function WeatherMoonWidget() {
  const uid = useId().replace(/:/g, '');
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
      <svg
        viewBox="0 0 48 44"
        width={60}
        height={55}
        style={{ filter: 'drop-shadow(0 0 8px rgba(226,232,240,0.3))' }}
      >
        <defs>
          <radialGradient id={`moonGrad-${uid}`} cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="60%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#8ea0b8" />
          </radialGradient>
          <clipPath id={`moonClip-${uid}`}>
            <rect x={4} y={0} width={clipWidth} height={44} />
          </clipPath>
        </defs>

        {/* twinkling stars */}
        <circle className="anim-twinkle" cx={5} cy={8} r={0.9} fill="#e2e8f0" style={{ animation: 'twinkle 3s ease-in-out infinite' }} />
        <circle className="anim-twinkle" cx={43} cy={6} r={1.1} fill="#e2e8f0" style={{ animation: 'twinkle 4s ease-in-out 1s infinite' }} />
        <circle className="anim-twinkle" cx={45} cy={32} r={0.7} fill="#e2e8f0" style={{ animation: 'twinkle 3.5s ease-in-out 2s infinite' }} />

        {/* moon disc */}
        <circle cx={24} cy={22} r={18} fill={`url(#moonGrad-${uid})`} />
        {/* craters */}
        <circle cx={17} cy={16} r={3.2} fill="#94a3b8" opacity={0.45} />
        <circle cx={29} cy={27} r={2.4} fill="#94a3b8" opacity={0.4} />
        <circle cx={31} cy={13} r={1.6} fill="#94a3b8" opacity={0.35} />
        <circle cx={21} cy={31} r={1.8} fill="#94a3b8" opacity={0.35} />
        <circle cx={16.2} cy={15.2} r={1.4} fill="#f1f5f9" opacity={0.35} />

        {/* phase shadow */}
        <g clipPath={`url(#moonClip-${uid})`} style={{ transform: 'translateX(4px)', transformOrigin: 'center' }}>
          <circle cx={20} cy={22} r={18.4} fill="#0b1220" opacity={0.93} />
        </g>
      </svg>
      <span className="text-lg font-bold text-slate-100" style={{ textShadow: '0 0 10px rgba(226,232,240,0.45)' }}>
        {Math.round(illumination * 100)}%
      </span>
      <span className="text-xs text-slate-400">Next full moon {dayjs(fullMoonDate).format('MMM D')}</span>
      <div className="mt-1 flex gap-3 text-xs">
        <span className="text-amber-400/90">☀︎ {dayjs(times.sunrise).format('h:mm A')}</span>
        <span className="text-indigo-300/90">☾ {dayjs(times.maghrib).format('h:mm A')}</span>
      </div>
    </WidgetCard>
  );
}
