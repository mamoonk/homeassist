import { useWeatherContext } from '../../hooks/WeatherContext';
import { weatherCodeLabel } from '../../services/weather';
import { WeatherEffectsOverlay } from './WeatherEffectsOverlay';
import { WeatherSceneIcon, sceneForWeatherCode } from './WeatherSceneIcon';
import type { SceneKind } from './WeatherSceneIcon';
import { WidgetCard } from '../../components/grid/WidgetCard';

// Subtle sky wash behind the header content, tuned per condition/time-of-day.
const SKY_GRADIENTS: Record<SceneKind, string> = {
  'clear-day': 'linear-gradient(160deg, rgba(59,130,246,0.30) 0%, rgba(251,191,36,0.16) 100%)',
  'clear-night': 'linear-gradient(160deg, rgba(49,46,129,0.45) 0%, rgba(15,23,42,0.15) 100%)',
  partly: 'linear-gradient(160deg, rgba(59,130,246,0.24) 0%, rgba(100,116,139,0.18) 100%)',
  cloudy: 'linear-gradient(160deg, rgba(100,116,139,0.30) 0%, rgba(51,65,85,0.18) 100%)',
  fog: 'linear-gradient(160deg, rgba(148,163,184,0.26) 0%, rgba(71,85,105,0.14) 100%)',
  drizzle: 'linear-gradient(160deg, rgba(30,64,175,0.28) 0%, rgba(51,65,85,0.20) 100%)',
  rain: 'linear-gradient(160deg, rgba(30,58,138,0.38) 0%, rgba(30,41,59,0.22) 100%)',
  snow: 'linear-gradient(160deg, rgba(148,163,184,0.30) 0%, rgba(191,219,254,0.12) 100%)',
  thunder: 'linear-gradient(160deg, rgba(49,46,129,0.48) 0%, rgba(15,23,42,0.30) 100%)',
};

export function WeatherHeaderWidget() {
  const { weather, loading, isOverridden } = useWeatherContext();

  if (loading && !weather) return <WidgetCard centered>Loading…</WidgetCard>;
  if (!weather) return <WidgetCard centered>Weather unavailable</WidgetCard>;

  const { current, daily, locationName } = weather;
  const condition = weatherCodeLabel(current.weatherCode);
  const kind = sceneForWeatherCode(current.weatherCode, current.isDay);

  return (
    <div className="widget-container relative flex h-full flex-col justify-center gap-1 overflow-hidden p-3">
      {/* condition-aware sky wash + horizon glow */}
      <div className="absolute inset-0" style={{ background: SKY_GRADIENTS[kind] }} />
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background:
            kind === 'clear-day'
              ? 'linear-gradient(to top, rgba(251,191,36,0.14), transparent)'
              : 'linear-gradient(to top, rgba(15,23,42,0.35), transparent)',
        }}
      />
      <WeatherEffectsOverlay condition={condition} />

      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm text-slate-300">{locationName}</div>
          <div
            className="text-3xl font-bold text-amber-400"
            style={{ textShadow: '0 0 18px rgba(251,191,36,0.45), 0 2px 4px rgba(0,0,0,0.4)' }}
          >
            {Math.round(current.temperature)}°
          </div>
          <div className="text-sm text-slate-100">{condition}</div>
          <div className="text-xs text-slate-400">Feels like {Math.round(current.apparentTemperature)}°</div>
          {daily[0] && (
            <div className="text-xs text-slate-400">The high will be {Math.round(daily[0].temperatureMax)}°.</div>
          )}
          {isOverridden && (
            <div className="mt-1 text-[0.65rem] text-slate-500">
              Showing {locationName}. Click that world clock again to return to your location.
            </div>
          )}
        </div>
        <div className="anim-float flex-shrink-0">
          <WeatherSceneIcon code={current.weatherCode} isDay={current.isDay} size={76} />
        </div>
      </div>
    </div>
  );
}
