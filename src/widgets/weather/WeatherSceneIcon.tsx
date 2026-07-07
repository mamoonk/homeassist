import { useId } from 'react';

export type SceneKind =
  | 'clear-day'
  | 'clear-night'
  | 'partly'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'thunder';

export function sceneForWeatherCode(code: number, isDay: boolean): SceneKind {
  if (code === 0) return isDay ? 'clear-day' : 'clear-night';
  if (code === 1 || code === 2) return isDay ? 'partly' : 'cloudy';
  if (code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if ([51, 53, 55, 56, 57].includes(code)) return 'drizzle';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  if ([95, 96, 99].includes(code)) return 'thunder';
  return isDay ? 'partly' : 'cloudy';
}

interface WeatherSceneIconProps {
  code: number;
  isDay: boolean;
  size?: number;
}

// Animated SVG hero scene for the current condition: layered gradients,
// drifting clouds, spinning sun rays, twinkling stars, falling drops/flakes,
// and a flickering lightning bolt — all in one 72x72-ish glyph.
export function WeatherSceneIcon({ code, isDay, size = 72 }: WeatherSceneIconProps) {
  const uid = useId().replace(/:/g, '');
  const kind = sceneForWeatherCode(code, isDay);

  const showSun = kind === 'clear-day' || kind === 'partly';
  const showMoon = kind === 'clear-night';
  const showBackCloud = ['cloudy', 'rain', 'thunder', 'snow'].includes(kind);
  const showFrontCloud = kind !== 'clear-day' && kind !== 'clear-night';
  const darkCloud = kind === 'thunder' || kind === 'rain';
  const showDrops = kind === 'rain' || kind === 'drizzle';
  const showFlakes = kind === 'snow';
  const showBolt = kind === 'thunder';
  const showFogLines = kind === 'fog';

  const dropSpecs =
    kind === 'drizzle'
      ? [
          { x: 24, delay: 0, dur: 1.7 },
          { x: 34, delay: 0.8, dur: 1.9 },
        ]
      : [
          { x: 20, delay: 0, dur: 1.2 },
          { x: 29, delay: 0.45, dur: 1.4 },
          { x: 38, delay: 0.85, dur: 1.1 },
        ];

  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <defs>
        <radialGradient id={`sun-${uid}`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="55%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
        <radialGradient id={`moon-${uid}`} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="65%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#8ea0b8" />
        </radialGradient>
        <linearGradient id={`cloudLight-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        <linearGradient id={`cloudDark-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id={`cloudBack-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id={`drop-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <linearGradient id={`bolt-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {showSun && (
        <g
          opacity={kind === 'partly' ? 0.95 : 1}
          style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.75))' }}
        >
          <g
            className="anim-sun"
            style={{ animation: 'sun-spin 26s linear infinite', transformOrigin: '28px 24px' }}
          >
            {Array.from({ length: 8 }, (_, i) => {
              const rad = (i * 45 * Math.PI) / 180;
              return (
                <line
                  key={i}
                  x1={28 + 15 * Math.cos(rad)}
                  y1={24 + 15 * Math.sin(rad)}
                  x2={28 + 20 * Math.cos(rad)}
                  y2={24 + 20 * Math.sin(rad)}
                  stroke="#fbbf24"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                />
              );
            })}
          </g>
          <circle cx={28} cy={24} r={11.5} fill={`url(#sun-${uid})`} />
        </g>
      )}

      {showMoon && (
        <g style={{ filter: 'drop-shadow(0 0 8px rgba(226,232,240,0.5))' }}>
          <circle className="anim-twinkle" cx={10} cy={12} r={1.3} fill="#e2e8f0" style={{ animation: 'twinkle 3s ease-in-out infinite' }} />
          <circle className="anim-twinkle" cx={54} cy={10} r={1.6} fill="#e2e8f0" style={{ animation: 'twinkle 4s ease-in-out 1.2s infinite' }} />
          <circle className="anim-twinkle" cx={50} cy={44} r={1.1} fill="#e2e8f0" style={{ animation: 'twinkle 3.4s ease-in-out 2.1s infinite' }} />
          <circle className="anim-twinkle" cx={14} cy={48} r={1} fill="#e2e8f0" style={{ animation: 'twinkle 4.4s ease-in-out 0.6s infinite' }} />
          <circle cx={32} cy={28} r={14} fill={`url(#moon-${uid})`} />
          <circle cx={26} cy={23} r={2.6} fill="#94a3b8" opacity={0.45} />
          <circle cx={37} cy={33} r={2} fill="#94a3b8" opacity={0.4} />
          <circle cx={38} cy={22} r={1.3} fill="#94a3b8" opacity={0.35} />
        </g>
      )}

      {showBackCloud && (
        <g
          className="anim-cloud-back"
          opacity={0.8}
          style={{ animation: 'cloud-drift-back 8s ease-in-out infinite' }}
        >
          <path
            d="M14 34a6.5 6.5 0 0 1 .6-12.97A7.9 7.9 0 0 1 30.1 19.3 5.8 5.8 0 0 1 31 30.9V34H14Z"
            fill={`url(#cloudBack-${uid})`}
          />
        </g>
      )}

      {showFrontCloud && (
        <g
          className="anim-cloud-front"
          style={{
            animation: 'cloud-drift 6.5s ease-in-out infinite',
            filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.45))',
          }}
        >
          <path
            d="M16 44a9 9 0 0 1 .8-17.95A11 11 0 0 1 38.3 23.8 8 8 0 0 1 39.4 39.7V44H16Z"
            fill={`url(#${darkCloud ? `cloudDark-${uid}` : `cloudLight-${uid}`})`}
          />
        </g>
      )}

      {showDrops &&
        dropSpecs.map((d, i) => (
          <path
            key={i}
            className="anim-drop"
            d={`M${d.x} 48 q1.8 3 0 5 q-1.8 -2 0 -5Z`}
            fill={`url(#drop-${uid})`}
            style={{
              animation: `drop-fall ${d.dur}s linear ${d.delay}s infinite`,
              filter: 'drop-shadow(0 0 2px rgba(56,189,248,0.6))',
            }}
          />
        ))}

      {showFlakes &&
        [
          { x: 20, delay: 0, dur: 2.2, r: 1.6 },
          { x: 29, delay: 0.7, dur: 2.6, r: 1.3 },
          { x: 38, delay: 1.3, dur: 2, r: 1.7 },
        ].map((f, i) => (
          <circle
            key={i}
            className="anim-drop"
            cx={f.x}
            cy={49}
            r={f.r}
            fill="#e0f2fe"
            style={{
              animation: `drop-fall ${f.dur}s ease-in ${f.delay}s infinite`,
              filter: 'drop-shadow(0 0 2px rgba(224,242,254,0.8))',
            }}
          />
        ))}

      {showBolt && (
        <polygon
          className="anim-bolt"
          points="30,44 24,55 29,55 26,63 37,51 31,51 36,44"
          fill={`url(#bolt-${uid})`}
          style={{
            animation: 'bolt-flash 3.6s ease-in-out infinite',
            filter: 'drop-shadow(0 0 5px rgba(253,224,71,0.9))',
          }}
        />
      )}

      {showFogLines &&
        [
          { y: 46, x1: 12, x2: 44, anim: 'cloud-drift', dur: 5 },
          { y: 52, x1: 20, x2: 52, anim: 'cloud-drift-back', dur: 6 },
          { y: 58, x1: 14, x2: 40, anim: 'cloud-drift', dur: 7 },
        ].map((l, i) => (
          <line
            key={i}
            className="anim-cloud-front"
            x1={l.x1}
            y1={l.y}
            x2={l.x2}
            y2={l.y}
            stroke="#94a3b8"
            strokeWidth={2.6}
            strokeLinecap="round"
            opacity={0.55}
            style={{ animation: `${l.anim} ${l.dur}s ease-in-out infinite` }}
          />
        ))}
    </svg>
  );
}
