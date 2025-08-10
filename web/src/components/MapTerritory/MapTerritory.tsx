import React from 'react';
import { motion } from 'framer-motion';
import type { Territory as TerritoryType, Player } from '../../game/types';
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

  return (
    <motion.g
      className="map-territory"
      onClick={handleClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: Math.random() * 0.2 }}
    >
      <defs>
        {/* 地形パターン */}
        <pattern id={`terrain-${territory.id}`} x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="0.5" fill="#000" opacity="0.1"/>
          <circle cx="15" cy="12" r="0.7" fill="#000" opacity="0.1"/>
          <circle cx="25" cy="8" r="0.5" fill="#000" opacity="0.1"/>
          <circle cx="10" cy="20" r="0.6" fill="#000" opacity="0.1"/>
          <circle cx="20" cy="25" r="0.5" fill="#000" opacity="0.1"/>
        </pattern>
        
        {/* 影効果 */}
        <filter id={`shadow-${territory.id}`}>
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="1" dy="1" result="offsetblur"/>
          <feFlood floodColor="#000000" floodOpacity="0.3"/>
          <feComposite in2="offsetblur" operator="in"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* メインの六角形 */}
      <polygon
        points={territory.vertices.map(v => `${v.x},${v.y}`).join(' ')}
        fill={owner?.color || '#556B2F'}
        stroke={isSelected ? '#FFD700' : (isHighlighted ? '#FF6B6B' : owner?.color || '#2a4a3a')}
        strokeWidth={isSelected ? '4' : (isHighlighted ? '3' : '2')}
        opacity={owner ? 0.85 : 0.6}
        strokeLinejoin="round"
        filter={`url(#shadow-${territory.id})`}
        style={{ 
          cursor: isClickable ? 'pointer' : 'default',
          transition: 'all 0.2s ease'
        }}
      />
      
      {/* 地形テクスチャ */}
      <polygon
        points={territory.vertices.map(v => `${v.x},${v.y}`).join(' ')}
        fill={`url(#terrain-${territory.id})`}
        opacity={0.3}
        pointerEvents="none"
      />
      
      {/* 選択時のグロー効果 */}
      {isSelected && (
        <motion.polygon
          points={territory.vertices.map(v => `${v.x},${v.y}`).join(' ')}
          fill="none"
          stroke="#FFD700"
          strokeWidth="2"
          opacity={0.6}
          pointerEvents="none"
          animate={{
            opacity: [0.4, 0.8, 0.4],
            strokeWidth: [2, 3, 2]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {/* ハイライト効果 */}
      {isHighlighted && !isSelected && (
        <motion.polygon
          points={territory.vertices.map(v => `${v.x},${v.y}`).join(' ')}
          fill="#FF6B6B"
          opacity={0.2}
          pointerEvents="none"
          animate={{
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* 情報表示エリア */}
      <g className="territory-info">
        {/* 背景 */}
        <circle
          cx={territory.position.x}
          cy={territory.position.y}
          r="22"
          fill="#000"
          opacity="0.4"
        />
        <circle
          cx={territory.position.x}
          cy={territory.position.y}
          r="20"
          fill="white"
          opacity="0.95"
        />
        
        {/* サイコロアイコン */}
        <text
          x={territory.position.x}
          y={territory.position.y - 5}
          textAnchor="middle"
          fontSize="14"
          fill="#333"
        >
          🎲
        </text>
        
        {/* サイコロ数 */}
        <text
          x={territory.position.x}
          y={territory.position.y + 8}
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="#333"
        >
          {territory.diceCount}
        </text>
      </g>

      {/* プレイヤー名 */}
      {owner && (
        <text
          x={territory.position.x}
          y={territory.position.y - 32}
          textAnchor="middle"
          fontSize="9"
          fill={owner.color}
          fontWeight="bold"
          opacity="0.8"
        >
          {owner.name}
        </text>
      )}
    </motion.g>
  );
};

export default MapTerritory;