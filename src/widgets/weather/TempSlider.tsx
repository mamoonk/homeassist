interface TempSliderProps {
  value: number;
  min: number;
  max: number;
}

export function TempSlider({ value, min, max }: TempSliderProps) {
  const clamped = Math.min(max, Math.max(min, value));
  const pct = max === min ? 50 : ((clamped - min) / (max - min)) * 100;

  return (
    <div className="relative h-2 w-full rounded-full" style={{ background: 'linear-gradient(to right, #3b82f6, #f59e0b)' }}>
      <div
        className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-amber-400 bg-white shadow"
        style={{ left: `calc(${pct}% - 8px)` }}
      />
    </div>
  );
}
