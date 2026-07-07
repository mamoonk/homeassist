import { useSettingsStore } from '../../store/settingsStore';
import { useDataStore } from '../../store/dataStore';
import { useNow } from '../../hooks/useNow';
import { zoneLabel, TIMEZONE_LOCATIONS } from '../../services/geocoding';
import { AnalogClockFace } from '../clock/AnalogClockFace';
import { FlipClock } from '../clock/FlipClock';
import dayjs from '../../services/dayjsSetup';

export function WorldClocksBar() {
  const enabled = useSettingsStore((s) => s.worldClocksEnabled);
  const zones = useSettingsStore((s) => s.worldClockZones);
  const cityDetails = useSettingsStore((s) => s.worldClockCityDetails);
  const clockScale = useSettingsStore((s) => s.clockScale);
  const displayType = useSettingsStore((s) => s.clockDisplayType);
  const showHourNumbers = useSettingsStore((s) => s.clockWidgetShowHourNumbers);
  const dialStyle = useSettingsStore((s) => s.clockWidgetDialStyle);

  const override = useDataStore((s) => s.weatherLocationOverride);
  const toggleOverride = useDataStore((s) => s.toggleWeatherLocationOverride);

  const now = useNow(1000);

  if (!enabled) return null;

  const visibleZones = zones.slice(0, 5);

  return (
    <div
      className="glass-panel flex flex-wrap items-center justify-center gap-4 border-b border-white/10 px-3 py-2"
      style={{ fontSize: `${clockScale}rem` }}
    >
      {visibleZones.map((zoneId) => {
        const label = zoneLabel(zoneId, cityDetails);
        const location = cityDetails[zoneId] ?? TIMEZONE_LOCATIONS[zoneId];
        const zonedNow = dayjs(now).tz(zoneId);
        const timeStr = zonedNow.format('h:mm:ss A');
        const isSelected = override?.zoneId === zoneId;

        return (
          <button
            key={zoneId}
            type="button"
            disabled={!location}
            onClick={() =>
              location &&
              toggleOverride({ lat: location.lat, lon: location.lon, name: location.name, zoneId })
            }
            className={`flex flex-col items-center rounded-md px-2 py-1 transition ${
              isSelected
                ? 'border border-amber-500/50 bg-amber-500/25 ring-1 ring-amber-500/50'
                : 'border border-transparent hover:bg-white/5'
            } ${!location ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <span className="text-xs uppercase tracking-wide text-slate-400">{label}</span>
            {displayType === 'analog' ? (
              <div className="flex flex-col items-center">
                <AnalogClockFace
                  date={zonedNow.toDate()}
                  showHourNumbers={showHourNumbers}
                  dialStyle={dialStyle}
                  className="h-[3.5em] w-[3.5em]"
                />
                <span className="font-dseg14 text-[0.6em] tabular-nums">{timeStr}</span>
              </div>
            ) : (
              <FlipClock date={zonedNow} />
            )}
          </button>
        );
      })}
    </div>
  );
}
