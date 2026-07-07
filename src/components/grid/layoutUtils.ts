import type { BreakpointKey, LayoutsByBreakpoint, WidgetLayoutItem } from '../../types';
import { defaultSizeForWidget } from './widgetRegistry';

export const BREAKPOINT_COLS: Record<BreakpointKey, number> = { lg: 12, md: 10, sm: 6 };
export const BREAKPOINT_KEYS: BreakpointKey[] = ['lg', 'md', 'sm'];

export function emptyLayouts(): LayoutsByBreakpoint {
  return { lg: [], md: [], sm: [] };
}

// Places new items in a 2-wide flow, 6 items per visual "row group" —
// mirrors the original app's add-to-home placement math.
export function layoutItemForIndex(id: string, index: number): WidgetLayoutItem {
  const size = defaultSizeForWidget(id);
  return {
    i: id,
    x: (index * 2) % 12,
    y: Math.floor(index / 6) * 2,
    w: size.w,
    h: size.h,
  };
}

// Packs every item into uniform 2x2 tiles, wrapping at itemsPerRow = floor(cols/2).
export function autoArrangeLayouts(ids: string[]): LayoutsByBreakpoint {
  const layouts = emptyLayouts();
  BREAKPOINT_KEYS.forEach((bp) => {
    const cols = BREAKPOINT_COLS[bp];
    const itemsPerRow = Math.max(1, Math.floor(cols / 2));
    layouts[bp] = ids.map((id, index) => ({
      i: id,
      x: (index % itemsPerRow) * 2,
      y: Math.floor(index / itemsPerRow) * 2,
      w: 2,
      h: 2,
    }));
  });
  return layouts;
}

// Merges saved per-breakpoint layout items over a set of ids, generating
// defaults for any id missing from the saved layout (new widgets) and
// dropping items no longer in `ids` (removed widgets). `fallback` (if given)
// is consulted per-breakpoint before falling back to the standard 2-wide flow.
export function reconcileLayouts(
  saved: LayoutsByBreakpoint | undefined,
  ids: string[],
  fallback?: LayoutsByBreakpoint,
): LayoutsByBreakpoint {
  const result = emptyLayouts();
  BREAKPOINT_KEYS.forEach((bp) => {
    const savedItems = saved?.[bp] ?? [];
    const savedById = new Map(savedItems.map((item) => [item.i, item]));
    const fallbackById = new Map((fallback?.[bp] ?? []).map((item) => [item.i, item]));
    const kept = ids.map((id, index) => savedById.get(id) ?? fallbackById.get(id) ?? layoutItemForIndex(id, index));
    result[bp] = kept;
  });
  return result;
}

