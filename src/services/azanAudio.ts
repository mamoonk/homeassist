import { useAzanPlaybackStore } from '../store/azanPlaybackStore';

export type AzanChoice = 1 | 2 | 3 | 4 | 5;

const players = new Map<AzanChoice, HTMLAudioElement>();

function setAzanPlaying(playing: boolean): void {
  useAzanPlaybackStore.getState().setAzanPlaying(playing);
}

function getPlayer(choice: AzanChoice): HTMLAudioElement {
  let audio = players.get(choice);
  if (!audio) {
    audio = new Audio(`/azan${choice}.mp3`);
    audio.preload = 'auto';
    players.set(choice, audio);
  }
  return audio;
}

export async function playAzan(choice: AzanChoice, volume: number, onEnded?: () => void): Promise<void> {
  const audio = getPlayer(choice);
  audio.muted = false;
  audio.volume = volume;
  audio.currentTime = 0;
  audio.onended = () => {
    setAzanPlaying(false);
    onEnded?.();
  };
  await audio.play();
  setAzanPlaying(true);
}

export function stopAzan(choice: AzanChoice): void {
  const audio = players.get(choice);
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
  setAzanPlaying(false);
}

export function stopAllAzan(): void {
  players.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
  setAzanPlaying(false);
}

// Browsers block audio until the user has interacted with the page. Called
// from a real gesture handler, a muted play+pause unlocks each element so the
// scheduler can start playback later without a gesture.
export function primeAzanAudio(): void {
  ([1, 2, 3, 4, 5] as AzanChoice[]).forEach((choice) => {
    const audio = getPlayer(choice);
    audio.muted = true;
    audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
      })
      .catch(() => {
        audio.muted = false;
      });
  });
}

// Dev servers answer missing files with the SPA's index.html (HTTP 200), so a
// content-type sniff is required in addition to res.ok.
export async function checkAzanFile(choice: AzanChoice): Promise<boolean> {
  try {
    const res = await fetch(`/azan${choice}.mp3`, { method: 'HEAD' });
    return res.ok && (res.headers.get('content-type') ?? '').includes('audio');
  } catch {
    return false;
  }
}

let chimeCtx: AudioContext | null = null;

// Audible fallback when an azan mp3 is missing or fails to play: three soft
// ascending tones via WebAudio (no files needed).
export function playFallbackChime(volume: number): void {
  try {
    chimeCtx ??= new AudioContext();
    const ctx = chimeCtx;
    if (ctx.state === 'suspended') void ctx.resume();
    const t0 = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const start = t0 + i * 0.5;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(Math.max(0.01, volume) * 0.5, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.5);
    });
  } catch {
    // WebAudio unavailable — nothing else to fall back to.
  }
}
