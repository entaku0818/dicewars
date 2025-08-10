import React from 'react';
import './DoomCounter.css';

interface DoomCounterProps {
  turn: number;
}

const DoomCounter: React.FC<DoomCounterProps> = ({ turn }) => {
  return (
    <div className="doom-counter">
      <div className="doom-content">
        <div className="turn-display">
          <span className="turn-label">ターン</span>
          <span className="turn-number">{turn}</span>
        </div>
      </div>
    </div>
  );
};

export default DoomCounter;