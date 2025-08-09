import React, { useState, useEffect } from 'react';
import type { GameState, BattleResult } from '../../game/types';
import Dice from '../Dice/Dice';
import './GameUI.css';

interface GameUIProps {
  gameState: GameState;
  battleResult: BattleResult | null;
  isProcessing: boolean;
  onEndTurn: () => void;
}

const GameUI: React.FC<GameUIProps> = ({
  gameState,
  battleResult,
  isProcessing,
  onEndTurn,
}) => {
  const currentPlayer = gameState.players.get(gameState.currentPlayerId);
  const isHumanTurn = currentPlayer && !currentPlayer.isAI;
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    if (battleResult) {
      setIsRolling(true);
      setTimeout(() => setIsRolling(false), 500);
    }
  }, [battleResult]);

  return (
    <div className="game-ui">
      <div className="turn-info">
        <span>Turn {gameState.turn}</span>
      </div>

      {isHumanTurn && !battleResult && (
        <div className="help-text">
          <p>📍 あなたは<span style={{color: '#FF6B6B', fontWeight: 'bold'}}>赤色</span>のプレイヤーです</p>
          <p>1️⃣ サイコロが2個以上ある自分の領土をクリック</p>
          <p>2️⃣ 隣接する敵の領土をクリックして攻撃</p>
        </div>
      )}

      {battleResult && (
        <div className="battle-result">
          <div className="battle-title">Battle Result</div>
          <div className="battle-rolls">
            <div className="roll-group">
              <span className="roll-label">Attacker:</span>
              <div className="dice-container">
                {battleResult.attacker.rolls.map((roll, i) => (
                  <Dice key={i} value={roll} color="#4CAF50" size={35} isRolling={isRolling} />
                ))}
                <span className="roll-total">= {battleResult.attacker.total}</span>
              </div>
            </div>
            <div className="roll-group">
              <span className="roll-label">Defender:</span>
              <div className="dice-container">
                {battleResult.defender.rolls.map((roll, i) => (
                  <Dice key={i} value={roll} color="#f44336" size={35} isRolling={isRolling} />
                ))}
                <span className="roll-total">= {battleResult.defender.total}</span>
              </div>
            </div>
          </div>
          <div className={`battle-winner ${battleResult.winner}`}>
            {battleResult.winner === 'attacker' ? 'Attacker Wins!' : 'Defender Wins!'}
          </div>
        </div>
      )}

      {isHumanTurn && (
        <div className="controls">
          <button
            className="end-turn-button"
            onClick={onEndTurn}
            disabled={isProcessing}
          >
            End Turn
          </button>
        </div>
      )}

      {!isHumanTurn && (
        <div className="ai-thinking">
          <span>AI is thinking...</span>
        </div>
      )}
    </div>
  );
};

export default GameUI;