import { create } from 'zustand';

interface AzanPlaybackState {
  isAzanPlaying: boolean;
  setAzanPlaying: (playing: boolean) => void;
}

// Live "azan audio is currently sounding" flag. Written by the azanAudio
// service (which runs outside React), read by widgets that change their
// presentation during the azan (e.g. the Clock widget's Kaaba takeover).
export const useAzanPlaybackStore = create<AzanPlaybackState>((set) => ({
  isAzanPlaying: false,
  setAzanPlaying: (playing) => set({ isAzanPlaying: playing }),
}));

// Dev-only escape hatch to simulate the azan without waiting for prayer time:
// __azanPlayback.setAzanPlaying(true) in the browser console.
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__azanPlayback = useAzanPlaybackStore.getState();
}
