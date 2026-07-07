import type { ReactNode } from 'react';

interface WidgetCardProps {
  title?: string;
  centered?: boolean;
  children: ReactNode;
  className?: string;
}

export function WidgetCard({ title, centered, children, className }: WidgetCardProps) {
  return (
    <div className={`widget-container flex h-full flex-col gap-1 p-3 ${className ?? ''}`}>
      {title && <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{title}</div>}
      <div className={`flex-1 ${centered ? 'flex flex-col items-center justify-center' : ''}`}>{children}</div>
    </div>
  );
}
