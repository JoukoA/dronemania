import { useCallback, useEffect, useRef, useState } from 'react';

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'chimney' | 'flare';
}

interface GameState {
  droneX: number;
  droneY: number;
  droneVelocityY: number;
  droneRotation: number;
  scrollOffset: number;
  obstacles: Obstacle[];
  score: number;
  level: number;
  levelProgress: number;
  isMeasuring: boolean;
  gameStatus: 'ready' | 'playing' | 'gameover' | 'levelcomplete';
}

export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 480;
const DRONE_SIZE = 48;
const GRAVITY = 0.12;
const LIFT_FORCE = 0.28;
const MAX_VELOCITY = 5;
const ROTATION_SPEED = 2;
const MAX_ROTATION = 45;
const BASE_SPEED = 0.5;
const MAX_SPEED = 4;
const OBSTACLE_SPAWN_DISTANCE = 250;
const GROUND_HEIGHT = 48;
const MEASURING_DISTANCE = 60;
const LEVEL_LENGTH = 3000; // scroll distance per level

export const useGameLoop = () => {
  const [gameState, setGameState] = useState<GameState>({
    droneX: 150,
    droneY: GAME_HEIGHT / 2,
    droneVelocityY: 0,
    droneRotation: 0,
    scrollOffset: 0,
    obstacles: [],
    score: 0,
    level: 1,
    levelProgress: 0,
    isMeasuring: false,
    gameStatus: 'ready',
  });

  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('dronemania-highscore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [leftPropeller, setLeftPropeller] = useState(false);
  const [rightPropeller, setRightPropeller] = useState(false);

  const gameLoopRef = useRef<number>();
  const lastObstacleRef = useRef(0);
  const obstacleIdRef = useRef(0);
  const levelStartOffset = useRef(0);

  const generateObstacle = useCallback((scrollOffset: number, level: number): Obstacle[] => {
    const obstacles: Obstacle[] = [];
    
    // Generate chimneys of varying heights
    const chimneyWidth = 50 + Math.random() * 30;
    const chimneyHeight = 100 + Math.random() * 200;
    
    obstacles.push({
      id: obstacleIdRef.current++,
      x: GAME_WIDTH + scrollOffset + 50,
      y: GAME_HEIGHT - chimneyHeight - GROUND_HEIGHT,
      width: chimneyWidth,
      height: chimneyHeight,
      type: 'chimney',
    });

    // Level 2+: Add flares between chimneys
    if (level >= 2 && Math.random() > 0.5) {
      const flareX = GAME_WIDTH + scrollOffset + 150 + Math.random() * 100;
      const flareWidth = 40 + Math.random() * 20;
      const flareHeight = 60 + Math.random() * 40;
      
      obstacles.push({
        id: obstacleIdRef.current++,
        x: flareX,
        y: GAME_HEIGHT - flareHeight - GROUND_HEIGHT,
        width: flareWidth,
        height: flareHeight,
        type: 'flare',
      });
    }

    return obstacles;
  }, []);

  const checkCollision = useCallback((
    droneX: number,
    droneY: number,
    obstacles: Obstacle[],
    scrollOffset: number
  ): boolean => {
    // Check ground collision
    if (droneY + DRONE_SIZE / 2 > GAME_HEIGHT - GROUND_HEIGHT) {
      return true;
    }

    // Check ceiling collision
    if (droneY - DRONE_SIZE / 2 < 0) {
      return true;
    }

    // Check obstacle collisions
    const droneLeft = droneX - DRONE_SIZE / 2 + 10;
    const droneRight = droneX + DRONE_SIZE / 2 - 10;
    const droneTop = droneY - DRONE_SIZE / 4;
    const droneBottom = droneY + DRONE_SIZE / 4;

    for (const obs of obstacles) {
      const obsLeft = obs.x - scrollOffset;
      const obsRight = obs.x - scrollOffset + obs.width;
      const obsTop = obs.y;
      const obsBottom = obs.y + obs.height;

      if (
        droneRight > obsLeft &&
        droneLeft < obsRight &&
        droneBottom > obsTop &&
        droneTop < obsBottom
      ) {
        return true;
      }
    }

    return false;
  }, []);

  const checkMeasuring = useCallback((
    droneX: number,
    droneY: number,
    obstacles: Obstacle[],
    scrollOffset: number
  ): boolean => {
    for (const obs of obstacles) {
      if (obs.type !== 'chimney') continue;
      
      const obsCenter = obs.x - scrollOffset + obs.width / 2;
      const obsTop = obs.y;
      
      // Check if drone is above the chimney and within measuring distance
      const distX = Math.abs(droneX - obsCenter);
      const distY = obsTop - droneY;
      
      if (distX < obs.width && distY > 0 && distY < MEASURING_DISTANCE) {
        return true;
      }
    }
    return false;
  }, []);

  const startGame = useCallback(() => {
    setGameState({
      droneX: 150,
      droneY: GAME_HEIGHT / 2,
      droneVelocityY: 0,
      droneRotation: 0,
      scrollOffset: 0,
      obstacles: [],
      score: 0,
      level: 1,
      levelProgress: 0,
      isMeasuring: false,
      gameStatus: 'playing',
    });
    lastObstacleRef.current = 0;
    levelStartOffset.current = 0;
  }, []);

  const startNextLevel = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      droneX: 150,
      droneY: GAME_HEIGHT / 2,
      droneVelocityY: 0,
      droneRotation: 0,
      obstacles: [],
      level: prev.level + 1,
      levelProgress: 0,
      isMeasuring: false,
      gameStatus: 'playing',
    }));
    lastObstacleRef.current = 0;
  }, []);

  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  // Game loop
  useEffect(() => {
    if (gameState.gameStatus !== 'playing') {
      return;
    }

    const gameLoop = () => {
      setGameState((prev) => {
        // Both props can't be active simultaneously - enforce exclusive control
        const effectiveLeft = leftPropeller && !rightPropeller;
        const effectiveRight = rightPropeller && !leftPropeller;
        
        // Calculate lift and rotation based on propellers
        let lift = GRAVITY; // Default: falling
        let targetRotation = 0;

        if (effectiveLeft) {
          // Only left: rise and tilt right (nose down = forward)
          lift = -LIFT_FORCE * 0.7;
          targetRotation = MAX_ROTATION;
        } else if (effectiveRight) {
          // Only right: rise and tilt left (nose up = backward)
          lift = -LIFT_FORCE * 0.7;
          targetRotation = -MAX_ROTATION;
        }
        // If both are pressed, neither is effective - drone falls

        // Update velocity with lift/gravity
        let newVelocityY = prev.droneVelocityY + lift;
        newVelocityY = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, newVelocityY));

        // Update position
        const newDroneY = prev.droneY + newVelocityY;

        // Smoothly rotate towards target
        let newRotation = prev.droneRotation;
        if (newRotation < targetRotation) {
          newRotation = Math.min(targetRotation, newRotation + ROTATION_SPEED);
        } else if (newRotation > targetRotation) {
          newRotation = Math.max(targetRotation, newRotation - ROTATION_SPEED);
        }

        // Speed controlled by pitch - tilt forward (positive rotation) = faster
        const pitchFactor = newRotation / MAX_ROTATION; // -1 to 1
        const scrollSpeed = BASE_SPEED + (pitchFactor + 1) * (MAX_SPEED - BASE_SPEED) / 2;
        const newScrollOffset = prev.scrollOffset + Math.max(0, scrollSpeed);

        // Check level progress
        const levelProgress = ((newScrollOffset - levelStartOffset.current) / LEVEL_LENGTH) * 100;
        
        // Level complete check
        if (levelProgress >= 100 && prev.level < 3) {
          const finalScore = prev.score;
          if (finalScore > highScore) {
            setHighScore(finalScore);
            localStorage.setItem('dronemania-highscore', String(finalScore));
          }
          levelStartOffset.current = newScrollOffset;
          return {
            ...prev,
            droneY: newDroneY,
            droneVelocityY: newVelocityY,
            droneRotation: newRotation,
            scrollOffset: newScrollOffset,
            levelProgress: 100,
            gameStatus: 'levelcomplete' as const,
          };
        }

        // Spawn new obstacles
        let newObstacles = [...prev.obstacles];
        if (newScrollOffset - lastObstacleRef.current > OBSTACLE_SPAWN_DISTANCE) {
          newObstacles = [...newObstacles, ...generateObstacle(newScrollOffset, prev.level)];
          lastObstacleRef.current = newScrollOffset;
        }

        // Remove off-screen obstacles
        newObstacles = newObstacles.filter(
          (obs) => obs.x - newScrollOffset > -100
        );

        // Check collisions
        if (checkCollision(prev.droneX, newDroneY, newObstacles, newScrollOffset)) {
          // Game over
          const finalScore = prev.score;
          if (finalScore > highScore) {
            setHighScore(finalScore);
            localStorage.setItem('dronemania-highscore', String(finalScore));
          }
          return {
            ...prev,
            droneY: newDroneY,
            droneRotation: newRotation,
            scrollOffset: newScrollOffset,
            obstacles: newObstacles,
            gameStatus: 'gameover' as const,
          };
        }

        // Check if measuring emissions (near chimney top)
        const isMeasuring = checkMeasuring(prev.droneX, newDroneY, newObstacles, newScrollOffset);
        
        // Score: base points + bonus for measuring
        const baseScore = Math.floor(newScrollOffset / 50);
        const measureBonus = isMeasuring ? 5 : 0;
        const newScore = prev.score + measureBonus;

        return {
          ...prev,
          droneY: newDroneY,
          droneVelocityY: newVelocityY,
          droneRotation: newRotation,
          scrollOffset: newScrollOffset,
          obstacles: newObstacles,
          score: newScore,
          levelProgress: Math.min(levelProgress, 100),
          isMeasuring,
        };
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.gameStatus, leftPropeller, rightPropeller, generateObstacle, checkCollision, checkMeasuring, highScore]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setLeftPropeller(true);
      } else if (e.key === 'ArrowRight') {
        setRightPropeller(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setLeftPropeller(false);
      } else if (e.key === 'ArrowRight') {
        setRightPropeller(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return {
    gameState,
    highScore,
    leftPropeller,
    rightPropeller,
    setLeftPropeller,
    setRightPropeller,
    startGame,
    startNextLevel,
    restartGame,
  };
};
