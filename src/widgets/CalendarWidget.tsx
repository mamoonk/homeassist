import { useMemo, useState } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { useMergedEvents } from '../hooks/useMergedEvents';
import { buildMonthGrid, isSameDay, toDateKey } from '../services/calendarMonth';
import { toArabicDigits, toHijri } from '../services/hijri';
import dayjs from '../services/dayjsSetup';

const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function CalendarWidget() {
  const [viewDate, setViewDate] = useState(() => new Date());
  const scale = useSettingsStore((s) => s.calendarScale);
  const showHijri = useSettingsStore((s) => s.calendarShowHijri);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const relevantYears = useMemo(() => [...new Set(cells.map((c) => c.date.getFullYear()))], [cells]);
  const events = useMergedEvents(relevantYears);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const event of events) {
      const key = event.start.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(event.title);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const todayHolidayNames = useMemo(
    () => events.filter((e) => e.id.startsWith('holiday-') && e.start.slice(0, 10) === toDateKey(new Date())).map((e) => e.title),
    [events],
  );

  const today = new Date();
  const isCurrentMonthView = today.getFullYear() === year && today.getMonth() === month;
  const hijriHeader = showHijri ? toHijri(new Date(year, month, 15)) : null;
  const todayHolidays = isCurrentMonthView ? todayHolidayNames : [];

  return (
    <div className="widget-container flex h-full flex-col gap-1 p-2" style={{ fontSize: `${scale}rem` }}>
      <div className="flex items-center justify-between text-sm">
        <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} className="min-h-0 min-w-0 px-1">
          ←
        </button>
        <div className="flex items-center gap-2">
          <span className="font-semibold">
            {dayjs(viewDate).format('MMMM YYYY')}
            {hijriHeader && ` / ${hijriHeader.monthName} ${hijriHeader.year} AH`}
          </span>
          {todayHolidays.length > 0 && <span className="text-xs text-amber-400">({todayHolidays.join(', ')})</span>}
          {!isCurrentMonthView && (
            <button
              type="button"
              onClick={() => setViewDate(new Date())}
              className="min-h-0 min-w-0 rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-400"
            >
              Today
            </button>
          )}
        </div>
        <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} className="min-h-0 min-w-0 px-1">
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center text-[0.65em] text-slate-500">
        {WEEKDAY_LETTERS.map((letter, i) => (
          <div key={i}>{letter}</div>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-7 gap-0.5 overflow-hidden">
        {cells.map(({ date, isCurrentMonth }) => {
          const dateKey = toDateKey(date);
          const titles = eventsByDate.get(dateKey) ?? [];
          const isToday = isSameDay(date, today);
          const hijri = showHijri ? toHijri(date) : null;

          return (
            <div
              key={dateKey}
              className={`flex flex-col overflow-hidden rounded p-0.5 text-[0.6em] ${
                isToday ? 'bg-amber-500/20 ring-1 ring-amber-500/50' : ''
              } ${!isCurrentMonth ? 'opacity-30' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span>{date.getDate()}</span>
                {hijri && <span className="text-slate-500">{toArabicDigits(hijri.day)}</span>}
              </div>
              <div className="flex-1 overflow-y-auto">
                {titles.map((title, i) => (
                  <div key={i} className="truncate text-sky-300">
                    {title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
