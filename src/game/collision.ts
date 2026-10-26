export interface Circle {
  x: number;
  z: number;
  r: number;
}

function hits(x: number, z: number, radius: number, solids: Circle[]) {
  for (let index = 0; index < solids.length; index += 1) {
    const solid = solids[index];
    const min = radius + solid.r;
    const dx = x - solid.x;
    const dz = z - solid.z;
    if (dx * dx + dz * dz < min * min) return true;
  }
  return false;
}

export function moveWithCollision(
  x: number,
  z: number,
  dx: number,
  dz: number,
  radius: number,
  solids: Circle[],
  bounds: number,
) {
  let nextX = x + dx;
  let nextZ = z;
  const blockedX = hits(nextX, nextZ, radius, solids);
  if (blockedX) nextX = x;

  nextZ = z + dz;
  const blockedZ = hits(nextX, nextZ, radius, solids);
  if (blockedZ) nextZ = z;

  const distance = Math.hypot(nextX, nextZ);
  if (distance > bounds) {
    const scale = bounds / distance;
    nextX *= scale;
    nextZ *= scale;
  }

  if (hits(nextX, nextZ, radius, solids)) {
    return { x, z, blockedX: true, blockedZ: true };
  }

  return { x: nextX, z: nextZ, blockedX, blockedZ };
}
