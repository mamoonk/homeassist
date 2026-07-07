import { useEffect, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useSettingsStore } from '../store/settingsStore';
import { useHourlyRefresh } from '../hooks/useHourlyRefresh';
import { fetchDailyCandles, fetchQuote } from '../services/stocks';
import type { StockCandlePoint, StockQuote } from '../types';
import { WidgetCard } from '../components/grid/WidgetCard';

export function StockWidget({ symbol }: { symbol: string }) {
  const apiKey = useSettingsStore((s) => s.stocksApiKey);
  const refreshTick = useHourlyRefresh();
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [candles, setCandles] = useState<StockCandlePoint[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;
    setError(false);

    Promise.all([fetchQuote(symbol, apiKey), fetchDailyCandles(symbol, 30, apiKey)])
      .then(([q, c]) => {
        if (cancelled) return;
        setQuote(q);
        setCandles(c);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [symbol, apiKey, refreshTick]);

  if (!apiKey) {
    return (
      <WidgetCard title={symbol} centered>
        <span className="text-sm text-slate-400">Configure API key in Settings</span>
      </WidgetCard>
    );
  }

  if (error) {
    return (
      <WidgetCard title={symbol} centered>
        <span className="text-sm text-slate-400">Unable to load</span>
      </WidgetCard>
    );
  }

  if (!quote) {
    return (
      <WidgetCard title={symbol} centered>
        Loading…
      </WidgetCard>
    );
  }

  const isUp = quote.change >= 0;
  const color = isUp ? '#34d399' : '#f87171';
  const chartData = candles.map((c) => ({ time: c.time, close: c.close }));

  return (
    <WidgetCard title={symbol}>
      <div className="flex h-full flex-col justify-between">
        <div>
          <div className="text-xl font-bold">{quote.current.toFixed(2)}</div>
          <div className="text-sm" style={{ color }}>
            {isUp ? '+' : ''}
            {quote.change.toFixed(2)} ({isUp ? '+' : ''}
            {quote.percentChange.toFixed(2)}%)
          </div>
        </div>
        {chartData.length > 0 && (
          <div style={{ height: 50 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`stockGradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', fontSize: 11 }}
                  labelFormatter={() => ''}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={color}
                  strokeWidth={1.5}
                  fill={`url(#stockGradient-${symbol})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </WidgetCard>
  );
}
