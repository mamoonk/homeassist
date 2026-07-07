import { useMemo, useState } from 'react';
import { useEventsStore } from '../store/eventsStore';
import { useTasksStore } from '../store/tasksStore';
import { useSettingsStore } from '../store/settingsStore';
import { useMergedEvents } from '../hooks/useMergedEvents';
import { buildMonthGrid, isSameDay, toDateKey } from '../services/calendarMonth';
import { toArabicDigits, toHijri } from '../services/hijri';
import { EventModal, type EventModalResult } from '../components/modals/EventModal';
import type { CalendarEvent } from '../types';
import dayjs from '../services/dayjsSetup';

const EVENT_DRAG_MIME = 'application/x-gloss-event-id';
const WEEKDAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function isHoliday(event: CalendarEvent): boolean {
  return event.id.startsWith('holiday-');
}

export function CalendarPage() {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [modalState, setModalState] = useState<{ mode: 'add' | 'edit'; event?: CalendarEvent; date?: Date } | null>(
    null,
  );
  const [inlineAddDate, setInlineAddDate] = useState<string | null>(null);
  const [inlineTitle, setInlineTitle] = useState('');
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [taskInput, setTaskInput] = useState('');

  const showHijri = useSettingsStore((s) => s.calendarShowHijri);
  const addEvent = useEventsStore((s) => s.addEvent);
  const updateEvent = useEventsStore((s) => s.updateEvent);
  const removeEvent = useEventsStore((s) => s.removeEvent);
  const moveEvent = useEventsStore((s) => s.moveEvent);

  const tasks = useTasksStore((s) => s.tasks);
  const addTask = useTasksStore((s) => s.addTask);
  const toggleTask = useTasksStore((s) => s.toggleTask);
  const removeTask = useTasksStore((s) => s.removeTask);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const relevantYears = useMemo(() => [...new Set(cells.map((c) => c.date.getFullYear()))], [cells]);
  const events = useMergedEvents(relevantYears);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const key = event.start.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.start.localeCompare(b.start));
    }
    return map;
  }, [events]);

  const today = new Date();
  const todayKey = toDateKey(today);
  const todayEvents = eventsByDate.get(todayKey) ?? [];

  const upcoming = useMemo(() => {
    return events
      .filter((e) => !isHoliday(e) && e.start.slice(0, 10) > todayKey)
      .sort((a, b) => a.start.localeCompare(b.start))
      .slice(0, 7);
  }, [events, todayKey]);

  const hijriHeader = showHijri ? toHijri(new Date(year, month, 15)) : null;
  const todayHolidayNames = todayEvents.filter(isHoliday).map((e) => e.title);

  function handleSaveModal(result: EventModalResult) {
    const start = result.allDay ? result.date : `${result.date}T${result.time}:00`;
    if (modalState?.mode === 'edit' && modalState.event) {
      updateEvent(modalState.event.id, { title: result.title, start, allDay: result.allDay });
    } else {
      addEvent({ title: result.title, start, allDay: result.allDay });
    }
    setModalState(null);
  }

  function handleInlineAdd(dateKey: string) {
    if (!inlineTitle.trim()) {
      setInlineAddDate(null);
      return;
    }
    addEvent({ title: inlineTitle.trim(), start: dateKey, allDay: true });
    setInlineTitle('');
    setInlineAddDate(null);
  }

  function handleDrop(dateKey: string, e: React.DragEvent) {
    e.preventDefault();
    setDragOverDate(null);
    const id = e.dataTransfer.getData(EVENT_DRAG_MIME);
    if (id) moveEvent(id, dateKey);
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendar & Events</h1>
          <p className="text-sm text-slate-400">All in one place — stay on the same page.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalState({ mode: 'add', date: new Date() })}
          className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400"
        >
          + Add event
        </button>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Today</h2>
        {todayEvents.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 p-4 text-center text-sm text-slate-500">
            No events today
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {todayEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => !isHoliday(event) && setModalState({ mode: 'edit', event })}
                className={`glass-panel flex items-center justify-between rounded-lg p-3 ${
                  isHoliday(event) ? '' : 'cursor-pointer'
                }`}
              >
                <div>
                  <div className="font-medium">{event.title}</div>
                  <div className="text-xs text-slate-400">
                    {event.allDay ? 'All day' : dayjs(event.start).format('ddd, MMM D · h:mm A')}
                  </div>
                </div>
                {!isHoliday(event) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeEvent(event.id);
                    }}
                    className="min-h-0 min-w-0 text-slate-500 hover:text-red-400"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="rounded px-2 py-1 text-slate-300 hover:bg-white/5"
          >
            ←
          </button>
          <h2 className="text-lg font-semibold">
            {dayjs(viewDate).format('MMMM YYYY')}
            {hijriHeader && ` / ${hijriHeader.monthName} ${hijriHeader.year} AH`}
            {todayHolidayNames.length > 0 && (
              <span className="ml-2 text-sm font-normal text-amber-400">({todayHolidayNames.join(', ')})</span>
            )}
          </h2>
          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="rounded px-2 py-1 text-slate-300 hover:bg-white/5"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-xs text-slate-500">
          {WEEKDAY_HEADERS.map((d) => (
            <div key={d} className="p-1 text-center">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map(({ date, isCurrentMonth }) => {
            const dateKey = toDateKey(date);
            const dayEvents = eventsByDate.get(dateKey) ?? [];
            const isToday = isSameDay(date, today);
            const hijri = showHijri ? toHijri(date) : null;
            const isDragOver = dragOverDate === dateKey;

            return (
              <div
                key={dateKey}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverDate(dateKey);
                }}
                onDragLeave={() => setDragOverDate((d) => (d === dateKey ? null : d))}
                onDrop={(e) => handleDrop(dateKey, e)}
                className={`group relative flex min-h-[5rem] flex-col gap-0.5 rounded border p-1 text-xs ${
                  isToday ? 'border-amber-500/60 bg-amber-500/10 ring-1 ring-amber-500/40' : 'border-white/5'
                } ${!isCurrentMonth ? 'opacity-40' : ''} ${isDragOver ? 'ring-2 ring-amber-400' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className={isToday ? 'font-bold text-amber-400' : ''}>{date.getDate()}</span>
                  <div className="flex items-center gap-1">
                    {hijri && <span className="text-[0.65rem] text-slate-500">{toArabicDigits(hijri.day)}</span>}
                    <button
                      type="button"
                      onClick={() => {
                        setInlineAddDate(dateKey);
                        setInlineTitle('');
                      }}
                      className="hidden min-h-0 min-w-0 h-4 w-4 items-center justify-center rounded-full bg-white/10 text-[0.65rem] group-hover:flex"
                    >
                      +
                    </button>
                  </div>
                </div>

                {inlineAddDate === dateKey && (
                  <div className="flex flex-col gap-1">
                    <input
                      autoFocus
                      value={inlineTitle}
                      onChange={(e) => setInlineTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleInlineAdd(dateKey)}
                      className="w-full rounded border border-white/10 bg-slate-800 px-1 py-0.5 text-xs"
                    />
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleInlineAdd(dateKey)}
                        className="min-h-0 min-w-0 rounded bg-amber-500 px-1.5 py-0.5 text-[0.65rem] text-slate-900"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setInlineAddDate(null)}
                        className="min-h-0 min-w-0 rounded px-1.5 py-0.5 text-[0.65rem] text-slate-400 hover:bg-white/5"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-0.5 overflow-hidden">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      draggable={!isHoliday(event)}
                      onDragStart={(e) => e.dataTransfer.setData(EVENT_DRAG_MIME, event.id)}
                      onClick={() => !isHoliday(event) && setModalState({ mode: 'edit', event })}
                      title={event.title}
                      className={`truncate rounded px-1 ${
                        isHoliday(event) ? 'bg-emerald-500/20 text-emerald-300' : 'cursor-pointer bg-sky-500/20 text-sky-200'
                      }`}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Upcoming</h2>
          <div className="flex flex-col gap-2">
            {upcoming.length === 0 && <div className="text-sm text-slate-500">Nothing upcoming</div>}
            {upcoming.map((event) => (
              <div key={event.id} className="glass-panel rounded-lg p-2 text-sm">
                <div className="font-medium">{event.title}</div>
                <div className="text-xs text-slate-400">
                  {dayjs(event.start).format('ddd, MMM D')}
                  {!event.allDay && ` · ${dayjs(event.start).format('h:mm A')}`}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Tasks</h2>
          <div className="mb-2 flex gap-2">
            <input
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                const title = taskInput.trim() || window.prompt('Task title') || '';
                if (title.trim()) addTask(title.trim());
                setTaskInput('');
              }}
              placeholder="Add a task…"
              className="flex-1 rounded border border-white/10 bg-slate-800 px-2 py-1 text-sm"
            />
            <button
              type="button"
              onClick={() => {
                const title = taskInput.trim() || window.prompt('Task title') || '';
                if (title.trim()) addTask(title.trim());
                setTaskInput('');
              }}
              className="rounded bg-amber-500 px-3 py-1 text-sm font-medium text-slate-900 hover:bg-amber-400"
            >
              Add
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2 rounded px-1 py-1 text-sm hover:bg-white/5">
                <button
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  className={`flex h-5 w-5 min-h-0 min-w-0 items-center justify-center rounded-full border ${
                    task.done ? 'border-emerald-500 bg-emerald-500 text-slate-900' : 'border-slate-500'
                  }`}
                >
                  {task.done && '✓'}
                </button>
                <span className={`flex-1 ${task.done ? 'text-slate-500 line-through' : ''}`}>{task.title}</span>
                <button
                  type="button"
                  onClick={() => removeTask(task.id)}
                  className="min-h-0 min-w-0 text-slate-500 hover:text-red-400"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {modalState && (
        <EventModal
          initial={modalState.mode === 'edit' ? modalState.event : null}
          defaultDate={modalState.date}
          onCancel={() => setModalState(null)}
          onSave={handleSaveModal}
        />
      )}
    </div>
  );
}
