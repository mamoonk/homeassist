import { useState } from 'react';
import { useSettingsStore } from '../../../store/settingsStore';
import { SettingsCard, Field, Toggle, Slider, TextInput } from '../SettingsControls';

export function StocksSection() {
  const stocksApiKey = useSettingsStore((s) => s.stocksApiKey);
  const stocksWatchlist = useSettingsStore((s) => s.stocksWatchlist);
  const stocksShowOnDashboard = useSettingsStore((s) => s.stocksShowOnDashboard);
  const stocksScale = useSettingsStore((s) => s.stocksScale);
  const update = useSettingsStore((s) => s.update);
  const [newSymbol, setNewSymbol] = useState('');

  function addSymbol() {
    const symbol = newSymbol.trim().toUpperCase();
    if (!symbol || stocksWatchlist.includes(symbol)) return;
    update({ stocksWatchlist: [...stocksWatchlist, symbol] });
    setNewSymbol('');
  }

  function removeSymbol(symbol: string) {
    update({ stocksWatchlist: stocksWatchlist.filter((s) => s !== symbol) });
  }

  return (
    <SettingsCard title="Stocks">
      <Field label="Finnhub API key" hint="Free at finnhub.io">
        <TextInput
          type="password"
          value={stocksApiKey}
          onChange={(e) => update({ stocksApiKey: e.target.value })}
        />
      </Field>

      <div>
        <div className="mb-1 text-sm font-medium text-slate-300">Watchlist</div>
        <div className="flex flex-wrap gap-2">
          {stocksWatchlist.map((symbol) => (
            <span key={symbol} className="flex items-center gap-1 rounded-full border border-white/10 bg-slate-700/50 px-2 py-1 text-xs">
              {symbol}
              <button type="button" onClick={() => removeSymbol(symbol)} className="min-h-0 min-w-0 text-red-400">
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <TextInput
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSymbol()}
            placeholder="e.g. TSLA"
          />
          <button type="button" onClick={addSymbol} className="rounded bg-amber-500 px-3 py-1 text-sm font-medium text-slate-900 hover:bg-amber-400">
            + Add
          </button>
        </div>
      </div>

      <Toggle checked={stocksShowOnDashboard} onChange={(v) => update({ stocksShowOnDashboard: v })} label="Show on dashboard" />
      <Field label={`Widget scale (${stocksScale.toFixed(1)}×)`}>
        <Slider value={stocksScale} min={0.5} max={5} step={0.1} onChange={(v) => update({ stocksScale: v })} format={(v) => `${v.toFixed(1)}×`} />
      </Field>
    </SettingsCard>
  );
}
