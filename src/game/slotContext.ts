import { createContext, useContext } from 'react';
import { EMPTY_SLOTS, type ModelKey } from './modelConfig.ts';

export interface SlotLibrary {
  slots: Record<ModelKey, string | null>;
  checked: boolean;
}

export const SlotContext = createContext<SlotLibrary>({
  slots: EMPTY_SLOTS,
  checked: false,
});

export function useSlotUrl(slot: ModelKey) {
  return useContext(SlotContext).slots[slot];
}

export function useModelLibrary() {
  return useContext(SlotContext);
}
