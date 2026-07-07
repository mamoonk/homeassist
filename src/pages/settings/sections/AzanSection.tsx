import { useSettingsStore } from '../../../store/settingsStore';
import { SettingsCard, Field, Toggle, Slider, Select } from '../SettingsControls';
import { CALCULATION_METHODS, getFivePrayers, getPrayerTimes } from '../../../services/azan';
import { playAzan, stopAzan } from '../../../services/azanAudio';
import type { CalculationMethodName, PrayerName } from '../../../types';
import dayjs from '../../../services/dayjsSetup';

const SOUND_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `Azan ${n}` }));

export function AzanSection() {
  const azanEnabled = useSettingsStore((s) => s.azanEnabled);
  const playAzanAtPrayerTime = useSettingsStore((s) => s.playAzanAtPrayerTime);
  const prayerTimesScale = useSettingsStore((s) => s.prayerTimesScale);
  const azanLatitude = useSettingsStore((s) => s.azanLatitude);
  const azanLongitude = useSettingsStore((s) => s.azanLongitude);
  const azanCalculationMethod = useSettingsStore((s) => s.azanCalculationMethod);
  const azanVolume = useSettingsStore((s) => s.azanVolume);
  const azanByPrayer = useSettingsStore((s) => s.azanByPrayer);
  const update = useSettingsStore((s) => s.update);

  const prayers = getFivePrayers(getPrayerTimes(azanLatitude, azanLongitude, new Date(), azanCalculationMethod));

  function setPrayerSound(prayer: PrayerName, choice: string) {
    update({ azanByPrayer: { ...azanByPrayer, [prayer]: Number(choice) as 1 | 2 | 3 | 4 | 5 } });
  }

  return (
    <SettingsCard title="Azan">
      <Toggle checked={azanEnabled} onChange={(v) => update({ azanEnabled: v })} label="Enable prayer times" />
      <Toggle
        checked={playAzanAtPrayerTime}
        onChange={(v) => update({ playAzanAtPrayerTime: v })}
        label="Play azan at prayer time"
      />
      <Field label={`Prayer bar scale (${prayerTimesScale.toFixed(1)}×)`}>
        <Slider
          value={prayerTimesScale}
          min={0.5}
          max={5}
          step={0.1}
          onChange={(v) => update({ prayerTimesScale: v })}
          format={(v) => `${v.toFixed(1)}×`}
        />
      </Field>
      <Field label="Latitude">
        <input
          type="number"
          value={azanLatitude}
          onChange={(e) => update({ azanLatitude: Number(e.target.value) })}
          className="rounded border border-white/10 bg-slate-800 px-2 py-1 text-sm"
        />
      </Field>
      <Field label="Longitude">
        <input
          type="number"
          value={azanLongitude}
          onChange={(e) => update({ azanLongitude: Number(e.target.value) })}
          className="rounded border border-white/10 bg-slate-800 px-2 py-1 text-sm"
        />
      </Field>
      <Field label="Calculation method">
        <Select
          value={azanCalculationMethod}
          onChange={(v) => update({ azanCalculationMethod: v as CalculationMethodName })}
          options={CALCULATION_METHODS.map((m) => ({ value: m, label: m }))}
        />
      </Field>

      <p className="text-xs text-slate-500">
        Place adhan audio files as <code>azan1.mp3</code> … <code>azan5.mp3</code> in the app's{' '}
        <code>public/</code> folder.
      </p>

      <Field label={`Volume (${Math.round(azanVolume * 100)}%)`}>
        <Slider
          value={azanVolume}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => update({ azanVolume: v })}
          format={(v) => `${Math.round(v * 100)}%`}
        />
      </Field>

      <div className="flex flex-col gap-2">
        {(Object.keys(azanByPrayer) as PrayerName[]).map((prayer) => (
          <div key={prayer} className="flex items-center gap-2">
            <span className="w-16 text-sm">{prayer}</span>
            <Select
              value={String(azanByPrayer[prayer])}
              onChange={(v) => setPrayerSound(prayer, v)}
              options={SOUND_OPTIONS}
            />
            <button
              type="button"
              onClick={() => playAzan(azanByPrayer[prayer], azanVolume)}
              className="rounded bg-emerald-500/20 px-2 py-1 text-xs text-emerald-400 hover:bg-emerald-500/30"
            >
              Play
            </button>
            <button
              type="button"
              onClick={() => stopAzan(azanByPrayer[prayer])}
              className="rounded bg-white/5 px-2 py-1 text-xs text-slate-300 hover:bg-white/10"
            >
              Stop
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-white/10 p-3 text-sm">
        <div className="mb-1 font-medium text-slate-300">Today's prayer times</div>
        <div className="flex flex-wrap gap-3 text-slate-400">
          {prayers.map((p) => (
            <span key={p.name}>
              {p.name}: {dayjs(p.time).format('h:mm A')}
            </span>
          ))}
        </div>
      </div>
    </SettingsCard>
  );
}
