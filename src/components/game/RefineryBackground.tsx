import React from 'react';

interface RefineryBackgroundProps {
  scrollOffset: number;
  level: number;
}

// Level color schemes
const levelThemes = {
  1: {
    sky: 'linear-gradient(180deg, #1a2a3a 0%, #2d4a5a 50%, #4a6a7a 100%)',
    buildings: '#0a1520',
    buildingHighlight: '#1a3040',
    pipes: '#2a4a5a',
    ground: '#0a1520',
    smoke: 'rgba(200, 220, 240, 0.3)',
  },
  2: {
    sky: 'linear-gradient(180deg, #2a1a1a 0%, #4a2a2a 50%, #6a4a3a 100%)',
    buildings: '#1a0a0a',
    buildingHighlight: '#3a1a1a',
    pipes: '#5a2a2a',
    ground: '#1a0a0a',
    smoke: 'rgba(255, 200, 150, 0.4)',
  },
  3: {
    sky: 'linear-gradient(180deg, #1a1a2a 0%, #2a2a4a 50%, #4a4a6a 100%)',
    buildings: '#0a0a1a',
    buildingHighlight: '#1a1a3a',
    pipes: '#3a3a5a',
    ground: '#0a0a1a',
    smoke: 'rgba(180, 180, 255, 0.3)',
  },
};

export const RefineryBackground: React.FC<RefineryBackgroundProps> = ({ scrollOffset, level }) => {
  const theme = levelThemes[level as keyof typeof levelThemes] || levelThemes[1];
  
  // Generate consistent building silhouettes
  const generateBuildings = (layer: number, count: number, baseHeight: number) => {
    const buildings = [];
    const parallaxSpeed = layer === 1 ? 0.1 : layer === 2 ? 0.3 : 0.5;
    const offset = (scrollOffset * parallaxSpeed) % (count * 120);
    
    for (let i = 0; i < count + 2; i++) {
      const seed = (i * 7 + layer * 13) % 100;
      const height = baseHeight + (seed % 50) * (layer === 3 ? 2 : 1);
      const width = 60 + (seed % 40);
      const x = i * 120 - offset;
      
      buildings.push(
        <g key={`building-${layer}-${i}`} transform={`translate(${x}, 0)`}>
          {/* Main building */}
          <rect
            x={0}
            y={480 - 48 - height}
            width={width}
            height={height}
            fill={theme.buildings}
          />
          {/* Building highlight */}
          <rect
            x={4}
            y={480 - 48 - height + 4}
            width={8}
            height={height - 8}
            fill={theme.buildingHighlight}
            opacity={0.5}
          />
          
          {/* Windows */}
          {Array.from({ length: Math.floor(height / 30) }).map((_, wi) => (
            <React.Fragment key={`window-${wi}`}>
              <rect
                x={8 + ((seed + wi) % 3) * 12}
                y={480 - 48 - height + 10 + wi * 30}
                width={6}
                height={10}
                fill={((seed + wi) % 5 === 0) ? '#ffff88' : theme.buildingHighlight}
                opacity={((seed + wi) % 5 === 0) ? 0.8 : 0.3}
              />
            </React.Fragment>
          ))}
          
          {/* Smokestacks on some buildings */}
          {seed % 3 === 0 && (
            <>
              <rect
                x={width / 2 - 6}
                y={480 - 48 - height - 40}
                width={12}
                height={40}
                fill={theme.pipes}
              />
              {/* Smoke puff */}
              <circle
                cx={width / 2}
                cy={480 - 48 - height - 50 - (scrollOffset * 0.5 + seed) % 30}
                r={8 + (scrollOffset * 0.3 + seed) % 10}
                fill={theme.smoke}
                opacity={0.6 - ((scrollOffset * 0.3 + seed) % 30) / 60}
              />
            </>
          )}
        </g>
      );
    }
    return buildings;
  };

  // Generate pipe network
  const generatePipes = () => {
    const pipes = [];
    const offset = (scrollOffset * 0.4) % 300;
    
    for (let i = 0; i < 6; i++) {
      const x = i * 150 - offset;
      const seed = (i * 17) % 100;
      
      pipes.push(
        <g key={`pipe-${i}`} transform={`translate(${x}, 0)`}>
          {/* Horizontal pipe */}
          <rect
            x={0}
            y={380 - (seed % 40)}
            width={140}
            height={8}
            fill={theme.pipes}
          />
          {/* Vertical connectors */}
          <rect
            x={30 + (seed % 30)}
            y={380 - (seed % 40)}
            width={8}
            height={60 + (seed % 30)}
            fill={theme.pipes}
          />
          {/* Pipe joints */}
          <circle
            cx={34 + (seed % 30)}
            cy={380 - (seed % 40)}
            r={6}
            fill={theme.buildingHighlight}
          />
        </g>
      );
    }
    return pipes;
  };

  // Generate storage tanks
  const generateTanks = () => {
    const tanks = [];
    const offset = (scrollOffset * 0.25) % 400;
    
    for (let i = 0; i < 4; i++) {
      const x = i * 200 - offset;
      const seed = (i * 23) % 100;
      const radius = 35 + (seed % 20);
      
      tanks.push(
        <g key={`tank-${i}`} transform={`translate(${x}, 0)`}>
          {/* Tank body */}
          <ellipse
            cx={radius}
            cy={480 - 48 - radius * 0.6}
            rx={radius}
            ry={radius * 0.6}
            fill={theme.buildings}
          />
          <rect
            x={0}
            y={480 - 48 - radius * 1.4}
            width={radius * 2}
            height={radius * 0.8}
            fill={theme.buildings}
          />
          <ellipse
            cx={radius}
            cy={480 - 48 - radius * 1.4}
            rx={radius}
            ry={radius * 0.4}
            fill={theme.buildingHighlight}
          />
          {/* Tank stripes */}
          <rect
            x={radius - 2}
            y={480 - 48 - radius * 1.2}
            width={4}
            height={radius * 0.6}
            fill={theme.pipes}
            opacity={0.5}
          />
        </g>
      );
    }
    return tanks;
  };

  // Generate cracking towers (tall industrial columns)
  const generateTowers = () => {
    const towers = [];
    const offset = (scrollOffset * 0.35) % 500;
    
    for (let i = 0; i < 4; i++) {
      const x = 100 + i * 250 - offset;
      const seed = (i * 31) % 100;
      const height = 150 + (seed % 80);
      
      towers.push(
        <g key={`tower-${i}`} transform={`translate(${x}, 0)`}>
          {/* Tower body */}
          <rect
            x={0}
            y={480 - 48 - height}
            width={25}
            height={height}
            fill={theme.buildings}
          />
          {/* Tower segments */}
          {Array.from({ length: Math.floor(height / 25) }).map((_, si) => (
            <rect
              key={`seg-${si}`}
              x={-3}
              y={480 - 48 - height + si * 25}
              width={31}
              height={4}
              fill={theme.pipes}
            />
          ))}
          {/* Tower cap */}
          <polygon
            points={`0,${480 - 48 - height} 12.5,${480 - 48 - height - 15} 25,${480 - 48 - height}`}
            fill={theme.buildingHighlight}
          />
        </g>
      );
    }
    return towers;
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky gradient */}
      <div 
        className="absolute inset-0"
        style={{ background: theme.sky }}
      />
      
      {/* Stars/particles for level 3 */}
      {level === 3 && (
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${(i * 53 + scrollOffset * 0.05) % 100}%`,
                top: `${(i * 37) % 40}%`,
                opacity: 0.3 + (i % 5) * 0.1,
              }}
            />
          ))}
        </div>
      )}
      
      {/* SVG layers */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 640 480"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Far background - distant buildings */}
        <g opacity={0.4}>
          {generateBuildings(1, 8, 60)}
        </g>
        
        {/* Mid background - tanks and towers */}
        <g opacity={0.6}>
          {generateTanks()}
          {generateTowers()}
        </g>
        
        {/* Near background - buildings with details */}
        <g opacity={0.8}>
          {generateBuildings(2, 6, 80)}
        </g>
        
        {/* Pipe network */}
        <g opacity={0.7}>
          {generatePipes()}
        </g>
        
        {/* Ground */}
        <rect
          x={0}
          y={480 - 48}
          width={640}
          height={48}
          fill={theme.ground}
        />
        
        {/* Ground details */}
        <g>
          {Array.from({ length: 20 }).map((_, i) => (
            <rect
              key={`ground-line-${i}`}
              x={(i * 40 - scrollOffset) % 800 - 40}
              y={480 - 48}
              width={2}
              height={48}
              fill={theme.buildingHighlight}
              opacity={0.3}
            />
          ))}
        </g>
      </svg>
      
      {/* Atmospheric glow for level 2 (heat) */}
      {level === 2 && (
        <div 
          className="absolute bottom-12 left-0 right-0 h-32 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(255, 100, 50, 0.15) 100%)',
          }}
        />
      )}
      
      {/* Level indicator */}
      <div className="absolute top-2 left-2 text-xs opacity-30 text-white font-mono">
        SECTOR {level}
      </div>
    </div>
  );
};
