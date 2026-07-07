import { useEffect, useState } from 'react';
import { useSettingsStore } from '../../../store/settingsStore';
import { SettingsCard, Field, Toggle, Select } from '../SettingsControls';

export function SmartMirrorSection() {
  const enabled = useSettingsStore((s) => s.smartMirrorEnabled);
  const deviceId = useSettingsStore((s) => s.smartMirrorDeviceId);
  const update = useSettingsStore((s) => s.update);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    if (!enabled) return;
    navigator.mediaDevices
      ?.enumerateDevices()
      .then((all) => setDevices(all.filter((d) => d.kind === 'videoinput')))
      .catch(() => setDevices([]));
  }, [enabled]);

  const hasLabels = devices.some((d) => d.label);

  return (
    <SettingsCard title="Smart Mirror">
      <Toggle
        checked={enabled}
        onChange={(v) => update({ smartMirrorEnabled: v })}
        label="Enable Smart Mirror (webcam background + glass widgets)"
      />
      <Field label="Camera" hint={!hasLabels && enabled ? 'Grant camera permission to see device names.' : undefined}>
        <Select
          value={deviceId}
          disabled={!enabled}
          onChange={(v) => update({ smartMirrorDeviceId: v })}
          options={[
            { value: '', label: 'Default camera' },
            ...devices.map((d) => ({ value: d.deviceId, label: d.label || `Camera ${d.deviceId.slice(0, 6)}` })),
          ]}
        />
      </Field>
    </SettingsCard>
  );
}
