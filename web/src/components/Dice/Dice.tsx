import React from 'react';
import './Dice.css';

interface DiceProps {
  value: number;
  color?: string;
  size?: number;
  isRolling?: boolean;
}

const Dice: React.FC<DiceProps> = ({ 
  value, 
  color = '#fff', 
  size = 40,
  isRolling = false 
}) => {
  const dots: React.ReactElement[] = [];
  const dotPositions: { [key: number]: number[][] } = {
    1: [[50, 50]],
    2: [[30, 30], [70, 70]],
    3: [[30, 30], [50, 50], [70, 70]],
    4: [[30, 30], [30, 70], [70, 30], [70, 70]],
    5: [[30, 30], [30, 70], [50, 50], [70, 30], [70, 70]],
    6: [[30, 30], [30, 50], [30, 70], [70, 30], [70, 50], [70, 70]]
  };

  const positions = dotPositions[Math.min(Math.max(1, value), 6)] || dotPositions[1];
  
  positions.forEach((pos, index) => {
    dots.push(
      <circle
        key={index}
        cx={pos[0]}
        cy={pos[1]}
        r="8"
        fill={color}
      />
    );
  });

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100"
      className={`dice ${isRolling ? 'rolling' : ''}`}
    >
      <rect
        x="5"
        y="5"
        width="90"
        height="90"
        rx="10"
        fill="#222"
        stroke={color}
        strokeWidth="2"
      />
      {dots}
    </svg>
  );
};

export default Dice;