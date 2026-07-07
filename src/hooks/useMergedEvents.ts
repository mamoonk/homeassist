import { useMemo } from 'react';
import { useEventsStore } from '../store/eventsStore';
import { useSettingsStore } from '../store/settingsStore';
import { getIslamicHolidays, getUsHolidays } from '../services/holidays';
import type { CalendarEvent } from '../types';

export function useMergedEvents(years: number[]): CalendarEvent[] {
  const userEvents = useEventsStore((s) => s.events);
  const showUsHolidays = useSettingsStore((s) => s.calendarShowUsHolidays);
  const showIslamicHolidays = useSettingsStore((s) => s.calendarShowIslamicHolidays);

  return useMemo(() => {
    const holidays: CalendarEvent[] = [];
    const uniqueYears = [...new Set(years)];
    for (const year of uniqueYears) {
      if (showUsHolidays) holidays.push(...getUsHolidays(year));
      if (showIslamicHolidays) holidays.push(...getIslamicHolidays(year));
    }
    return [...userEvents, ...holidays];
  }, [userEvents, showUsHolidays, showIslamicHolidays, years.join(',')]);
}
