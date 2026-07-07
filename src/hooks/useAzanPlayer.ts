import { useEffect, useRef } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { getFivePrayers, getPrayerTimes } from '../services/azan';
import { playAzan, playFallbackChime, primeAzanAudio } from '../services/azanAudio';

const CHECK_INTERVAL_MS = 15_000;
const FIRE_WINDOW_MS = 120_000;

export function useAzanPlayer(): void {
  const enabled = useSettingsStore((s) => s.azanEnabled);
  const playAtPrayerTime = useSettingsStore((s) => s.playAzanAtPrayerTime);
  const latitude = useSettingsStore((s) => s.azanLatitude);
  const longitude = useSettingsStore((s) => s.azanLongitude);
  const method = useSettingsStore((s) => s.azanCalculationMethod);
  const volume = useSettingsStore((s) => s.azanVolume);
  const azanByPrayer = useSettingsStore((s) => s.azanByPrayer);
  const azanChoice = useSettingsStore((s) => s.azanChoice);

  const lastPlayedRef = useRef<Set<string>>(new Set());
  const isPlayingRef = useRef(false);

  // Unlock audio on the first user interaction so scheduled playback isn't
  // rejected by the browser's autoplay policy.
  useEffect(() => {
    if (!enabled || !playAtPrayerTime) return;
    const prime = () => {
      primeAzanAudio();
      document.removeEventListener('pointerdown', prime);
      document.removeEventListener('keydown', prime);
    };
    document.addEventListener('pointerdown', prime);
    document.addEventListener('keydown', prime);
    return () => {
      document.removeEventListener('pointerdown', prime);
      document.removeEventListener('keydown', prime);
    };
  }, [enabled, playAtPrayerTime]);

  useEffect(() => {
    if (!enabled || !playAtPrayerTime) return;

    const check = () => {
      if (isPlayingRef.current) return;
      const now = new Date();
      const prayers = getFivePrayers(getPrayerTimes(latitude, longitude, now, method));
      const dateKey = now.toISOString().slice(0, 10);

      for (const prayer of prayers) {
        const key = `${dateKey}-${prayer.name}`;
        if (lastPlayedRef.current.has(key)) continue;
        const deltaMs = now.getTime() - prayer.time.getTime();
        if (deltaMs >= 0 && deltaMs <= FIRE_WINDOW_MS) {
          lastPlayedRef.current.add(key);
          isPlayingRef.current = true;
          const choice = azanByPrayer[prayer.name] ?? azanChoice;
          playAzan(choice, volume)
            .catch((err: unknown) => {
              console.warn(
                `Azan playback failed for ${prayer.name} (azan${choice}.mp3):`,
                err instanceof Error ? `${err.name}: ${err.message}` : err,
              );
              playFallbackChime(volume);
            })
            .finally(() => {
              isPlayingRef.current = false;
            });
        }
      }
    };

    check();
    const id = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [enabled, playAtPrayerTime, latitude, longitude, method, volume, azanByPrayer, azanChoice]);
}
