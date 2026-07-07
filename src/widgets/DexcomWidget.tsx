import { useEffect, useState } from 'react';
import { Line, LineChart, ReferenceArea, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useSettingsStore } from '../store/settingsStore';
import { fetchDexcomData, getMockDexcomData, TREND_ARROWS, type DexcomBundle } from '../services/dexcom';
import type { DexcomTimeRangeHours } from '../types';
import dayjs from '../services/dayjsSetup';

const RANGES: DexcomTimeRangeHours[] = [3, 6, 12, 24];
const RANGE_LABELS: Record<DexcomTimeRangeHours, string> = { 3: '3 Hours', 6: '6', 12: '12', 24: '24' };

export function DexcomWidget() {
  const enabled = useSettingsStore((s) => s.dexcomEnabled);
  const useMock = useSettingsStore((s) => s.dexcomUseMockData);
  const apiBase = useSettingsStore((s) => s.dexcomApiBase);
  const accessToken = useSettingsStore((s) => s.dexcomAccessToken);
  const scale = useSettingsStore((s) => s.dexcomScale);

  const [range, setRange] = useState<DexcomTimeRangeHours>(3);
  const [bundle, setBundle] = useState<DexcomBundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (useMock) {
      setBundle(getMockDexcomData());
      setError(null);
      return;
    }
    if (!accessToken) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchDexcomData(apiBase, accessToken)
      .then((data) => {
        if (!cancelled) setBundle(data);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        if (err.message === '401') {
          setError('Your Dexcom session has expired. Re-authorize in Settings and paste a fresh access token.');
        } else if (err.message.includes('Failed to fetch')) {
          setError(
            'Could not reach Dexcom (likely a CORS restriction). Try mock mode, or proxy requests through a backend.',
          );
        } else {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, useMock, apiBase, accessToken]);

  if (!enabled) {
    return (
      <div className="widget-container flex h-full items-center justify-center p-3 text-sm text-slate-400">
        Dexcom is disabled. Enable it in Settings.
      </div>
    );
  }

  if (!useMock && !accessToken) {
    return (
      <div className="widget-container flex h-full items-center justify-center p-3 text-sm text-slate-400">
        No access token. Paste one in Settings after authorizing with Dexcom.
      </div>
    );
  }

  if (loading && !bundle) {
    return <div className="widget-container flex h-full items-center justify-center p-3 text-sm">Loading…</div>;
  }

  if (error) {
    return (
      <div className="widget-container flex h-full items-center justify-center p-3 text-center text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (!bundle) {
    return <div className="widget-container flex h-full items-center justify-center p-3 text-sm">No data</div>;
  }

  const now = Date.now();
  const rangeStart = now - range * 60 * 60 * 1000;
  const readings = bundle.egvs
    .filter((e) => new Date(e.systemTime).getTime() >= rangeStart)
    .filter((e) => e.value !== 39 && e.value !== 401);

  const latest = bundle.egvs[bundle.egvs.length - 1];
  const glucoseDisplay = latest ? (latest.value === 401 ? '>400' : latest.value === 39 ? '<40' : latest.value) : '—';

  const chartData = readings.map((e, i, arr) => ({
    time: new Date(e.systemTime).getTime(),
    hourLabel: i === arr.length - 1 ? 'Now' : dayjs(e.systemTime).format('h A'),
    value: e.value,
  }));

  return (
    <div className="widget-container flex h-full flex-col gap-2 p-3" style={{ fontSize: `${scale}rem` }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium uppercase tracking-wide text-slate-400">Glucose</span>
          {useMock && <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-400">Mock</span>}
        </div>
        <button type="button" className="min-h-0 min-w-0 text-slate-500">
          +
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border-4 border-sky-400/60">
          <div className="text-center">
            <div className="text-2xl font-bold">{glucoseDisplay}</div>
            <div className="text-[0.6rem] text-slate-400">mg/dL</div>
          </div>
        </div>
        <div className="text-3xl">{latest ? (TREND_ARROWS[latest.trend] ?? '—') : '—'}</div>
      </div>

      <div className="flex gap-1 text-xs">
        {RANGES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={`min-h-0 min-w-0 rounded px-2 py-1 ${
              range === r ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5'
            }`}
          >
            {RANGE_LABELS[r]}
          </button>
        ))}
        <span className="ml-auto min-h-0 min-w-0 px-2 py-1 text-slate-500">⋯</span>
      </div>

      {/* em height so the chart follows the dexcomScale font-size */}
      <div style={{ height: '8.75em' }}>
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No readings in selected range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <YAxis domain={[40, 400]} ticks={[40, 70, 180, 250, 400]} stroke="#64748b" fontSize={10} width={30} />
              <XAxis dataKey="hourLabel" stroke="#64748b" fontSize={10} />
              <ReferenceArea y1={70} y2={180} fill="#22c55e" fillOpacity={0.1} />
              <ReferenceLine y={250} stroke="#eab308" strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#e2e8f0"
                strokeDasharray="2 2"
                strokeWidth={1.5}
                dot={{ r: 2, fill: '#e2e8f0' }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
