import { useMemo } from 'react';
import { useHealthStore } from '../store/healthStore';
import { WidgetCard } from '../components/grid/WidgetCard';
import { toDateKey } from '../services/calendarMonth';
import dayjs from '../services/dayjsSetup';

export function HealthWidget() {
  const metrics = useHealthStore((s) => s.metrics);

  const todayKey = toDateKey(new Date());
  const today = useMemo(() => metrics.filter((m) => m.date === todayKey).at(-1), [metrics, todayKey]);

  const recent = useMemo(
    () =>
      [...metrics]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5),
    [metrics],
  );

  return (
    <WidgetCard title="Health">
      {!today ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-400">No data for today…</div>
      ) : (
        <div className="flex flex-col gap-1 text-sm">
          {today.steps !== undefined && <div>Steps: {today.steps.toLocaleString()}</div>}
          {today.sleepHours !== undefined && <div>Sleep: {today.sleepHours} h</div>}
          {today.weight !== undefined && <div>Weight: {today.weight} kg</div>}
        </div>
      )}
      {recent.length > 0 && (
        <div className="mt-2 border-t border-white/10 pt-1 text-xs text-slate-500">
          Recent: {recent.map((m) => dayjs(m.date).format('MMM D')).join(', ')}
        </div>
      )}
    </WidgetCard>
  );
}
