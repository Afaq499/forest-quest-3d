import { useMemo, useRef } from 'react';
import type { Group, Mesh } from 'three';
import { Color } from 'three';
import { useFrame } from '@react-three/fiber';
import { playerMotion } from '../game/runtime.ts';

const tunic = '#2f9d62';
const tunicDark = '#21784a';
const skin = '#f0c7a4';
const boot = '#6a4124';
const hat = '#d4533c';
const pack = '#8d5a32';

export function PlaceholderExplorer() {
  const body = useRef<Group>(null);
  const leftLeg = useRef<Group>(null);
  const rightLeg = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);

  useFrame(({ clock }) => {
    const moving = playerMotion.speed > 0.45 && !playerMotion.airborne;
    const swing = moving ? Math.sin(clock.elapsedTime * 11) * 0.7 : Math.sin(clock.elapsedTime * 1.6) * 0.05;
    if (leftLeg.current) leftLeg.current.rotation.x = swing;
    if (rightLeg.current) rightLeg.current.rotation.x = -swing;
    if (leftArm.current) leftArm.current.rotation.x = -swing * 0.75;
    if (rightArm.current) rightArm.current.rotation.x = swing * 0.75;
    if (body.current) {
      const bob = moving ? Math.abs(Math.sin(clock.elapsedTime * 11)) * 0.07 : 0;
      body.current.position.y = bob + (playerMotion.airborne ? 0.04 : 0);
      body.current.rotation.z = moving ? Math.sin(clock.elapsedTime * 11) * 0.05 : 0;
    }
  });

  return (
    <group ref={body}>
      <group ref={leftLeg} position={[-0.16, 0.78, 0]}>
        <mesh position={[0, -0.28, 0]} castShadow>
          <capsuleGeometry args={[0.09, 0.28, 4, 8]} />
          <meshStandardMaterial color={tunicDark} />
        </mesh>
        <mesh position={[0, -0.52, 0.05]} castShadow>
          <boxGeometry args={[0.16, 0.12, 0.28]} />
          <meshStandardMaterial color={boot} />
        </mesh>
      </group>
      <group ref={rightLeg} position={[0.16, 0.78, 0]}>
        <mesh position={[0, -0.28, 0]} castShadow>
          <capsuleGeometry args={[0.09, 0.28, 4, 8]} />
          <meshStandardMaterial color={tunicDark} />
        </mesh>
        <mesh position={[0, -0.52, 0.05]} castShadow>
          <boxGeometry args={[0.16, 0.12, 0.28]} />
          <meshStandardMaterial color={boot} />
        </mesh>
      </group>
      <mesh position={[0, 1.05, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.38, 4, 10]} />
        <meshStandardMaterial color={tunic} />
      </mesh>
      <mesh position={[0, 1.02, -0.22]} castShadow>
        <boxGeometry args={[0.32, 0.36, 0.16]} />
        <meshStandardMaterial color={pack} />
      </mesh>
      <mesh position={[0, 1.18, 0.3]} rotation={[0.4, 0, 0]} castShadow>
        <boxGeometry args={[0.34, 0.08, 0.12]} />
        <meshStandardMaterial color="#f2c14e" />
      </mesh>
      <group ref={leftArm} position={[-0.38, 1.2, 0]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.28, 3, 6]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      </group>
      <group ref={rightArm} position={[0.38, 1.2, 0]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <capsuleGeometry args={[0.07, 0.28, 3, 6]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      </group>
      <mesh position={[0, 1.52, 0]} castShadow>
        <sphereGeometry args={[0.24, 14, 12]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      <mesh position={[-0.08, 1.56, 0.18]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#2b241c" />
      </mesh>
      <mesh position={[0.08, 1.56, 0.18]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#2b241c" />
      </mesh>
      <mesh position={[0, 1.74, 0]} castShadow>
        <coneGeometry args={[0.2, 0.28, 8]} />
        <meshStandardMaterial color={hat} />
      </mesh>
      <mesh position={[0, 1.62, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.035, 6, 12]} />
        <meshStandardMaterial color={hat} />
      </mesh>
    </group>
  );
}

export function PlaceholderTree({ tint, castShadow = true }: { tint: number; castShadow?: boolean }) {
  const leaf = useMemo(() => new Color().setHSL(0.3 + tint * 0.06, 0.62, 0.34 + tint * 0.08), [tint]);
  const leafDark = useMemo(() => leaf.clone().offsetHSL(0, 0, -0.06), [leaf]);
  return (
    <group>
      <mesh position={[0, 0.55, 0]} castShadow={castShadow} receiveShadow>
        <cylinderGeometry args={[0.2, 0.3, 1.1, 6]} />
        <meshStandardMaterial color="#7a4e2c" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.7, 0]} castShadow={castShadow}>
        <coneGeometry args={[1.05, 1.7, 7]} />
        <meshStandardMaterial color={leaf} flatShading />
      </mesh>
      <mesh position={[0, 2.45, 0]} castShadow={castShadow}>
        <coneGeometry args={[0.78, 1.35, 7]} />
        <meshStandardMaterial color={leafDark} flatShading />
      </mesh>
    </group>
  );
}

export function PlaceholderRock({ tint }: { tint: number }) {
  const color = useMemo(() => new Color().setHSL(0.25, 0.08, 0.42 + tint * 0.16), [tint]);
  return (
    <group>
      <mesh position={[0, 0.42, 0]} rotation={[0.25, tint * 4, 0.15]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.58, 0]} />
        <meshStandardMaterial color={color} flatShading roughness={0.92} />
      </mesh>
      <mesh position={[0.2, 0.32, 0.12]} rotation={[0.4, 0.6, 0]} castShadow>
        <sphereGeometry args={[0.16, 6, 5]} />
        <meshStandardMaterial color="#6d9a4c" flatShading />
      </mesh>
    </group>
  );
}

export function PlaceholderCoin() {
  return (
    <group>
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.09, 20]} />
        <meshStandardMaterial color="#ffd35c" metalness={0.72} roughness={0.22} emissive="#b67812" emissiveIntensity={0.35} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.18, 0.035, 8, 18]} />
        <meshStandardMaterial color="#fff3bf" metalness={0.45} roughness={0.3} emissive="#f0c14e" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

export function PlaceholderShrine() {
  const lantern = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (lantern.current) lantern.current.position.y = 1.55 + Math.sin(clock.elapsedTime * 2) * 0.06;
  });
  return (
    <group>
      <mesh position={[-0.85, 1.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.16, 2.1, 6]} />
        <meshStandardMaterial color="#8a5a34" />
      </mesh>
      <mesh position={[0.85, 1.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.16, 2.1, 6]} />
        <meshStandardMaterial color="#8a5a34" />
      </mesh>
      <mesh position={[0, 2.15, 0]} castShadow>
        <boxGeometry args={[2.3, 0.16, 0.36]} />
        <meshStandardMaterial color="#6d4124" />
      </mesh>
      <mesh position={[0, 2.48, 0]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[1.45, 0.7, 4]} />
        <meshStandardMaterial color="#d4533c" flatShading />
      </mesh>
      <mesh ref={lantern} position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.16, 10, 10]} />
        <meshStandardMaterial color="#ffe08a" emissive="#ffb703" emissiveIntensity={1.4} />
      </mesh>
      <mesh position={[-0.45, 0.18, 0.45]} castShadow>
        <sphereGeometry args={[0.12, 6, 5]} />
        <meshStandardMaterial color="#ff7aa2" />
      </mesh>
      <mesh position={[0.5, 0.16, 0.4]} castShadow>
        <sphereGeometry args={[0.1, 6, 5]} />
        <meshStandardMaterial color="#ffe56a" />
      </mesh>
    </group>
  );
}

export function ThornBush({ scale }: { scale: number }) {
  return (
    <group scale={scale}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <ringGeometry args={[0.42, 0.95, 16]} />
        <meshBasicMaterial color="#e15b66" transparent opacity={0.45} depthWrite={false} />
      </mesh>
      {[0, 1, 2, 3, 4].map((index) => {
        const angle = (index / 5) * Math.PI * 2;
        return (
          <mesh key={index} position={[Math.cos(angle) * 0.28, 0.36, Math.sin(angle) * 0.28]} castShadow>
            <coneGeometry args={[0.2, 0.72, 5]} />
            <meshStandardMaterial color={index % 2 === 0 ? '#b42338' : '#7c1c32'} roughness={0.75} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.55, 0]} castShadow>
        <coneGeometry args={[0.24, 0.9, 5]} />
        <meshStandardMaterial color="#e24b5c" emissive="#6b1020" emissiveIntensity={0.28} />
      </mesh>
    </group>
  );
}
