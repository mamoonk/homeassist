import { useSettingsStore } from '../store/settingsStore';
import { useNow } from '../hooks/useNow';
import { AnalogClockFace } from '../components/clock/AnalogClockFace';
import { FlipClock } from '../components/clock/FlipClock';
import dayjs from '../services/dayjsSetup';

export function ClockWidget() {
  const displayType = useSettingsStore((s) => s.clockWidgetDisplayType);
  const showHourNumbers = useSettingsStore((s) => s.clockWidgetShowHourNumbers);
  const dialStyle = useSettingsStore((s) => s.clockWidgetDialStyle);
  const digitalScale = useSettingsStore((s) => s.clockDigitalScale);
  const analogDigitalScale = useSettingsStore((s) => s.clockAnalogDigitalScale);
  const now = useNow(1000);
  const d = dayjs(now);

  if (displayType === 'analog') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-[3%] p-2">
        <AnalogClockFace
          date={now}
          showHourNumbers={showHourNumbers}
          dialStyle={dialStyle}
          className="w-full min-h-0 flex-1 max-w-[min(64cqmin,100%)]"
        />
        <FlipClock date={d} style={{ fontSize: `calc(min(2rem, 10.5cqw, 13cqh) * ${analogDigitalScale})` }} />
      </div>
    );
  }

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center gap-[0.5em] p-2 text-center"
      style={{ fontSize: `calc(min(2.5rem, 16cqmin) * ${digitalScale})` }}
    >
      <div className="flip-clock-glow" aria-hidden="true" />
      <FlipClock date={d} />
      <div
        className="flex items-baseline gap-[0.5em] uppercase text-slate-400"
        style={{ fontSize: '0.28em', letterSpacing: '0.25em' }}
      >
        <span className="font-semibold text-amber-400">{d.format('dddd')}</span>
        <span>{d.format('MMM D, YYYY')}</span>
      </div>
    </div>
  );
}
