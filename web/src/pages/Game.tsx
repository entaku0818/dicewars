import React from 'react';
import { useGame } from '../hooks/useGame';
import Board from '../components/Board/Board';
import PlayerPanel from '../components/PlayerPanel/PlayerPanel';
import GameUI from '../components/GameUI/GameUI';
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
      
      <div className="game-info">
        <PlayerPanel 
          players={gameState.players}
          currentPlayerId={gameState.currentPlayerId}
          territories={gameState.territories}
        />
      </div>

      <Board
        territories={gameState.territories}
        players={gameState.players}
        currentPlayerId={gameState.currentPlayerId}
        selectedTerritoryId={selectedTerritoryId}
        onTerritoryClick={handleTerritoryClick}
      />

      <GameUI
        gameState={gameState}
        battleResult={battleResult}
        isProcessing={isProcessing}
        onEndTurn={handleEndTurn}
      />

      {gameState.phase === 'gameOver' && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>Winner: {gameState.players.get(gameState.winnerId!)?.name}</p>
          <button onClick={() => window.location.reload()}>New Game</button>
        </div>
      )}

      <DebugPanel />
    </div>
  );
};

export default Game;