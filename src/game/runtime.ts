import { Vector3 } from 'three';
import { SPAWN, SPAWN_YAW } from './level.ts';

export const playerRig = {
  position: new Vector3(SPAWN.x, 0, SPAWN.z),
  yaw: SPAWN_YAW,
};

export const playerMotion = {
  speed: 0,
  airborne: false,
  hurt: false,
};
