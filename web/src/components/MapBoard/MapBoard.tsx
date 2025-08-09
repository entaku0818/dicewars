import React from 'react';
import { motion } from 'framer-motion';
import type { Territory as TerritoryType, Player } from '../../game/types';
import MapTerritory from '../MapTerritory/MapTerritory';
import './MapBoard.css';

interface MapBoardProps {
  territories: Map<string, TerritoryType>;
  players: Map<string, Player>;
  currentPlayerId: string;
  selectedTerritoryId: string | null;
  onTerritoryClick: (territoryId: string) => void;
}

const MapBoard: React.FC<MapBoardProps> = ({
  territories,
  players,
  currentPlayerId,
  selectedTerritoryId,
  onTerritoryClick,
}) => {
  // 選択中の領土から攻撃可能な領土を取得
  const getAttackableTerritories = (): Set<string> => {
    if (!selectedTerritoryId) return new Set();
    
    const selected = territories.get(selectedTerritoryId);
    if (!selected || selected.ownerId !== currentPlayerId) return new Set();
    
    const attackable = new Set<string>();
    selected.adjacentTerritoryIds.forEach(id => {
      const territory = territories.get(id);
      if (territory && territory.ownerId !== currentPlayerId) {
        attackable.add(id);
      }
    });
    
    return attackable;
  };

  const attackableTerritories = getAttackableTerritories();

  return (
    <div className="map-board">
      <div className="map-background">
        {/* 背景のグリッドパターン */}
        <svg className="background-pattern" viewBox="0 0 800 600">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#333" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
            
            {/* 地形テクスチャ */}
            <filter id="paperTexture">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" />
              <feDiffuseLighting in="noise" lightingColor="white" surfaceScale="1">
                <feDistantLight azimuth="45" elevation="60" />
              </feDiffuseLighting>
            </filter>
          </defs>
          
          <rect width="800" height="600" fill="#2a3f2a"/>
          <rect width="800" height="600" fill="url(#grid)"/>
          <rect width="800" height="600" fill="#3a4f3a" opacity="0.3" filter="url(#paperTexture)"/>
        </svg>
      </div>

      <motion.svg 
        viewBox="0 0 800 600" 
        className="board-svg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* 海/背景 */}
        <rect width="800" height="600" fill="transparent"/>
        
        {/* 接続線（道路/国境） */}
        <g className="connections">
          {Array.from(territories.values()).map(territory => (
            territory.adjacentTerritoryIds.map(adjacentId => {
              const adjacent = territories.get(adjacentId);
              if (!adjacent || territory.id > adjacentId) return null;
              
              const isAllied = territory.ownerId === adjacent.ownerId && territory.ownerId !== null;
              
              return (
                <motion.line
                  key={`${territory.id}-${adjacentId}`}
                  x1={territory.position.x}
                  y1={territory.position.y}
                  x2={adjacent.position.x}
                  y2={adjacent.position.y}
                  stroke={isAllied ? "#4a5f4a" : "#3a3a3a"}
                  strokeWidth={isAllied ? "3" : "1"}
                  strokeDasharray={isAllied ? "none" : "5,5"}
                  opacity={isAllied ? 0.6 : 0.3}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: Math.random() * 0.5 }}
                />
              );
            })
          ))}
        </g>
        
        {/* 領土 */}
        <g className="territories">
          {Array.from(territories.values()).map(territory => {
            const owner = territory.ownerId ? players.get(territory.ownerId) || null : null;
            const isSelected = territory.id === selectedTerritoryId;
            const isCurrentPlayerTerritory = territory.ownerId === currentPlayerId;
            const isEnemyTerritory = territory.ownerId !== currentPlayerId && territory.ownerId !== null;
            const isHighlighted = attackableTerritories.has(territory.id);
            
            const isClickable = (isCurrentPlayerTerritory && territory.diceCount > 1) || 
                              (selectedTerritoryId && isEnemyTerritory);
            
            return (
              <MapTerritory
                key={territory.id}
                territory={territory}
                owner={owner}
                isSelected={isSelected}
                isClickable={isClickable}
                isHighlighted={isHighlighted}
                onClick={() => onTerritoryClick(territory.id)}
              />
            );
          })}
        </g>

        {/* 装飾要素 */}
        <g className="decorations">
          {/* コンパスローズ */}
          <g transform="translate(750, 550)">
            <circle r="30" fill="none" stroke="#666" strokeWidth="2" opacity="0.5"/>
            <text x="0" y="-35" textAnchor="middle" fill="#666" fontSize="12">N</text>
            <text x="35" y="5" textAnchor="middle" fill="#666" fontSize="12">E</text>
            <text x="0" y="40" textAnchor="middle" fill="#666" fontSize="12">S</text>
            <text x="-35" y="5" textAnchor="middle" fill="#666" fontSize="12">W</text>
            <path d="M 0,-25 L 5,-5 L 0,-10 L -5,-5 Z" fill="#666" opacity="0.7"/>
          </g>
        </g>
      </motion.svg>
    </div>
  );
};

export default MapBoard;