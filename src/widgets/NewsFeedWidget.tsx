import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettingsStore } from '../store/settingsStore';
import { useHourlyRefresh } from '../hooks/useHourlyRefresh';
import { fetchMarketNews } from '../services/stocks';
import type { MarketNewsItem } from '../services/stocks';
import { fetchLocalNews } from '../services/news';
import type { LocalNewsItem } from '../services/news';

type Tab = 'local' | 'markets';
type FetchState = 'idle' | 'loading' | 'error';

interface Headline {
  id: string | number;
  headline: string;
  source: string;
  datetime: number;
  url: string;
}

function ageLabel(unixSeconds: number): string {
  const mins = Math.max(1, Math.round((Date.now() / 1000 - unixSeconds) / 60));
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

function HeadlineList({ items }: { items: Headline[] }) {
  return (
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
  );
}

export function NewsFeedWidget() {
  const apiKey = useSettingsStore((s) => s.stocksApiKey);
  const locationName = useSettingsStore((s) => s.weatherLocationName);
  const refreshTick = useHourlyRefresh();

  const [tab, setTab] = useState<Tab>('local');
  const [localItems, setLocalItems] = useState<LocalNewsItem[]>([]);
  const [localState, setLocalState] = useState<FetchState>('loading');
  const [marketItems, setMarketItems] = useState<MarketNewsItem[]>([]);
  const [marketState, setMarketState] = useState<FetchState>('idle');

  useEffect(() => {
    let cancelled = false;
    setLocalState('loading');
    fetchLocalNews(locationName)
      .then((news) => {
        if (cancelled) return;
        setLocalItems(news);
        setLocalState('idle');
      })
      .catch(() => {
        if (!cancelled) setLocalState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [locationName, refreshTick]);

  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;
    setMarketState('loading');
    fetchMarketNews(apiKey)
      .then((news) => {
        if (cancelled) return;
        setMarketItems(news);
        setMarketState('idle');
      })
      .catch(() => {
        if (!cancelled) setMarketState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [apiKey, refreshTick]);

  const tabClass = (t: Tab) =>
    `rounded px-2 py-0.5 text-xs min-h-0 min-w-0 transition ${
      tab === t ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:bg-white/5'
    }`;

  return (
    <div className="widget-container flex h-full flex-col gap-1.5 p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
        <span
          className="inline-block h-1.5 w-1.5 rounded-full bg-red-500"
          style={{ boxShadow: '0 0 4px rgba(239,68,68,0.9)' }}
        />
        News
        <span className="ml-auto flex gap-1 normal-case tracking-normal">
          <button type="button" className={tabClass('local')} onClick={() => setTab('local')}>
            Local
          </button>
          <button type="button" className={tabClass('markets')} onClick={() => setTab('markets')}>
            Markets
          </button>
        </span>
      </div>

      {tab === 'local' ? (
        localState === 'loading' && localItems.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-400">Loading…</div>
        ) : localState === 'error' && localItems.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-400">Unable to load news</div>
        ) : localItems.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-center text-sm text-slate-400">
            No recent news for {locationName}
          </div>
        ) : (
          <HeadlineList items={localItems} />
        )
      ) : !apiKey ? (
        <div className="flex flex-1 items-center justify-center text-center text-sm text-slate-400">
          <span>
            <Link to="/settings" className="text-amber-400 hover:underline">
              Add a Finnhub API key
            </Link>{' '}
            for market headlines
          </span>
        </div>
      ) : marketState === 'loading' && marketItems.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-slate-400">Loading…</div>
      ) : marketState === 'error' && marketItems.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-slate-400">Unable to load news</div>
      ) : (
        <HeadlineList items={marketItems} />
      )}
    </div>
  );
}
