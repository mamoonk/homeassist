interface Layers {
  rain: 'drizzle' | 'rain' | null;
  snow: 'snow' | 'heavy_snow' | null;
  fog: boolean;
  clouds: boolean;
  thunder: boolean;
  wind: boolean;
  windLevel: number;
}

function resolveLayers(condition: string, windSpeed: number): Layers {
  const c = condition.toLowerCase();
  const thunder = c.includes('thunderstorm');
  const fog = c.includes('fog') || c.includes('rime');
  const heavySnow = c.includes('heavy snow');
  const snow = heavySnow ? ('heavy_snow' as const) : c.includes('snow') ? ('snow' as const) : null;
  const drizzle = c.includes('drizzle');
  const rain = thunder || c.includes('rain') || c.includes('shower') ? ('rain' as const) : drizzle ? ('drizzle' as const) : null;
  const clouds = c.includes('cloud') || c.includes('overcast') || !!rain || !!snow || thunder;
  const wind = windSpeed >= 15;
  const windLevel = windSpeed >= 35 ? 3 : windSpeed >= 25 ? 2 : 1;
  return { rain, snow, fog, clouds, thunder, wind, windLevel };
}

function seededFraction(index: number, salt: number): number {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Depth bands for parallax: far particles are small/slow/dim, near ones are
// big/fast/bright with a slight blur — reads as 3D depth-of-field.
const RAIN_BANDS = [
  { width: 1, hMin: 10, hMax: 16, dMin: 0.9, dMax: 1.25, opacity: 0.35, blur: 0 },
  { width: 1.5, hMin: 14, hMax: 24, dMin: 0.65, dMax: 0.9, opacity: 0.6, blur: 0 },
  { width: 2.5, hMin: 22, hMax: 34, dMin: 0.42, dMax: 0.6, opacity: 0.85, blur: 0.7 },
];
const SNOW_BANDS = [
  { sMin: 1.5, sMax: 2.5, dMin: 8, dMax: 11, opacity: 0.5, blur: 0, drift: 20 },
  { sMin: 2.5, sMax: 4, dMin: 6, dMax: 8, opacity: 0.7, blur: 0, drift: 35 },
  { sMin: 4, sMax: 6.5, dMin: 4, dMax: 5.5, opacity: 0.95, blur: 1, drift: 55 },
];

export function WeatherEffectsOverlay({ condition, windSpeed = 0 }: { condition: string; windSpeed?: number }) {
  const layers = resolveLayers(condition, windSpeed);
  const { rain, snow, fog, clouds, thunder, wind, windLevel } = layers;

  if (!rain && !snow && !fog && !clouds && !wind) return null;

  const rainCount = rain === 'drizzle' ? 28 : 55;
  const snowCount = snow === 'heavy_snow' ? 85 : 45;
  const windCount = 3 + windLevel * 3;

  return (
    <div className="weather-effects">
      {/* drifting cloud banks (back layer) */}
      {clouds &&
        [
          { top: '-6%', height: 44, width: '55%', dur: 55, delay: 0, opacity: 0.5 },
          { top: '8%', height: 34, width: '45%', dur: 75, delay: -30, opacity: 0.35 },
          { top: '-2%', height: 26, width: '38%', dur: 40, delay: -12, opacity: 0.25 },
        ].map((b, i) => (
          <div
            key={i}
            className="cloud-bank"
            style={{
              top: b.top,
              left: 0,
              height: b.height,
              width: b.width,
              opacity: b.opacity,
              animationDuration: `${b.dur}s`,
              animationDelay: `${b.delay}s`,
            }}
          />
        ))}

      {fog && <div className="fog-layer" />}

      {/* rain / drizzle with 3 parallax depth bands */}
      {rain &&
        Array.from({ length: rainCount }, (_, i) => {
          const band = RAIN_BANDS[i % 3];
          const left = seededFraction(i, 10) * 100;
          const height = band.hMin + seededFraction(i, 11) * (band.hMax - band.hMin);
          const duration = band.dMin + seededFraction(i, 12) * (band.dMax - band.dMin);
          const delay = seededFraction(i, 13) * duration;
          return (
            <span
              key={`r${i}`}
              className="rain-streak"
              style={{
                left: `${left}%`,
                height,
                width: band.width,
                opacity: band.opacity,
                filter: band.blur ? `blur(${band.blur}px)` : undefined,
                animationDuration: `${duration}s`,
                animationDelay: `${-delay}s`,
              }}
            />
          );
        })}

      {/* snow with 3 parallax depth bands */}
      {snow &&
        Array.from({ length: snowCount }, (_, i) => {
          const band = SNOW_BANDS[i % 3];
          const left = seededFraction(i, 1) * 100;
          const size = band.sMin + seededFraction(i, 2) * (band.sMax - band.sMin);
          const duration = band.dMin + seededFraction(i, 3) * (band.dMax - band.dMin);
          const delay = seededFraction(i, 4) * duration;
          const drift = (seededFraction(i, 5) - 0.5) * band.drift * 2;
          return (
            <span
              key={`s${i}`}
              className="snow-flake"
              style={{
                left: `${left}%`,
                width: size,
                height: size,
                opacity: band.opacity,
                filter: band.blur ? `blur(${band.blur}px)` : undefined,
                animationDuration: `${duration}s`,
                animationDelay: `${-delay}s`,
                ['--snow-drift' as string]: `${drift}px`,
              }}
            />
          );
        })}

      {/* wind swooshes, count scales with speed */}
      {wind &&
        Array.from({ length: windCount }, (_, i) => {
          const top = 8 + seededFraction(i, 20) * 80;
          const width = 25 + seededFraction(i, 21) * 30;
          const duration = 1.3 + seededFraction(i, 22) * (2.4 - windLevel * 0.4);
          const delay = seededFraction(i, 23) * 3;
          return (
            <span
              key={`w${i}`}
              className="wind-streak"
              style={{
                top: `${top}%`,
                left: 0,
                width: `${width}%`,
                opacity: 0.25 + seededFraction(i, 24) * 0.4,
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}

      {/* storm darkening + lightning flashes */}
      {thunder && (
        <>
          <div className="thunder-gradient" />
          <div
            className="lightning-flash"
            style={{
              background:
                'radial-gradient(ellipse at 28% 0%, rgba(255,255,255,0.85), rgba(191,219,254,0.35) 40%, transparent 70%)',
            }}
          />
          <div
            className="lightning-flash"
            style={{
              background:
                'radial-gradient(ellipse at 72% 0%, rgba(255,255,255,0.8), rgba(191,219,254,0.3) 35%, transparent 65%)',
              animationDuration: '9s',
              animationDelay: '-4s',
            }}
          />
        </>
      )}
    </div>
  );
}
