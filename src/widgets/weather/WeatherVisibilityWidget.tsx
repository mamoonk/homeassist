import { useId } from 'react';
import { useWeatherContext } from '../../hooks/WeatherContext';
import { WidgetCard } from '../../components/grid/WidgetCard';

const FEET_PER_MILE = 5280;

export function WeatherVisibilityWidget() {
  const uid = useId().replace(/:/g, '');
  const { weather, loading } = useWeatherContext();

  if (loading && !weather) return <WidgetCard centered>Loading…</WidgetCard>;
  if (!weather) return <WidgetCard centered>Weather unavailable</WidgetCard>;

  // Fix #4: with wind_speed_unit=mph, Open-Meteo returns visibility in feet
  // (see current_units.visibility), not miles — convert properly instead of
  // treating the raw number as already-miles.
  const miles = weather.current.visibility / FEET_PER_MILE;
  const label = miles >= 10 ? 'Excellent' : miles >= 5 ? 'Good' : miles >= 2 ? 'Fair' : 'Poor';
  const hazy = miles < 5;

  return (
    <WidgetCard title="Visibility" centered>
      <svg viewBox="0 0 64 40" width={72} height={45}>
        <defs>
          <radialGradient id={`iris-${uid}`} cx="42%" cy="38%" r="65%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="60%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#075985" />
          </radialGradient>
          <linearGradient id={`sclera-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
        </defs>

        {/* blinking eye */}
        <g
          className="anim-blink"
          style={{ animation: 'eye-blink 6s ease-in-out infinite', transformOrigin: '32px 20px' }}
        >
          <path
            d="M6 20 Q32 -2 58 20 Q32 42 6 20 Z"
            fill={`url(#sclera-${uid})`}
            stroke="#334155"
            strokeWidth={1.2}
            style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }}
          />
          <circle cx={32} cy={20} r={9.5} fill={`url(#iris-${uid})`} style={{ filter: 'drop-shadow(0 0 4px rgba(14,165,233,0.6))' }} />
          <circle cx={32} cy={20} r={4.2} fill="#0f172a" />
          <circle cx={29.5} cy={17.2} r={1.8} fill="#ffffff" opacity={0.9} />
        </g>

        {/* haze streaks when visibility is reduced */}
        {hazy && (
          <>
            <line x1={8} y1={34} x2={30} y2={34} stroke="#94a3b8" strokeWidth={2} strokeLinecap="round" opacity={0.5} />
            <line x1={36} y1={37} x2={56} y2={37} stroke="#94a3b8" strokeWidth={2} strokeLinecap="round" opacity={0.35} />
          </>
        )}
      </svg>
      <span className="text-2xl font-bold text-sky-200" style={{ textShadow: '0 0 10px rgba(125,211,252,0.35)' }}>
        {miles.toFixed(1)} mi
      </span>
      <span className="text-xs text-slate-400">{label}</span>
    </WidgetCard>
  );
}
