import { useEffect, useMemo, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useSettingsStore } from './store/settingsStore';
import { useWeather } from './hooks/useWeather';
import { useAzanPlayer } from './hooks/useAzanPlayer';
import { WorldClocksBar } from './components/bars/WorldClocksBar';
import { PrayerTimesBar } from './components/bars/PrayerTimesBar';
import { TabBar } from './components/bars/TabBar';
import { SmartMirrorBackground } from './components/SmartMirrorBackground';
import { WeatherProvider } from './hooks/WeatherContext';
import { HomePage } from './pages/HomePage';
import { WeatherPage } from './pages/WeatherPage';
import { StocksPage } from './pages/StocksPage';
import { CalendarPage } from './pages/CalendarPage';
import { HealthPage } from './pages/HealthPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import type { EffectiveTheme } from './types';

const THEME_COLORS: Record<EffectiveTheme, string> = {
  light: '#f1f5f9',
  dark: '#1e293b',
  gamified: '#1a0a2e',
};

function resolveEffectiveTheme(theme: string): EffectiveTheme {
  if (theme === 'light' || theme === 'dark' || theme === 'gamified') return theme;
  const hour = new Date().getHours();
  return hour >= 6 && hour <= 20 ? 'light' : 'dark';
}

function useEffectiveTheme(theme: string): EffectiveTheme {
  const [effective, setEffective] = useState(() => resolveEffectiveTheme(theme));

  useEffect(() => {
    setEffective(resolveEffectiveTheme(theme));
    if (theme !== 'circadian') return;
    const id = setInterval(() => setEffective(resolveEffectiveTheme(theme)), 60_000);
    return () => clearInterval(id);
  }, [theme]);

  return effective;
}

export default function App() {
  const theme = useSettingsStore((s) => s.theme);
  const fontScale = useSettingsStore((s) => s.fontScale);
  const glassOpacity = useSettingsStore((s) => s.glassOpacity);
  const glassBlur = useSettingsStore((s) => s.glassBlur);
  const contentBlur = useSettingsStore((s) => s.contentBlur);
  const backgroundType = useSettingsStore((s) => s.backgroundType);
  const backgroundColor = useSettingsStore((s) => s.backgroundColor);
  const backgroundImageUrl = useSettingsStore((s) => s.backgroundImageUrl);
  const smartMirrorEnabled = useSettingsStore((s) => s.smartMirrorEnabled);
  const smartMirrorDeviceId = useSettingsStore((s) => s.smartMirrorDeviceId);
  const lowPowerMode = useSettingsStore((s) => s.lowPowerMode);

  const effectiveTheme = useEffectiveTheme(theme);
  const weatherState = useWeather(2 * 60 * 60 * 1000);
  useAzanPlayer();

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-theme', effectiveTheme);
    if (lowPowerMode) html.setAttribute('data-low-power', 'true');
    else html.removeAttribute('data-low-power');
    html.style.setProperty('--glass-opacity', String(glassOpacity));
    html.style.setProperty('--glass-blur', `${glassBlur}px`);

    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', THEME_COLORS[effectiveTheme]);
  }, [effectiveTheme, glassOpacity, glassBlur, lowPowerMode]);

  const backgroundStyle = useMemo<React.CSSProperties>(() => {
    if (smartMirrorEnabled) return { background: 'transparent' };

    if (backgroundType === 'image' && backgroundImageUrl) {
      return {
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor,
      };
    }

    if (effectiveTheme === 'gamified' && backgroundColor === '#0f172a') {
      return { background: 'linear-gradient(160deg, #1a0a2e 0%, #0f172a 40%, #0c0a1a 100%)' };
    }

    // The untouched dark default swaps to the light default on the light theme.
    if (effectiveTheme === 'light' && backgroundColor === '#0f172a') {
      return { backgroundColor: '#f1f5f9' };
    }

    return { backgroundColor };
  }, [smartMirrorEnabled, backgroundType, backgroundImageUrl, backgroundColor, effectiveTheme]);

  const contentWrapperStyle = useMemo<React.CSSProperties>(() => {
    // Full-viewport backdrop-filter forces a whole-screen re-blur on every
    // animation frame — never worth it on weak hardware.
    if (smartMirrorEnabled || contentBlur === 0 || lowPowerMode) return {};
    return {
      backdropFilter: `blur(${contentBlur}px)`,
      WebkitBackdropFilter: `blur(${contentBlur}px)`,
      backgroundColor: 'rgba(15, 23, 42, 0.15)',
    };
  }, [smartMirrorEnabled, contentBlur, lowPowerMode]);

  return (
    <div
      data-smart-mirror={smartMirrorEnabled ? 'true' : 'false'}
      className={`min-h-screen ${effectiveTheme === 'light' ? 'text-slate-900' : 'text-white'}`}
      style={{ fontSize: `${fontScale * 100}%`, ...backgroundStyle }}
    >
      {smartMirrorEnabled && <SmartMirrorBackground deviceId={smartMirrorDeviceId} />}

      <div className="content-blur-wrapper flex min-h-screen flex-col" style={contentWrapperStyle}>
        <WorldClocksBar />
        <PrayerTimesBar />
        <TabBar />
        <main className="flex-1 overflow-auto">
          <WeatherProvider value={weatherState}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/weather" element={<WeatherPage />} />
              <Route path="/stocks" element={<StocksPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/health" element={<HealthPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </WeatherProvider>
        </main>
      </div>
    </div>
  );
}
