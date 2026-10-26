import { useEffect } from 'react';
import { ensureAudio } from '../game/audio.ts';
import { clearHeld, inputState, setHeld } from '../game/input.ts';
import { useGame } from '../game/store.ts';

export function KeyboardInput() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key.startsWith('arrow')) event.preventDefault();

      const phase = useGame.getState().phase;
      if (event.code === 'Space') {
        if (phase === 'playing') {
          event.preventDefault();
          if (!event.repeat) inputState.jumpQueued = true;
        }
        return;
      }
      if (event.repeat) return;

      const target = event.target instanceof HTMLElement ? event.target.tagName : '';
      const onButton = target === 'BUTTON';

      if (key === 'escape' || key === 'p') {
        if (phase === 'playing') useGame.getState().pause();
        else if (phase === 'paused') useGame.getState().resume();
        return;
      }
      if (key === 'enter' && !onButton) {
        ensureAudio();
        if (phase === 'menu') useGame.getState().start();
        else if (phase === 'paused') useGame.getState().resume();
        else if (phase === 'victory' || phase === 'gameover') useGame.getState().restart();
        return;
      }
      if (key === 'r' && (phase === 'victory' || phase === 'gameover' || phase === 'paused')) {
        ensureAudio();
        useGame.getState().restart();
        return;
      }
      if (key === 'm') {
        useGame.getState().toggleMute();
        return;
      }
      setHeld(key, true);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      setHeld(event.key.toLowerCase(), false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearHeld);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearHeld);
      clearHeld();
    };
  }, []);

  return null;
}
