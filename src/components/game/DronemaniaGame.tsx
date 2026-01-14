import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Drone } from './Drone';
import { Obstacle } from './Obstacle';
import { GameUI } from './GameUI';
import { BackgroundPlaceholder } from './BackgroundPlaceholder';
import { useGameLoop, GAME_WIDTH, GAME_HEIGHT } from '@/hooks/useGameLoop';

export const DronemaniaGame: React.FC = () => {
  const {
    gameState,
    highScore,
    leftPropeller,
    rightPropeller,
    setLeftPropeller,
    setRightPropeller,
    startGame,
    startNextLevel,
    restartGame,
  } = useGameLoop();

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Calculate scale to fit screen while maintaining 640x480
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const parent = containerRef.current.parentElement;
      if (!parent) return;
      
      const maxWidth = Math.min(window.innerWidth - 32, 640);
      const maxHeight = window.innerHeight - 150; // Leave room for title and instructions
      
      const scaleX = maxWidth / GAME_WIDTH;
      const scaleY = maxHeight / GAME_HEIGHT;
      const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 1x
      
      setScale(newScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    // Don't activate propellers during menu screens
    if (gameState.gameStatus !== 'playing') return;
    
    e.preventDefault();
    
    const gameContainer = e.currentTarget as HTMLElement;
    const rect = gameContainer.getBoundingClientRect();
    
    const touches = 'touches' in e ? Array.from(e.touches) : [e.nativeEvent as MouseEvent];
    
    // Only use the last touch - both props can't be active simultaneously
    const lastTouch = touches[touches.length - 1];
    const x = ('clientX' in lastTouch ? lastTouch.clientX : 0) - rect.left;
    const halfWidth = rect.width / 2;
    
    // Reset both first, then set the appropriate one
    setLeftPropeller(false);
    setRightPropeller(false);
    
    if (x < halfWidth) {
      setLeftPropeller(true);
    } else {
      setRightPropeller(true);
    }
  }, [gameState.gameStatus, setLeftPropeller, setRightPropeller]);

  const handleTouchEnd = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    // Don't process during menu screens
    if (gameState.gameStatus !== 'playing') return;
    
    e.preventDefault();
    
    // For touch events, check remaining touches
    if ('touches' in e) {
      const gameContainer = e.currentTarget as HTMLElement;
      const rect = gameContainer.getBoundingClientRect();
      
      // Reset both propellers
      setLeftPropeller(false);
      setRightPropeller(false);
      
      // Only use the last remaining touch - both props can't be active simultaneously
      if (e.touches.length > 0) {
        const lastTouch = e.touches[e.touches.length - 1];
        const x = lastTouch.clientX - rect.left;
        const halfWidth = rect.width / 2;
        
        if (x < halfWidth) {
          setLeftPropeller(true);
        } else {
          setRightPropeller(true);
        }
      }
    } else {
      // Mouse event - release both
      setLeftPropeller(false);
      setRightPropeller(false);
    }
  }, [gameState.gameStatus, setLeftPropeller, setRightPropeller]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-2 md:p-4">
      {/* Title */}
      <h1 className="text-xl md:text-2xl text-primary retro-text-shadow mb-2 md:mb-4 text-center">
        DRONEMANIA
      </h1>
      
      {/* Game Container - Fixed 640x480 with scaling */}
      <div
        ref={containerRef}
        className="relative retro-border bg-game-sky overflow-hidden scanlines select-none"
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={() => {
          setLeftPropeller(false);
          setRightPropeller(false);
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => {
          setLeftPropeller(false);
          setRightPropeller(false);
        }}
      >
        {/* Background */}
        <BackgroundPlaceholder scrollOffset={gameState.scrollOffset} />
        
        {/* Obstacles */}
        {gameState.obstacles.map((obstacle) => (
          <Obstacle
            key={obstacle.id}
            x={obstacle.x - gameState.scrollOffset}
            y={obstacle.y}
            width={obstacle.width}
            height={obstacle.height}
            type={obstacle.type}
          />
        ))}
        
        {/* Drone */}
        <Drone
          x={gameState.droneX - 24}
          y={gameState.droneY - 12}
          rotation={gameState.droneRotation}
          leftPropellerActive={leftPropeller}
          rightPropellerActive={rightPropeller}
          isMeasuring={gameState.isMeasuring}
        />
        
        {/* UI Overlay */}
        <GameUI
          score={gameState.score}
          highScore={highScore}
          level={gameState.level}
          levelProgress={gameState.levelProgress}
          isMeasuring={gameState.isMeasuring}
          gameState={gameState.gameStatus}
          onStart={startGame}
          onRestart={restartGame}
          onNextLevel={startNextLevel}
        />
        
        {/* Touch indicators during gameplay */}
        {gameState.gameStatus === 'playing' && (
          <>
            <div 
              className={`absolute left-0 top-0 w-1/2 h-full transition-colors duration-100 pointer-events-none ${
                leftPropeller && !rightPropeller ? 'bg-primary/10' : 'bg-transparent'
              }`}
            />
            <div 
              className={`absolute right-0 top-0 w-1/2 h-full transition-colors duration-100 pointer-events-none ${
                rightPropeller && !leftPropeller ? 'bg-secondary/10' : 'bg-transparent'
              }`}
            />
          </>
        )}
      </div>
      
      {/* Spacer to account for scaled height */}
      <div style={{ height: GAME_HEIGHT * scale - GAME_HEIGHT + 16 }} />
      
      {/* Instructions */}
      <div className="text-center">
        <p className="text-[8px] md:text-xs text-muted-foreground">
          ← → ARROWS (ONE AT A TIME) | TAP LEFT/RIGHT
        </p>
      </div>
    </div>
  );
};
