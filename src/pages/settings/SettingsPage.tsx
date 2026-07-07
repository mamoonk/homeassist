import { useMemo, useState } from 'react';
import { SETTINGS_SECTIONS } from './sectionConfig';
import { AppearanceSection } from './sections/AppearanceSection';
import { BackgroundSection } from './sections/BackgroundSection';
import { GlassmorphismSection } from './sections/GlassmorphismSection';
import { SmartMirrorSection } from './sections/SmartMirrorSection';
import { DashboardSection } from './sections/DashboardSection';
import { CalendarSection } from './sections/CalendarSection';
import { WorldClocksSection } from './sections/WorldClocksSection';
import { ClockWidgetSection } from './sections/ClockWidgetSection';
import { WeatherSection } from './sections/WeatherSection';
import { StocksSection } from './sections/StocksSection';
import { DexcomSection } from './sections/DexcomSection';
import { AzanSection } from './sections/AzanSection';

const SECTION_COMPONENTS: Record<string, React.ComponentType> = {
  appearance: AppearanceSection,
  background: BackgroundSection,
  glassmorphism: GlassmorphismSection,
  'smart-mirror': SmartMirrorSection,
  dashboard: DashboardSection,
  calendar: CalendarSection,
  'world-clocks': WorldClocksSection,
  'clock-widget': ClockWidgetSection,
  weather: WeatherSection,
  stocks: StocksSection,
  dexcom: DexcomSection,
  azan: AzanSection,
};

export function SettingsPage() {
  const [activeId, setActiveId] = useState('appearance');
  const [search, setSearch] = useState('');
  const [generalExpanded, setGeneralExpanded] = useState(true);

  const filteredSections = useMemo(() => {
    if (!search.trim()) return SETTINGS_SECTIONS;
    const q = search.toLowerCase();
    return SETTINGS_SECTIONS.filter((s) => s.label.toLowerCase().includes(q));
  }, [search]);

  const generalSections = filteredSections.filter((s) => s.group === 'general');
  const flatSections = filteredSections.filter((s) => !s.group);

  const ActiveComponent = SECTION_COMPONENTS[activeId] ?? AppearanceSection;

  function renderItem(section: (typeof SETTINGS_SECTIONS)[number]) {
    const isActive = activeId === section.id;
    return (
      <button
        key={section.id}
        type="button"
        onClick={() => setActiveId(section.id)}
        className={`w-full rounded-md px-3 py-1.5 text-left text-sm transition ${
          isActive
            ? 'border-l-2 border-amber-500 bg-amber-500/10 text-amber-400'
            : 'border-l-2 border-transparent text-slate-300 hover:bg-white/5'
        }`}
      >
        {section.label}
      </button>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold">Settings</h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search settings…"
          className="w-64 rounded border border-white/10 bg-slate-800 px-2 py-1 text-sm"
        />
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <nav className="flex w-56 flex-shrink-0 flex-col gap-1 overflow-y-auto">
          {generalSections.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setGeneralExpanded((v) => !v)}
                className="flex w-full items-center gap-1 px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                <span>{generalExpanded ? '▼' : '▶'}</span>
                General
              </button>
              {generalExpanded && <div className="flex flex-col gap-0.5">{generalSections.map(renderItem)}</div>}
            </div>
          )}
          <div className="mt-2 flex flex-col gap-0.5">{flatSections.map(renderItem)}</div>
        </nav>

        <div className="flex-1 overflow-y-auto rounded-lg p-1 shadow-inner">
          <div className="max-w-[50%] min-w-[20rem]">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  );
}
