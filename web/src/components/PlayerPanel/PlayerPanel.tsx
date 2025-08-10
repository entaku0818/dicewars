import React from 'react';
import type { Player, Territory } from '../../game/types';
import './PlayerPanel.css';

interface PlayerPanelProps {
  players: Map<string, Player>;
  currentPlayerId: string;
  territories: Map<string, Territory>;
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({
  players,
  currentPlayerId,
  territories,
}) => {
  const getPlayerStats = (playerId: string) => {
    const playerTerritories = Array.from(territories.values())
      .filter(t => t.ownerId === playerId);
    
    const territoryCount = playerTerritories.length;
    const diceCount = playerTerritories.reduce((sum, t) => sum + t.diceCount, 0);
    
    return { territoryCount, diceCount };
  };

  return (
    <div className="player-panel">
      {Array.from(players.values()).map(player => {
        const stats = getPlayerStats(player.id);
        const isCurrent = player.id === currentPlayerId;
        
        return (
          <div
            key={player.id}
            className={`player-card ${isCurrent ? 'current' : ''}`}
            style={{ borderColor: player.color }}
          >
            <div className="player-header">
              <span 
                className="player-color-indicator" 
                style={{ backgroundColor: player.color }}
              />
              <span className="player-name">{player.name}</span>
              {isCurrent && <span className="current-indicator">▶</span>}
            </div>
            <div className="player-stats">
              <div className="stat">
                <span className="stat-value">{stats.territoryCount}</span>
                <span className="stat-label">領土</span>
              </div>
              <div className="stat">
                <span className="stat-value">{stats.diceCount}</span>
                <span className="stat-label">ダイス</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlayerPanel;