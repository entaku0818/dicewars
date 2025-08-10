import React from 'react';
import type { Territory as TerritoryType, Player } from '../../game/types';
import { soundManager } from '../../game/sound/SoundManager';
import './Territory.css';

interface TerritoryProps {
  territory: TerritoryType;
  owner: Player | null;
  isSelected: boolean;
  isClickable: boolean;
  onClick: () => void;
}

const Territory: React.FC<TerritoryProps> = ({
  territory,
  owner,
  isSelected,
  isClickable,
  onClick,
}) => {
  const handleClick = () => {
    if (isClickable || isSelected) {
      onClick();
    }
  };

  return (
    <g
      className={`territory ${isClickable ? 'clickable' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
      onMouseEnter={() => isClickable && soundManager.play('hover', 0.2)}
    >
      {/* 領土の円 */}
      <circle
        cx={territory.position.x}
        cy={territory.position.y}
        r="30"
        fill={owner ? owner.color : '#666'}
        stroke={isSelected ? '#FFD700' : '#000'}
        strokeWidth={isSelected ? 3 : 1}
        opacity={0.8}
      />
      
      {/* サイコロ数の表示 */}
      <text
        x={territory.position.x}
        y={territory.position.y + 5}
        textAnchor="middle"
        className="dice-count"
        fill="white"
        fontSize="20"
        fontWeight="bold"
      >
        {territory.diceCount}
      </text>
      
      {/* プレイヤー名表示 */}
      <text
        x={territory.position.x}
        y={territory.position.y - 20}
        textAnchor="middle"
        fontSize="11"
        fill="white"
        fontWeight="bold"
      >
        {owner?.name || 'Empty'}
      </text>
    </g>
  );
};

export default Territory;