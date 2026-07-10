import { useSettingsStore } from '../store/settingsStore';
import { useNow } from '../hooks/useNow';
import { getCurrentPrayer, getFivePrayers, getNextPrayer, getPrayerTimes } from '../services/azan';
import { WidgetCard } from '../components/grid/WidgetCard';
import dayjs from '../services/dayjsSetup';

export function AzanWidget() {
  const latitude = useSettingsStore((s) => s.azanLatitude);
  const longitude = useSettingsStore((s) => s.azanLongitude);
  const method = useSettingsStore((s) => s.azanCalculationMethod);
  // Minute-level display — no need for a per-second re-render.
  const now = useNow(30_000);

  const prayers = getFivePrayers(getPrayerTimes(latitude, longitude, now, method));
  const current = getCurrentPrayer(prayers, now);
  const next = getNextPrayer(prayers, now);

  return (
    <WidgetCard title="Prayer times">
      <div className="flex flex-col gap-1 text-sm">
        {prayers.map((prayer) => {
          const isCurrent = current?.name === prayer.name;
          const isNext = next?.name === prayer.name;
          return (
            <div
              key={prayer.name}
              className={`flex justify-between rounded px-1.5 py-0.5 ${
                isCurrent ? 'bg-amber-500/20 text-amber-400' : isNext ? 'bg-emerald-500/15 text-emerald-400' : ''
              }`}
            >
              <span>{prayer.name}</span>
              <span>{dayjs(prayer.time).format('h:mm A')}</span>
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
}
