import { useId } from 'react';
import type { DialStyle } from '../../types';

interface DialTheme {
  faceFrom: string;
  faceTo: string;
  bezelFrom: string;
  bezelTo: string;
  tick: string;
  majorTick: string;
  numeral: string;
  hourHand: string;
  minuteHand: string;
  secondHand: string;
  centerFill: string;
  /** Neon-style glow color applied to hands, numerals, and center cap. */
  glow?: string;
  /** Hour marker shape: line ticks (default), lume dots, batons, or a lone 12 o'clock dot. */
  markers?: 'ticks' | 'dots' | 'batons' | 'single-dot';
  /** Suppress the minute tick track entirely (ultra-clean dials). */
  hideMinorTicks?: boolean;
  /** Dial designs where numerals never belong, regardless of the user toggle. */
  hideNumerals?: boolean;
  /** Hour hand: plain line, wide baton, or Mercedes ring near the tip. */
  hourHandStyle?: 'line' | 'baton' | 'mercedes';
}

const DIAL_THEMES: Record<DialStyle, DialTheme> = {
  1: {
    faceFrom: '#334155',
    faceTo: '#0f172a',
    bezelFrom: '#475569',
    bezelTo: '#1e293b',
    tick: '#94a3b8',
    majorTick: '#e2e8f0',
    numeral: '#e2e8f0',
    hourHand: '#f1f5f9',
    minuteHand: '#f1f5f9',
    secondHand: '#f59e0b',
    centerFill: '#f59e0b',
  },
  2: {
    faceFrom: '#ffffff',
    faceTo: '#e2e8f0',
    bezelFrom: '#f8fafc',
    bezelTo: '#cbd5e1',
    tick: '#94a3b8',
    majorTick: '#334155',
    numeral: '#334155',
    hourHand: '#1e293b',
    minuteHand: '#1e293b',
    secondHand: '#64748b',
    centerFill: '#1e293b',
  },
  3: {
    faceFrom: '#1e3a8a',
    faceTo: '#0c1a4a',
    bezelFrom: '#3b5bdb',
    bezelTo: '#0a1440',
    tick: '#d4af37',
    majorTick: '#d4af37',
    numeral: '#d4af37',
    hourHand: '#f1f5f9',
    minuteHand: '#f1f5f9',
    secondHand: '#d4af37',
    centerFill: '#d4af37',
  },
  4: {
    faceFrom: '#fdf6e3',
    faceTo: '#e8d9b5',
    bezelFrom: '#8b5e34',
    bezelTo: '#5a3a1f',
    tick: '#8b5e34',
    majorTick: '#5a3a1f',
    numeral: '#5a3a1f',
    hourHand: '#5a3a1f',
    minuteHand: '#5a3a1f',
    secondHand: '#a3521f',
    centerFill: '#a3521f',
  },
  5: {
    faceFrom: '#ffffff',
    faceTo: '#ffffff',
    bezelFrom: '#000000',
    bezelTo: '#000000',
    tick: '#000000',
    majorTick: '#000000',
    numeral: '#000000',
    hourHand: '#000000',
    minuteHand: '#000000',
    secondHand: '#dc2626',
    centerFill: '#000000',
  },
  6: {
    // Neon Cyber — glowing cyan/magenta on deep purple
    faceFrom: '#2b1b4d',
    faceTo: '#0d0620',
    bezelFrom: '#22d3ee',
    bezelTo: '#7c3aed',
    tick: '#164e63',
    majorTick: '#22d3ee',
    numeral: '#a5f3fc',
    hourHand: '#e879f9',
    minuteHand: '#22d3ee',
    secondHand: '#f0abfc',
    centerFill: '#22d3ee',
    glow: '#22d3ee',
  },
  7: {
    // Emerald — deep green with gold second hand
    faceFrom: '#065f46',
    faceTo: '#022c22',
    bezelFrom: '#34d399',
    bezelTo: '#064e3b',
    tick: '#047857',
    majorTick: '#6ee7b7',
    numeral: '#d1fae5',
    hourHand: '#ecfdf5',
    minuteHand: '#a7f3d0',
    secondHand: '#fbbf24',
    centerFill: '#fbbf24',
  },
  8: {
    // Rose Gold — blush face, burgundy hands
    faceFrom: '#fdf2f8',
    faceTo: '#fbcfe8',
    bezelFrom: '#e8b4a0',
    bezelTo: '#b76e79',
    tick: '#d8a5b1',
    majorTick: '#b76e79',
    numeral: '#881337',
    hourHand: '#881337',
    minuteHand: '#9f1239',
    secondHand: '#e11d48',
    centerFill: '#e11d48',
  },
  9: {
    // Midnight OLED — pure black with glowing ice-blue
    faceFrom: '#000000',
    faceTo: '#000000',
    bezelFrom: '#1e293b',
    bezelTo: '#020617',
    tick: '#1d4ed8',
    majorTick: '#60a5fa',
    numeral: '#93c5fd',
    hourHand: '#bfdbfe',
    minuteHand: '#93c5fd',
    secondHand: '#3b82f6',
    centerFill: '#3b82f6',
    glow: '#3b82f6',
  },
  10: {
    // Sunset Glow — molten orange fading to violet
    faceFrom: '#f97316',
    faceTo: '#6b21a8',
    bezelFrom: '#fbbf24',
    bezelTo: '#9a3412',
    tick: '#fdba74',
    majorTick: '#fef3c7',
    numeral: '#fff7ed',
    hourHand: '#fff7ed',
    minuteHand: '#ffedd5',
    secondHand: '#facc15',
    centerFill: '#facc15',
    glow: '#fb923c',
  },
  11: {
    // Deep Ocean — teal depths with aqua hands
    faceFrom: '#155e75',
    faceTo: '#082f49',
    bezelFrom: '#22d3ee',
    bezelTo: '#0e7490',
    tick: '#0e7490',
    majorTick: '#67e8f9',
    numeral: '#cffafe',
    hourHand: '#e0f2fe',
    minuteHand: '#a5f3fc',
    secondHand: '#2dd4bf',
    centerFill: '#2dd4bf',
  },
  12: {
    // Retro Diner — cream, cherry red, and navy
    faceFrom: '#fefce8',
    faceTo: '#fde68a',
    bezelFrom: '#dc2626',
    bezelTo: '#7f1d1d',
    tick: '#b91c1c',
    majorTick: '#7f1d1d',
    numeral: '#7f1d1d',
    hourHand: '#1e3a8a',
    minuteHand: '#1e3a8a',
    secondHand: '#dc2626',
    centerFill: '#dc2626',
  },
  13: {
    // Museum Dot (Movado-inspired) — black dial, lone gold dot at 12
    faceFrom: '#0a0a0a',
    faceTo: '#000000',
    bezelFrom: '#e5e7eb',
    bezelTo: '#6b7280',
    tick: '#1f2937',
    majorTick: '#d4af37',
    numeral: '#d4af37',
    hourHand: '#d4af37',
    minuteHand: '#d4af37',
    secondHand: '#b8962e',
    centerFill: '#d4af37',
    markers: 'single-dot',
    hideMinorTicks: true,
    hideNumerals: true,
    hourHandStyle: 'baton',
  },
  14: {
    // Diver (Rolex Submariner-inspired) — green-black dial, lume dots, Mercedes hand
    faceFrom: '#08130c',
    faceTo: '#010603',
    bezelFrom: '#14532d',
    bezelTo: '#052e16',
    tick: '#374151',
    majorTick: '#e7f6e7',
    numeral: '#e7f6e7',
    hourHand: '#e7f6e7',
    minuteHand: '#e7f6e7',
    secondHand: '#d4af37',
    centerFill: '#d4af37',
    markers: 'dots',
    hideNumerals: true,
    hourHandStyle: 'mercedes',
  },
  15: {
    // Seamaster (Omega-inspired) — ocean blue dial, steel batons, orange seconds
    faceFrom: '#0c4a6e',
    faceTo: '#082f49',
    bezelFrom: '#cbd5e1',
    bezelTo: '#475569',
    tick: '#155e75',
    majorTick: '#e2e8f0',
    numeral: '#e2e8f0',
    hourHand: '#f1f5f9',
    minuteHand: '#e2e8f0',
    secondHand: '#f97316',
    centerFill: '#f97316',
    markers: 'batons',
    hideNumerals: true,
    hourHandStyle: 'baton',
  },
  16: {
    // Ceramic (Rado-inspired) — bronze ceramic dial, rose-gold batons, ultra clean
    faceFrom: '#2a1e16',
    faceTo: '#140d08',
    bezelFrom: '#d4a373',
    bezelTo: '#8c5a3c',
    tick: '#3f2d20',
    majorTick: '#e6b88a',
    numeral: '#e6b88a',
    hourHand: '#e6b88a',
    minuteHand: '#e6b88a',
    secondHand: '#e6b88a',
    centerFill: '#e6b88a',
    markers: 'batons',
    hideMinorTicks: true,
    hideNumerals: true,
    hourHandStyle: 'baton',
  },
  17: {
    // Dress Silver (Patek-inspired) — silver dial, blued-steel hands
    faceFrom: '#f8fafc',
    faceTo: '#cbd5e1',
    bezelFrom: '#e5e7eb',
    bezelTo: '#94a3b8',
    tick: '#94a3b8',
    majorTick: '#334155',
    numeral: '#334155',
    hourHand: '#1d4ed8',
    minuteHand: '#1d4ed8',
    secondHand: '#1d4ed8',
    centerFill: '#1d4ed8',
    markers: 'batons',
    hideNumerals: true,
    hourHandStyle: 'baton',
  },
  18: {
    // Racing (TAG-inspired) — carbon dial, red accents, white hands
    faceFrom: '#1f2937',
    faceTo: '#030712',
    bezelFrom: '#ef4444',
    bezelTo: '#7f1d1d',
    tick: '#6b7280',
    majorTick: '#f9fafb',
    numeral: '#f9fafb',
    hourHand: '#f9fafb',
    minuteHand: '#f9fafb',
    secondHand: '#ef4444',
    centerFill: '#ef4444',
  },
};

interface AnalogClockFaceProps {
  date: Date;
  showHourNumbers?: boolean;
  dialStyle?: DialStyle;
  className?: string;
  style?: React.CSSProperties;
}

export function AnalogClockFace({ date, showHourNumbers = true, dialStyle = 1, className, style }: AnalogClockFaceProps) {
  const uid = useId().replace(/:/g, '');
  const theme = DIAL_THEMES[dialStyle];

  const hours = date.getHours() % 12;
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const secondAngle = seconds * 6;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const hourAngle = hours * 30 + minutes * 0.5 + seconds * (0.5 / 60);

  const center = 24;
  const faceRadius = 22;
  const tickOuter = 20.5;

  function polar(radius: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: center + radius * Math.cos(rad), y: center + radius * Math.sin(rad) };
  }

  const minorTicks = Array.from({ length: 60 }, (_, i) => i);
  const hourNumerals = Array.from({ length: 12 }, (_, i) => i);

  const hourHandEnd = polar(11, hourAngle);
  const minuteHandEnd = polar(16, minuteAngle);
  const secondHandEnd = polar(18, secondAngle);

  const glowFilter = theme.glow
    ? `drop-shadow(0 0 0.8px ${theme.glow}) drop-shadow(0 0 2.5px ${theme.glow})`
    : undefined;

  const markers = theme.markers ?? 'ticks';
  const showNumerals = showHourNumbers && !theme.hideNumerals && markers === 'ticks';
  const handStyle = theme.hourHandStyle ?? 'line';
  const handCap = handStyle === 'baton' ? 'butt' : 'round';
  const hourHandWidth = handStyle === 'baton' ? 2.2 : 1.6;
  const minuteHandWidth = handStyle === 'baton' ? 1.6 : 1.1;
  const mercedesRing = handStyle === 'mercedes' ? polar(7.5, hourAngle) : null;

  return (
    <svg viewBox="0 0 48 48" width="48" height="48" className={className} style={style} role="img" aria-label="Analog clock">
      <defs>
        <radialGradient id={`face-${uid}`} cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor={theme.faceFrom} />
          <stop offset="100%" stopColor={theme.faceTo} />
        </radialGradient>
        <linearGradient id={`bezel-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={theme.bezelFrom} />
          <stop offset="100%" stopColor={theme.bezelTo} />
        </linearGradient>
        <filter id={`shadow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0.5" stdDeviation="0.8" floodOpacity="0.4" />
        </filter>
      </defs>

      <circle cx={center} cy={center} r={faceRadius + 2} fill={`url(#bezel-${uid})`} filter={`url(#shadow-${uid})`} />
      <circle cx={center} cy={center} r={faceRadius} fill={`url(#face-${uid})`} />

      {!theme.hideMinorTicks &&
        minorTicks.map((i) => {
          // Three tiers: quarters (12/3/6/9) longest and thickest, then hour
          // ticks, then minute ticks. Hour positions defer to shape markers
          // (dots/batons) when the theme defines them.
          const angle = i * 6;
          const isQuarter = i % 15 === 0;
          const isMajor = i % 5 === 0;
          if (isMajor && markers !== 'ticks') return null;
          const outer = polar(tickOuter, angle);
          const inner = polar(isQuarter ? 17 : isMajor ? 18 : 19.3, angle);
          return (
            <line
              key={i}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke={isMajor ? theme.majorTick : theme.tick}
              strokeWidth={isQuarter ? 1.1 : isMajor ? 0.6 : 0.3}
            />
          );
        })}

      {markers === 'dots' &&
        hourNumerals.map((i) => {
          const pos = polar(18, i * 30);
          const r = i === 0 ? 2 : i % 3 === 0 ? 1.6 : 1.2;
          return (
            <circle
              key={i}
              cx={pos.x}
              cy={pos.y}
              r={r}
              fill={theme.majorTick}
              stroke="rgba(0,0,0,0.35)"
              strokeWidth={0.3}
              style={{ filter: glowFilter }}
            />
          );
        })}

      {markers === 'batons' &&
        hourNumerals.map((i) => {
          const isQuarter = i % 3 === 0;
          const outer = polar(20.3, i * 30);
          const inner = polar(isQuarter ? 16.6 : 17.8, i * 30);
          return (
            <line
              key={i}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke={theme.majorTick}
              strokeWidth={isQuarter ? 1.7 : 1.2}
              strokeLinecap="butt"
              style={{ filter: glowFilter }}
            />
          );
        })}

      {markers === 'single-dot' && (
        <circle
          cx={polar(17.2, 0).x}
          cy={polar(17.2, 0).y}
          r={2.3}
          fill={theme.majorTick}
          style={{ filter: glowFilter }}
        />
      )}

      {showNumerals &&
        hourNumerals.map((i) => {
          const pos = polar(14.8, i * 30);
          return (
            <text
              key={i}
              x={pos.x}
              y={pos.y}
              fontSize={4}
              fill={theme.numeral}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ filter: glowFilter }}
            >
              {i === 0 ? 12 : i}
            </text>
          );
        })}

      <line
        x1={center}
        y1={center}
        x2={hourHandEnd.x}
        y2={hourHandEnd.y}
        stroke={theme.hourHand}
        strokeWidth={hourHandWidth}
        strokeLinecap={handCap}
        style={{ filter: glowFilter }}
      />
      {mercedesRing && (
        <circle
          cx={mercedesRing.x}
          cy={mercedesRing.y}
          r={1.8}
          fill="none"
          stroke={theme.hourHand}
          strokeWidth={0.9}
          style={{ filter: glowFilter }}
        />
      )}
      <line
        x1={center}
        y1={center}
        x2={minuteHandEnd.x}
        y2={minuteHandEnd.y}
        stroke={theme.minuteHand}
        strokeWidth={minuteHandWidth}
        strokeLinecap={handCap}
        style={{ filter: glowFilter }}
      />
      <line
        x1={center}
        y1={center}
        x2={secondHandEnd.x}
        y2={secondHandEnd.y}
        stroke={theme.secondHand}
        strokeWidth={0.6}
        strokeLinecap="round"
        style={{ filter: glowFilter }}
      />

      <circle cx={center} cy={center} r={1.4} fill={theme.centerFill} style={{ filter: glowFilter }} />
      <circle cx={center} cy={center} r={0.5} fill={theme.faceFrom} />
    </svg>
  );
}
