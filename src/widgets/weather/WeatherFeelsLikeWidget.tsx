import { useWeatherContext } from '../../hooks/WeatherContext';
import { WidgetCard } from '../../components/grid/WidgetCard';
import { TempSlider } from './TempSlider';

export function WeatherFeelsLikeWidget() {
  const { weather, loading } = useWeatherContext();

  if (loading && !weather) return <WidgetCard centered>Loading…</WidgetCard>;
  if (!weather) return <WidgetCard centered>Weather unavailable</WidgetCard>;

  const { current } = weather;
  const { temperature, apparentTemperature } = current;
  const min = Math.min(temperature, apparentTemperature) - 3;
  const max = Math.max(temperature, apparentTemperature) + 3;
  const diff = apparentTemperature - temperature;
  const comfort = diff > 2 ? 'Warmer' : diff < -2 ? 'Colder' : 'Comfortable';

  return (
    <WidgetCard title="Feels like" centered>
      <div className="flex w-full flex-col items-center gap-2">
        <span className="text-3xl font-bold text-amber-400">{Math.round(apparentTemperature)}°</span>
        <div className="w-full px-2">
          <TempSlider value={apparentTemperature} min={min} max={max} />
        </div>
        <span className="text-xs text-slate-300">{comfort}</span>
        <span className="text-xs text-slate-500">Temperature {Math.round(temperature)}°</span>
      </div>
    </WidgetCard>
  );
}
