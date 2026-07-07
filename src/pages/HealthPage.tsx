import { useMemo, useState } from 'react';
import { useHealthStore } from '../store/healthStore';
import { WidgetGrid } from '../components/grid/WidgetGrid';
import { BREAKPOINT_COLS, emptyLayouts } from '../components/grid/layoutUtils';
import { toDateKey } from '../services/calendarMonth';
import type { BreakpointKey, LayoutsByBreakpoint } from '../types';

const ITEM_IDS = ['health', 'dexcom'];

export function HealthPage() {
  const addMetric = useHealthStore((s) => s.addMetric);
  const [steps, setSteps] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [weight, setWeight] = useState('');

  const initialLayout = useMemo<LayoutsByBreakpoint>(() => {
    const layouts = emptyLayouts();
    (Object.keys(BREAKPOINT_COLS) as BreakpointKey[]).forEach((bp) => {
      layouts[bp] = [
        { i: 'health', x: 0, y: 0, w: 4, h: 3 },
        { i: 'dexcom', x: 4, y: 0, w: 4, h: 3 },
      ];
    });
    return layouts;
  }, []);

  function handleAdd() {
    const metric = {
      date: toDateKey(new Date()),
      steps: steps ? Number(steps) : undefined,
      sleepHours: sleepHours ? Number(sleepHours) : undefined,
      weight: weight ? Number(weight) : undefined,
    };
    if (metric.steps === undefined && metric.sleepHours === undefined && metric.weight === undefined) return;
    addMetric(metric);
    setSteps('');
    setSleepHours('');
    setWeight('');
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="glass-panel flex flex-wrap items-end gap-3 rounded-lg p-3">
        <label className="flex flex-col gap-1 text-sm">
          Steps
          <input
            type="number"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            className="w-28 rounded border border-white/10 bg-slate-800 px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Sleep hours
          <input
            type="number"
            step={0.5}
            value={sleepHours}
            onChange={(e) => setSleepHours(e.target.value)}
            className="w-28 rounded border border-white/10 bg-slate-800 px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Weight (kg)
          <input
            type="number"
            step={0.1}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-28 rounded border border-white/10 bg-slate-800 px-2 py-1"
          />
        </label>
        <button
          type="button"
          onClick={handleAdd}
          className="rounded bg-amber-500 px-4 py-1.5 text-sm font-semibold text-slate-900 hover:bg-amber-400"
        >
          Add
        </button>
      </div>

      <WidgetGrid tabKey="health-page" itemIds={ITEM_IDS} initialLayout={initialLayout} />
    </div>
  );
}
