const players = new Map<1 | 2 | 3 | 4 | 5, HTMLAudioElement>();

function getPlayer(choice: 1 | 2 | 3 | 4 | 5): HTMLAudioElement {
  let audio = players.get(choice);
  if (!audio) {
    audio = new Audio(`/azan${choice}.mp3`);
    players.set(choice, audio);
  }
  return audio;
}

export async function playAzan(choice: 1 | 2 | 3 | 4 | 5, volume: number): Promise<void> {
  const audio = getPlayer(choice);
  audio.volume = volume;
  audio.currentTime = 0;
  await audio.play();
}

export function stopAzan(choice: 1 | 2 | 3 | 4 | 5): void {
  const audio = players.get(choice);
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

export function stopAllAzan(): void {
  players.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
}
