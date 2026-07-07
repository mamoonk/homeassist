import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { useSettingsStore } from '../store/settingsStore';
import { fetchCompanyName, fetchDailyCandles, fetchQuote } from '../services/stocks';
import type { StockCandlePoint, StockQuote } from '../types';
import dayjs from '../services/dayjsSetup';

interface Row {
  symbol: string;
  name: string;
  quote: StockQuote | null;
  candles: StockCandlePoint[];
}

export function StocksListWidget() {
  const apiKey = useSettingsStore((s) => s.stocksApiKey);
  const watchlist = useSettingsStore((s) => s.stocksWatchlist);
  const scale = useSettingsStore((s) => s.stocksScale);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;
    const symbols = watchlist.slice(0, 12);

    Promise.all(
      symbols.map(async (symbol) => {
        const [quote, name, candles] = await Promise.all([
          fetchQuote(symbol, apiKey).catch(() => null),
          fetchCompanyName(symbol, apiKey).catch(() => symbol),
          fetchDailyCandles(symbol, 30, apiKey).catch(() => []),
        ]);
        return { symbol, name, quote, candles };
      }),
    ).then((results) => {
      if (!cancelled) setRows(results);
    });

    return () => {
      cancelled = true;
    };
  }, [apiKey, watchlist]);

  return (
    <div className="widget-container flex h-full flex-col gap-2 p-3" style={{ fontSize: `${scale}rem` }}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold">Stocks</div>
          <div className="text-xs text-slate-400">{dayjs().format('dddd, MMMM D, YYYY')}</div>
        </div>
        <Link to="/settings" className="text-xs text-amber-400 hover:underline">
          Edit
        </Link>
      </div>

      {!apiKey ? (
        <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
          Configure API key in Settings
        </div>
      ) : (
        <div className="flex flex-1 flex-col divide-y divide-white/5 overflow-y-auto">
          {rows.map((row) => {
            const isUp = (row.quote?.change ?? 0) >= 0;
            const color = isUp ? '#34d399' : '#f87171';
            return (
              <div key={row.symbol} className="flex items-center gap-2 py-1.5">
                <div className="w-16 flex-shrink-0">
                  <div className="font-semibold">{row.symbol}</div>
                  <div className="truncate text-xs text-slate-400">{row.name}</div>
                </div>
                <div style={{ height: 28, width: 60 }} className="flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={row.candles}>
                      <defs>
                        <linearGradient id={`sparkline-${row.symbol}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                          <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="close"
                        stroke={color}
                        strokeWidth={1.5}
                        fill={`url(#sparkline-${row.symbol})`}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="ml-auto text-right">
                  <div className="font-semibold">{row.quote ? row.quote.current.toFixed(2) : '—'}</div>
                  {row.quote && (
                    <span
                      className="inline-block rounded px-1.5 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: color }}
                    >
                      {isUp ? '+' : ''}
                      {row.quote.percentChange.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
