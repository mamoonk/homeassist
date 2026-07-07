import { useWeatherContext } from '../../hooks/WeatherContext';
import { WidgetCard } from '../../components/grid/WidgetCard';
import { TempSlider } from './TempSlider';

export function WeatherTemperatureWidget() {
  const { weather, loading } = useWeatherContext();

  if (loading && !weather) return <WidgetCard centered>Loading…</WidgetCard>;
  if (!weather) return <WidgetCard centered>Weather unavailable</WidgetCard>;

  const { current, daily } = weather;
  const today = daily[0];
  const min = today ? today.temperatureMin - 2 : current.temperature - 5;
  const max = today ? today.temperatureMax + 2 : current.temperature + 5;

  return (
    <WidgetCard title="Temperature" centered>
      <div className="flex w-full flex-col items-center gap-2">
        <span className="text-3xl font-bold text-amber-400">{Math.round(current.temperature)}°</span>
        <div className="w-full px-2">
          <TempSlider value={current.temperature} min={min} max={max} />
        </div>
        {today && (
          <span className="text-xs text-slate-400">
            High {Math.round(today.temperatureMax)}° · Low {Math.round(today.temperatureMin)}°
          </span>
        )}
      </div>
    </WidgetCard>
  );
}
