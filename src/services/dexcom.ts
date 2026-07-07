import type { DexcomApiBase, DexcomEgv, DexcomTrend } from '../types';

const BASE_URLS: Record<DexcomApiBase, string> = {
  sandbox: '/dexcom-api',
  us: 'https://api.dexcom.com',
  eu: 'https://api.eu.dexcom.com',
  jp: 'https://api.dexcom.jp',
};

export function buildAuthorizationUrl(base: DexcomApiBase, clientId: string, redirectUri: string): string {
  const origin =
    base === 'sandbox'
      ? 'https://sandbox-api.dexcom.com'
      : BASE_URLS[base];
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'offline_access',
    state: 'gloss',
  });
  return `${origin}/v3/oauth2/login?${params.toString()}`;
}

export interface DexcomDevice {
  transmitterId: string;
  transmitterGeneration: string;
  displayDevice: string;
}

export interface DexcomAlert {
  alertName: string;
  displayTime: string;
}

export interface DexcomCalibration {
  systemTime: string;
  value: number;
}

export interface DexcomEvent {
  eventType: 'carbs' | 'insulin';
  value: number;
  unit: string;
  systemTime: string;
}

export interface DexcomDataRange {
  start: string;
  end: string;
}

export interface DexcomBundle {
  dataRange: DexcomDataRange;
  egvs: DexcomEgv[];
  devices: DexcomDevice[] | null;
  alerts: DexcomAlert[] | null;
  calibrations: DexcomCalibration[] | null;
  events: DexcomEvent[] | null;
}

function isoNoMillis(date: Date): string {
  return date.toISOString().split('.')[0];
}

async function getJson<T>(url: string, accessToken: string): Promise<T> {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  // Status checks first: a 401 can arrive with a non-JSON body (proxy/gateway
  // pages) and must still surface as a re-auth prompt, not a proxy error.
  if (res.status === 401) throw new Error('401');
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      'Dexcom returned a non-JSON response. Check the API base URL and, in dev, the /dexcom-api proxy configuration.',
    );
  }
  if (!res.ok) {
    throw new Error(`Dexcom request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchDexcomData(base: DexcomApiBase, accessToken: string): Promise<DexcomBundle> {
  const origin = BASE_URLS[base];
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startParam = isoNoMillis(start);
  const endParam = isoNoMillis(end);

  const dataRangeRes = await getJson<{ egvs: { start: { systemTime: string }; end: { systemTime: string } } }>(
    `${origin}/v3/users/self/dataRange`,
    accessToken,
  );
  const egvsRes = await getJson<{ records: DexcomEgv[] }>(
    `${origin}/v3/users/self/egvs?startDate=${startParam}&endDate=${endParam}`,
    accessToken,
  );

  const [devices, alerts, calibrations, events] = await Promise.all([
    getJson<{ records: DexcomDevice[] }>(`${origin}/v3/users/self/devices`, accessToken)
      .then((r) => r.records)
      .catch(() => null),
    getJson<{ records: DexcomAlert[] }>(
      `${origin}/v3/users/self/alerts?startDate=${startParam}&endDate=${endParam}`,
      accessToken,
    )
      .then((r) => r.records)
      .catch(() => null),
    getJson<{ records: DexcomCalibration[] }>(
      `${origin}/v3/users/self/calibrations?startDate=${startParam}&endDate=${endParam}`,
      accessToken,
    )
      .then((r) => r.records)
      .catch(() => null),
    getJson<{ records: DexcomEvent[] }>(
      `${origin}/v3/users/self/events?startDate=${startParam}&endDate=${endParam}`,
      accessToken,
    )
      .then((r) => r.records)
      .catch(() => null),
  ]);

  return {
    dataRange: { start: dataRangeRes.egvs.start.systemTime, end: dataRangeRes.egvs.end.systemTime },
    // Dexcom v3 returns EGVs newest-first; consumers assume oldest-first
    // (latest = last element, chart flows left to right).
    egvs: [...egvsRes.records].sort((a, b) => a.systemTime.localeCompare(b.systemTime)),
    devices,
    alerts,
    calibrations,
    events,
  };
}

// Dexcom timestamps carry no timezone designator and are parsed as local
// time by consumers — mock strings must therefore be rendered in LOCAL time,
// not sliced from toISOString() (UTC), or readings shift by the UTC offset.
function localIsoNoMillis(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}:${pad(date.getSeconds())}`;
}

export function getMockDexcomData(): DexcomBundle {
  const now = Date.now();
  const values: Array<{ minutesAgo: number; value: number; trend: DexcomTrend }> = [
    { minutesAgo: 120, value: 98, trend: 'flat' },
    { minutesAgo: 90, value: 102, trend: 'fortyFiveUp' },
    { minutesAgo: 60, value: 115, trend: 'singleUp' },
    { minutesAgo: 30, value: 108, trend: 'fortyFiveDown' },
    { minutesAgo: 0, value: 112, trend: 'flat' },
  ];
  const egvs: DexcomEgv[] = values.map((v) => {
    const time = localIsoNoMillis(new Date(now - v.minutesAgo * 60 * 1000));
    return { systemTime: time, displayTime: time, value: v.value, trend: v.trend, unit: 'mg/dL' };
  });

  const sevenDaysAgo = localIsoNoMillis(new Date(now - 7 * 24 * 60 * 60 * 1000));
  const nowIso = localIsoNoMillis(new Date(now));

  return {
    dataRange: { start: sevenDaysAgo, end: nowIso },
    egvs,
    devices: [{ transmitterId: 'MOCK01', transmitterGeneration: 'g7', displayDevice: 'iOS' }],
    alerts: [{ alertName: 'urgentLowSoon', displayTime: localIsoNoMillis(new Date(now - 45 * 60 * 1000)) }],
    calibrations: [{ systemTime: localIsoNoMillis(new Date(now - 6 * 60 * 60 * 1000)), value: 105 }],
    events: [
      { eventType: 'carbs', value: 45, unit: 'g', systemTime: localIsoNoMillis(new Date(now - 3 * 60 * 60 * 1000)) },
      { eventType: 'insulin', value: 5, unit: 'u', systemTime: localIsoNoMillis(new Date(now - 3 * 60 * 60 * 1000)) },
    ],
  };
}

export const TREND_ARROWS: Record<DexcomTrend, string> = {
  doubleUp: '▲▲',
  singleUp: '▲',
  fortyFiveUp: '↗',
  flat: '→',
  fortyFiveDown: '↘',
  singleDown: '▼',
  doubleDown: '▼▼',
  notComputable: '—',
  rateOutOfRange: '—',
  none: '—',
};
