import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import type { Group, Mesh, MeshBasicMaterial } from 'three';
import { playSound } from '../game/audio.ts';
import { moveWithCollision } from '../game/collision.ts';
import { clearHeld, inputState, readAxes } from '../game/input.ts';
import {
  COIN_COLLECT_RADIUS,
  COINS,
  HAZARDS,
  PLAYER_RADIUS,
  SOLIDS,
  SPAWN,
  SPAWN_YAW,
  WORLD_BOUNDS,
} from '../game/level.ts';
import { playerMotion, playerRig } from '../game/runtime.ts';
import { useSlotUrl } from '../game/slotContext.ts';
import { useGame } from '../game/store.ts';
import { AssetModel } from './AssetModel.tsx';
import { PlaceholderExplorer } from './placeholders.tsx';

const forward = new Vector3();
const right = new Vector3();
const wish = new Vector3();
const up = new Vector3(0, 1, 0);

function PlayerBody() {
  const url = useSlotUrl('player');
  if (!url) return <PlaceholderExplorer />;
  return <AssetModel slot="player" url={url} animated fallback={<PlaceholderExplorer />} />;
}

export function Player() {
  const groupRef = useRef<Group>(null);
  const shadowRef = useRef<Mesh<never, MeshBasicMaterial>>(null);
  const velocity = useRef(new Vector3());
  const coyote = useRef(0);
  const jumpBuffer = useRef(0);
  const timeAcc = useRef(0);
  const hurtUntil = useRef(0);

  useEffect(() => {
    const resetBody = () => {
      const group = groupRef.current;
      if (!group) return;
      group.position.set(SPAWN.x, 0, SPAWN.z);
      group.rotation.y = SPAWN_YAW;
      velocity.current.set(0, 0, 0);
      coyote.current = 0;
      jumpBuffer.current = 0;
      timeAcc.current = 0;
      hurtUntil.current = 0;
      playerMotion.speed = 0;
      playerMotion.airborne = false;
      playerMotion.hurt = false;
      playerRig.position.set(SPAWN.x, 0, SPAWN.z);
      playerRig.yaw = SPAWN_YAW;
      inputState.jumpQueued = false;
    };

    resetBody();
    return useGame.subscribe((state, previous) => {
      if (state.resetId !== previous.resetId) resetBody();
    });
  }, []);

  useEffect(() => () => clearHeld(), []);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const step = Math.min(delta, 0.033);
    const playing = useGame.getState().phase === 'playing';

    if (playing) {
      timeAcc.current += step;
      if (timeAcc.current >= 0.1) {
        useGame.getState().addTime(timeAcc.current);
        timeAcc.current = 0;
      }

      const axes = readAxes();
      state.camera.getWorldDirection(forward);
      forward.y = 0;
      if (forward.lengthSq() < 0.00001) forward.set(Math.sin(group.rotation.y), 0, Math.cos(group.rotation.y));
      else forward.normalize();
      right.crossVectors(forward, up).normalize();

      wish.set(0, 0, 0).addScaledVector(forward, axes.forward).addScaledVector(right, axes.strafe);
      if (wish.lengthSq() > 1) wish.normalize();

      const blend = 1 - Math.exp(-14 * step);
      velocity.current.x += (wish.x * 7.4 - velocity.current.x) * blend;
      velocity.current.z += (wish.z * 7.4 - velocity.current.z) * blend;

      if (wish.lengthSq() > 0.04) {
        const desired = Math.atan2(wish.x, wish.z);
        let diff = desired - group.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        group.rotation.y += diff * (1 - Math.exp(-12 * step));
      }

      if (group.position.y <= 0.001) coyote.current = 0.12;
      else coyote.current = Math.max(0, coyote.current - step);

      if (inputState.jumpQueued) {
        jumpBuffer.current = 0.14;
        inputState.jumpQueued = false;
      } else {
        jumpBuffer.current = Math.max(0, jumpBuffer.current - step);
      }

      if (jumpBuffer.current > 0 && coyote.current > 0) {
        velocity.current.y = 8.1;
        jumpBuffer.current = 0;
        coyote.current = 0;
        playSound('jump');
      }

      velocity.current.y -= 26 * step;
      const moved = moveWithCollision(
        group.position.x,
        group.position.z,
        velocity.current.x * step,
        velocity.current.z * step,
        PLAYER_RADIUS,
        SOLIDS,
        WORLD_BOUNDS,
      );
      if (moved.blockedX) velocity.current.x = 0;
      if (moved.blockedZ) velocity.current.z = 0;
      group.position.x = moved.x;
      group.position.z = moved.z;

      const nextY = group.position.y + velocity.current.y * step;
      if (nextY <= 0) {
        group.position.y = 0;
        if (velocity.current.y < 0) velocity.current.y = 0;
        playerMotion.airborne = false;
      } else {
        group.position.y = nextY;
        playerMotion.airborne = true;
      }

      const collected = useGame.getState().collectedIds;
      for (const coin of COINS) {
        if (collected.includes(coin.id)) continue;
        const dx = group.position.x - coin.x;
        const dy = group.position.y + 0.85 - coin.y;
        const dz = group.position.z - coin.z;
        if (dx * dx + dy * dy + dz * dz <= COIN_COLLECT_RADIUS * COIN_COLLECT_RADIUS) {
          useGame.getState().collectCoin(coin.id);
        }
      }

      const now = state.clock.elapsedTime * 1000;
      playerMotion.hurt = now < hurtUntil.current;
      if (useGame.getState().phase === 'playing' && now >= hurtUntil.current) {
        for (const hazard of HAZARDS) {
          const dx = group.position.x - hazard.x;
          const dz = group.position.z - hazard.z;
          const reach = PLAYER_RADIUS + hazard.radius;
          if (dx * dx + dz * dz > reach * reach) continue;
          hurtUntil.current = now + 1200;
          playerMotion.hurt = true;
          const length = Math.hypot(dx, dz) || 1;
          velocity.current.x = (dx / length) * 7;
          velocity.current.z = (dz / length) * 7;
          velocity.current.y = Math.max(velocity.current.y, 4.5);
          useGame.getState().damage();
          break;
        }
      }
    } else {
      playerMotion.hurt = false;
    }

    playerMotion.speed = playing ? Math.hypot(velocity.current.x, velocity.current.z) : 0;
    playerRig.position.copy(group.position);
    playerRig.yaw = group.rotation.y;

    const shadow = shadowRef.current;
    if (shadow) {
      shadow.position.set(group.position.x, 0.045, group.position.z);
      const lift = Math.min(group.position.y / 4.5, 0.7);
      const scale = 1 - lift * 0.55;
      shadow.scale.setScalar(scale);
      shadow.material.opacity = 0.28 * (1 - lift);
    }
  });

  return (
    <>
      <group ref={groupRef} position={[SPAWN.x, 0, SPAWN.z]} rotation={[0, SPAWN_YAW, 0]}>
        <PlayerBody />
      </group>
      <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]} position={[SPAWN.x, 0.045, SPAWN.z]}>
        <circleGeometry args={[0.48, 18]} />
        <meshBasicMaterial color="#173326" transparent opacity={0.28} depthWrite={false} />
      </mesh>
    </>
  );
}
