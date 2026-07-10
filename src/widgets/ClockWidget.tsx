import { useSettingsStore } from '../store/settingsStore';
import { useAzanPlaybackStore } from '../store/azanPlaybackStore';
import { useNow } from '../hooks/useNow';
import { useWeatherContext } from '../hooks/WeatherContext';
import { AnalogClockFace } from '../components/clock/AnalogClockFace';
import { FlipClock } from '../components/clock/FlipClock';
import { KaabaModel } from '../components/clock/KaabaModel';
import dayjs from '../services/dayjsSetup';

export function ClockWidget() {
  const displayType = useSettingsStore((s) => s.clockWidgetDisplayType);
  const isAzanPlaying = useAzanPlaybackStore((s) => s.isAzanPlaying);
  const showHourNumbers = useSettingsStore((s) => s.clockWidgetShowHourNumbers);
  const dialStyle = useSettingsStore((s) => s.clockWidgetDialStyle);
  const digitalScale = useSettingsStore((s) => s.clockDigitalScale);
  const analogDigitalScale = useSettingsStore((s) => s.clockAnalogDigitalScale);
  const analogDialScale = useSettingsStore((s) => s.clockAnalogDialScale);
  const { weather } = useWeatherContext();
  const now = useNow(1000);
  // Show the weather location's local time (the display machine's OS zone
  // may differ); fall back to machine time until weather has loaded.
  const d = weather?.timezone ? dayjs(now).tz(weather.timezone) : dayjs(now);
  // AnalogClockFace reads local getHours() from a native Date, so rebuild
  // one carrying the zone's wall-clock fields.
  const analogDate = weather?.timezone
    ? new Date(d.year(), d.month(), d.date(), d.hour(), d.minute(), d.second())
    : now;

  // During the azan the clock steps aside for a rotating Kaaba model.
  if (isAzanPlaying) {
    return (
      <div className="relative h-full w-full">
        <KaabaModel />
      </div>
    );
  }

  if (displayType === 'analog') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-[3%] p-2">
        <AnalogClockFace
          date={analogDate}
          showHourNumbers={showHourNumbers}
          dialStyle={dialStyle}
          className="w-full min-h-0 flex-1"
          style={{ maxWidth: `calc(min(64cqmin, 100%) * ${analogDialScale})` }}
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
