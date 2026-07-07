import { useSettingsStore } from '../../../store/settingsStore';
import { SettingsCard, Field, Select, TextInput } from '../SettingsControls';
import type { BackgroundType } from '../../../types';

export function BackgroundSection() {
  const backgroundType = useSettingsStore((s) => s.backgroundType);
  const backgroundColor = useSettingsStore((s) => s.backgroundColor);
  const backgroundImageUrl = useSettingsStore((s) => s.backgroundImageUrl);
  const update = useSettingsStore((s) => s.update);

  return (
    <SettingsCard title="Background">
      <Field label="Type">
        <Select
          value={backgroundType}
          onChange={(v) => update({ backgroundType: v as BackgroundType })}
          options={[
            { value: 'color', label: 'Color' },
            { value: 'image', label: 'Image' },
          ]}
        />
      </Field>

      {backgroundType === 'image' && (
        <Field label="Image URL">
          <TextInput
            value={backgroundImageUrl}
            onChange={(e) => update({ backgroundImageUrl: e.target.value })}
            placeholder="https://…"
          />
        </Field>
      )}

      <Field label={backgroundType === 'image' ? 'Fallback color' : 'Color'}>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => update({ backgroundColor: e.target.value })}
            className="h-8 w-12 rounded border border-white/10 bg-slate-800"
          />
          <TextInput value={backgroundColor} onChange={(e) => update({ backgroundColor: e.target.value })} />
        </div>
      </Field>
    </SettingsCard>
  );
}
