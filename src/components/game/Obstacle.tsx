import React from 'react';

interface ObstacleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'top' | 'bottom' | 'floating';
}

export const Obstacle: React.FC<ObstacleProps> = ({ x, y, width, height, type }) => {
  const isChimney = type === 'bottom';
  
  return (
    <div
      className="absolute pixel-art"
      style={{
        left: x,
        top: y,
        width,
        height: isChimney ? height + 20 : height, // Extra for chimney cap
      }}
    >
      {isChimney ? (
        <>
          {/* Smoke particles */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-full">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="absolute rounded-full bg-muted-foreground/40 animate-smoke"
                style={{
                  width: 8 + i * 4,
                  height: 8 + i * 4,
                  left: `calc(50% - ${4 + i * 2}px + ${Math.sin(i * 1.5) * 8}px)`,
                  bottom: 20 + i * 16,
                  animationDelay: `${i * 0.3}s`,
                  opacity: 0.6 - i * 0.1,
                }}
              />
            ))}
          </div>
          
          {/* Chimney cap/top */}
          <div 
            className="absolute top-0 bg-game-obstacle"
            style={{
              left: -6,
              width: width + 12,
              height: 16,
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary opacity-40" />
          </div>
          
          {/* Main chimney body */}
          <div 
            className="absolute bg-game-obstacle"
            style={{
              top: 16,
              left: 0,
              width: width,
              height: height,
            }}
          >
            {/* Brick pattern */}
            <div className="w-full h-full relative overflow-hidden">
              {Array.from({ length: Math.floor(height / 12) }).map((_, row) => (
                <div key={row} className="flex w-full" style={{ height: 12 }}>
                  {Array.from({ length: Math.ceil(width / 20) }).map((_, col) => (
                    <div
                      key={col}
                      className="border-b border-r border-background/30"
                      style={{
                        width: 20,
                        height: 12,
                        marginLeft: row % 2 === 0 ? 0 : -10,
                      }}
                    />
                  ))}
                </div>
              ))}
              {/* Chimney shadow */}
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-background/20" />
            </div>
          </div>
        </>
      ) : (
        /* Floating obstacle - keep original style */
        <div className="w-full h-full bg-secondary glow-magenta">
          <div className="w-full h-full relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary opacity-50" />
            {Array.from({ length: Math.floor(height / 8) }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-background opacity-20"
                style={{
                  left: (i % 3) * 8 + 4,
                  top: i * 8 + 4,
                }}
              />
            ))}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-background opacity-30" />
          </div>
        </div>
      )}
    </div>
  );
};