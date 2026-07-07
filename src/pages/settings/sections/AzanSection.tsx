import { useEffect, useState } from 'react';
import { useSettingsStore } from '../../../store/settingsStore';
import { SettingsCard, Field, Toggle, Slider, Select } from '../SettingsControls';
import { CALCULATION_METHODS, getFivePrayers, getPrayerTimes } from '../../../services/azan';
import { checkAzanFile, playAzan, playFallbackChime, stopAzan } from '../../../services/azanAudio';
import type { AzanChoice } from '../../../services/azanAudio';
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

  const [fileStatus, setFileStatus] = useState<Record<number, boolean>>({});
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all(([1, 2, 3, 4, 5] as AzanChoice[]).map(async (n) => [n, await checkAzanFile(n)] as const)).then(
      (entries) => {
        if (!cancelled) setFileStatus(Object.fromEntries(entries));
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  function setPrayerSound(prayer: PrayerName, choice: string) {
    update({ azanByPrayer: { ...azanByPrayer, [prayer]: Number(choice) as AzanChoice } });
  }

  function handlePlay(choice: AzanChoice) {
    setNotice(null);
    playAzan(choice, azanVolume).catch((err: unknown) => {
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setNotice('The browser blocked audio playback — click anywhere on the page first, then try again.');
      } else {
        setNotice(`azan${choice}.mp3 is missing from public/ (see AUDIO_README.md) — playing a fallback chime instead.`);
        playFallbackChime(azanVolume);
      }
    });
  }

  const anyMissing = Object.values(fileStatus).some((ok) => !ok);

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
      {anyMissing && (
        <p className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-xs text-amber-300">
          Missing audio files:{' '}
          {Object.entries(fileStatus)
            .filter(([, ok]) => !ok)
            .map(([n]) => `azan${n}.mp3`)
            .join(', ')}
          . A fallback chime plays at prayer time until they're added.
        </p>
      )}

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
            <span
              className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                fileStatus[azanByPrayer[prayer]] === undefined
                  ? 'bg-slate-600'
                  : fileStatus[azanByPrayer[prayer]]
                    ? 'bg-emerald-400'
                    : 'bg-amber-400'
              }`}
              title={
                fileStatus[azanByPrayer[prayer]] === false
                  ? `azan${azanByPrayer[prayer]}.mp3 missing`
                  : `azan${azanByPrayer[prayer]}.mp3 found`
              }
            />
            <button
              type="button"
              onClick={() => handlePlay(azanByPrayer[prayer])}
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
        {notice && <p className="text-xs text-amber-300">{notice}</p>}
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
