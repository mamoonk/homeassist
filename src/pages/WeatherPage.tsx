import { WidgetGrid } from '../components/grid/WidgetGrid';

const WEATHER_WIDGET_IDS = [
  'weather-header',
  'weather-forecast',
  'weather-hourly-graph',
  'weather-minimap',
  'weather-temperature',
  'weather-feels-like',
  'weather-cloud-cover',
  'weather-precipitation',
  'weather-wind',
  'weather-humidity',
  'weather-uv',
  'weather-aqi',
  'weather-visibility',
  'weather-pressure',
  'weather-moon',
];

export function WeatherPage() {
  return (
    <div className="p-3">
      <WidgetGrid tabKey="weather" itemIds={WEATHER_WIDGET_IDS} />
    </div>
  );
}
