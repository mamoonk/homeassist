const SYNODIC_MONTH_DAYS = 29.530588;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

function daysSinceKnownNewMoon(date: Date): number {
  return (date.getTime() - KNOWN_NEW_MOON) / (1000 * 60 * 60 * 24);
}

export function moonIllumination(date: Date): number {
  const age = daysSinceKnownNewMoon(date) % SYNODIC_MONTH_DAYS;
  const positiveAge = age < 0 ? age + SYNODIC_MONTH_DAYS : age;
  const phaseFraction = positiveAge / SYNODIC_MONTH_DAYS;
  return (1 - Math.cos(2 * Math.PI * phaseFraction)) / 2;
}

export function nextFullMoon(date: Date): Date {
  const age = daysSinceKnownNewMoon(date) % SYNODIC_MONTH_DAYS;
  const positiveAge = age < 0 ? age + SYNODIC_MONTH_DAYS : age;
  const daysUntilFull = ((SYNODIC_MONTH_DAYS / 2 - positiveAge) + SYNODIC_MONTH_DAYS) % SYNODIC_MONTH_DAYS;
  return new Date(date.getTime() + daysUntilFull * 24 * 60 * 60 * 1000);
}
