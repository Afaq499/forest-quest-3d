import { create } from 'zustand';
import { playSound, setAudioMuted } from './audio.ts';
import { MAX_HEALTH, TOTAL_COINS } from './level.ts';
import { EMPTY_SLOTS, type ModelKey } from './modelConfig.ts';

export type Phase = 'menu' | 'playing' | 'paused' | 'victory' | 'gameover';

export interface GameState {
  phase: Phase;
  score: number;
  collectedIds: string[];
  totalCoins: number;
  health: number;
  maxHealth: number;
  elapsed: number;
  muted: boolean;
  resetId: number;
  hurtNonce: number;
  endReason: string;
  slots: Record<ModelKey, string | null>;
  modelsChecked: boolean;
  toggleMute: () => void;
  setSlots: (slots: Record<ModelKey, string | null>) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  restart: () => void;
  backToMenu: () => void;
  collectCoin: (id: string) => void;
  damage: () => void;
  addTime: (dt: number) => void;
}

function readMuted() {
  try {
    return localStorage.getItem('fq-muted') === '1';
  } catch {
    return false;
  }
}

const initialMuted = readMuted();
setAudioMuted(initialMuted);

function fresh(phase: Phase, resetId: number, muted: boolean) {
  return {
    phase,
    score: 0,
    collectedIds: [] as string[],
    health: MAX_HEALTH,
    elapsed: 0,
    hurtNonce: 0,
    endReason: '',
    resetId,
    muted,
  };
}

export const useGame = create<GameState>((set, get) => ({
  ...fresh('menu', 0, initialMuted),
  totalCoins: TOTAL_COINS,
  maxHealth: MAX_HEALTH,
  slots: { ...EMPTY_SLOTS },
  modelsChecked: false,
  toggleMute: () => {
    const muted = !get().muted;
    setAudioMuted(muted);
    try {
      localStorage.setItem('fq-muted', muted ? '1' : '0');
    } catch {
      /* storage can be blocked in private modes */
    }
    set({ muted });
  },
  setSlots: (slots) => set({ slots, modelsChecked: true }),
  start: () => set((state) => fresh('playing', state.resetId + 1, state.muted)),
  pause: () => {
    if (get().phase === 'playing') set({ phase: 'paused' });
  },
  resume: () => {
    if (get().phase === 'paused') set({ phase: 'playing' });
  },
  restart: () => set((state) => fresh('playing', state.resetId + 1, state.muted)),
  backToMenu: () => set((state) => fresh('menu', state.resetId + 1, state.muted)),
  collectCoin: (id) => {
    const state = get();
    if (state.phase !== 'playing' || state.collectedIds.includes(id)) return;
    const collectedIds = [...state.collectedIds, id];
    const won = collectedIds.length >= state.totalCoins;
    set({
      collectedIds,
      score: collectedIds.length,
      phase: won ? 'victory' : state.phase,
    });
    playSound(won ? 'win' : 'collect');
  },
  damage: () => {
    const state = get();
    if (state.phase !== 'playing' || state.health <= 0) return;
    const health = state.health - 1;
    const dead = health <= 0;
    set({
      health,
      hurtNonce: state.hurtNonce + 1,
      phase: dead ? 'gameover' : state.phase,
      endReason: dead ? 'The thorn bushes caught you.' : state.endReason,
    });
    playSound(dead ? 'lose' : 'hurt');
  },
  addTime: (dt) => {
    if (get().phase !== 'playing') return;
    set({ elapsed: get().elapsed + dt });
  },
}));
