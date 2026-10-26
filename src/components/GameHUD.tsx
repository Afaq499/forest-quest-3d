import { formatTime } from '../game/format.ts';
import { useGame } from '../game/store.ts';

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={filled ? 'heart filled' : 'heart'} aria-hidden="true">
      <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" />
    </svg>
  );
}

function CoinMark() {
  return (
    <svg viewBox="0 0 24 24" className="coin-mark" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v9M9.2 9.4c.6-.8 1.6-1.2 2.8-1.2 1.8 0 3 1 3 2.4s-1.2 2.3-3 2.5-3 .9-3 2.4 1.3 2.3 3.1 2.3c1.2 0 2.2-.4 2.8-1.2" />
    </svg>
  );
}

export function GameHUD() {
  const score = useGame((state) => state.score);
  const totalCoins = useGame((state) => state.totalCoins);
  const health = useGame((state) => state.health);
  const maxHealth = useGame((state) => state.maxHealth);
  const elapsed = useGame((state) => state.elapsed);
  const phase = useGame((state) => state.phase);
  const pause = useGame((state) => state.pause);
  const progress = totalCoins === 0 ? 0 : Math.round((score / totalCoins) * 100);

  return (
    <div className="hud">
      <div className="hud-top">
        <div className="chip score-chip">
          <CoinMark />
          <strong>
            {score}/{totalCoins}
          </strong>
          {score > 0 ? (
            <span key={score} className="score-pop">
              +1
            </span>
          ) : null}
        </div>
        <div className="chip timer-chip">
          <span>Time</span>
          <strong>{formatTime(elapsed)}</strong>
        </div>
        <div className="hud-actions">
          <div className="chip hearts" aria-label={`${health} of ${maxHealth} hearts`}>
            {Array.from({ length: maxHealth }, (_, index) => (
              <Heart key={index} filled={index < health} />
            ))}
          </div>
          {phase === 'playing' ? (
            <button type="button" className="icon-button" onClick={pause}>
              Pause
            </button>
          ) : null}
        </div>
      </div>
      <div className="progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      <p className="control-hint">WASD or arrows to move · Space to jump · Esc to pause</p>
    </div>
  );
}
