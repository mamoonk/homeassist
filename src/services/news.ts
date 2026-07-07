export interface LocalNewsItem {
  id: string;
  headline: string;
  source: string;
  datetime: number; // unix seconds
  url: string;
}

interface GdeltArticle {
  title?: string;
  url?: string;
  domain?: string;
  seendate?: string;
}

// GDELT DOC 2.0 — free, keyless, CORS-enabled worldwide news search.
const GDELT_URL = 'https://api.gdeltproject.org/api/v2/doc/doc';

function parseSeenDate(seendate: string | undefined): number {
  const digits = (seendate ?? '').replace(/\D/g, '');
  if (digits.length < 14) return Math.floor(Date.now() / 1000);
  const [y, mo, d, h, mi, s] = [
    digits.slice(0, 4),
    digits.slice(4, 6),
    digits.slice(6, 8),
    digits.slice(8, 10),
    digits.slice(10, 12),
    digits.slice(12, 14),
  ].map(Number);
  return Math.floor(Date.UTC(y, mo - 1, d, h, mi, s) / 1000);
}

export async function fetchLocalNews(locationQuery: string, limit = 10): Promise<LocalNewsItem[]> {
  const cleaned = locationQuery.replace(/,/g, ' ').replace(/\s+/g, ' ').trim() || 'world';
  const query = encodeURIComponent(`"${cleaned}" sourcelang:english`);
  const res = await fetch(
    `${GDELT_URL}?query=${query}&mode=artlist&format=json&maxrecords=${limit * 3}&sort=datedesc`,
  );
  if (!res.ok) throw new Error(`Local news fetch failed: ${res.status}`);
  const data: { articles?: GdeltArticle[] } = await res.json();

  const seen = new Set<string>();
  const items: LocalNewsItem[] = [];
  for (const a of data.articles ?? []) {
    if (!a.title || !a.url) continue;
    // Same story syndicated across outlets varies late in the title — a short
    // normalized prefix catches those near-duplicates.
    const key = a.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 60);
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({
      id: a.url,
      headline: a.title,
      source: a.domain ?? 'news',
      datetime: parseSeenDate(a.seendate),
      url: a.url,
    });
    if (items.length >= limit) break;
  }
  return items;
}
