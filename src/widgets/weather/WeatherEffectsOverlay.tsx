type Effect = 'thunderstorm' | 'fog' | 'heavy_snow' | 'snow' | 'drizzle' | 'rain' | null;

function resolveEffect(condition: string): Effect {
  const c = condition.toLowerCase();
  if (c.includes('thunderstorm')) return 'thunderstorm';
  if (c.includes('fog') || c.includes('rime')) return 'fog';
  if (c.includes('heavy snow')) return 'heavy_snow';
  if (c.includes('snow')) return 'snow';
  if (c.includes('drizzle')) return 'drizzle';
  if (c.includes('rain') || c.includes('shower')) return 'rain';
  return null;
}

function seededFraction(index: number, salt: number): number {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function WeatherEffectsOverlay({ condition }: { condition: string }) {
  const effect = resolveEffect(condition);
  if (!effect) return null;

  if (effect === 'fog') {
    return (
      <div className="weather-effects">
        <div className="fog-layer" />
      </div>
    );
  }

  if (effect === 'snow' || effect === 'heavy_snow') {
    const heavy = effect === 'heavy_snow';
    const count = heavy ? 85 : 45;
    return (
      <div className="weather-effects">
        {Array.from({ length: count }, (_, i) => {
          const left = seededFraction(i, 1) * 100;
          const size = (heavy ? 3 : 2) + seededFraction(i, 2) * (heavy ? 4 : 3);
          const duration = (heavy ? 4 : 6) + seededFraction(i, 3) * 4;
          const delay = seededFraction(i, 4) * duration;
          const drift = (seededFraction(i, 5) - 0.5) * (heavy ? 60 : 30);
          return (
            <span
              key={i}
              className="snow-flake"
              style={{
                left: `${left}%`,
                width: size,
                height: size,
                animationDuration: `${duration}s`,
                animationDelay: `${-delay}s`,
                ['--snow-drift' as string]: `${drift}px`,
              }}
            />
          );
        })}
      </div>
    );
  }

  // rain, drizzle, thunderstorm
  const count = effect === 'drizzle' ? 28 : 55;
  return (
    <div className="weather-effects">
      {effect === 'thunderstorm' && <div className="thunder-gradient" />}
      {Array.from({ length: count }, (_, i) => {
        const left = seededFraction(i, 10) * 100;
        const height = 12 + seededFraction(i, 11) * 18;
        const duration = 0.5 + seededFraction(i, 12) * 0.6;
        const delay = seededFraction(i, 13) * duration;
        return (
          <span
            key={i}
            className="rain-streak"
            style={{
              left: `${left}%`,
              height,
              animationDuration: `${duration}s`,
              animationDelay: `${-delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}
