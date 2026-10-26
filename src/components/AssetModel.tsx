import { useAnimations, useGLTF } from '@react-three/drei';
import { Component, Suspense, useEffect, useMemo, type ReactNode } from 'react';
import { Box3, Group, Mesh, Vector3 } from 'three';
import type { AnimationClip, Object3D } from 'three';
import { clone as cloneObject } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { MODEL_SLOTS, type ModelKey, type ModelSlotConfig } from '../game/modelConfig.ts';

const scratchSize = new Vector3();

function buildFitted(source: Object3D, config: ModelSlotConfig) {
  const cloned = cloneObject(source);
  cloned.traverse((child) => {
    if (child instanceof Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  cloned.updateMatrixWorld(true);

  const box = new Box3().setFromObject(cloned);
  box.getSize(scratchSize);
  const maxAxis = Math.max(scratchSize.x, scratchSize.y, scratchSize.z, 0.0001);
  const fit = (config.targetSize / maxAxis) * config.scaleMultiplier;

  const inner = new Group();
  inner.add(cloned);
  cloned.position.set(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2);
  inner.scale.setScalar(fit);

  const pivot = new Group();
  pivot.rotation.set(config.pitch, config.yaw, 0);
  pivot.add(inner);
  return pivot;
}

interface BoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface BoundaryState {
  failed: boolean;
}

class ModelErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('A model in public/models could not be used. Showing the procedural stand-in.', error);
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

function StaticFitted({ slot, url }: { slot: ModelKey; url: string }) {
  const gltf = useGLTF(url, false, false);
  const object = useMemo(() => buildFitted(gltf.scene, MODEL_SLOTS[slot]), [gltf.scene, slot]);
  return <primitive object={object} />;
}

function AnimatedFitted({ slot, url }: { slot: ModelKey; url: string }) {
  const gltf = useGLTF(url, false, false);
  const object = useMemo(() => buildFitted(gltf.scene, MODEL_SLOTS[slot]), [gltf.scene, slot]);
  const { actions, names } = useAnimations(gltf.animations as AnimationClip[], object);

  useEffect(() => {
    const clipName = names.find((name) => /idle|walk|run/i.test(name)) ?? names[0];
    if (!clipName) return undefined;
    const action = actions[clipName];
    action?.reset().fadeIn(0.2).play();
    return () => {
      action?.stop();
    };
  }, [actions, names]);

  return <primitive object={object} />;
}

interface AssetModelProps {
  slot: ModelKey;
  url: string;
  fallback: ReactNode;
  animated?: boolean;
}

export function AssetModel({ slot, url, fallback, animated = false }: AssetModelProps) {
  return (
    <ModelErrorBoundary key={url} fallback={fallback}>
      <Suspense fallback={fallback}>
        {animated ? <AnimatedFitted slot={slot} url={url} /> : <StaticFitted slot={slot} url={url} />}
      </Suspense>
    </ModelErrorBoundary>
  );
}
