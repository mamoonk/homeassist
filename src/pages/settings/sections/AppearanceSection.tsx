import { useSettingsStore } from '../../../store/settingsStore';
import { SettingsCard, Field, Slider, Select, Toggle } from '../SettingsControls';
import type { OrientationLock, Theme } from '../../../types';

const THEME_OPTIONS: Array<{ value: Theme; label: string }> = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'circadian', label: 'Circadian (light day, dark night)' },
  { value: 'gamified', label: 'Gamified' },
];

const ORIENTATION_OPTIONS: Array<{ value: OrientationLock; label: string }> = [
  { value: 'any', label: 'Any' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
];

export function AppearanceSection() {
  const theme = useSettingsStore((s) => s.theme);
  const fontScale = useSettingsStore((s) => s.fontScale);
  const orientationLock = useSettingsStore((s) => s.orientationLock);
  const lowPowerMode = useSettingsStore((s) => s.lowPowerMode);
  const update = useSettingsStore((s) => s.update);

  return (
    <SettingsCard title="Appearance">
      <Field label="Theme">
        <Select value={theme} onChange={(v) => update({ theme: v as Theme })} options={THEME_OPTIONS} />
      </Field>
      <Field label={`Font scale (${fontScale.toFixed(1)}×, up to 5×)`}>
        <Slider
          value={fontScale}
          min={0.5}
          max={5}
          step={0.1}
          onChange={(v) => update({ fontScale: v })}
          format={(v) => `${v.toFixed(1)}×`}
        />
      </Field>
      <Field label="Orientation">
        <Select
          value={orientationLock}
          onChange={(v) => update({ orientationLock: v as OrientationLock })}
          options={ORIENTATION_OPTIONS}
        />
      </Field>
      <Toggle
        checked={lowPowerMode}
        onChange={(v) => update({ lowPowerMode: v })}
        label="Low power mode (disables blur & ambient animations — for weak hardware)"
      />
    </SettingsCard>
  );
}
