import { useState } from 'react';
import type { CalendarEvent } from '../../types';
import { toDateKey } from '../../services/calendarMonth';

export interface EventModalResult {
  title: string;
  date: string;
  allDay: boolean;
  time: string;
}

interface EventModalProps {
  initial?: CalendarEvent | null;
  defaultDate?: Date;
  onCancel: () => void;
  onSave: (result: EventModalResult) => void;
}

function splitEvent(event?: CalendarEvent | null, defaultDate?: Date) {
  if (!event) {
    return { title: '', date: toDateKey(defaultDate ?? new Date()), allDay: true, time: '09:00' };
  }
  const allDay = event.allDay ?? !event.start.includes('T');
  if (allDay) {
    return { title: event.title, date: event.start.slice(0, 10), allDay: true, time: '09:00' };
  }
  const [date, time] = event.start.split('T');
  return { title: event.title, date, allDay: false, time: (time ?? '09:00').slice(0, 5) };
}

export function EventModal({ initial, defaultDate, onCancel, onSave }: EventModalProps) {
  const initialState = splitEvent(initial, defaultDate);
  const [title, setTitle] = useState(initialState.title);
  const [date, setDate] = useState(initialState.date);
  const [allDay, setAllDay] = useState(initialState.allDay);
  const [time, setTime] = useState(initialState.time);

  function handleSave() {
    if (!title.trim()) return;
    onSave({ title: title.trim(), date, allDay, time });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div
        className="glass-panel w-full max-w-sm rounded-lg border border-white/10 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-3 text-lg font-semibold">{initial ? 'Edit event' : 'Add event'}</h2>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Title
            <input
              autoFocus
              data-testid="event-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded border border-white/10 bg-slate-800 px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded border border-white/10 bg-slate-800 px-2 py-1"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
            All-day
          </label>
          {!allDay && (
            <label className="flex flex-col gap-1 text-sm">
              Time
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="rounded border border-white/10 bg-slate-800 px-2 py-1"
              />
            </label>
          )}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded bg-amber-500 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-amber-400"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
