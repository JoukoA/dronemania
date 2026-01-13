import React from 'react';

interface DroneProps {
  x: number;
  y: number;
  rotation: number;
  leftPropellerActive: boolean;
  rightPropellerActive: boolean;
}

export const Drone: React.FC<DroneProps> = ({
  x,
  y,
  rotation,
  leftPropellerActive,
  rightPropellerActive,
}) => {
  return (
    <div
      className="absolute pixel-art"
      style={{
        left: x,
        top: y,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center center',
      }}
    >
      {/* Drone Body */}
      <div className="relative w-16 h-8">
        {/* Left Propeller Mount */}
        <div className="absolute -left-2 top-0 w-6 h-2 bg-primary" />
        
        {/* Left Propeller */}
        <div
          className={`absolute -left-4 -top-2 w-10 h-1 ${
            leftPropellerActive ? 'bg-accent glow-yellow propeller-active' : 'bg-secondary'
          }`}
        />
        
        {/* Right Propeller Mount */}
        <div className="absolute -right-2 top-0 w-6 h-2 bg-primary" />
        
        {/* Right Propeller */}
        <div
          className={`absolute -right-4 -top-2 w-10 h-1 ${
            rightPropellerActive ? 'bg-accent glow-yellow propeller-active' : 'bg-secondary'
          }`}
        />
        
        {/* Main Body */}
        <div className="absolute left-4 top-1 w-8 h-6 bg-primary glow-cyan" />
        
        {/* Body Detail */}
        <div className="absolute left-5 top-2 w-6 h-4 bg-background" />
        <div className="absolute left-6 top-3 w-4 h-2 bg-secondary" />
        
        {/* Landing Skids */}
        <div className="absolute left-2 bottom-0 w-12 h-1 bg-muted" />
        <div className="absolute left-1 bottom-0 w-1 h-2 bg-muted" />
        <div className="absolute right-1 bottom-0 w-1 h-2 bg-muted" />
      </div>
    </div>
  );
};
