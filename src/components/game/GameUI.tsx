import React from 'react';

interface GameUIProps {
  score: number;
  highScore: number;
  gameState: 'ready' | 'playing' | 'gameover';
  onStart: () => void;
  onRestart: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({
  score,
  highScore,
  gameState,
  onStart,
  onRestart,
}) => {
  return (
    <>
      {/* Score Display */}
      <div className="absolute top-4 left-4 z-10">
        <div className="retro-border bg-card p-3">
          <div className="text-xs text-muted-foreground mb-1">SCORE</div>
          <div className="text-lg text-primary retro-text-shadow">
            {String(score).padStart(6, '0')}
          </div>
        </div>
      </div>

      {/* High Score */}
      <div className="absolute top-4 right-4 z-10">
        <div className="retro-border bg-card p-3">
          <div className="text-xs text-muted-foreground mb-1">HIGH</div>
          <div className="text-lg text-secondary">
            {String(highScore).padStart(6, '0')}
          </div>
        </div>
      </div>

      {/* Start Screen */}
      {gameState === 'ready' && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-background/80">
          <div className="text-center retro-border bg-card p-8">
            <h1 className="text-2xl text-primary retro-text-shadow mb-4">
              DRONEMANIA
            </h1>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              CONTROL YOUR DRONE!<br />
              ← LEFT PROP | RIGHT PROP →<br />
              BOTH = RISE | NONE = FALL
            </p>
            <button
              onClick={onStart}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onStart();
              }}
              className="retro-border bg-primary text-primary-foreground px-6 py-3 text-sm hover:bg-secondary transition-colors blink"
            >
              PRESS TO START
            </button>
            <p className="text-xs text-muted-foreground mt-4">
              OR TAP LEFT/RIGHT SIDE
            </p>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-background/80">
          <div className="text-center retro-border bg-card p-8">
            <h2 className="text-xl text-destructive retro-text-shadow mb-4">
              GAME OVER
            </h2>
            <p className="text-sm text-primary mb-2">
              SCORE: {String(score).padStart(6, '0')}
            </p>
            {score >= highScore && score > 0 && (
              <p className="text-xs text-accent mb-4 blink">
                ★ NEW HIGH SCORE ★
              </p>
            )}
            <button
              onClick={onRestart}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRestart();
              }}
              className="retro-border bg-secondary text-secondary-foreground px-6 py-3 text-sm hover:bg-primary transition-colors"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* Controls indicator */}
      {gameState === 'playing' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-8">
          <div className="retro-border bg-card px-4 py-2 text-xs text-muted-foreground">
            ← LEFT
          </div>
          <div className="retro-border bg-card px-4 py-2 text-xs text-muted-foreground">
            RIGHT →
          </div>
        </div>
      )}
    </>
  );
};
