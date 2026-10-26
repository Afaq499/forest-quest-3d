import { ensureAudio, playSound } from '../game/audio.ts';
import { MODEL_KEYS, MODEL_SLOTS } from '../game/modelConfig.ts';
import { useGame } from '../game/store.ts';

export function MainMenu() {
  const start = useGame((state) => state.start);
  const muted = useGame((state) => state.muted);
  const toggleMute = useGame((state) => state.toggleMute);
  const slots = useGame((state) => state.slots);
  const modelsChecked = useGame((state) => state.modelsChecked);
  const loaded = MODEL_KEYS.filter((key) => slots[key]);

  const begin = () => {
    ensureAudio();
    playSound('click');
    start();
  };

  return (
    <div className="scrim menu-scrim">
      <section className="panel menu-panel">
        <p className="eyebrow">Third-person forest adventure</p>
        <h1>
          Forest Quest <span>3D</span>
        </h1>
        <p className="lede">Follow the dirt path, pocket all 10 coins, and keep clear of the red thorn bushes.</p>
        <div className="menu-actions">
          <button type="button" className="btn" onClick={begin} autoFocus>
            Start Game
          </button>
          <button type="button" className="btn btn-secondary" onClick={toggleMute}>
            Sound {muted ? 'Off' : 'On'}
          </button>
        </div>
        <div className="controls">
          <h2>Controls</h2>
          <ul>
            <li>
              <kbd>W</kbd>
              <kbd>A</kbd>
              <kbd>S</kbd>
              <kbd>D</kbd>
              <span>Move, relative to the camera</span>
            </li>
            <li>
              <kbd>↑</kbd>
              <kbd>←</kbd>
              <kbd>↓</kbd>
              <kbd>→</kbd>
              <span>Move as well</span>
            </li>
            <li>
              <kbd>Space</kbd>
              <span>Jump</span>
            </li>
            <li>
              <kbd>Esc</kbd>
              <span>Pause or resume</span>
            </li>
            <li>
              <kbd>M</kbd>
              <span>Toggle sound</span>
            </li>
          </ul>
          <p>You have 3 hearts. Touching a thorn bush costs one. Collect every coin to clear the grove.</p>
        </div>
        <p className="asset-note">
          {modelsChecked
            ? loaded.length > 0
              ? `Vi3W models active: ${loaded.map((key) => MODEL_SLOTS[key].label).join(', ')}.`
              : 'Procedural stand-ins are on screen. Add GLB files to public/models to swap in Vi3W models.'
            : 'Checking public/models…'}
        </p>
      </section>
    </div>
  );
}
