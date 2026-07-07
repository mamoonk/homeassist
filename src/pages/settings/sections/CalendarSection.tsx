import { useSettingsStore } from '../../../store/settingsStore';
import { SettingsCard, Field, Toggle, Slider } from '../SettingsControls';

export function CalendarSection() {
  const calendarShowOnDashboard = useSettingsStore((s) => s.calendarShowOnDashboard);
  const calendarScale = useSettingsStore((s) => s.calendarScale);
  const calendarShowUsHolidays = useSettingsStore((s) => s.calendarShowUsHolidays);
  const calendarShowIslamicHolidays = useSettingsStore((s) => s.calendarShowIslamicHolidays);
  const calendarShowHijri = useSettingsStore((s) => s.calendarShowHijri);
  const update = useSettingsStore((s) => s.update);

  return (
    <SettingsCard title="Calendar & Events">
      <Toggle
        checked={calendarShowOnDashboard}
        onChange={(v) => update({ calendarShowOnDashboard: v })}
        label="Show on dashboard"
      />
      <Field label={`Widget scale (${calendarScale.toFixed(1)}×)`}>
        <Slider value={calendarScale} min={0.5} max={5} step={0.1} onChange={(v) => update({ calendarScale: v })} format={(v) => `${v.toFixed(1)}×`} />
      </Field>
      <Toggle checked={calendarShowUsHolidays} onChange={(v) => update({ calendarShowUsHolidays: v })} label="US holidays" />
      <Toggle
        checked={calendarShowIslamicHolidays}
        onChange={(v) => update({ calendarShowIslamicHolidays: v })}
        label="Islamic holidays"
      />
      <Toggle checked={calendarShowHijri} onChange={(v) => update({ calendarShowHijri: v })} label="Show Hijri dates" />
    </SettingsCard>
  );
}
