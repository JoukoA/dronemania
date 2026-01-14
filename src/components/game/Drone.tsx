import React from 'react';

interface DroneProps {
  x: number;
  y: number;
  rotation: number;
  leftPropellerActive: boolean;
  rightPropellerActive: boolean;
  isMeasuring: boolean;
}

export const Drone: React.FC<DroneProps> = ({
  x,
  y,
  rotation,
  leftPropellerActive,
  rightPropellerActive,
  isMeasuring,
}) => {
  // Both props can't be active simultaneously
  const effectiveLeft = leftPropellerActive && !rightPropellerActive;
  const effectiveRight = rightPropellerActive && !leftPropellerActive;

  return (
    <div
      className={`absolute pixel-art transition-shadow duration-200 ${
        isMeasuring ? 'measuring-glow' : ''
      }`}
      style={{
        left: x,
        top: y,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center center',
      }}
    >
      {/* Measuring indicator ring */}
      {isMeasuring && (
        <div 
          className="absolute -inset-4 rounded-full border-2 border-green-400 animate-measuring-pulse"
          style={{
            boxShadow: '0 0 20px rgba(74, 222, 128, 0.6), 0 0 40px rgba(74, 222, 128, 0.3)',
          }}
        />
      )}
      
      {/* Drone Body */}
      <div className="relative w-16 h-8">
        {/* Left Propeller Mount */}
        <div className="absolute -left-2 top-0 w-6 h-2 bg-primary" />
        
        {/* Left Propeller */}
        <div
          className={`absolute -left-4 -top-2 w-10 h-1 ${
            effectiveLeft ? 'bg-accent glow-yellow propeller-active' : 'bg-secondary'
          }`}
        />
        
        {/* Right Propeller Mount */}
        <div className="absolute -right-2 top-0 w-6 h-2 bg-primary" />
        
        {/* Right Propeller */}
        <div
          className={`absolute -right-4 -top-2 w-10 h-1 ${
            effectiveRight ? 'bg-accent glow-yellow propeller-active' : 'bg-secondary'
          }`}
        />
        
        {/* Main Body */}
        <div className={`absolute left-4 top-1 w-8 h-6 ${isMeasuring ? 'bg-green-500' : 'bg-primary'} glow-cyan transition-colors duration-200`} />
        
        {/* Body Detail */}
        <div className="absolute left-5 top-2 w-6 h-4 bg-background" />
        <div className={`absolute left-6 top-3 w-4 h-2 ${isMeasuring ? 'bg-green-400' : 'bg-secondary'} transition-colors duration-200`} />
        
        {/* Landing Skids */}
        <div className="absolute left-2 bottom-0 w-12 h-1 bg-muted" />
        <div className="absolute left-1 bottom-0 w-1 h-2 bg-muted" />
        <div className="absolute right-1 bottom-0 w-1 h-2 bg-muted" />
      </div>
    </div>
  );
};
