import { useSettingsStore } from '../../../store/settingsStore';
import { SettingsCard, Field, Toggle, Slider, Select, TextInput } from '../SettingsControls';
import { buildAuthorizationUrl } from '../../../services/dexcom';
import type { DexcomApiBase } from '../../../types';

export function DexcomSection() {
  const dexcomEnabled = useSettingsStore((s) => s.dexcomEnabled);
  const dexcomUseMockData = useSettingsStore((s) => s.dexcomUseMockData);
  const dexcomApiBase = useSettingsStore((s) => s.dexcomApiBase);
  const dexcomClientId = useSettingsStore((s) => s.dexcomClientId);
  const dexcomClientSecret = useSettingsStore((s) => s.dexcomClientSecret);
  const dexcomRedirectUri = useSettingsStore((s) => s.dexcomRedirectUri);
  const dexcomAccessToken = useSettingsStore((s) => s.dexcomAccessToken);
  const dexcomShowOnDashboard = useSettingsStore((s) => s.dexcomShowOnDashboard);
  const dexcomScale = useSettingsStore((s) => s.dexcomScale);
  const update = useSettingsStore((s) => s.update);

  const canAuthorize = Boolean(dexcomClientId && dexcomRedirectUri);
  const authUrl = canAuthorize ? buildAuthorizationUrl(dexcomApiBase, dexcomClientId, dexcomRedirectUri) : null;

  return (
    <SettingsCard title="Dexcom">
      <p className="text-xs text-slate-500">
        Connect a Dexcom CGM account to show live glucose readings. See{' '}
        <a href="https://developer.dexcom.com" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">
          developer.dexcom.com
        </a>{' '}
        to register an app.
      </p>

      <Toggle checked={dexcomEnabled} onChange={(v) => update({ dexcomEnabled: v })} label="Enable Dexcom" />
      <Toggle checked={dexcomUseMockData} onChange={(v) => update({ dexcomUseMockData: v })} label="Use mock data" />

      <Field label="API base">
        <Select
          value={dexcomApiBase}
          onChange={(v) => update({ dexcomApiBase: v as DexcomApiBase })}
          options={[
            { value: 'sandbox', label: 'Sandbox' },
            { value: 'us', label: 'US' },
            { value: 'eu', label: 'EU' },
            { value: 'jp', label: 'JP' },
          ]}
        />
      </Field>

      <Field label="Client ID">
        <TextInput value={dexcomClientId} onChange={(e) => update({ dexcomClientId: e.target.value })} />
      </Field>
      <Field label="Client secret" hint="Stored locally in your browser — treat this device as sensitive.">
        <TextInput type="password" value={dexcomClientSecret} onChange={(e) => update({ dexcomClientSecret: e.target.value })} />
      </Field>
      <Field label="Redirect URI">
        <TextInput value={dexcomRedirectUri} onChange={(e) => update({ dexcomRedirectUri: e.target.value })} />
      </Field>

      {authUrl && (
        <a href={authUrl} target="_blank" rel="noreferrer" className="text-sm text-amber-400 hover:underline">
          Open Dexcom authorization URL →
        </a>
      )}

      <Field label="Access token" hint="Paste the token from your OAuth exchange — this app does not perform the exchange itself.">
        <TextInput value={dexcomAccessToken} onChange={(e) => update({ dexcomAccessToken: e.target.value })} />
      </Field>

      <Toggle checked={dexcomShowOnDashboard} onChange={(v) => update({ dexcomShowOnDashboard: v })} label="Show on dashboard" />
      <Field label={`Widget scale (${dexcomScale.toFixed(1)}×)`}>
        <Slider value={dexcomScale} min={0.5} max={5} step={0.1} onChange={(v) => update({ dexcomScale: v })} format={(v) => `${v.toFixed(1)}×`} />
      </Field>
    </SettingsCard>
  );
}
