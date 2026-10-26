import type { Circle } from './collision.ts';

export const WORLD_BOUNDS = 21.15;
export const PLAYER_RADIUS = 0.48;
export const MAX_HEALTH = 3;
export const COIN_COLLECT_RADIUS = 1.15;
export const SPAWN = { x: 0, z: 11.5 };
export const SPAWN_YAW = Math.PI;

export interface CoinSpec {
  id: string;
  x: number;
  z: number;
  y: number;
  phase: number;
}

export interface PropSpec {
  id: string;
  x: number;
  z: number;
  yaw: number;
  scale: number;
  tint: number;
  radius: number;
}

export interface HazardSpec {
  id: string;
  x: number;
  z: number;
  radius: number;
  scale: number;
}

export interface PathSegment {
  x: number;
  z: number;
  length: number;
  yaw: number;
}

export interface DecorSpec {
  x: number;
  z: number;
  yaw: number;
  scale: number;
  tint: number;
  kind: 'grass' | 'flower' | 'mushroom';
}

export const PATH: Array<[number, number]> = [
  [0, 15.6],
  [0, 11.5],
  [0, 4.6],
  [-6.4, 1.2],
  [-1.2, -4.4],
  [7.4, -7.6],
  [13.6, -12.8],
  [4.8, -17.4],
  [-7.2, -17.2],
  [-15.2, -10.6],
  [-16.4, -3.6],
  [-8.2, 0.8],
  [-0.6, 3.6],
];

export const PATH_SEGMENTS: PathSegment[] = [];

let pathLength = 0;
for (let index = 0; index < PATH.length - 1; index += 1) {
  const start = PATH[index];
  const end = PATH[index + 1];
  const dx = end[0] - start[0];
  const dz = end[1] - start[1];
  const length = Math.hypot(dx, dz);
  pathLength += length;
  PATH_SEGMENTS.push({
    x: (start[0] + end[0]) / 2,
    z: (start[1] + end[1]) / 2,
    length: length + 0.5,
    yaw: Math.atan2(dx, dz),
  });
}

interface Frame {
  x: number;
  z: number;
  yaw: number;
  rx: number;
  rz: number;
}

function frameAt(distance: number): Frame {
  let remaining = distance;
  for (let index = 0; index < PATH.length - 1; index += 1) {
    const start = PATH[index];
    const end = PATH[index + 1];
    const length = Math.hypot(end[0] - start[0], end[1] - start[1]) || 0.0001;
    if (remaining <= length || index === PATH.length - 2) {
      const t = Math.max(0, Math.min(1, remaining / length));
      const yaw = Math.atan2(end[0] - start[0], end[1] - start[1]);
      return {
        x: start[0] + (end[0] - start[0]) * t,
        z: start[1] + (end[1] - start[1]) * t,
        yaw,
        rx: Math.cos(yaw),
        rz: -Math.sin(yaw),
      };
    }
    remaining -= length;
  }
  const last = PATH[PATH.length - 1];
  return { x: last[0], z: last[1], yaw: 0, rx: 1, rz: 0 };
}

export function distanceToPath(x: number, z: number) {
  let best = Infinity;
  for (let index = 0; index < PATH.length - 1; index += 1) {
    const start = PATH[index];
    const end = PATH[index + 1];
    const abx = end[0] - start[0];
    const abz = end[1] - start[1];
    const lengthSquared = abx * abx + abz * abz || 1;
    const t = Math.max(0, Math.min(1, ((x - start[0]) * abx + (z - start[1]) * abz) / lengthSquared));
    const dx = x - (start[0] + abx * t);
    const dz = z - (start[1] + abz * t);
    const distance = Math.hypot(dx, dz);
    if (distance < best) best = distance;
  }
  return best;
}

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(0x51a7c0de);

const COIN_MARKS = [0.1, 0.18, 0.27, 0.36, 0.45, 0.54, 0.63, 0.73, 0.82, 0.91];

export const COINS: CoinSpec[] = COIN_MARKS.map((mark, index) => {
  const frame = frameAt(pathLength * mark);
  const side = index % 2 === 0 ? 0.28 : -0.28;
  return {
    id: `coin-${index + 1}`,
    x: frame.x + frame.rx * side,
    z: frame.z + frame.rz * side,
    y: 1.05,
    phase: index * 0.62,
  };
});

function overlaps(
  x: number,
  z: number,
  radius: number,
  others: Array<{ x: number; z: number; radius: number }>,
  padding: number,
) {
  return others.some((other) => Math.hypot(other.x - x, other.z - z) < radius + other.radius + padding);
}

function nearCoin(x: number, z: number, gap: number) {
  return COINS.some((coin) => Math.hypot(coin.x - x, coin.z - z) < gap);
}

const shrineFrame = frameAt(pathLength * 0.76);
export const SHRINE = {
  x: shrineFrame.x + shrineFrame.rx * 4.3,
  z: shrineFrame.z + shrineFrame.rz * 4.3,
  yaw: shrineFrame.yaw + Math.PI / 2,
  radius: 1.15,
};

const occupied: Array<{ x: number; z: number; radius: number }> = [
  { x: SHRINE.x, z: SHRINE.z, radius: SHRINE.radius },
];

export const TREES: PropSpec[] = [];
export const ROCKS: PropSpec[] = [];

function tryProp(kind: 'tree' | 'rock', x: number, z: number, scale: number) {
  const radius = (kind === 'tree' ? 0.46 : 0.7) * scale;
  if (Math.hypot(x, z) > WORLD_BOUNDS - 0.7) return;
  if (distanceToPath(x, z) < radius + 1.22) return;
  if (nearCoin(x, z, radius + 1.3)) return;
  if (Math.hypot(x - SPAWN.x, z - SPAWN.z) < 3.3) return;
  if (overlaps(x, z, radius, occupied, 0.65)) return;
  const spec: PropSpec = {
    id: `${kind}-${kind === 'tree' ? TREES.length : ROCKS.length}`,
    x,
    z,
    yaw: rng() * Math.PI * 2,
    scale,
    tint: rng(),
    radius,
  };
  occupied.push({ x, z, radius });
  if (kind === 'tree') TREES.push(spec);
  else ROCKS.push(spec);
}

let guard = 0;
while (TREES.length < 18 && guard < 800) {
  guard += 1;
  const frame = frameAt(rng() * pathLength);
  const side = rng() > 0.5 ? 1 : -1;
  const offset = 2.55 + rng() * 2.8;
  tryProp('tree', frame.x + frame.rx * side * offset, frame.z + frame.rz * side * offset, 0.88 + rng() * 0.4);
}

guard = 0;
while (ROCKS.length < 9 && guard < 600) {
  guard += 1;
  const frame = frameAt(pathLength * (0.06 + rng() * 0.88));
  const side = rng() > 0.5 ? 1 : -1;
  const offset = 1.95 + rng() * 1.15;
  tryProp('rock', frame.x + frame.rx * side * offset, frame.z + frame.rz * side * offset, 0.78 + rng() * 0.4);
}

export const RING_TREES: PropSpec[] = Array.from({ length: 42 }, (_, index) => {
  const angle = (index / 42) * Math.PI * 2;
  const ring = 22.45 + (index % 3) * 0.55;
  return {
    id: `ring-${index}`,
    x: Math.cos(angle) * ring,
    z: Math.sin(angle) * ring,
    yaw: angle,
    scale: 0.92 + (index % 5) * 0.1,
    tint: (index % 8) / 8,
    radius: 0,
  };
});

export const DISTANT_TREES: PropSpec[] = Array.from({ length: 18 }, (_, index) => {
  const angle = (index / 18) * Math.PI * 2 + 0.17;
  const ring = 33 + (index % 3) * 1.1;
  return {
    id: `far-${index}`,
    x: Math.cos(angle) * ring,
    z: Math.sin(angle) * ring,
    yaw: angle * 1.7,
    scale: 1.55 + (index % 4) * 0.28,
    tint: (index % 6) / 6,
    radius: 0,
  };
});

export const HAZARDS: HazardSpec[] = [];
[0.15, 0.25, 0.37, 0.49, 0.6, 0.71, 0.86].forEach((mark, index) => {
  const frame = frameAt(pathLength * mark);
  const side = index % 2 === 0 ? 1 : -1;
  const x = frame.x + frame.rx * side * 2.28;
  const z = frame.z + frame.rz * side * 2.28;
  const radius = 0.78;
  if (Math.hypot(x, z) > WORLD_BOUNDS - 0.8) return;
  if (nearCoin(x, z, 2.2)) return;
  if (distanceToPath(x, z) < 1.72) return;
  if (overlaps(x, z, radius, occupied, 0.2)) return;
  HAZARDS.push({
    id: `thorn-${index + 1}`,
    x,
    z,
    radius,
    scale: 0.9 + (index % 3) * 0.14,
  });
  occupied.push({ x, z, radius });
});

export const DECOR: DecorSpec[] = [];
for (let index = 0; index < 280; index += 1) {
  const angle = rng() * Math.PI * 2;
  const radius = Math.sqrt(rng()) * 20.2;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  if (distanceToPath(x, z) < 1.12) continue;
  if (Math.hypot(x - SPAWN.x, z - SPAWN.z) < 1.7) continue;
  const roll = rng();
  const kind: DecorSpec['kind'] = roll > 0.9 ? 'flower' : roll > 0.83 ? 'mushroom' : 'grass';
  DECOR.push({
    x,
    z,
    yaw: rng() * Math.PI * 2,
    scale: 0.65 + rng() * 0.8,
    tint: rng(),
    kind,
  });
}

export const GRASS = DECOR.filter((item) => item.kind === 'grass');
export const FLOWERS = DECOR.filter((item) => item.kind === 'flower');
export const MUSHROOMS = DECOR.filter((item) => item.kind === 'mushroom');

export const SOLIDS: Circle[] = [
  ...TREES.map((tree) => ({ x: tree.x, z: tree.z, r: tree.radius })),
  ...ROCKS.map((rock) => ({ x: rock.x, z: rock.z, r: rock.radius })),
  { x: SHRINE.x, z: SHRINE.z, r: SHRINE.radius },
];

export const TOTAL_COINS = COINS.length;
export const PATH_LENGTH = pathLength;
