import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../hooks/useGame';
import MapBoard from '../components/MapBoard/MapBoard';
import PlayerPanel from '../components/PlayerPanel/PlayerPanel';
import VictoryScreen from '../components/VictoryScreen/VictoryScreen';
import TurnTransition from '../components/TurnTransition/TurnTransition';
import DebugPanel from '../components/DebugPanel/DebugPanel';
import DoomCounter from '../components/DoomCounter/DoomCounter';
import Dice3D from '../components/Dice3D/Dice3D';
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

  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    if (battleResult) {
      setIsRolling(true);
      setTimeout(() => setIsRolling(false), 300);
    }
  }, [battleResult]);

  const isDoomActive = gameState.doomState?.isActive || false;
  const isDoomWarning = false; // 警告を無効化
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

      {/* Battle Result Display */}
      <AnimatePresence>
        {battleResult && (
          <motion.div 
            className="battle-result"
            initial={{ scale: 0.8, opacity: 0, x: 100 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0.8, opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <motion.div 
              className="battle-title"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
            >
              ⚔️ Battle Result ⚔️
            </motion.div>
            <div className="battle-rolls">
              <motion.div 
                className="roll-group"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <span className="roll-label attacker-label">⚔️ Attacker</span>
                <div className="dice-container">
                  {battleResult.attacker.rolls.map((roll, i) => (
                    <Dice3D key={i} value={roll} color="#4CAF50" size={50} isRolling={isRolling} />
                  ))}
                  <motion.span 
                    className="roll-total"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                  >
                    = {battleResult.attacker.total}
                  </motion.span>
                </div>
              </motion.div>
              <motion.div 
                className="roll-group"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <span className="roll-label defender-label">🛡️ Defender</span>
                <div className="dice-container">
                  {battleResult.defender.rolls.map((roll, i) => (
                    <Dice3D key={i} value={roll} color="#f44336" size={50} isRolling={isRolling} />
                  ))}
                  <motion.span 
                    className="roll-total"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                  >
                    = {battleResult.defender.total}
                  </motion.span>
                </div>
              </motion.div>
            </div>
            <motion.div 
              className={`battle-winner ${battleResult.winner}`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
            >
              {battleResult.winner === 'attacker' ? 
                '⚔️ ATTACKER WINS! ⚔️' : 
                '🛡️ DEFENDER HOLDS! 🛡️'
              }
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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