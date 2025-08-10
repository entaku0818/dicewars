import React from 'react';
import type { Territory as TerritoryType, Player } from '../../game/types';
import Territory from '../Territory/Territory';
import './Board.css';

interface BoardProps {
  territories: Map<string, TerritoryType>;
  players: Map<string, Player>;
  currentPlayerId: string;
  selectedTerritoryId: string | null;
  onTerritoryClick: (territoryId: string) => void;
}

const Board: React.FC<BoardProps> = ({
  territories,
  players,
  currentPlayerId,
  selectedTerritoryId,
  onTerritoryClick,
}) => {
  return (
    <div className="board">
      <svg viewBox="0 0 640 480" className="board-svg">
        {/* 接続線を描画 */}
        {Array.from(territories.values()).map(territory => (
          territory.adjacentTerritoryIds.map(adjacentId => {
            const adjacent = territories.get(adjacentId);
            if (!adjacent) return null;
            // 重複を避けるため、IDの順序でフィルタリング
            if (territory.id > adjacentId) return null;
            
            return (
              <line
                key={`${territory.id}-${adjacentId}`}
                x1={territory.position.x}
                y1={territory.position.y}
                x2={adjacent.position.x}
                y2={adjacent.position.y}
                stroke="#333"
                strokeWidth="1"
                opacity="0.3"
              />
            );
          })
        ))}
        
        {/* 領土を描画 */}
        {Array.from(territories.values()).map(territory => {
          const owner = territory.ownerId ? players.get(territory.ownerId) || null : null;
          const isSelected = territory.id === selectedTerritoryId;
          const isCurrentPlayerTerritory = territory.ownerId === currentPlayerId;
          const isEnemyTerritory = territory.ownerId !== currentPlayerId && territory.ownerId !== null;
          
          // クリック可能：自分の領土（サイコロ2個以上）または選択中の場合の敵領土
          const isClickable = (isCurrentPlayerTerritory && territory.diceCount > 1) || 
                            (selectedTerritoryId && isEnemyTerritory);
          
          return (
            <Territory
              key={territory.id}
              territory={territory}
              owner={owner}
              isSelected={isSelected}
              isClickable={!!isClickable}
              onClick={() => onTerritoryClick(territory.id)}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default Board;