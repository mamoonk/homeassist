import { useEffect, useState } from 'react';
import type { Dayjs } from 'dayjs';

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;
const AP = ['A', 'P'] as const;
const M = ['M'] as const;

// Must match the flip-fold animation duration in index.css.
const FLIP_MS = 300;

interface FlipDigitProps {
  target: string;
  charset: readonly string[];
}

// One split-flap character slot. Four stacked layers: a static top panel
// (already showing the incoming character), a static bottom panel (still
// showing the outgoing one), and — while animating — a 3D flipper card whose
// front is the outgoing top half and whose back is the incoming bottom half.
// Characters advance sequentially through the charset (Solari-style), one
// 300ms fold per step, until the displayed character reaches the target.
function FlipDigit({ target, charset }: FlipDigitProps) {
  const [current, setCurrent] = useState(target);
  const [next, setNext] = useState<string | null>(null);

  useEffect(() => {
    if (next === null && target !== current) {
      const idx = charset.indexOf(current);
      setNext(idx === -1 ? target : charset[(idx + 1) % charset.length]);
    }
  }, [target, current, next, charset]);

  useEffect(() => {
    if (next === null) return;
    const timer = window.setTimeout(() => {
      setCurrent(next);
      setNext(null);
    }, FLIP_MS);
    return () => window.clearTimeout(timer);
  }, [next]);

  const flipping = next !== null;

  return (
    <span className={`flip-digit ${flipping ? 'is-flipping' : ''}`}>
      <span className="flip-half flip-half--top">
        <span>{flipping ? next : current}</span>
      </span>
      <span className="flip-half flip-half--bottom">
        <span>{current}</span>
      </span>
      {flipping && (
        <span className="flip-flipper" key={next}>
          <span className="flip-face flip-face--front">
            <span>{current}</span>
          </span>
          <span className="flip-face flip-face--back">
            <span>{next}</span>
          </span>
        </span>
      )}
    </span>
  );
}

function Colon() {
  return (
    <span className="flip-colon" aria-hidden="true">
      <i />
      <i />
    </span>
  );
}

interface FlipClockProps {
  date: Dayjs;
  showSeconds?: boolean;
  className?: string;
}

export function FlipClock({ date, showSeconds = true, className = '' }: FlipClockProps) {
  const hh = date.format('hh');
  const mm = date.format('mm');
  const ss = date.format('ss');
  const ap = date.format('A');

  return (
    <span className={`flip-clock ${className}`} role="img" aria-label={date.format('h:mm:ss A')}>
      <span className="flip-clock__group">
        <FlipDigit target={hh[0]} charset={DIGITS} />
        <FlipDigit target={hh[1]} charset={DIGITS} />
      </span>
      <Colon />
      <span className="flip-clock__group">
        <FlipDigit target={mm[0]} charset={DIGITS} />
        <FlipDigit target={mm[1]} charset={DIGITS} />
      </span>
      {showSeconds && (
        <>
          <Colon />
          <span className="flip-clock__group flip-clock__seconds">
            <FlipDigit target={ss[0]} charset={DIGITS} />
            <FlipDigit target={ss[1]} charset={DIGITS} />
          </span>
        </>
      )}
      <span className="flip-clock__group flip-clock__ampm">
        <FlipDigit target={ap[0]} charset={AP} />
        <FlipDigit target="M" charset={M} />
      </span>
    </span>
  );
}
