import { useEffect, useMemo } from 'react';
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import type { Layout, ResponsiveLayouts } from 'react-grid-layout';
import { useLayoutStore } from '../../store/layoutStore';
import type { BreakpointKey, LayoutsByBreakpoint } from '../../types';
import { resolveWidget } from './widgetRegistry';
import { BREAKPOINT_COLS, reconcileLayouts } from './layoutUtils';

interface WidgetGridProps {
  tabKey: string;
  itemIds: string[];
  onRemove?: (id: string) => void;
  initialLayout?: LayoutsByBreakpoint;
}

const BREAKPOINTS: Record<BreakpointKey, number> = { lg: 1200, md: 996, sm: 768 };

export function WidgetGrid({ tabKey, itemIds, onRemove, initialLayout }: WidgetGridProps) {
  const { width, containerRef, mounted } = useContainerWidth({ initialWidth: 1200 });
  const savedLayouts = useLayoutStore((s) => s.layouts[tabKey]);
  const setTabLayout = useLayoutStore((s) => s.setTabLayout);

  const layouts = useMemo(
    () => reconcileLayouts(savedLayouts, itemIds, initialLayout),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [savedLayouts, itemIds],
  );

  useEffect(() => {
    if (!savedLayouts) {
      setTabLayout(tabKey, layouts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabKey]);

  function handleLayoutChange(_current: Layout, all: ResponsiveLayouts<BreakpointKey>) {
    const next: LayoutsByBreakpoint = {
      lg: [...(all.lg ?? layouts.lg)],
      md: [...(all.md ?? layouts.md)],
      sm: [...(all.sm ?? layouts.sm)],
    };
    setTabLayout(tabKey, next);
  }

  return (
    <div ref={containerRef}>
      {mounted && (
        <ResponsiveGridLayout
          width={width}
          breakpoints={BREAKPOINTS}
          cols={BREAKPOINT_COLS}
          rowHeight={80}
          margin={[12, 12]}
          containerPadding={[12, 12]}
          layouts={layouts as unknown as ResponsiveLayouts<BreakpointKey>}
          onLayoutChange={handleLayoutChange}
          // Interactive elements inside widgets must receive clicks instead
          // of starting a grid drag (news tabs, headline links, etc.).
          dragConfig={{ cancel: 'button, a, input, select, textarea' }}
        >
          {itemIds.map((id) => {
            const widget = resolveWidget(id);
            return (
              <div key={id} className="group relative overflow-hidden rounded-lg glass-panel shadow-lg">
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(id)}
                    className="absolute right-1 top-1 z-10 flex h-6 w-6 min-h-0 min-w-0 items-center justify-center rounded-full bg-black/40 text-xs text-white opacity-0 transition hover:bg-red-500 group-hover:opacity-100"
                    aria-label={`Remove ${id}`}
                  >
                    ×
                  </button>
                )}
                {widget ? widget.render() : <div className="p-3 text-sm text-slate-400">Widget: {id}</div>}
              </div>
            );
          })}
        </ResponsiveGridLayout>
      )}
    </div>
  );
}
