import { useSettingsStore } from '../../../store/settingsStore';
import { SettingsCard, Field, Select, TextInput } from '../SettingsControls';
import type { TemperatureUnit } from '../../../types';

export function WeatherSection() {
  const weatherLocationName = useSettingsStore((s) => s.weatherLocationName);
  const weatherLatitude = useSettingsStore((s) => s.weatherLatitude);
  const weatherLongitude = useSettingsStore((s) => s.weatherLongitude);
  const temperatureUnit = useSettingsStore((s) => s.temperatureUnit);
  const update = useSettingsStore((s) => s.update);

  return (
    <SettingsCard title="Weather">
      <Field label="Location name">
        <TextInput value={weatherLocationName} onChange={(e) => update({ weatherLocationName: e.target.value })} />
      </Field>
      <Field label="Latitude">
        <TextInput
          type="number"
          value={weatherLatitude}
          onChange={(e) => update({ weatherLatitude: Number(e.target.value) })}
        />
      </Field>
      <Field label="Longitude">
        <TextInput
          type="number"
          value={weatherLongitude}
          onChange={(e) => update({ weatherLongitude: Number(e.target.value) })}
        />
      </Field>
      <Field label="Units">
        <Select
          value={temperatureUnit}
          onChange={(v) => update({ temperatureUnit: v as TemperatureUnit })}
          options={[
            { value: 'fahrenheit', label: 'Fahrenheit' },
            { value: 'celsius', label: 'Celsius' },
          ]}
        />
      </Field>
    </SettingsCard>
  );
}
