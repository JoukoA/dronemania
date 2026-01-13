import { useCallback, useEffect, useRef, useState } from 'react';

interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'top' | 'bottom' | 'floating';
}

interface GameState {
  droneX: number;
  droneY: number;
  droneVelocityY: number;
  droneRotation: number;
  scrollOffset: number;
  obstacles: Obstacle[];
  score: number;
  gameStatus: 'ready' | 'playing' | 'gameover';
}

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const DRONE_SIZE = 64;
const GRAVITY = 0.15;
const LIFT_FORCE = 0.35;
const MAX_VELOCITY = 6;
const ROTATION_SPEED = 2;
const MAX_ROTATION = 30;
const SCROLL_SPEED = 3;
const OBSTACLE_SPAWN_DISTANCE = 300;
const GROUND_HEIGHT = 64;

export const useGameLoop = () => {
  const [gameState, setGameState] = useState<GameState>({
    droneX: 150,
    droneY: GAME_HEIGHT / 2,
    droneVelocityY: 0,
    droneRotation: 0,
    scrollOffset: 0,
    obstacles: [],
    score: 0,
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

  const generateObstacle = useCallback((scrollOffset: number): Obstacle[] => {
    const obstacles: Obstacle[] = [];
    const rand = Math.random();

    if (rand < 0.4) {
      // Gap obstacle (top and bottom)
      const gapY = 150 + Math.random() * (GAME_HEIGHT - 300 - GROUND_HEIGHT);
      const gapHeight = 120 + Math.random() * 60;

      obstacles.push({
        id: obstacleIdRef.current++,
        x: GAME_WIDTH + scrollOffset + 50,
        y: 0,
        width: 40,
        height: gapY - gapHeight / 2,
        type: 'top',
      });

      obstacles.push({
        id: obstacleIdRef.current++,
        x: GAME_WIDTH + scrollOffset + 50,
        y: gapY + gapHeight / 2,
        width: 40,
        height: GAME_HEIGHT - gapY - gapHeight / 2 - GROUND_HEIGHT,
        type: 'bottom',
      });
    } else if (rand < 0.7) {
      // Floating obstacle
      obstacles.push({
        id: obstacleIdRef.current++,
        x: GAME_WIDTH + scrollOffset + 50,
        y: 100 + Math.random() * (GAME_HEIGHT - 300 - GROUND_HEIGHT),
        width: 60 + Math.random() * 40,
        height: 30 + Math.random() * 30,
        type: 'floating',
      });
    } else {
      // Stalactite or stalagmite
      const fromTop = Math.random() > 0.5;
      const height = 80 + Math.random() * 120;
      obstacles.push({
        id: obstacleIdRef.current++,
        x: GAME_WIDTH + scrollOffset + 50,
        y: fromTop ? 0 : GAME_HEIGHT - height - GROUND_HEIGHT,
        width: 30,
        height,
        type: fromTop ? 'top' : 'bottom',
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

  const startGame = useCallback(() => {
    setGameState({
      droneX: 150,
      droneY: GAME_HEIGHT / 2,
      droneVelocityY: 0,
      droneRotation: 0,
      scrollOffset: 0,
      obstacles: [],
      score: 0,
      gameStatus: 'playing',
    });
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
        // Calculate lift and rotation based on propellers
        let lift = GRAVITY; // Default: falling
        let targetRotation = 0;

        if (leftPropeller && rightPropeller) {
          // Both propellers: rise straight
          lift = -LIFT_FORCE;
          targetRotation = 0;
        } else if (leftPropeller) {
          // Only left: rise and tilt right
          lift = -LIFT_FORCE * 0.5;
          targetRotation = MAX_ROTATION;
        } else if (rightPropeller) {
          // Only right: rise and tilt left
          lift = -LIFT_FORCE * 0.5;
          targetRotation = -MAX_ROTATION;
        }

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

        // Update scroll
        const newScrollOffset = prev.scrollOffset + SCROLL_SPEED;

        // Spawn new obstacles
        let newObstacles = [...prev.obstacles];
        if (newScrollOffset - lastObstacleRef.current > OBSTACLE_SPAWN_DISTANCE) {
          newObstacles = [...newObstacles, ...generateObstacle(newScrollOffset)];
          lastObstacleRef.current = newScrollOffset;
        }

        // Remove off-screen obstacles
        newObstacles = newObstacles.filter(
          (obs) => obs.x - newScrollOffset > -100
        );

        // Check collisions
        if (checkCollision(prev.droneX, newDroneY, newObstacles, newScrollOffset)) {
          // Game over
          const finalScore = Math.floor(newScrollOffset / 10);
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
            score: finalScore,
            gameStatus: 'gameover' as const,
          };
        }

        return {
          ...prev,
          droneY: newDroneY,
          droneVelocityY: newVelocityY,
          droneRotation: newRotation,
          scrollOffset: newScrollOffset,
          obstacles: newObstacles,
          score: Math.floor(newScrollOffset / 10),
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
  }, [gameState.gameStatus, leftPropeller, rightPropeller, generateObstacle, checkCollision, highScore]);

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
    restartGame,
  };
};
