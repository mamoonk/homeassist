import { useSettingsStore } from '../../../store/settingsStore';
import { SettingsCard, Field, Select, Toggle } from '../SettingsControls';
import type { ClockDisplayType, DialStyle } from '../../../types';

const DIAL_OPTIONS = [
  { value: '1', label: '1 Classic' },
  { value: '2', label: '2 Minimal' },
  { value: '3', label: '3 Navy' },
  { value: '4', label: '4 Warm' },
  { value: '5', label: '5 High contrast' },
];

export function ClockWidgetSection() {
  const displayType = useSettingsStore((s) => s.clockWidgetDisplayType);
  const showHourNumbers = useSettingsStore((s) => s.clockWidgetShowHourNumbers);
  const dialStyle = useSettingsStore((s) => s.clockWidgetDialStyle);
  const update = useSettingsStore((s) => s.update);

  return (
    <SettingsCard title="Clock widget">
      <Field label="Display">
        <Select
          value={displayType}
          onChange={(v) => update({ clockWidgetDisplayType: v as ClockDisplayType })}
          options={[
            { value: 'digital', label: 'Digital' },
            { value: 'analog', label: 'Analog' },
          ]}
        />
      </Field>
      {displayType === 'analog' && (
        <>
          <Field label="Dial style">
            <Select
              value={String(dialStyle)}
              onChange={(v) => update({ clockWidgetDialStyle: Number(v) as DialStyle })}
              options={DIAL_OPTIONS}
            />
          </Field>
          <Toggle
            checked={showHourNumbers}
            onChange={(v) => update({ clockWidgetShowHourNumbers: v })}
            label="Show hour numbers"
          />
        </>
      )}
    </SettingsCard>
  );
}
