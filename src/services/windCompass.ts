const DIRECTIONS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];

export function compassDirection(degrees: number): string {
  const index = Math.round(degrees / 22.5) % 16;
  return DIRECTIONS[index];
}

const BEAUFORT_THRESHOLDS_MPH = [1, 4, 8, 13, 19, 25, 32];

export function beaufortForce(speedMph: number): number {
  for (let i = 0; i < BEAUFORT_THRESHOLDS_MPH.length; i++) {
    if (speedMph < BEAUFORT_THRESHOLDS_MPH[i]) return i;
  }
  return BEAUFORT_THRESHOLDS_MPH.length;
}
