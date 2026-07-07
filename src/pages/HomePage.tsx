import { useEffect } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { useLayoutStore } from '../store/layoutStore';
import { WidgetGrid } from '../components/grid/WidgetGrid';
import { WidgetPalette } from '../components/grid/WidgetPalette';
import { autoArrangeLayouts, layoutItemForIndex } from '../components/grid/layoutUtils';

const DASHBOARD_SYNCED_WIDGETS = ['calendar', 'dexcom', 'stocks'] as const;

export function HomePage() {
  const homeWidgetIds = useSettingsStore((s) => s.homeWidgetIds);
  const dashboardShowPalette = useSettingsStore((s) => s.dashboardShowPalette);
  const dashboardAutoArrange = useSettingsStore((s) => s.dashboardAutoArrange);
  const calendarShowOnDashboard = useSettingsStore((s) => s.calendarShowOnDashboard);
  const dexcomShowOnDashboard = useSettingsStore((s) => s.dexcomShowOnDashboard);
  const stocksShowOnDashboard = useSettingsStore((s) => s.stocksShowOnDashboard);
  const update = useSettingsStore((s) => s.update);
  const setTabLayout = useLayoutStore((s) => s.setTabLayout);
  const layouts = useLayoutStore((s) => s.layouts.home);

  const syncFlags: Record<(typeof DASHBOARD_SYNCED_WIDGETS)[number], boolean> = {
    calendar: calendarShowOnDashboard,
    dexcom: dexcomShowOnDashboard,
    stocks: stocksShowOnDashboard,
  };

  // Keep homeWidgetIds in sync with the calendar/dexcom/stocks "show on
  // dashboard" toggles from Settings, in both directions.
  useEffect(() => {
    let next = homeWidgetIds;
    for (const id of DASHBOARD_SYNCED_WIDGETS) {
      const shouldShow = syncFlags[id];
      const isPresent = next.includes(id);
      if (shouldShow && !isPresent) next = [...next, id];
      if (!shouldShow && isPresent) next = next.filter((w) => w !== id);
    }
    if (next !== homeWidgetIds) update({ homeWidgetIds: next });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarShowOnDashboard, dexcomShowOnDashboard, stocksShowOnDashboard]);

  function handleAdd(id: string) {
    if (homeWidgetIds.includes(id)) return;
    update({ homeWidgetIds: [...homeWidgetIds, id] });
    if ((DASHBOARD_SYNCED_WIDGETS as readonly string[]).includes(id)) {
      if (id === 'calendar') update({ calendarShowOnDashboard: true });
      if (id === 'dexcom') update({ dexcomShowOnDashboard: true });
      if (id === 'stocks') update({ stocksShowOnDashboard: true });
    }

    if (dashboardAutoArrange) {
      setTabLayout('home', autoArrangeLayouts([...homeWidgetIds, id]));
    } else {
      const current = layouts ?? { lg: [], md: [], sm: [] };
      const index = homeWidgetIds.length;
      setTabLayout('home', {
        lg: [...current.lg, layoutItemForIndex(id, index)],
        md: [...current.md, layoutItemForIndex(id, index)],
        sm: [...current.sm, layoutItemForIndex(id, index)],
      });
    }
  }

  function handleRemove(id: string) {
    update({ homeWidgetIds: homeWidgetIds.filter((w) => w !== id) });
    if (id === 'calendar') update({ calendarShowOnDashboard: false });
    if (id === 'dexcom') update({ dexcomShowOnDashboard: false });
    if (id === 'stocks') update({ stocksShowOnDashboard: false });
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      {dashboardShowPalette && (
        <WidgetPalette activeIds={homeWidgetIds} onAdd={handleAdd} onRemove={handleRemove} />
      )}
      <WidgetGrid tabKey="home" itemIds={homeWidgetIds} onRemove={handleRemove} />
    </div>
  );
}
