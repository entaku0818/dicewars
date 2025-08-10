import React from 'react';
import { useGame } from '../hooks/useGame';
import MapBoard from '../components/MapBoard/MapBoard';
import PlayerPanel from '../components/PlayerPanel/PlayerPanel';
import GameUI from '../components/GameUI/GameUI';
import VictoryScreen from '../components/VictoryScreen/VictoryScreen';
import TurnTransition from '../components/TurnTransition/TurnTransition';
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
    showTurnTransition,
    handleTerritoryClick,
    handleEndTurn,
    handleTurnTransitionComplete,
  } = useGame(config);

  return (
    <div className="game-container">
      <div className="game-header">
        <h1 className="game-title">陣取りサイコロ</h1>
        <button className="back-to-title" onClick={onBackToTitle}>
          ← タイトルに戻る
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

      <TurnTransition
        player={gameState.players.get(gameState.currentPlayerId)}
        isVisible={showTurnTransition}
        onComplete={handleTurnTransitionComplete}
      />

      {import.meta.env.DEV && <DebugPanel />}
    </div>
  );
};

export default Game;