import { GameHUD } from './GameHUD.tsx';
import { GameOver, VictoryScreen } from './GameOver.tsx';
import { MainMenu } from './MainMenu.tsx';
import { PauseMenu } from './PauseMenu.tsx';
import { TouchControls } from './TouchControls.tsx';
import { useGame } from '../game/store.ts';

export function Overlay() {
  const phase = useGame((state) => state.phase);
  const hurtNonce = useGame((state) => state.hurtNonce);

  return (
    <>
      {hurtNonce > 0 ? <div key={hurtNonce} className="hurt-flash" /> : null}
      {phase === 'menu' ? <MainMenu /> : null}
      {phase === 'playing' || phase === 'paused' ? <GameHUD /> : null}
      {phase === 'paused' ? <PauseMenu /> : null}
      {phase === 'victory' ? <VictoryScreen /> : null}
      {phase === 'gameover' ? <GameOver /> : null}
      {phase === 'playing' ? <TouchControls /> : null}
    </>
  );
}
