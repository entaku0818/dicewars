import React from 'react';
import { useGame } from '../hooks/useGame';
import MapBoard from '../components/MapBoard/MapBoard';
import PlayerPanel from '../components/PlayerPanel/PlayerPanel';
import GameUI from '../components/GameUI/GameUI';
import VictoryScreen from '../components/VictoryScreen/VictoryScreen';
import DebugPanel from '../components/DebugPanel/DebugPanel';
import type { GameConfig } from '../game/types';
import './Game.css';

interface GameProps {
  config: GameConfig;
  onBackToTitle: () => void;
}

const Game: React.FC<GameProps> = ({ config, onBackToTitle }) => {
  const {
    gameState,
    selectedTerritoryId,
    battleResult,
    isProcessing,
    handleTerritoryClick,
    handleEndTurn,
  } = useGame(config);

  return (
    <div className="game-container">
      <div className="game-header">
        <h1 className="game-title">DICEWARS</h1>
        <button className="back-to-title" onClick={onBackToTitle}>
          ← Back to Title
        </button>
      </div>

      <GameUI
        gameState={gameState}
        battleResult={battleResult}
        isProcessing={isProcessing}
        onEndTurn={handleEndTurn}
      />

      <MapBoard
        territories={gameState.territories}
        players={gameState.players}
        currentPlayerId={gameState.currentPlayerId}
        selectedTerritoryId={selectedTerritoryId}
        onTerritoryClick={handleTerritoryClick}
      />
      
      <div className="game-info">
        <PlayerPanel 
          players={gameState.players}
          currentPlayerId={gameState.currentPlayerId}
          territories={gameState.territories}
        />
      </div>

      <VictoryScreen
        winner={gameState.winnerId ? gameState.players.get(gameState.winnerId)?.name || 'Unknown' : ''}
        isVisible={gameState.phase === 'gameOver'}
        onNewGame={onBackToTitle}
        stats={{
          turns: gameState.turn,
          territoriesCaptured: 15,
          battlesWon: Math.floor(gameState.turn * 0.7)
        }}
      />

      <DebugPanel />
    </div>
  );
};

export default Game;