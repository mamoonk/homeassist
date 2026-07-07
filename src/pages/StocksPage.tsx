import { useMemo } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { WidgetGrid } from '../components/grid/WidgetGrid';
import { BREAKPOINT_COLS, emptyLayouts } from '../components/grid/layoutUtils';
import type { BreakpointKey, LayoutsByBreakpoint } from '../types';

const ITEMS_PER_ROW: Record<BreakpointKey, number> = { lg: 4, md: 3, sm: 2 };
const DASHBOARD_HEIGHT = 5;
const STOCK_WIDGET_SIZE = { w: 3, h: 2 };

export function StocksPage() {
  const watchlist = useSettingsStore((s) => s.stocksWatchlist);

  const itemIds = useMemo(() => ['stocks-dashboard', ...watchlist.map((s) => `stock-${s}`)], [watchlist]);

  const initialLayout = useMemo<LayoutsByBreakpoint>(() => {
    const layouts = emptyLayouts();
    (Object.keys(BREAKPOINT_COLS) as BreakpointKey[]).forEach((bp) => {
      const cols = BREAKPOINT_COLS[bp];
      const perRow = ITEMS_PER_ROW[bp];
      const dashboardItem = { i: 'stocks-dashboard', x: 0, y: 0, w: cols, h: DASHBOARD_HEIGHT };
      const stockItems = watchlist.map((symbol, index) => ({
        i: `stock-${symbol}`,
        x: (index % perRow) * STOCK_WIDGET_SIZE.w,
        y: DASHBOARD_HEIGHT + Math.floor(index / perRow) * STOCK_WIDGET_SIZE.h,
        w: STOCK_WIDGET_SIZE.w,
        h: STOCK_WIDGET_SIZE.h,
      }));
      layouts[bp] = [dashboardItem, ...stockItems];
    });
    return layouts;
  }, [watchlist]);

  return (
    <div className="p-3">
      <WidgetGrid tabKey="stocks-page" itemIds={itemIds} initialLayout={initialLayout} />
    </div>
  );
}
