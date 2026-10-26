import { ensureAudio, playSound } from '../game/audio.ts';
import { useGame } from '../game/store.ts';

export function PauseMenu() {
  const resume = useGame((state) => state.resume);
  const restart = useGame((state) => state.restart);
  const backToMenu = useGame((state) => state.backToMenu);
  const muted = useGame((state) => state.muted);
  const toggleMute = useGame((state) => state.toggleMute);

  const click = (action: () => void) => {
    ensureAudio();
    playSound('click');
    action();
  };

  return (
    <div className="scrim">
      <section className="panel">
        <p className="eyebrow">Paused</p>
        <h2>Take a breath under the trees.</h2>
        <div className="stack">
          <button type="button" className="btn" onClick={() => click(resume)} autoFocus>
            Resume
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => click(restart)}>
            Restart
          </button>
          <button type="button" className="btn btn-ghost" onClick={toggleMute}>
            Sound {muted ? 'Off' : 'On'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => click(backToMenu)}>
            Main Menu
          </button>
        </div>
      </section>
    </div>
  );
}
