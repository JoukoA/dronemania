import React from 'react';

interface GameUIProps {
  score: number;
  highScore: number;
  level: number;
  levelProgress: number;
  isMeasuring: boolean;
  gameState: 'ready' | 'playing' | 'gameover' | 'levelcomplete';
  onStart: () => void;
  onRestart: () => void;
  onNextLevel: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({
  score,
  highScore,
  level,
  levelProgress,
  isMeasuring,
  gameState,
  onStart,
  onRestart,
  onNextLevel,
}) => {
  return (
    <>
      {/* Score Display */}
      <div className="absolute top-4 left-4 z-10">
        <div className={`retro-border bg-card p-3 transition-colors duration-200 ${isMeasuring ? 'border-green-400' : ''}`}>
          <div className="text-xs text-muted-foreground mb-1">EMISSIONS</div>
          <div className={`text-lg retro-text-shadow transition-colors duration-200 ${isMeasuring ? 'text-green-400' : 'text-primary'}`}>
            {String(score).padStart(6, '0')}
          </div>
          {isMeasuring && (
            <div className="text-xs text-green-400 animate-pulse mt-1">
              MEASURING...
            </div>
          )}
        </div>
      </div>

      {/* Level & Progress */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="retro-border bg-card p-2 min-w-[120px]">
          <div className="text-xs text-muted-foreground mb-1 text-center">LEVEL {level}/3</div>
          <div className="h-2 bg-background retro-border">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${levelProgress}%` }}
            />
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
              MEASURE CHIMNEY EMISSIONS!<br />
              ← TILT BACK | TILT FORWARD →<br />
              ONLY ONE PROP AT A TIME!<br />
              FLY CLOSE TO CHIMNEYS TO MEASURE
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
              3 LEVELS TO COMPLETE
            </p>
          </div>
        </div>
      )}

      {/* Level Complete Screen */}
      {gameState === 'levelcomplete' && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-background/80">
          <div className="text-center retro-border bg-card p-8">
            <h2 className="text-xl text-green-400 retro-text-shadow mb-4">
              LEVEL {level} COMPLETE!
            </h2>
            <p className="text-sm text-primary mb-2">
              EMISSIONS: {String(score).padStart(6, '0')}
            </p>
            {level < 3 && (
              <>
                <p className="text-xs text-muted-foreground mb-4">
                  {level === 1 ? 'NEXT: BURNING FLARES AHEAD!' : 'FINAL LEVEL AWAITS!'}
                </p>
                <button
                  onClick={onNextLevel}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNextLevel();
                  }}
                  className="retro-border bg-green-500 text-black px-6 py-3 text-sm hover:bg-green-400 transition-colors blink"
                >
                  CONTINUE →
                </button>
              </>
            )}
            {level === 3 && (
              <>
                <p className="text-xs text-accent mb-4 blink">
                  ★ GAME COMPLETE ★
                </p>
                <button
                  onClick={onRestart}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRestart();
                  }}
                  className="retro-border bg-primary text-primary-foreground px-6 py-3 text-sm hover:bg-secondary transition-colors"
                >
                  PLAY AGAIN
                </button>
              </>
            )}
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
              EMISSIONS: {String(score).padStart(6, '0')}
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              LEVEL {level}/3
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
