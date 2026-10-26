import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { playerRig } from '../game/runtime.ts';
import { useGame } from '../game/store.ts';

const desired = new Vector3();
const look = new Vector3();

export function CameraRig() {
  const mode = useRef<'scenic' | 'follow'>('scenic');
  const { camera } = useThree();

  useFrame((state, delta) => {
    const phase = useGame.getState().phase;
    const scenic = phase === 'menu';
    if (scenic) {
      mode.current = 'scenic';
      const angle = state.clock.elapsedTime * 0.16;
      desired.set(Math.sin(angle) * 17, 8.6, Math.cos(angle) * 17);
      camera.position.lerp(desired, 1 - Math.exp(-1.4 * delta));
      camera.lookAt(0, 1.2, 2);
      return;
    }

    const yaw = playerRig.yaw;
    desired.set(
      playerRig.position.x - Math.sin(yaw) * 8.2,
      playerRig.position.y + 4.8,
      playerRig.position.z - Math.cos(yaw) * 8.2,
    );
    if (mode.current === 'scenic') {
      camera.position.copy(desired);
      mode.current = 'follow';
    } else {
      camera.position.lerp(desired, 1 - Math.exp(-3.4 * delta));
    }
    look.set(playerRig.position.x, playerRig.position.y + 1.25, playerRig.position.z);
    camera.lookAt(look);
  });

  return null;
}
