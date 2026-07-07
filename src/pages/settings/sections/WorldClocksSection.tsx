import { useEffect, useState } from 'react';
import { useSettingsStore } from '../../../store/settingsStore';
import { SettingsCard, Field, Toggle, Slider, Select } from '../SettingsControls';
import { searchCities, type GeocodingResult, COMMON_ZONES, zoneLabel } from '../../../services/geocoding';
import type { ClockDisplayType } from '../../../types';

export function WorldClocksSection() {
  const enabled = useSettingsStore((s) => s.worldClocksEnabled);
  const clockDisplayType = useSettingsStore((s) => s.clockDisplayType);
  const clockScale = useSettingsStore((s) => s.clockScale);
  const zones = useSettingsStore((s) => s.worldClockZones);
  const cityDetails = useSettingsStore((s) => s.worldClockCityDetails);
  const update = useSettingsStore((s) => s.update);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [plainZone, setPlainZone] = useState(COMMON_ZONES[0]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const id = setTimeout(() => {
      searchCities(query)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(id);
  }, [query]);

  function addZone(zoneId: string, city?: { name: string; lat: number; lon: number }) {
    if (zones.includes(zoneId) || zones.length >= 5) return;
    update({
      worldClockZones: [...zones, zoneId],
      worldClockCityDetails: city ? { ...cityDetails, [zoneId]: city } : cityDetails,
    });
    setQuery('');
    setResults([]);
  }

  function removeZone(zoneId: string) {
    update({ worldClockZones: zones.filter((z) => z !== zoneId) });
  }

  return (
    <SettingsCard title="World clocks">
      <Toggle checked={enabled} onChange={(v) => update({ worldClocksEnabled: v })} label="Enable world clocks bar" />
      <Field label="Clock style">
        <Select
          value={clockDisplayType}
          onChange={(v) => update({ clockDisplayType: v as ClockDisplayType })}
          options={[
            { value: 'digital', label: 'Digital' },
            { value: 'analog', label: 'Analog' },
          ]}
        />
      </Field>
      <Field label={`Bar scale (${clockScale.toFixed(1)}×)`}>
        <Slider value={clockScale} min={0.5} max={5} step={0.1} onChange={(v) => update({ clockScale: v })} format={(v) => `${v.toFixed(1)}×`} />
      </Field>

      <div>
        <div className="mb-1 text-sm font-medium text-slate-300">Zones ({zones.length}/5)</div>
        <div className="flex flex-wrap gap-2">
          {zones.map((zoneId) => (
            <span key={zoneId} className="flex items-center gap-1 rounded-full border border-white/10 bg-slate-700/50 px-2 py-1 text-xs">
              {zoneLabel(zoneId, cityDetails)}
              <button type="button" onClick={() => removeZone(zoneId)} className="min-h-0 min-w-0 text-red-400">
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {zones.length < 5 && (
        <>
          <Field label="Search for a city">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Karachi"
                className="w-full rounded border border-white/10 bg-slate-800 px-2 py-1 text-sm"
              />
              {searching && <span className="absolute right-2 top-1.5 text-xs text-slate-500">Searching…</span>}
              {results.length > 0 && (
                <ul role="listbox" className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded border border-white/10 bg-slate-800 text-sm shadow-lg">
                  {results.map((r) => {
                    const alreadyAdded = zones.includes(r.timezone);
                    return (
                      <li
                        key={`${r.timezone}-${r.latitude}-${r.longitude}`}
                        role="option"
                        aria-selected={false}
                        onClick={() =>
                          !alreadyAdded && addZone(r.timezone, { name: r.name, lat: r.latitude, lon: r.longitude })
                        }
                        className={`px-2 py-1 ${alreadyAdded ? 'cursor-not-allowed text-slate-600' : 'cursor-pointer hover:bg-white/10'}`}
                      >
                        {r.name}, {r.country}
                        {alreadyAdded && ' (already added)'}
                      </li>
                    );
                  })}
                </ul>
              )}
              {!searching && query.trim().length >= 2 && results.length === 0 && (
                <div className="mt-1 text-xs text-slate-500">No matches. Try another name.</div>
              )}
            </div>
          </Field>

          <Field label="Or pick a common zone">
            <div className="flex gap-2">
              <Select
                value={plainZone}
                onChange={setPlainZone}
                options={COMMON_ZONES.map((z) => ({ value: z, label: z }))}
              />
              <button
                type="button"
                onClick={() => addZone(plainZone)}
                className="rounded bg-amber-500 px-3 py-1 text-sm font-medium text-slate-900 hover:bg-amber-400"
              >
                Add
              </button>
            </div>
          </Field>
        </>
      )}
    </SettingsCard>
  );
}
