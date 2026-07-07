import type { HolidayEvent } from '../types';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toISODate(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function dayOfWeek(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function nthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): number {
  const first = dayOfWeek(year, month, 1);
  const offset = (weekday - first + 7) % 7;
  return 1 + offset + (n - 1) * 7;
}

function lastWeekdayOfMonth(year: number, month: number, weekday: number): number {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const lastDow = dayOfWeek(year, month, daysInMonth);
  const offset = (lastDow - weekday + 7) % 7;
  return daysInMonth - offset;
}

function observedFixedDate(year: number, month: number, day: number): string {
  const dow = dayOfWeek(year, month, day);
  if (dow === 6) return toISODate(year, month, day - 1); // Sat -> observed Fri
  if (dow === 0) return toISODate(year, month, day + 1); // Sun -> observed Mon
  return toISODate(year, month, day);
}

function usHoliday(id: string, title: string, date: string): HolidayEvent {
  return { id, title, start: date, holiday: true, allDay: true };
}

export function getUsHolidays(year: number): HolidayEvent[] {
  const mk = (month: number, day: number, title: string) => {
    const date = observedFixedDate(year, month, day);
    return usHoliday(`holiday-us-${date}`, title, date);
  };

  const mlk = toISODate(year, 1, nthWeekdayOfMonth(year, 1, 1, 3));
  const presidents = toISODate(year, 2, nthWeekdayOfMonth(year, 2, 1, 3));
  const memorial = toISODate(year, 5, lastWeekdayOfMonth(year, 5, 1));
  const labor = toISODate(year, 9, nthWeekdayOfMonth(year, 9, 1, 1));
  const columbus = toISODate(year, 10, nthWeekdayOfMonth(year, 10, 1, 2));
  const thanksgiving = toISODate(year, 11, nthWeekdayOfMonth(year, 11, 4, 4));

  return [
    mk(1, 1, "New Year's Day"),
    usHoliday(`holiday-us-${mlk}`, 'Martin Luther King Jr. Day', mlk),
    usHoliday(`holiday-us-${presidents}`, "Presidents' Day", presidents),
    usHoliday(`holiday-us-${memorial}`, 'Memorial Day', memorial),
    mk(6, 19, 'Juneteenth'),
    mk(7, 4, 'Independence Day'),
    usHoliday(`holiday-us-${labor}`, 'Labor Day', labor),
    usHoliday(`holiday-us-${columbus}`, 'Columbus Day', columbus),
    mk(11, 11, 'Veterans Day'),
    usHoliday(`holiday-us-${thanksgiving}`, 'Thanksgiving Day', thanksgiving),
    mk(12, 25, 'Christmas Day'),
  ];
}

// Approximate Gregorian dates for a fixed table of years; the Islamic
// calendar is lunar so these shift ~11 days earlier each year.
const ISLAMIC_HOLIDAYS: Record<number, Array<{ title: string; date: string }>> = {
  2024: [
    { title: 'Islamic New Year', date: '2024-07-07' },
    { title: 'Mawlid an-Nabi', date: '2024-09-15' },
    { title: 'Eid al-Fitr', date: '2024-04-10' },
    { title: 'Eid al-Adha', date: '2024-06-16' },
  ],
  2025: [
    { title: 'Islamic New Year', date: '2025-06-26' },
    { title: 'Mawlid an-Nabi', date: '2025-09-04' },
    { title: 'Eid al-Fitr', date: '2025-03-30' },
    { title: 'Eid al-Adha', date: '2025-06-06' },
  ],
  2026: [
    { title: 'Islamic New Year', date: '2026-06-16' },
    { title: 'Mawlid an-Nabi', date: '2026-08-24' },
    { title: 'Eid al-Fitr', date: '2026-03-20' },
    { title: 'Eid al-Adha', date: '2026-05-27' },
  ],
  2027: [
    { title: 'Islamic New Year', date: '2027-06-06' },
    { title: 'Mawlid an-Nabi', date: '2027-08-14' },
    { title: 'Eid al-Fitr', date: '2027-03-09' },
    { title: 'Eid al-Adha', date: '2027-05-16' },
  ],
  2028: [
    { title: 'Islamic New Year', date: '2028-05-25' },
    { title: 'Mawlid an-Nabi', date: '2028-08-02' },
    { title: 'Eid al-Fitr', date: '2028-02-26' },
    { title: 'Eid al-Adha', date: '2028-05-05' },
  ],
  2029: [
    { title: 'Islamic New Year', date: '2029-05-14' },
    { title: 'Mawlid an-Nabi', date: '2029-07-22' },
    { title: 'Eid al-Fitr', date: '2029-02-14' },
    { title: 'Eid al-Adha', date: '2029-04-24' },
  ],
  2030: [
    { title: 'Islamic New Year', date: '2030-05-04' },
    { title: 'Mawlid an-Nabi', date: '2030-07-11' },
    { title: 'Eid al-Fitr', date: '2030-02-04' },
    { title: 'Eid al-Adha', date: '2030-04-13' },
  ],
};

export function getIslamicHolidays(year: number): HolidayEvent[] {
  const entries = ISLAMIC_HOLIDAYS[year] ?? [];
  return entries.map((e) => ({
    id: `holiday-islamic-${e.date}`,
    title: e.title,
    start: e.date,
    holiday: true,
    allDay: true,
  }));
}
