import React from 'react';

interface ObstacleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'top' | 'bottom' | 'floating';
}

export const Obstacle: React.FC<ObstacleProps> = ({ x, y, width, height, type }) => {
  return (
    <div
      className="absolute pixel-art"
      style={{
        left: x,
        top: y,
        width,
        height,
      }}
    >
      {/* Main obstacle block */}
      <div 
        className={`w-full h-full ${
          type === 'floating' ? 'bg-secondary glow-magenta' : 'bg-game-obstacle'
        }`}
      >
        {/* Pixel detail pattern */}
        <div className="w-full h-full relative overflow-hidden">
          {/* Top edge highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary opacity-50" />
          
          {/* Chunky pixel pattern */}
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
          
          {/* Bottom edge shadow */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-background opacity-30" />
        </div>
      </div>
    </div>
  );
};
