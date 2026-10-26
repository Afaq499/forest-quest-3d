export function formatTime(seconds: number) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const remainder = Math.floor(safe % 60);
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

export function victoryRank(seconds: number, health: number, maxHealth: number) {
  if (seconds <= 50 && health === maxHealth) return 'Grove Legend';
  if (seconds <= 55) return 'Trailblazer';
  if (seconds <= 80) return 'Pathfinder';
  return 'Wanderer';
}
