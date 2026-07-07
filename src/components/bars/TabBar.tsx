import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', label: 'Home Dashboard', end: true },
  { to: '/weather', label: 'Weather' },
  { to: '/stocks', label: 'Stocks' },
  { to: '/calendar', label: 'Calendar & Events' },
  { to: '/health', label: 'Health' },
];

export function TabBar() {
  return (
    <nav className="glass-panel flex items-center gap-1 overflow-x-auto border-b border-white/10 px-2 py-1">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition ${
              isActive ? 'bg-amber-500/20 text-amber-400' : 'text-slate-300 hover:bg-white/5'
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `ml-auto whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition ${
            isActive ? 'bg-amber-500/20 text-amber-400' : 'text-slate-300 hover:bg-white/5'
          }`
        }
      >
        Settings
      </NavLink>
    </nav>
  );
}
