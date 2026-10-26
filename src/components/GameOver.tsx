import { ensureAudio, playSound } from '../game/audio.ts';
import { formatTime, victoryRank } from '../game/format.ts';
import { useGame } from '../game/store.ts';

function EndActions({ primary }: { primary: string }) {
  const restart = useGame((state) => state.restart);
  const backToMenu = useGame((state) => state.backToMenu);

  const click = (action: () => void) => {
    ensureAudio();
    playSound('click');
    action();
  };

  return (
    <div className="stack">
      <button type="button" className="btn" onClick={() => click(restart)} autoFocus>
        {primary}
      </button>
      <button type="button" className="btn btn-ghost" onClick={() => click(backToMenu)}>
        Main Menu
      </button>
    </div>
  );
}

export function VictoryScreen() {
  const elapsed = useGame((state) => state.elapsed);
  const score = useGame((state) => state.score);
  const totalCoins = useGame((state) => state.totalCoins);
  const health = useGame((state) => state.health);
  const maxHealth = useGame((state) => state.maxHealth);
  const rank = victoryRank(elapsed, health, maxHealth);

  return (
    <div className="scrim">
      <section className="panel">
        <p className="eyebrow">Grove cleared</p>
        <h2>{rank}</h2>
        <p className="lede">Every coin is accounted for. The trail is yours.</p>
        <dl className="stats">
          <div>
            <dt>Time</dt>
            <dd>{formatTime(elapsed)}</dd>
          </div>
          <div>
            <dt>Coins</dt>
            <dd>
              {score}/{totalCoins}
            </dd>
          </div>
          <div>
            <dt>Hearts</dt>
            <dd>
              {health}/{maxHealth}
            </dd>
          </div>
        </dl>
        <EndActions primary="Play Again" />
      </section>
    </div>
  );
}

export function GameOver() {
  const elapsed = useGame((state) => state.elapsed);
  const score = useGame((state) => state.score);
  const totalCoins = useGame((state) => state.totalCoins);
  const endReason = useGame((state) => state.endReason);

  return (
    <div className="scrim">
      <section className="panel">
        <p className="eyebrow">Game over</p>
        <h2>The forest wins this round.</h2>
        <p className="lede">{endReason || 'The thorn bushes caught you.'}</p>
        <dl className="stats">
          <div>
            <dt>Time</dt>
            <dd>{formatTime(elapsed)}</dd>
          </div>
          <div>
            <dt>Coins</dt>
            <dd>
              {score}/{totalCoins}
            </dd>
          </div>
        </dl>
        <EndActions primary="Try Again" />
      </section>
    </div>
  );
}
