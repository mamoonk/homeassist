import { Area, AreaChart, CartesianGrid, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useWeatherContext } from '../../hooks/WeatherContext';
import { WidgetCard } from '../../components/grid/WidgetCard';
import dayjs from '../../services/dayjsSetup';

export function WeatherHourlyGraphWidget() {
  const { weather, loading } = useWeatherContext();

  if (loading && !weather) return <WidgetCard centered>Loading…</WidgetCard>;
  if (!weather) return <WidgetCard centered>Weather unavailable</WidgetCard>;

  const data = weather.hourly.map((h) => ({
    time: h.time,
    label: dayjs(h.time).format('h A'),
    temperature: Math.round(h.temperature),
  }));

  const now = Date.now();
  let nowIndex = -1;
  let nowDelta = Infinity;
  data.forEach((d, i) => {
    const delta = Math.abs(dayjs(d.time).valueOf() - now);
    if (delta < nowDelta && delta <= 30 * 60 * 1000) {
      nowDelta = delta;
      nowIndex = i;
    }
  });

  return (
    <WidgetCard title="Hourly temperature">
      <div style={{ height: 180, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="hourlyTempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} interval={2} />
            <YAxis stroke="#94a3b8" fontSize={10} width={30} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', fontSize: 12 }}
              cursor={{ stroke: '#f59e0b', strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="temperature"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#hourlyTempGradient)"
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
            />
            {nowIndex >= 0 && (
              <ReferenceDot x={data[nowIndex].label} y={data[nowIndex].temperature} r={4} fill="#f59e0b" stroke="#fff" />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </WidgetCard>
  );
}
