/**
 * Drop Vi3W exports into `public/models/` using these filenames.
 * `.gltf` is used when the `.glb` file is absent.
 * Tune yaw, pitch, and scaleMultiplier if a model faces the wrong way.
 * The game auto-fits the longest side to `targetSize` and plants the feet on y = 0.
 * Procedural stand-ins are coded in the scene. They are not Vi3W models.
 */
export const MODEL_KEYS = ['player', 'tree', 'rock', 'coin', 'environment'] as const;

export type ModelKey = (typeof MODEL_KEYS)[number];

export interface ModelSlotConfig {
  url: string;
  targetSize: number;
  yaw: number;
  pitch: number;
  scaleMultiplier: number;
  label: string;
}

export const MODEL_SLOTS: Record<ModelKey, ModelSlotConfig> = {
  player: {
    url: '/models/player.glb',
    targetSize: 1.7,
    yaw: 0,
    pitch: 0,
    scaleMultiplier: 1,
    label: 'Player',
  },
  tree: {
    url: '/models/tree.glb',
    targetSize: 3.5,
    yaw: 0,
    pitch: 0,
    scaleMultiplier: 1,
    label: 'Tree',
  },
  rock: {
    url: '/models/rock.glb',
    targetSize: 1.25,
    yaw: 0,
    pitch: 0,
    scaleMultiplier: 1,
    label: 'Rock',
  },
  coin: {
    url: '/models/coin.glb',
    targetSize: 0.72,
    yaw: 0,
    pitch: 0,
    scaleMultiplier: 1,
    label: 'Coin',
  },
  environment: {
    url: '/models/environment.glb',
    targetSize: 3.3,
    yaw: 0,
    pitch: 0,
    scaleMultiplier: 1,
    label: 'Shrine',
  },
};

export const EMPTY_SLOTS: Record<ModelKey, string | null> = {
  player: null,
  tree: null,
  rock: null,
  coin: null,
  environment: null,
};
