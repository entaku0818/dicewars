import React from 'react';
import { useGame } from '../hooks/useGame';
import MapBoard from '../components/MapBoard/MapBoard';
import PlayerPanel from '../components/PlayerPanel/PlayerPanel';
import GameUI from '../components/GameUI/GameUI';
import VictoryScreen from '../components/VictoryScreen/VictoryScreen';
import TurnTransition from '../components/TurnTransition/TurnTransition';
import DebugPanel from '../components/DebugPanel/DebugPanel';
import DoomCounter from '../components/DoomCounter/DoomCounter';
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

  const isDoomActive = gameState.doomState?.isActive || false;
  const isDoomWarning = gameState.doomState && gameState.doomState.turnsUntilDoom <= 5 && gameState.doomState.turnsUntilDoom > 0;
  const isDoomStarting = gameState.doomState?.turnsUntilDoom === 0 && !gameState.doomState?.isActive;

  return (
    <div className={`game-container ${isDoomActive ? 'doom-active' : ''} ${isDoomWarning ? 'doom-warning' : ''}`}>
      {/* 破滅の時背景エフェクト */}
      {(isDoomActive || isDoomWarning) && (
        <div className={`doom-background-effect ${isDoomStarting ? 'doom-starting' : ''}`} />
      )}
      
      <DoomCounter 
        turn={gameState.turn}
      />
      
      <div className="game-header">
        <h1 className="game-title">陣取りサイコロ</h1>
        <button className="back-to-title" onClick={onBackToTitle}>
          ← タイトルに戻る
        </button>
      </div>

      <GameUI
        battleResult={battleResult}
      />

      <MapBoard
        territories={gameState.territories}
        players={gameState.players}
        currentPlayerId={gameState.currentPlayerId}
        selectedTerritoryId={selectedTerritoryId}
        onTerritoryClick={handleTerritoryClick}
        battleResult={battleResult}
        isProcessing={isProcessing}
        onEndTurn={handleEndTurn}
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