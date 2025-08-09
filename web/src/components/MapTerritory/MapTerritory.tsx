import React from 'react';
import { motion } from 'framer-motion';
import type { Territory as TerritoryType, Player, Position } from '../../game/types';
import './MapTerritory.css';

interface MapTerritoryProps {
  territory: TerritoryType;
  owner: Player | null;
  isSelected: boolean;
  isClickable: boolean;
  isHighlighted?: boolean;
  onClick: () => void;
}

const MapTerritory: React.FC<MapTerritoryProps> = ({
  territory,
  owner,
  isSelected,
  isClickable,
  isHighlighted = false,
  onClick,
}) => {
  const handleClick = () => {
    if (isClickable || isSelected) {
      onClick();
    }
  };

  // 多角形のパスを生成
  const generatePath = (vertices: Position[]): string => {
    if (!vertices || vertices.length < 3) {
      // フォールバック：六角形を生成
      const hexVertices = generateHexagon(territory.position, 45);
      return `M ${hexVertices.map(v => `${v.x},${v.y}`).join(' L ')} Z`;
    }
    return `M ${vertices.map(v => `${v.x},${v.y}`).join(' L ')} Z`;
  };

  const generateHexagon = (center: Position, radius: number): Position[] => {
    const vertices: Position[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6 - Math.PI / 6;
      vertices.push({
        x: center.x + Math.cos(angle) * radius,
        y: center.y + Math.sin(angle) * radius,
      });
    }
    return vertices;
  };

  const pathData = generatePath(territory.vertices || []);

  // 地形のパターンを選択
  const getTerrainPattern = () => {
    const patterns = ['terrain-grass', 'terrain-desert', 'terrain-mountain', 'terrain-forest'];
    const index = Math.abs(territory.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % patterns.length;
    return patterns[index];
  };

  const terrainClass = getTerrainPattern();

  return (
    <g
      className={`map-territory ${isClickable ? 'clickable' : ''} ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
      onClick={handleClick}
    >
      {/* 地形の背景 */}
      <defs>
        <pattern id={`${territory.id}-pattern`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill={owner?.color || '#666'} opacity="0.3"/>
          <circle cx="10" cy="10" r="2" fill={owner?.color || '#666'} opacity="0.2"/>
          <circle cx="30" cy="30" r="2" fill={owner?.color || '#666'} opacity="0.2"/>
          <circle cx="30" cy="10" r="1" fill={owner?.color || '#666'} opacity="0.15"/>
          <circle cx="10" cy="30" r="1" fill={owner?.color || '#666'} opacity="0.15"/>
        </pattern>

        <filter id={`${territory.id}-shadow`}>
          <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
        </filter>
      </defs>

      {/* メインの領土形状 */}
      <motion.path
        d={pathData}
        className={`territory-shape ${terrainClass}`}
        fill={`url(#${territory.id}-pattern)`}
        stroke={owner?.color || '#666'}
        strokeWidth={isSelected ? 3 : 2}
        filter={`url(#${territory.id}-shadow)`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: owner ? 0.9 : 0.6, 
          scale: isSelected ? 1.05 : 1,
        }}
        whileHover={isClickable ? { scale: 1.02 } : {}}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />

      {/* 国境線のハイライト */}
      {isSelected && (
        <motion.path
          d={pathData}
          fill="none"
          stroke="#FFD700"
          strokeWidth="4"
          strokeDasharray="10,5"
          opacity="0.8"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* 攻撃可能な領土のハイライト */}
      {isHighlighted && !isSelected && (
        <motion.path
          d={pathData}
          fill="none"
          stroke="#FF6B6B"
          strokeWidth="3"
          opacity="0.6"
          animate={{ 
            strokeWidth: [3, 4, 3],
            opacity: [0.4, 0.7, 0.4] 
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* サイコロ数の表示 */}
      <g className="territory-info">
        {/* 背景円 */}
        <motion.circle
          cx={territory.position.x}
          cy={territory.position.y}
          r="25"
          fill={owner?.color || '#666'}
          opacity="0.9"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        />
        
        {/* サイコロアイコン */}
        <text
          x={territory.position.x}
          y={territory.position.y - 8}
          textAnchor="middle"
          fontSize="16"
          fill="white"
        >
          🎲
        </text>
        
        {/* サイコロ数 */}
        <text
          x={territory.position.x}
          y={territory.position.y + 10}
          textAnchor="middle"
          className="dice-count"
          fill="white"
          fontSize="18"
          fontWeight="bold"
        >
          {territory.diceCount}
        </text>
      </g>

      {/* 領土名（オプション） */}
      <text
        x={territory.position.x}
        y={territory.position.y - 35}
        textAnchor="middle"
        fontSize="10"
        fill={owner?.color || '#666'}
        opacity="0.8"
        fontWeight="bold"
      >
        {owner?.name || 'Neutral'}
      </text>
    </g>
  );
};

export default MapTerritory;