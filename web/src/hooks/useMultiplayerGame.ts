import { useState, useEffect, useCallback } from 'react';
import { socketService } from '../services/SocketService';
import { GameEngine } from '../game/engine/GameEngine';
import type { GameState, GameConfig, BattleResult } from '../game/types';
import { soundManager } from '../game/sound/SoundManager';

export const useMultiplayerGame = (config: GameConfig) => {
  const [gameEngine] = useState(() => new GameEngine(config));
  const [gameState, setGameState] = useState<GameState>(gameEngine.getState());
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | null>(null);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTurnTransition, setShowTurnTransition] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(false);

  // マルチプレイヤーイベントの処理
  useEffect(() => {
    // ゲームアクションを受信
    socketService.onGameAction((data) => {
      if (data.action.type === 'attack') {
        const result = gameEngine.attack(data.action.from, data.action.to);
        if (result) {
          setBattleResult(result);
          soundManager.play('battle_start');
          setTimeout(() => setBattleResult(null), 2000);
        }
        setGameState(gameEngine.getState());
      } else if (data.action.type === 'endTurn') {
        gameEngine.endTurn();
        setGameState(gameEngine.getState());
        setShowTurnTransition(true);
      }
    });

    // 自分のターンかチェック
    const myPlayerId = socketService.getPlayerId();
    const currentPlayer = gameState.players.get(gameState.currentPlayerId);
    setIsMyTurn(currentPlayer?.id === myPlayerId);
  }, [gameEngine, gameState]);

  const handleTerritoryClick = useCallback((territoryId: string) => {
    if (!isMyTurn || isProcessing) return;
    
    const territory = gameState.territories.get(territoryId);
    if (!territory) return;

    if (!selectedTerritoryId) {
      // 領土選択
      if (territory.ownerId === gameState.currentPlayerId && territory.diceCount > 1) {
        setSelectedTerritoryId(territoryId);
        soundManager.play('click');
      }
    } else {
      // 攻撃
      if (territoryId === selectedTerritoryId) {
        setSelectedTerritoryId(null);
        soundManager.play('click');
      } else if (gameEngine.canAttack(selectedTerritoryId, territoryId)) {
        setIsProcessing(true);
        
        // サーバーに攻撃を送信
        socketService.sendGameAction({
          type: 'attack',
          from: selectedTerritoryId,
          to: territoryId
        });

        const result = gameEngine.attack(selectedTerritoryId, territoryId);
        if (result) {
          setBattleResult(result);
          soundManager.play('battle_start');
          setTimeout(() => {
            setBattleResult(null);
            setIsProcessing(false);
          }, 2000);
        }
        
        setSelectedTerritoryId(null);
        setGameState(gameEngine.getState());
      }
    }
  }, [selectedTerritoryId, gameState, gameEngine, isProcessing, isMyTurn]);

  const handleEndTurn = useCallback(() => {
    if (!isMyTurn || isProcessing) return;
    
    // サーバーにターン終了を送信
    socketService.sendGameAction({
      type: 'endTurn'
    });
    
    gameEngine.endTurn();
    setGameState(gameEngine.getState());
    setSelectedTerritoryId(null);
    setShowTurnTransition(true);
    soundManager.play('turn_end');
  }, [gameEngine, isProcessing, isMyTurn]);

  const handleTurnTransitionComplete = useCallback(() => {
    setShowTurnTransition(false);
  }, []);

  return {
    gameState,
    selectedTerritoryId,
    battleResult,
    isProcessing,
    showTurnTransition,
    isMyTurn,
    handleTerritoryClick,
    handleEndTurn,
    handleTurnTransitionComplete,
  };
};