import { useLayoutEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { PMREMGenerator } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { Mesh } from 'three';

export function Lights() {
  const { gl, scene } = useThree();

  useLayoutEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04).texture;
    // Three.js scene lighting is applied by writing these fields.
    // oxlint-disable-next-line react/immutability
    scene.environment = environment;
    // oxlint-disable-next-line react/immutability
    scene.environmentIntensity = 0.42;

    return () => {
      scene.environment = null;
      environment.dispose();
      pmrem.dispose();
      room.traverse((child) => {
        const mesh = child as Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => material.dispose());
      });
    };
  }, [gl, scene]);

  return (
    <>
      <hemisphereLight args={['#d7f1ff', '#3f8a42', 0.72]} />
      <ambientLight intensity={0.28} color="#fff6e8" />
      <directionalLight
        position={[18, 28, 12]}
        intensity={1.85}
        color="#fff1d4"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={2}
        shadow-camera-far={72}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-bias={-0.0002}
        shadow-normalBias={0.035}
      />
    </>
  );
}
