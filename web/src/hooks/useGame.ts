import { useState, useCallback, useEffect } from 'react';
import { GameEngine } from '../game/engine/GameEngine';
import type { GameState, GameConfig, BattleResult } from '../game/types';

export const useGame = (config: GameConfig) => {
  const [engine] = useState(() => new GameEngine(config));
  const [gameState, setGameState] = useState<GameState>(engine.getState());
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | null>(null);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const updateGameState = useCallback(() => {
    setGameState({ ...engine.getState() });
  }, [engine]);

  const handleTerritoryClick = useCallback((territoryId: string) => {
    if (isProcessing) return;

    const territory = gameState.territories.get(territoryId);
    if (!territory) return;

    console.log('Clicked territory:', territoryId, territory);
    console.log('Current player:', gameState.currentPlayerId);
    console.log('Selected territory:', selectedTerritoryId);

    // 自分の領土をクリックした場合
    if (territory.ownerId === gameState.currentPlayerId) {
      if (territory.diceCount > 1) {
        console.log('Selecting territory:', territoryId);
        setSelectedTerritoryId(territoryId);
        setBattleResult(null);
      }
    } 
    // 選択中の領土から攻撃可能な敵領土をクリックした場合
    else if (selectedTerritoryId) {
      const canAttack = engine.canAttack(selectedTerritoryId, territoryId);
      console.log('Can attack?', canAttack);
      if (canAttack) {
        setIsProcessing(true);
        
        const result = engine.attack(selectedTerritoryId, territoryId);
        if (result) {
          setBattleResult(result);
          updateGameState();
          
          // 勝利した場合は選択を維持、負けた場合は解除
          if (result.winner === 'defender') {
            setSelectedTerritoryId(null);
          }
        }
        
        setIsProcessing(false);
      }
    }
  }, [selectedTerritoryId, gameState, engine, updateGameState, isProcessing]);

  const handleEndTurn = useCallback(() => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    engine.endTurn();
    updateGameState();
    setSelectedTerritoryId(null);
    setBattleResult(null);
    setIsProcessing(false);
  }, [engine, updateGameState, isProcessing]);

  // AI の自動プレイ
  useEffect(() => {
    const currentPlayer = gameState.players.get(gameState.currentPlayerId);
    if (!currentPlayer?.isAI || gameState.phase === 'gameOver') return;

    const aiPlay = async () => {
      setIsProcessing(true);
      
      // 簡単なAI: ランダムに攻撃
      const myTerritories = Array.from(gameState.territories.values())
        .filter(t => t.ownerId === gameState.currentPlayerId && t.diceCount > 1);
      
      let attackCount = 0;
      const maxAttacks = 3 + Math.floor(Math.random() * 3); // 3-5回攻撃
      
      for (const territory of myTerritories) {
        if (attackCount >= maxAttacks) break;
        
        const targets = territory.adjacentTerritoryIds
          .map(id => gameState.territories.get(id))
          .filter(t => t && t.ownerId !== gameState.currentPlayerId);
        
        if (targets.length > 0) {
          const target = targets[Math.floor(Math.random() * targets.length)];
          if (target) {
            await new Promise(resolve => setTimeout(resolve, 500)); // 遅延
            engine.attack(territory.id, target.id);
            updateGameState();
            attackCount++;
          }
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      engine.endTurn();
      updateGameState();
      setIsProcessing(false);
    };

    const timer = setTimeout(aiPlay, 1000);
    return () => clearTimeout(timer);
  }, [gameState.currentPlayerId, gameState.players, gameState.territories, gameState.phase, engine, updateGameState]);

  return {
    gameState,
    selectedTerritoryId,
    battleResult,
    isProcessing,
    handleTerritoryClick,
    handleEndTurn,
  };
};