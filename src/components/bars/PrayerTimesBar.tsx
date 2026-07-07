import { useSettingsStore } from '../../store/settingsStore';
import { useNow } from '../../hooks/useNow';
import { getFivePrayers, getPrayerTimes, getCurrentPrayer, getNextPrayer } from '../../services/azan';
import dayjs from '../../services/dayjsSetup';

function formatCountdown(ms: number): string {
  const totalMinutes = Math.max(0, Math.round(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function PrayerTimesBar() {
  const enabled = useSettingsStore((s) => s.azanEnabled);
  const scale = useSettingsStore((s) => s.prayerTimesScale);
  const latitude = useSettingsStore((s) => s.azanLatitude);
  const longitude = useSettingsStore((s) => s.azanLongitude);
  const method = useSettingsStore((s) => s.azanCalculationMethod);

  const now = useNow(1000);

  if (!enabled) return null;

  const prayers = getFivePrayers(getPrayerTimes(latitude, longitude, now, method));
  const current = getCurrentPrayer(prayers, now);
  const next = getNextPrayer(prayers, now);

  let statusText: string;
  if (current && next) {
    statusText = `Now: ${current.name} until ${dayjs(next.time).format('h:mm A')} · Next: ${next.name} ${dayjs(
      next.time,
    ).format('h:mm A')} (${formatCountdown(next.time.getTime() - now.getTime())})`;
  } else if (next) {
    statusText = `Next: Fajr tomorrow`;
  } else {
    statusText = `Next: Fajr tomorrow`;
  }

  return (
    <div
      className="glass-panel flex items-center gap-2 overflow-x-auto border-b border-white/10 px-3 py-2"
      style={{ fontSize: `${scale}rem` }}
    >
      {prayers.map((prayer) => {
        const isCurrent = current?.name === prayer.name;
        const isNext = next?.name === prayer.name;
        return (
          <span
            key={prayer.name}
            // em-based sizing so the bar's font-size (prayerTimesScale) actually
            // scales the chips — rem classes like text-sm ignore the parent.
            className={`whitespace-nowrap rounded-full border px-[0.85em] py-[0.28em] text-[0.875em] ${
              isCurrent
                ? 'border-amber-500/50 bg-amber-500/25 font-semibold text-amber-400'
                : isNext
                  ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400'
                  : 'border-white/10 text-slate-300'
            }`}
          >
            {prayer.name} {dayjs(prayer.time).format('h:mm A')}
          </span>
        );
      })}
      <span className="ml-2 whitespace-nowrap text-[0.75em] text-slate-400">{statusText}</span>
    </div>
  );
}
