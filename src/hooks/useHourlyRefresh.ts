import { useEffect, useState } from 'react';

const HOUR_MS = 60 * 60 * 1000;

// Returns a counter that increments on an interval (hourly by default).
// Include it in a fetch effect's dependency array to re-run the fetch.
export function useHourlyRefresh(intervalMs: number = HOUR_MS): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((v) => v + 1), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return tick;
}
