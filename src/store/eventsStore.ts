import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CalendarEvent } from '../types';
import { isAllDay, randomId } from '../services/storage';

interface EventsStore {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id'>) => CalendarEvent;
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void;
  removeEvent: (id: string) => void;
  moveEvent: (id: string, newDateKey: string) => void;
}

export const useEventsStore = create<EventsStore>()(
  persist(
    (set, get) => ({
      events: [],
      addEvent: (event) => {
        const newEvent: CalendarEvent = {
          ...event,
          id: randomId('ev'),
          allDay: event.allDay ?? isAllDay(event.start),
        };
        set({ events: [...get().events, newEvent] });
        return newEvent;
      },
      updateEvent: (id, patch) => {
        set({ events: get().events.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
      },
      removeEvent: (id) => {
        set({ events: get().events.filter((e) => e.id !== id) });
      },
      moveEvent: (id, newDateKey) => {
        set({
          events: get().events.map((e) => {
            if (e.id !== id) return e;
            if (e.allDay || !e.start.includes('T')) return { ...e, start: newDateKey };
            const time = e.start.split('T')[1];
            return { ...e, start: `${newDateKey}T${time}` };
          }),
        });
      },
    }),
    { name: 'gloss-calendar-events' },
  ),
);
