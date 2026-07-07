interface TempSliderProps {
  value: number;
  min: number;
  max: number;
}

export function TempSlider({ value, min, max }: TempSliderProps) {
  const clamped = Math.min(max, Math.max(min, value));
  const pct = max === min ? 50 : ((clamped - min) / (max - min)) * 100;

  return (
    <div
      className="relative h-2.5 w-full rounded-full"
      style={{
        background: 'linear-gradient(to right, #2563eb, #38bdf8, #fbbf24, #f97316)',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.07)',
      }}
    >
      <div
        className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full"
        style={{
          left: `calc(${pct}% - 8px)`,
          background: 'radial-gradient(circle at 35% 30%, #ffffff, #e2e8f0 55%, #94a3b8)',
          border: '2px solid #fbbf24',
          boxShadow: '0 0 8px rgba(251,191,36,0.75), 0 2px 4px rgba(0,0,0,0.5)',
          transition: 'left 0.9s cubic-bezier(0.34, 1.3, 0.5, 1)',
        }}
      />
    </div>
  );
}
