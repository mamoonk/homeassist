import { WidgetCard } from '../components/grid/WidgetCard';

export function NewsFeedWidget() {
  return (
    <WidgetCard title="News">
      <ul className="space-y-1 text-sm text-slate-300">
        <li>Welcome to your Smart Mirror</li>
        <li>Add widgets from the + bar</li>
        <li>Clock, weather, and news here</li>
      </ul>
    </WidgetCard>
  );
}
