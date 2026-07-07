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
};

interface AnalogClockFaceProps {
  date: Date;
  showHourNumbers?: boolean;
  dialStyle?: DialStyle;
  className?: string;
}

export function AnalogClockFace({ date, showHourNumbers = true, dialStyle = 1, className }: AnalogClockFaceProps) {
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

  return (
    <svg viewBox="0 0 48 48" width="48" height="48" className={className} role="img" aria-label="Analog clock">
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

      {minorTicks.map((i) => {
        const angle = i * 6;
        const isMajor = i % 5 === 0;
        const outer = polar(tickOuter, angle);
        const inner = polar(isMajor ? 18 : 19.3, angle);
        return (
          <line
            key={i}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke={isMajor ? theme.majorTick : theme.tick}
            strokeWidth={isMajor ? 0.6 : 0.3}
          />
        );
      })}

      {showHourNumbers &&
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
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <line
        x1={center}
        y1={center}
        x2={minuteHandEnd.x}
        y2={minuteHandEnd.y}
        stroke={theme.minuteHand}
        strokeWidth={1.1}
        strokeLinecap="round"
      />
      <line
        x1={center}
        y1={center}
        x2={secondHandEnd.x}
        y2={secondHandEnd.y}
        stroke={theme.secondHand}
        strokeWidth={0.6}
        strokeLinecap="round"
      />

      <circle cx={center} cy={center} r={1.4} fill={theme.centerFill} />
      <circle cx={center} cy={center} r={0.5} fill={theme.faceFrom} />
    </svg>
  );
}
