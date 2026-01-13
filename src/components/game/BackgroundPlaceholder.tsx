import React from 'react';

interface BackgroundPlaceholderProps {
  scrollOffset: number;
}

export const BackgroundPlaceholder: React.FC<BackgroundPlaceholderProps> = ({ scrollOffset }) => {
  // This creates a simple grid pattern that scrolls
  // Replace this with actual background graphics later
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky gradient placeholder */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, hsl(var(--sky)) 0%, hsl(var(--muted)) 100%)',
        }}
      />
      
      {/* Scrolling grid pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
          transform: `translateX(${-scrollOffset % 32}px)`,
        }}
      />
      
      {/* Placeholder text */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center opacity-20"
        style={{
          transform: `translate(-50%, -50%) translateX(${-scrollOffset * 0.1}px)`,
        }}
      >
        <div className="text-4xl text-primary mb-2">[ BACKGROUND ]</div>
        <div className="text-xs text-muted-foreground">ROLLING BG HERE</div>
      </div>
      
      {/* Distant "mountains" placeholder */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 opacity-30"
        style={{
          transform: `translateX(${-scrollOffset * 0.3 % 200}px)`,
        }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="absolute bottom-0 bg-muted"
            style={{
              left: i * 200,
              width: 100,
              height: 40 + Math.sin(i * 1.5) * 30,
              clipPath: 'polygon(0% 100%, 50% 0%, 100% 100%)',
            }}
          />
        ))}
      </div>
      
      {/* Ground line */}
      <div className="absolute bottom-16 left-0 right-0 h-1 bg-game-ground" />
      <div 
        className="absolute bottom-0 left-0 right-0 h-16 bg-game-ground opacity-80"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 30px,
            hsl(var(--background) / 0.3) 30px,
            hsl(var(--background) / 0.3) 32px
          )`,
          transform: `translateX(${-scrollOffset % 32}px)`,
        }}
      />
    </div>
  );
};
