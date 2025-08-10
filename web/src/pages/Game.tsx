import React from 'react';
import { useGame } from '../hooks/useGame';
import MapBoard from '../components/MapBoard/MapBoard';
import PlayerPanel from '../components/PlayerPanel/PlayerPanel';
import GameUI from '../components/GameUI/GameUI';
import VictoryScreen from '../components/VictoryScreen/VictoryScreen';
import DebugPanel from '../components/DebugPanel/DebugPanel';
import './Game.css';

const Game: React.FC = () => {
  const {
    gameState,
    selectedTerritoryId,
    battleResult,
    isProcessing,
    handleTerritoryClick,
    handleEndTurn,
  } = useGame({
    playerCount: 4,
    mapSize: 'small',
    aiDifficulty: 'normal',
  });

  return (
    <div className="game-container">
      <h1 className="game-title">DICEWARS</h1>

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
        onNewGame={() => window.location.reload()}
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