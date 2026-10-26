import { useGLTF } from '@react-three/drei';
import { useEffect, useState, type ReactNode } from 'react';
import { EMPTY_SLOTS, MODEL_KEYS, MODEL_SLOTS, type ModelKey } from '../game/modelConfig.ts';
import { SlotContext, type SlotLibrary } from '../game/slotContext.ts';
import { useGame } from '../game/store.ts';

async function resolveModel(url: string) {
  const base = url.replace(/\.(glb|gltf)$/i, '');
  for (const extension of ['.glb', '.gltf']) {
    const candidate = `${base}${extension}`;
    try {
      let response = await fetch(candidate, { method: 'HEAD' });
      if (response.status === 405 || response.status === 501) {
        response = await fetch(candidate);
      }
      if (!response.ok) continue;
      const type = response.headers.get('content-type') ?? '';
      if (type.includes('text/html')) continue;
      return candidate;
    } catch {
      continue;
    }
  }
  return null;
}

export function ModelProvider({ children }: { children: ReactNode }) {
  const [library, setLibrary] = useState<SlotLibrary>({ slots: EMPTY_SLOTS, checked: false });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const resolved = await Promise.all(
        MODEL_KEYS.map(async (key) => [key, await resolveModel(MODEL_SLOTS[key].url)] as const),
      );
      if (cancelled) return;
      const slots = { ...EMPTY_SLOTS };
      for (const [key, url] of resolved) {
        slots[key as ModelKey] = url;
        if (url) useGLTF.preload(url, false, false);
      }
      setLibrary({ slots, checked: true });
      useGame.getState().setSlots(slots);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return <SlotContext.Provider value={library}>{children}</SlotContext.Provider>;
}
