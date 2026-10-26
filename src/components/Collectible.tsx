import { Float } from '@react-three/drei';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { AssetModel } from './AssetModel.tsx';
import { PlaceholderCoin } from './placeholders.tsx';
import { COINS } from '../game/level.ts';
import { useSlotUrl } from '../game/slotContext.ts';
import { useGame } from '../game/store.ts';

function Collectible({
  coin,
  url,
}: {
  coin: (typeof COINS)[number];
  url: string | null;
}) {
  const spin = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!spin.current) return;
    spin.current.rotation.y = clock.elapsedTime * 1.7 + coin.phase;
  });

  return (
    <Float speed={1.8} rotationIntensity={0} floatIntensity={0.55} floatingRange={[-0.08, 0.14]}>
      <group ref={spin} position={[coin.x, coin.y, coin.z]}>
        {url ? <AssetModel slot="coin" url={url} fallback={<PlaceholderCoin />} /> : <PlaceholderCoin />}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, 0]}>
          <ringGeometry args={[0.22, 0.34, 18]} />
          <meshBasicMaterial color="#ffe08a" transparent opacity={0.45} depthWrite={false} />
        </mesh>
      </group>
    </Float>
  );
}

export function Collectibles() {
  const url = useSlotUrl('coin');
  const collectedIds = useGame((state) => state.collectedIds);

  return (
    <group>
      {COINS.map((coin) =>
        collectedIds.includes(coin.id) ? null : <Collectible key={coin.id} coin={coin} url={url} />,
      )}
    </group>
  );
}
