import type { ReactNode } from 'react';
import { WeatherHeaderWidget } from '../../widgets/weather/WeatherHeaderWidget';
import { WeatherMinimapWidget } from '../../widgets/weather/WeatherMinimapWidget';
import { WeatherForecastWidget } from '../../widgets/weather/WeatherForecastWidget';
import { WeatherHourlyGraphWidget } from '../../widgets/weather/WeatherHourlyGraphWidget';
import { WeatherTemperatureWidget } from '../../widgets/weather/WeatherTemperatureWidget';
import { WeatherFeelsLikeWidget } from '../../widgets/weather/WeatherFeelsLikeWidget';
import { WeatherCloudCoverWidget } from '../../widgets/weather/WeatherCloudCoverWidget';
import { WeatherPrecipitationWidget } from '../../widgets/weather/WeatherPrecipitationWidget';
import { WeatherWindWidget } from '../../widgets/weather/WeatherWindWidget';
import { WeatherHumidityWidget } from '../../widgets/weather/WeatherHumidityWidget';
import { WeatherUvWidget } from '../../widgets/weather/WeatherUvWidget';
import { WeatherAqiWidget } from '../../widgets/weather/WeatherAqiWidget';
import { WeatherVisibilityWidget } from '../../widgets/weather/WeatherVisibilityWidget';
import { WeatherPressureWidget } from '../../widgets/weather/WeatherPressureWidget';
import { WeatherMoonWidget } from '../../widgets/weather/WeatherMoonWidget';
import { ClockWidget } from '../../widgets/ClockWidget';
import { CalendarWidget } from '../../widgets/CalendarWidget';
import { HealthWidget } from '../../widgets/HealthWidget';
import { AzanWidget } from '../../widgets/AzanWidget';
import { DexcomWidget } from '../../widgets/DexcomWidget';
import { StockWidget } from '../../widgets/StockWidget';
import { StocksListWidget } from '../../widgets/StocksListWidget';
import { FinnhubDashboardWidget } from '../../widgets/FinnhubDashboardWidget';
import { NewsFeedWidget } from '../../widgets/NewsFeedWidget';

export interface WidgetSize {
  w: number;
  h: number;
}

export interface WidgetDefinition {
  render: () => ReactNode;
  defaultSize: WidgetSize;
}

const SMALL: WidgetSize = { w: 2, h: 2 };
const LARGE: WidgetSize = { w: 4, h: 4 };

const STATIC_REGISTRY: Record<string, WidgetDefinition> = {
  'weather-header': { render: () => <WeatherHeaderWidget />, defaultSize: SMALL },
  'weather-minimap': { render: () => <WeatherMinimapWidget />, defaultSize: SMALL },
  'weather-forecast': { render: () => <WeatherForecastWidget />, defaultSize: SMALL },
  'weather-hourly-graph': { render: () => <WeatherHourlyGraphWidget />, defaultSize: SMALL },
  'weather-temperature': { render: () => <WeatherTemperatureWidget />, defaultSize: SMALL },
  'weather-feels-like': { render: () => <WeatherFeelsLikeWidget />, defaultSize: SMALL },
  'weather-cloud-cover': { render: () => <WeatherCloudCoverWidget />, defaultSize: SMALL },
  'weather-precipitation': { render: () => <WeatherPrecipitationWidget />, defaultSize: SMALL },
  'weather-wind': { render: () => <WeatherWindWidget />, defaultSize: SMALL },
  'weather-humidity': { render: () => <WeatherHumidityWidget />, defaultSize: SMALL },
  'weather-uv': { render: () => <WeatherUvWidget />, defaultSize: SMALL },
  'weather-aqi': { render: () => <WeatherAqiWidget />, defaultSize: SMALL },
  'weather-visibility': { render: () => <WeatherVisibilityWidget />, defaultSize: SMALL },
  'weather-pressure': { render: () => <WeatherPressureWidget />, defaultSize: SMALL },
  'weather-moon': { render: () => <WeatherMoonWidget />, defaultSize: SMALL },
  clock: { render: () => <ClockWidget />, defaultSize: SMALL },
  calendar: { render: () => <CalendarWidget />, defaultSize: LARGE },
  health: { render: () => <HealthWidget />, defaultSize: SMALL },
  azan: { render: () => <AzanWidget />, defaultSize: SMALL },
  dexcom: { render: () => <DexcomWidget />, defaultSize: LARGE },
  stocks: { render: () => <StocksListWidget />, defaultSize: LARGE },
  'stocks-dashboard': { render: () => <FinnhubDashboardWidget />, defaultSize: LARGE },
  news: { render: () => <NewsFeedWidget />, defaultSize: SMALL },
};

// Widgets offered in the add/remove palette, with display labels. `news` is
// intentionally absent (matches the original app's registry gap — quirk in
// the source spec) so its palette chip falls back to showing the raw id.
export const PALETTE_LABELS: Record<string, string> = {
  'weather-header': 'Weather Header',
  'weather-minimap': 'Weather Mini Map',
  'weather-forecast': 'Weather Forecast',
  'weather-hourly-graph': 'Weather Hourly Graph',
  'weather-temperature': 'Weather Temperature',
  'weather-feels-like': 'Weather Feels Like',
  'weather-cloud-cover': 'Weather Cloud Cover',
  'weather-precipitation': 'Weather Precipitation',
  'weather-wind': 'Weather Wind',
  'weather-humidity': 'Weather Humidity',
  'weather-uv': 'Weather UV',
  'weather-aqi': 'Weather AQI',
  'weather-visibility': 'Weather Visibility',
  'weather-pressure': 'Weather Pressure',
  'weather-moon': 'Weather Moon',
  clock: 'Clock',
  calendar: 'Calendar',
  health: 'Health',
  azan: 'Prayer Times',
  dexcom: 'Dexcom',
  stocks: 'Stocks',
  'stocks-dashboard': 'Stocks Dashboard',
};

export function paletteWidgetIds(): string[] {
  return Object.keys(STATIC_REGISTRY);
}

export function widgetLabel(id: string): string {
  return PALETTE_LABELS[id] ?? id;
}

export function resolveWidget(id: string): WidgetDefinition | null {
  if (STATIC_REGISTRY[id]) return STATIC_REGISTRY[id];
  if (id.startsWith('stock-')) {
    const symbol = id.slice('stock-'.length);
    return { render: () => <StockWidget symbol={symbol} />, defaultSize: { w: 3, h: 2 } };
  }
  return null;
}

export function defaultSizeForWidget(id: string): WidgetSize {
  return resolveWidget(id)?.defaultSize ?? SMALL;
}
