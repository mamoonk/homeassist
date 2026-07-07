import { useEffect, useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useSettingsStore } from '../store/settingsStore';
import { useHourlyRefresh } from '../hooks/useHourlyRefresh';
import { fetchCandles, fetchQuote, type IntradayResolution } from '../services/stocks';
import type { StockCandlePoint, StockQuote } from '../types';
import dayjs from '../services/dayjsSetup';

const MOCK_SECTORS = [
  { code: 'SIXB', name: 'Materials', value: 412.3, pct: 0.8 },
  { code: 'SIXC', name: 'Communication', value: 289.1, pct: -1.2 },
  { code: 'SIXD', name: 'Consumer Disc.', value: 1023.5, pct: 1.5 },
  { code: 'SIXE', name: 'Energy', value: 654.2, pct: -0.4 },
  { code: 'SIXF', name: 'Financials', value: 892.7, pct: 0.6 },
  { code: 'SIXH', name: 'Health Care', value: 1502.9, pct: 0.2 },
  { code: 'SIXI', name: 'Industrials', value: 733.4, pct: 1.1 },
  { code: 'SIXT', name: 'Technology', value: 3421.8, pct: 2.3 },
  { code: 'SIXU', name: 'Utilities', value: 341.6, pct: -0.7 },
];

const MOCK_HEADLINES = [
  { title: 'Markets edge higher as tech leads rally', age: '12m', source: 'Newswire' },
  { title: 'Fed officials signal steady rate path', age: '38m', source: 'Financial Times' },
  { title: 'Oil prices slip on demand concerns', age: '1h', source: 'Reuters' },
  { title: 'Retail earnings beat expectations broadly', age: '2h', source: 'Bloomberg' },
];

const MARKET_SUMMARY_CARDS = [
  {
    title: 'Equities',
    body: 'Major indices traded mixed as investors weighed earnings against rate expectations. Technology names outperformed while defensive sectors lagged.',
  },
  { title: 'Fixed Income', body: '' },
  { title: 'Commodities', body: '' },
  { title: 'Currencies', body: '' },
];

const TICKERS = ['SPY', 'IXIC', 'DJI', 'NVDA'];
const TICKER_REMAP: Record<string, string> = { IXIC: 'QQQ', DJI: 'DIA' };

type Range = '1D' | '5D' | '1M' | 'YTD' | 'MAX';
const RANGES: Range[] = ['1D', '5D', '1M', 'YTD', 'MAX'];

function rangeToParams(range: Range): { resolution: IntradayResolution; days: number } {
  switch (range) {
    case '1D':
      return { resolution: '5', days: 1 };
    case '5D':
      return { resolution: '15', days: 5 };
    case '1M':
      return { resolution: 'D', days: 30 };
    case 'YTD':
      return { resolution: 'D', days: 180 };
    case 'MAX':
      return { resolution: 'D', days: 365 };
  }
}

export function FinnhubDashboardWidget() {
  const apiKey = useSettingsStore((s) => s.stocksApiKey);
  const watchlist = useSettingsStore((s) => s.stocksWatchlist);
  const refreshTick = useHourlyRefresh();

  const [leftTab, setLeftTab] = useState<'sectors' | 'stocks'>('sectors');
  const [expandedCard, setExpandedCard] = useState(0);
  const [ticker, setTicker] = useState('SPY');
  const [range, setRange] = useState<Range>('1D');
  const [chartData, setChartData] = useState<StockCandlePoint[]>([]);
  const [chartState, setChartState] = useState<'idle' | 'loading' | 'empty' | 'error'>('idle');
  const [watchlistQuotes, setWatchlistQuotes] = useState<Record<string, StockQuote>>({});

  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;
    Promise.all(
      watchlist.map((symbol) => fetchQuote(symbol, apiKey).then((q) => [symbol, q] as const).catch(() => null)),
    ).then((results) => {
      if (cancelled) return;
      const map: Record<string, StockQuote> = {};
      for (const r of results) if (r) map[r[0]] = r[1];
      setWatchlistQuotes(map);
    });
    return () => {
      cancelled = true;
    };
  }, [apiKey, watchlist, refreshTick]);

  useEffect(() => {
    if (!apiKey) {
      setChartState('error');
      return;
    }
    let cancelled = false;
    setChartState('loading');
    const { resolution, days } = rangeToParams(range);
    const to = Math.floor(Date.now() / 1000);
    const from = to - days * 24 * 60 * 60;
    const resolvedTicker = TICKER_REMAP[ticker] ?? ticker;

    fetchCandles(resolvedTicker, resolution, from, to, apiKey)
      .then((points) => {
        if (cancelled) return;
        setChartData(points);
        setChartState(points.length ? 'idle' : 'empty');
      })
      .catch(() => {
        if (!cancelled) setChartState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey, ticker, range, refreshTick]);

  const maxSectorValue = useMemo(() => Math.max(...MOCK_SECTORS.map((s) => s.value)), []);

  return (
    <div className="widget-container flex h-full flex-col gap-2 overflow-hidden p-2" style={{ background: '#1a1a24' }}>
      <div className="flex items-center gap-2">
        <input
          readOnly
          placeholder="Search assets, news, research..."
          className="flex-1 rounded bg-black/30 px-3 py-1.5 text-sm text-slate-400"
        />
        <button type="button" className="rounded bg-black/30 px-2 py-1.5">
          🔔
        </button>
      </div>

      <div className="flex flex-1 gap-2 overflow-hidden">
        {/* Left panel */}
        <div className="flex w-[28%] flex-col gap-2 overflow-hidden">
          <div className="flex gap-1 text-xs">
            <button
              type="button"
              onClick={() => setLeftTab('sectors')}
              className={`rounded px-2 py-1 ${leftTab === 'sectors' ? 'bg-white/10 text-white' : 'text-slate-400'}`}
            >
              Market sectors
            </button>
            <button
              type="button"
              onClick={() => setLeftTab('stocks')}
              className={`rounded px-2 py-1 ${leftTab === 'stocks' ? 'bg-white/10 text-white' : 'text-slate-400'}`}
            >
              Stocks
            </button>
          </div>
          <div className="subtle-scrollbar flex-1 overflow-y-auto text-xs">
            {leftTab === 'sectors'
              ? MOCK_SECTORS.map((sector) => (
                  <div key={sector.code} className="flex items-center gap-2 py-1">
                    <span className="w-10 text-slate-500">{sector.code}</span>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="truncate text-slate-300">{sector.name}</span>
                        <span className={sector.pct >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {sector.pct >= 0 ? '+' : ''}
                          {sector.pct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="mt-0.5 h-1 rounded-full bg-white/10">
                        <div
                          className={`h-1 rounded-full ${sector.pct >= 0 ? 'bg-emerald-400' : 'bg-red-400'}`}
                          style={{ width: `${(sector.value / maxSectorValue) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              : watchlist.map((symbol) => {
                  const quote = watchlistQuotes[symbol];
                  const isUp = (quote?.change ?? 0) >= 0;
                  return (
                    <div key={symbol} className="flex items-center justify-between py-1">
                      <span className="text-slate-300">{symbol}</span>
                      <span className={isUp ? 'text-emerald-400' : 'text-red-400'}>
                        {quote ? quote.current.toFixed(2) : '—'}
                      </span>
                    </div>
                  );
                })}
          </div>
        </div>

        {/* Center panel */}
        <div className="subtle-scrollbar flex w-[40%] flex-col gap-3 overflow-y-auto text-xs">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                <span className="font-semibold text-white">Latest updates</span>
              </div>
              <button type="button" className="text-slate-400 hover:text-white">
                Show more →
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {MOCK_HEADLINES.map((h) => (
                <div key={h.title}>
                  <div className="text-slate-200">{h.title}</div>
                  <div className="text-slate-500">
                    {h.age} · {h.source}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 font-semibold text-white">US market summary</div>
            <div className="flex flex-col gap-1">
              {MARKET_SUMMARY_CARDS.map((card, i) => (
                <div key={card.title} className="rounded bg-black/20">
                  <button
                    type="button"
                    onClick={() => setExpandedCard(expandedCard === i ? -1 : i)}
                    className="flex w-full items-center justify-between px-2 py-1.5 text-left text-slate-200"
                  >
                    {card.title}
                    <span>{expandedCard === i ? '−' : '+'}</span>
                  </button>
                  {expandedCard === i && (
                    <div className="px-2 pb-2 text-slate-400">
                      {card.body || 'No further detail available.'}
                      <button type="button" className="mt-2 block rounded bg-white/5 px-2 py-1 text-slate-300">
                        Dive deeper on this topic with AI
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="subtle-scrollbar flex w-[32%] flex-col gap-2 overflow-y-auto text-xs">
          <div>
            <div className="mb-1 font-semibold text-white">Market commentary</div>
            <p className="text-slate-400">
              Sentiment remains cautiously optimistic heading into the session, with volume concentrated in
              large-cap technology names.
            </p>
          </div>
          <div>
            <div className="mb-1 font-semibold text-white">Market Performance</div>
            <ul className="list-disc pl-4 text-slate-400">
              <li>Breadth improved from yesterday's session</li>
              <li>Volatility index ticked lower</li>
              <li>Sector rotation favored growth</li>
            </ul>
          </div>

          <div className="flex gap-1">
            {TICKERS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTicker(t)}
                className={`rounded px-1.5 py-0.5 ${ticker === t ? 'bg-violet-500/30 text-violet-200' : 'text-slate-400'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ height: 100 }}>
            {chartState === 'error' && !apiKey && (
              <div className="flex h-full items-center justify-center text-slate-500">
                Set API key in Settings for live data
              </div>
            )}
            {chartState === 'loading' && (
              <div className="flex h-full items-center justify-center text-slate-500">Loading chart…</div>
            )}
            {chartState === 'empty' && (
              <div className="flex h-full items-center justify-center text-slate-500">
                No chart data. Check symbol or API key.
              </div>
            )}
            {chartState === 'error' && apiKey && (
              <div className="flex h-full items-center justify-center text-slate-500">Failed to load chart.</div>
            )}
            {chartState === 'idle' && chartData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke="#a78bfa"
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {RANGES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={`rounded px-1.5 py-0.5 ${range === r ? 'bg-white/10 text-white' : 'text-slate-500'}`}
                >
                  {r}
                </button>
              ))}
            </div>
            <button type="button" className="text-slate-500 hover:text-white">
              Full Chart
            </button>
          </div>
          <div className="text-slate-600">Updated {dayjs().format('h:mm A')}</div>
        </div>
      </div>
    </div>
  );
}
