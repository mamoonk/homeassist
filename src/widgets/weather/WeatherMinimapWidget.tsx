import { useEffect, useMemo, useState } from 'react';
import { useWeatherContext } from '../../hooks/WeatherContext';
import { WidgetCard } from '../../components/grid/WidgetCard';
import dayjs from '../../services/dayjsSetup';

const TILE = 256;
const ZOOM = 7;
const GRID = [-1, 0, 1]; // 3x3 tile grid around the location

interface RadarFrame {
  time: number;
  path: string;
}

// Slippy-map fractional tile coordinates for a lat/lon at a zoom level.
function tileCoords(lat: number, lon: number, zoom: number) {
  const latRad = (lat * Math.PI) / 180;
  const n = 2 ** zoom;
  return {
    x: ((lon + 180) / 360) * n,
    y: ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  };
}

export function WeatherMinimapWidget() {
  const { weather } = useWeatherContext();
  const [radarHost, setRadarHost] = useState<string | null>(null);
  const [frames, setFrames] = useState<RadarFrame[]>([]);
  const [frameIdx, setFrameIdx] = useState(0);

  // RainViewer public radar catalog: free, keyless, CORS-enabled.
  useEffect(() => {
    let alive = true;
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setRadarHost(d.host);
        setFrames([...(d.radar?.past ?? []).slice(-8), ...(d.radar?.nowcast ?? [])]);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Cycle radar frames to animate precipitation movement.
  useEffect(() => {
    if (frames.length < 2) return;
    const t = window.setInterval(() => setFrameIdx((i) => (i + 1) % frames.length), 750);
    return () => window.clearInterval(t);
  }, [frames.length]);

  const lat = weather?.latitude;
  const lon = weather?.longitude;

  const tiles = useMemo(() => {
    if (lat === undefined || lon === undefined) return [];
    const { x, y } = tileCoords(lat, lon, ZOOM);
    const cx = Math.floor(x);
    const cy = Math.floor(y);
    const max = 2 ** ZOOM;
    return GRID.flatMap((dy) =>
      GRID.map((dx) => {
        const tx = (cx + dx + max) % max;
        const ty = cy + dy;
        return {
          key: `${tx}-${ty}`,
          tx,
          ty,
          left: (cx + dx - x) * TILE,
          top: (cy + dy - y) * TILE,
          valid: ty >= 0 && ty < max,
        };
      }),
    );
  }, [lat, lon]);

  if (!weather) return <WidgetCard centered>Weather unavailable</WidgetCard>;

  const frame = frames[frameIdx];
  const nextFrame = frames.length > 1 ? frames[(frameIdx + 1) % frames.length] : undefined;

  const radarLayer = (f: RadarFrame, opacity: number) =>
    tiles.map(
      (t) =>
        t.valid && (
          <img
            key={`${f.path}-${t.key}`}
            src={`${radarHost}${f.path}/${TILE}/${ZOOM}/${t.tx}/${t.ty}/2/1_1.png`}
            alt=""
            draggable={false}
            className="absolute select-none"
            style={{ left: t.left, top: t.top, width: TILE, height: TILE, opacity }}
          />
        ),
    );

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* map tiles (theme-filtered) */}
      <div className="minimap-tiles absolute left-1/2 top-1/2">
        {tiles.map(
          (t) =>
            t.valid && (
              <img
                key={t.key}
                src={`https://tile.openstreetmap.org/${ZOOM}/${t.tx}/${t.ty}.png`}
                alt=""
                draggable={false}
                className="absolute select-none"
                style={{ left: t.left, top: t.top, width: TILE, height: TILE }}
              />
            ),
        )}
      </div>

      {/* animated radar overlay (not theme-filtered — colors are meaningful) */}
      {radarHost && frame && (
        <div className="absolute left-1/2 top-1/2">{radarLayer(frame, 0.75)}</div>
      )}
      {/* preload next frame invisibly to avoid flicker */}
      {radarHost && nextFrame && (
        <div className="absolute left-1/2 top-1/2" aria-hidden="true">
          {radarLayer(nextFrame, 0)}
        </div>
      )}

      {/* pulsing location marker */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span
          className="map-ping-ring absolute inset-0 rounded-full border-2 border-amber-400"
          style={{ animation: 'map-ping 2s ease-out infinite' }}
        />
        <span
          className="block h-3 w-3 rounded-full bg-amber-400"
          style={{ boxShadow: '0 0 8px rgba(251,191,36,0.9), 0 0 2px rgba(0,0,0,0.6)' }}
        />
      </div>

      {/* labels */}
      <div className="dark-surface pointer-events-none absolute left-2 top-2 rounded bg-slate-900/70 px-2 py-0.5 text-xs text-slate-100 backdrop-blur-sm">
        {weather.locationName}
      </div>
      {frame && (
        <div className="dark-surface pointer-events-none absolute right-2 top-2 flex items-center gap-1.5 rounded bg-slate-900/70 px-2 py-0.5 text-[0.65rem] tabular-nums text-slate-200 backdrop-blur-sm">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-red-500"
            style={{ boxShadow: '0 0 4px rgba(239,68,68,0.9)' }}
          />
          Radar {dayjs(frame.time * 1000).format('h:mm A')}
        </div>
      )}
      <div className="pointer-events-none absolute bottom-1 right-2 text-[0.55rem] text-slate-300/80">
        © OpenStreetMap · RainViewer
      </div>
    </div>
  );
}
