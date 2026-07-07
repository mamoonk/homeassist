import { useSettingsStore } from '../../../store/settingsStore';
import { SettingsCard, Field, Slider, Select } from '../SettingsControls';

export function GlassmorphismSection() {
  const glassOpacity = useSettingsStore((s) => s.glassOpacity);
  const glassBlur = useSettingsStore((s) => s.glassBlur);
  const contentBlur = useSettingsStore((s) => s.contentBlur);
  const update = useSettingsStore((s) => s.update);

  return (
    <SettingsCard title="Glassmorphism">
      <Field label={`Panel translucency (${Math.round(glassOpacity * 100)}%)`}>
        <Slider
          value={glassOpacity}
          min={0.2}
          max={0.9}
          step={0.05}
          onChange={(v) => update({ glassOpacity: v })}
          format={(v) => `${Math.round(v * 100)}%`}
        />
      </Field>
      <Field label="Backdrop blur">
        <Select
          value={String(glassBlur)}
          onChange={(v) => update({ glassBlur: Number(v) as 0 | 4 | 8 | 12 })}
          options={[
            { value: '0', label: 'Off' },
            { value: '4', label: 'Subtle (4px)' },
            { value: '8', label: 'Medium (8px)' },
            { value: '12', label: 'Strong (12px)' },
          ]}
        />
      </Field>
      <Field label={`Content blur (${contentBlur}px)`}>
        <Slider value={contentBlur} min={0} max={24} step={1} onChange={(v) => update({ contentBlur: v })} format={(v) => `${v}px`} />
      </Field>
    </SettingsCard>
  );
}
