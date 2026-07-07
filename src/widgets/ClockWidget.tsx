import { useSettingsStore } from '../store/settingsStore';
import { useNow } from '../hooks/useNow';
import { AnalogClockFace } from '../components/clock/AnalogClockFace';
import dayjs from '../services/dayjsSetup';

export function ClockWidget() {
  const displayType = useSettingsStore((s) => s.clockWidgetDisplayType);
  const showHourNumbers = useSettingsStore((s) => s.clockWidgetShowHourNumbers);
  const dialStyle = useSettingsStore((s) => s.clockWidgetDialStyle);
  const now = useNow(1000);

  if (displayType === 'analog') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2">
        <AnalogClockFace
          date={now}
          showHourNumbers={showHourNumbers}
          dialStyle={dialStyle}
          className="w-full max-w-[min(72cqmin,100%)]"
        />
        <span className="font-dseg14 tabular-nums">{dayjs(now).format('h:mm:ss A')}</span>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center">
      <span className="font-dseg14 font-bold tabular-nums" style={{ fontSize: 'min(1.25rem, 8cqmin)' }}>
        {dayjs(now).format('h:mm:ss A')}
      </span>
      <span className="text-xs uppercase tracking-wide text-slate-400">{dayjs(now).format('dddd, MMM D, YYYY')}</span>
    </div>
  );
}
