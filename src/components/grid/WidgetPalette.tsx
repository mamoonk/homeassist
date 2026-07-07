import { paletteWidgetIds, widgetLabel } from './widgetRegistry';

interface WidgetPaletteProps {
  activeIds: string[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}

export function WidgetPalette({ activeIds, onAdd, onRemove }: WidgetPaletteProps) {
  const allIds = paletteWidgetIds();
  const activeSet = new Set(activeIds);

  return (
    <div className="glass-panel flex flex-wrap items-center gap-2 rounded-lg p-3">
      <span className="text-sm text-slate-400">Add or remove from dashboard:</span>
      {allIds.map((id) => {
        const isActive = activeSet.has(id);
        return isActive ? (
          <span
            key={id}
            className="flex items-center gap-1 rounded-full border border-white/10 bg-slate-700/50 px-3 py-1 text-sm"
          >
            {widgetLabel(id)}
            <button
              type="button"
              onClick={() => onRemove(id)}
              className="ml-1 flex h-5 w-5 min-h-0 min-w-0 items-center justify-center rounded-full text-red-400 hover:bg-red-500/20"
              aria-label={`Remove ${widgetLabel(id)}`}
            >
              −
            </button>
          </span>
        ) : (
          <button
            key={id}
            type="button"
            onClick={() => onAdd(id)}
            className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-sm text-amber-400 hover:bg-amber-500/20"
          >
            {widgetLabel(id)} +
          </button>
        );
      })}
    </div>
  );
}
