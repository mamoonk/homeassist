import { useWeatherContext } from '../../hooks/WeatherContext';
import { weatherCodeLabel } from '../../services/weather';
import { weatherEmoji } from '../../services/weatherIcon';
import { WeatherEffectsOverlay } from './WeatherEffectsOverlay';
import { WidgetCard } from '../../components/grid/WidgetCard';

export function WeatherHeaderWidget() {
  const { weather, loading, isOverridden } = useWeatherContext();

  if (loading && !weather) return <WidgetCard centered>Loading…</WidgetCard>;
  if (!weather) return <WidgetCard centered>Weather unavailable</WidgetCard>;

  const { current, daily, locationName } = weather;
  const condition = weatherCodeLabel(current.weatherCode);

  return (
    <div className="widget-container relative flex h-full flex-col justify-center gap-1 overflow-hidden p-3">
      <WeatherEffectsOverlay condition={condition} />
      <div className="relative z-10">
        <div className="text-sm text-slate-300">{locationName}</div>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-amber-400">{Math.round(current.temperature)}°</span>
          <span
            className="anim-float"
            style={{ fontSize: 40, lineHeight: 1, display: 'inline-block', filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.45))' }}
          >
            {weatherEmoji(current.weatherCode, current.isDay)}
          </span>
        </div>
        <div className="text-sm">{condition}</div>
        <div className="text-xs text-slate-400">Feels like {Math.round(current.apparentTemperature)}°</div>
        {daily[0] && <div className="text-xs text-slate-400">The high will be {Math.round(daily[0].temperatureMax)}°.</div>}
        {isOverridden && (
          <div className="mt-1 text-[0.65rem] text-slate-500">
            Showing {locationName}. Click that world clock again to return to your location.
          </div>
        )}
      </div>
    </div>
  );
}
