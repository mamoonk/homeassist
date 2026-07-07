export function isAllDay(start: string): boolean {
  return !start.includes('T');
}

export function randomId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
