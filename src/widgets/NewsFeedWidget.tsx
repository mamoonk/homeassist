import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettingsStore } from '../store/settingsStore';
import { useHourlyRefresh } from '../hooks/useHourlyRefresh';
import { fetchMarketNews } from '../services/stocks';
import type { MarketNewsItem } from '../services/stocks';
import { WidgetCard } from '../components/grid/WidgetCard';

function ageLabel(unixSeconds: number): string {
  const mins = Math.max(1, Math.round((Date.now() / 1000 - unixSeconds) / 60));
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

export function NewsFeedWidget() {
  const apiKey = useSettingsStore((s) => s.stocksApiKey);
  const refreshTick = useHourlyRefresh();
  const [items, setItems] = useState<MarketNewsItem[]>([]);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');

  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;
    setState('loading');
    fetchMarketNews(apiKey)
      .then((news) => {
        if (cancelled) return;
        setItems(news);
        setState('idle');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey, refreshTick]);

  if (!apiKey) {
    return (
      <WidgetCard title="News">
        <ul className="space-y-1 text-sm text-slate-300">
          <li>Welcome to your Smart Mirror</li>
          <li>Add widgets from the + bar</li>
          <li>
            <Link to="/settings" className="text-amber-400 hover:underline">
              Add a Finnhub API key
            </Link>{' '}
            for live headlines
          </li>
        </ul>
      </WidgetCard>
    );
  }

  return (
    <div className="widget-container flex h-full flex-col gap-1.5 p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
        <span
          className="inline-block h-1.5 w-1.5 rounded-full bg-red-500"
          style={{ boxShadow: '0 0 4px rgba(239,68,68,0.9)' }}
        />
        News
      </div>
      {state === 'error' && items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-slate-400">Unable to load news</div>
      ) : state === 'loading' && items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-slate-400">Loading…</div>
      ) : (
        <ul className="flex-1 space-y-1.5 overflow-y-auto">
          {items.map((n) => (
            <li key={n.id} className="border-b border-white/5 pb-1.5 last:border-0">
              <a
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm leading-snug text-slate-200 hover:text-amber-300"
              >
                {n.headline}
              </a>
              <span className="text-xs text-slate-500">
                {n.source} · {ageLabel(n.datetime)} ago
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
