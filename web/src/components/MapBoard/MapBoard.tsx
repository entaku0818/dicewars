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
        {/* リアルな地図背景 */}
        <svg className="background-pattern" viewBox="0 0 800 600">
          <defs>
            {/* 海のグラデーション */}
            <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#1a3d5c', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#2a5f7f', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#1a3d5c', stopOpacity: 1 }} />
            </linearGradient>
            
            {/* 波パターン */}
            <pattern id="wavePattern" x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
              <path d="M0,10 Q25,5 50,10 T100,10" stroke="#2a5f7f" strokeWidth="0.5" fill="none" opacity="0.3"/>
              <path d="M0,15 Q25,10 50,15 T100,15" stroke="#3a6f8f" strokeWidth="0.5" fill="none" opacity="0.2"/>
            </pattern>
            
            {/* 地形テクスチャ */}
            <filter id="paperTexture">
              <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="5" result="noise" seed="2" />
              <feColorMatrix in="noise" type="saturate" values="0"/>
              <feComponentTransfer>
                <feFuncA type="discrete" tableValues=".5 .5 .5 .5 .5 .6 .7 .8 .9 1" />
              </feComponentTransfer>
              <feComposite operator="over" in2="SourceGraphic" />
            </filter>
            
            {/* グロー効果 */}
            <filter id="landGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* 海/背景 */}
          <rect width="800" height="600" fill="url(#oceanGradient)"/>
          <rect width="800" height="600" fill="url(#wavePattern)" opacity="0.5"/>
          
          {/* 大陸の影 */}
          <ellipse cx="400" cy="300" rx="380" ry="280" fill="#0a2d4a" opacity="0.3" filter="url(#landGlow)"/>
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
        
        {/* 接続線を描画しない - 六角形の境界線で十分 */}
        
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