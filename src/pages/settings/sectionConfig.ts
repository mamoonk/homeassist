export interface SettingsSection {
  id: string;
  label: string;
  group?: 'general';
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  { id: 'appearance', label: 'Appearance', group: 'general' },
  { id: 'background', label: 'Background', group: 'general' },
  { id: 'glassmorphism', label: 'Glassmorphism', group: 'general' },
  { id: 'smart-mirror', label: 'Smart Mirror', group: 'general' },
  { id: 'dashboard', label: 'Dashboard', group: 'general' },
  { id: 'calendar', label: 'Calendar & Events' },
  { id: 'world-clocks', label: 'World clocks' },
  { id: 'clock-widget', label: 'Clock widget' },
  { id: 'weather', label: 'Weather' },
  { id: 'stocks', label: 'Stocks' },
  { id: 'dexcom', label: 'Dexcom' },
  { id: 'azan', label: 'Azan' },
];
