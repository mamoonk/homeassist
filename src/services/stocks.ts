import type { StockCandlePoint, StockQuote } from '../types';

const BASE_URL = 'https://finnhub.io/api/v1';

// Some tickers used for display don't have the same symbol on Finnhub.
const CANDLE_SYMBOL_REMAP: Record<string, string> = {
  IXIC: 'QQQ',
  DJI: 'DIA',
};

interface QuoteResponse {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
}

interface ProfileResponse {
  name?: string;
}

interface CandleResponse {
  c: number[];
  t: number[];
  s: string;
}

export async function fetchQuote(symbol: string, apiKey: string): Promise<StockQuote> {
  const res = await fetch(`${BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`);
  if (!res.ok) throw new Error(`Quote fetch failed: ${res.status}`);
  const data: QuoteResponse = await res.json();
  return {
    symbol,
    current: data.c,
    change: data.d,
    percentChange: data.dp,
    high: data.h,
    low: data.l,
    open: data.o,
    previousClose: data.pc,
  };
}

export async function fetchCompanyName(symbol: string, apiKey: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`);
  if (!res.ok) throw new Error(`Profile fetch failed: ${res.status}`);
  const data: ProfileResponse = await res.json();
  return data.name ?? symbol;
}

export async function fetchDailyCandles(symbol: string, days: number, apiKey: string): Promise<StockCandlePoint[]> {
  const resolvedSymbol = CANDLE_SYMBOL_REMAP[symbol] ?? symbol;
  const to = Math.floor(Date.now() / 1000);
  const from = to - days * 24 * 60 * 60;
  const res = await fetch(
    `${BASE_URL}/stock/candle?symbol=${encodeURIComponent(resolvedSymbol)}&resolution=D&from=${from}&to=${to}&token=${apiKey}`,
  );
  if (!res.ok) throw new Error(`Candle fetch failed: ${res.status}`);
  const data: CandleResponse = await res.json();
  if (data.s !== 'ok' || !data.c?.length) return [];
  return data.t.map((t, i) => ({ time: t, close: data.c[i] }));
}

export type IntradayResolution = '5' | '15' | 'D';

export async function fetchCandles(
  symbol: string,
  resolution: IntradayResolution,
  fromSeconds: number,
  toSeconds: number,
  apiKey: string,
): Promise<StockCandlePoint[]> {
  const resolvedSymbol = CANDLE_SYMBOL_REMAP[symbol] ?? symbol;
  const res = await fetch(
    `${BASE_URL}/stock/candle?symbol=${encodeURIComponent(resolvedSymbol)}&resolution=${resolution}&from=${fromSeconds}&to=${toSeconds}&token=${apiKey}`,
  );
  if (!res.ok) throw new Error(`Candle fetch failed: ${res.status}`);
  const data: CandleResponse = await res.json();
  if (data.s !== 'ok' || !data.c?.length) return [];
  return data.t.map((t, i) => ({ time: t, close: data.c[i] }));
}
