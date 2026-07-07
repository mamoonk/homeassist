import { useSettingsStore } from '../../../store/settingsStore';
import { SettingsCard, Toggle } from '../SettingsControls';

export function DashboardSection() {
  const dashboardShowPalette = useSettingsStore((s) => s.dashboardShowPalette);
  const dashboardAutoArrange = useSettingsStore((s) => s.dashboardAutoArrange);
  const update = useSettingsStore((s) => s.update);

  return (
    <SettingsCard title="Dashboard">
      <Toggle
        checked={dashboardShowPalette}
        onChange={(v) => update({ dashboardShowPalette: v })}
        label="Show add/remove palette bar on Home"
      />
      <Toggle
        checked={dashboardAutoArrange}
        onChange={(v) => update({ dashboardAutoArrange: v })}
        label="Auto-arrange widgets when added"
      />
      <p className="text-xs text-slate-500">
        You can always remove a widget from the Home grid by hovering it and clicking the × in the corner.
      </p>
    </SettingsCard>
  );
}
