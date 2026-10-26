import { useLayoutEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BackSide,
  CanvasTexture,
  Color,
  ConeGeometry,
  Float32BufferAttribute,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
  SRGBColorSpace,
} from 'three';
import type { Group, InstancedMesh } from 'three';
import { AssetModel } from './AssetModel.tsx';
import { PlaceholderShrine, PlaceholderTree } from './placeholders.tsx';
import {
  DISTANT_TREES,
  FLOWERS,
  GRASS,
  MUSHROOMS,
  PATH_SEGMENTS,
  RING_TREES,
  SHRINE,
  type PropSpec,
} from '../game/level.ts';
import { useSlotUrl } from '../game/slotContext.ts';

const FLOWER_COLORS = ['#ff7aa2', '#ffe56a', '#fffaf0', '#d2b0ff', '#ffb15a'];

function Sky() {
  const geometry = useMemo(() => {
    const sphere = new SphereGeometry(90, 28, 18);
    const colors: number[] = [];
    const position = sphere.attributes.position;
    const color = new Color();
    const top = new Color('#6eb6e6');
    const bottom = new Color('#e7f8d9');
    for (let index = 0; index < position.count; index += 1) {
      const height = position.getY(index) / 90;
      color.copy(bottom).lerp(top, Math.min(1, Math.max(0, height * 0.55 + 0.5)));
      colors.push(color.r, color.g, color.b);
    }
    sphere.setAttribute('color', new Float32BufferAttribute(colors, 3));
    return sphere;
  }, []);

  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <meshBasicMaterial vertexColors side={BackSide} depthWrite={false} fog={false} />
    </mesh>
  );
}

function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <circleGeometry args={[50, 72]} />
        <meshStandardMaterial color="#3d9148" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[23.4, 72]} />
        <meshStandardMaterial color="#58b562" roughness={0.96} />
      </mesh>
      {PATH_SEGMENTS.map((segment) => (
        <group key={`${segment.x}:${segment.z}`} position={[segment.x, 0, segment.z]} rotation={[0, segment.yaw, 0]}>
          <mesh position={[0, 0.03, 0]} receiveShadow>
            <boxGeometry args={[2.4, 0.05, segment.length]} />
            <meshStandardMaterial color="#c9a36c" roughness={1} />
          </mesh>
          <mesh position={[0, 0.06, 0]} receiveShadow>
            <boxGeometry args={[1.25, 0.04, segment.length]} />
            <meshStandardMaterial color="#f0d7a6" roughness={0.92} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function GrassField() {
  const ref = useRef<InstancedMesh>(null);
  const geometry = useMemo(() => {
    const cone = new ConeGeometry(0.16, 0.48, 4);
    cone.translate(0, 0.24, 0);
    return cone;
  }, []);
  const material = useMemo(() => new MeshStandardMaterial(), []);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new Object3D();
    const color = new Color();
    GRASS.forEach((tuft, index) => {
      dummy.position.set(tuft.x, 0, tuft.z);
      dummy.rotation.set(0, tuft.yaw, 0);
      dummy.scale.set(tuft.scale, tuft.scale * (0.75 + tuft.tint * 0.7), tuft.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      color.setHSL(0.28 + tuft.tint * 0.08, 0.58, 0.32 + tuft.tint * 0.14);
      mesh.setColorAt(index, color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  if (GRASS.length === 0) return null;
  return <instancedMesh ref={ref} args={[geometry, material, GRASS.length]} frustumCulled={false} />;
}

function Flowers() {
  return (
    <>
      {FLOWERS.map((flower, index) => (
        <group key={`${flower.x}:${flower.z}:${index}`} position={[flower.x, 0, flower.z]} rotation={[0, flower.yaw, 0]} scale={flower.scale}>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.36, 4]} />
            <meshStandardMaterial color="#3f8f45" />
          </mesh>
          <mesh position={[0, 0.38, 0]}>
            <sphereGeometry args={[0.09, 6, 5]} />
            <meshStandardMaterial color={FLOWER_COLORS[index % FLOWER_COLORS.length]} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Mushrooms() {
  return (
    <>
      {MUSHROOMS.map((mushroom, index) => (
        <group
          key={`${mushroom.x}:${mushroom.z}:${index}`}
          position={[mushroom.x, 0, mushroom.z]}
          rotation={[0, mushroom.yaw, 0]}
          scale={mushroom.scale * 0.8}
        >
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.07, 0.18, 6]} />
            <meshStandardMaterial color="#f4efe4" />
          </mesh>
          <mesh position={[0, 0.2, 0]} castShadow>
            <sphereGeometry args={[0.12, 8, 6]} />
            <meshStandardMaterial color={index % 2 === 0 ? '#d4533c' : '#f2c14e'} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Hills() {
  const hills = [
    { position: [-30, -1.4, 8] as const, scale: [12, 5, 10] as const, color: '#3f8d48' },
    { position: [32, -1.8, -6] as const, scale: [14, 6, 11] as const, color: '#4c9a52' },
    { position: [4, -2.2, -36] as const, scale: [18, 6, 10] as const, color: '#3d8744' },
    { position: [-8, -1.6, 36] as const, scale: [16, 5, 9] as const, color: '#57a85a' },
  ];
  return (
    <>
      {hills.map((hill) => (
        <mesh key={hill.position.join(':')} position={hill.position} scale={hill.scale}>
          <sphereGeometry args={[1, 14, 10]} />
          <meshStandardMaterial color={hill.color} />
        </mesh>
      ))}
    </>
  );
}

function useSignTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 280;
    const context = canvas.getContext('2d');
    if (!context) return null;
    context.fillStyle = '#6d4326';
    context.fillRect(0, 0, 512, 280);
    context.strokeStyle = '#f0d7a6';
    context.lineWidth = 14;
    context.strokeRect(18, 18, 476, 244);
    context.fillStyle = '#f7f1e2';
    context.font = '700 54px Georgia';
    context.textAlign = 'center';
    context.fillText('Collect 10 coins', 256, 118);
    context.font = '34px Georgia';
    context.fillStyle = '#f2c14e';
    context.fillText('Follow the dirt path', 256, 176);
    context.fillStyle = '#f7f1e2';
    context.fillText('Avoid red thorns', 256, 224);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, []);
}

function TrailSign() {
  const texture = useSignTexture();
  return (
    <group position={[-3.6, 0, 12.8]} rotation={[0, 0.7, 0]}>
      <mesh position={[-0.55, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 1.4, 6]} />
        <meshStandardMaterial color="#7a4e2c" />
      </mesh>
      <mesh position={[0.55, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 1.4, 6]} />
        <meshStandardMaterial color="#7a4e2c" />
      </mesh>
      <mesh position={[0, 1.35, 0]} castShadow>
        <boxGeometry args={[1.7, 0.95, 0.08]} />
        <meshStandardMaterial color="#6d4326" />
      </mesh>
      {texture ? (
        <mesh position={[0, 1.35, 0.05]}>
          <planeGeometry args={[1.5, 0.82]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
}

function Clouds() {
  const group = useRef<Group>(null);
  useFrame((_, delta) => {
    const cloud = group.current;
    if (!cloud) return;
    cloud.position.x += delta * 0.45;
    if (cloud.position.x > 36) cloud.position.x = -36;
  });
  const puffs: Array<[number, number, number]> = [
    [-16, 12, -8],
    [-6, 13.2, 4],
    [8, 11.4, -12],
    [18, 12.6, 6],
  ];
  return (
    <group ref={group}>
      {puffs.map((puff) => (
        <group key={puff.join(':')} position={puff}>
          <mesh>
            <sphereGeometry args={[1.5, 8, 6]} />
            <meshStandardMaterial color="#f5fbff" roughness={1} />
          </mesh>
          <mesh position={[1.2, -0.15, 0.2]}>
            <sphereGeometry args={[1.05, 8, 6]} />
            <meshStandardMaterial color="#ffffff" roughness={1} />
          </mesh>
          <mesh position={[-1.15, -0.2, 0.1]}>
            <sphereGeometry args={[1.1, 8, 6]} />
            <meshStandardMaterial color="#f7fbff" roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Bird({ groupRef }: { groupRef: RefObject<Group | null> }) {
  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.1, 6, 5]} />
        <meshBasicMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[0.16, 0.03, 0]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.26, 0.04, 0.1]} />
        <meshBasicMaterial color="#3c3c3c" />
      </mesh>
      <mesh position={[-0.16, 0.03, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.26, 0.04, 0.1]} />
        <meshBasicMaterial color="#3c3c3c" />
      </mesh>
    </group>
  );
}

function Birds() {
  const first = useRef<Group>(null);
  const second = useRef<Group>(null);
  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    if (first.current) {
      first.current.position.set(Math.cos(time * 0.32) * 9, 6.4 + Math.sin(time * 1.4) * 0.35, Math.sin(time * 0.32) * 7);
      first.current.rotation.y = -time * 0.32 + Math.PI / 2;
    }
    if (second.current) {
      const t = time * 0.27 + 2;
      second.current.position.set(Math.cos(t) * 12, 7.2 + Math.sin(time * 1.1) * 0.3, Math.sin(t) * 9 - 2);
      second.current.rotation.y = -t + Math.PI / 2;
    }
  });
  return (
    <>
      <Bird groupRef={first} />
      <Bird groupRef={second} />
    </>
  );
}

function Shrine() {
  const url = useSlotUrl('environment');
  return (
    <group position={[SHRINE.x, 0, SHRINE.z]} rotation={[0, SHRINE.yaw, 0]}>
      {url ? <AssetModel slot="environment" url={url} fallback={<PlaceholderShrine />} /> : <PlaceholderShrine />}
    </group>
  );
}

function TreeLine({ trees, castShadow = false }: { trees: PropSpec[]; castShadow?: boolean }) {
  return (
    <>
      {trees.map((tree) => (
        <group key={tree.id} position={[tree.x, 0, tree.z]} rotation={[0, tree.yaw, 0]} scale={tree.scale}>
          <PlaceholderTree tint={tree.tint} castShadow={castShadow} />
        </group>
      ))}
    </>
  );
}

export function Environment() {
  return (
    <>
      <color attach="background" args={['#9fd4ee']} />
      <fog attach="fog" args={['#d7f0d4', 18, 52]} />
      <Sky />
      <Ground />
      <GrassField />
      <Flowers />
      <Mushrooms />
      <Hills />
      <Clouds />
      <Birds />
      <TrailSign />
      <Shrine />
      <TreeLine trees={RING_TREES} />
      <TreeLine trees={DISTANT_TREES} />
    </>
  );
}
