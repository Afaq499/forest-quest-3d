import { CameraRig } from './CameraRig.tsx';
import { Collectibles } from './Collectible.tsx';
import { Environment } from './Environment.tsx';
import { Lights } from './Lights.tsx';
import { Obstacles } from './Obstacles.tsx';
import { Player } from './Player.tsx';

export function Experience() {
  return (
    <>
      <Lights />
      <Environment />
      <Obstacles />
      <Collectibles />
      <Player />
      <CameraRig />
    </>
  );
}
