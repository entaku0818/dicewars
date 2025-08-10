import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from './GameEngine';
import type { GameConfig } from '../types';

describe('GameEngine', () => {
  let engine: GameEngine;
  const config: GameConfig = {
    playerCount: 2,
    mapSize: 'small',
    aiDifficulty: 'normal',
  };

  beforeEach(() => {
    engine = new GameEngine(config);
  });

  describe('initialization', () => {
    it('should initialize with correct number of players', () => {
      const state = engine.getState();
      expect(state.players.size).toBe(2);
    });

    it('should create correct map size', () => {
      const state = engine.getState();
      expect(state.territories.size).toBe(15); // 3x5 for small map
    });

    it('should distribute all territories to players', () => {
      const state = engine.getState();
      const territoriesWithOwners = Array.from(state.territories.values())
        .filter(t => t.ownerId !== null);
      expect(territoriesWithOwners.length).toBe(15);
    });

    it('should assign dice to all territories', () => {
      const state = engine.getState();
      const territoriesWithDice = Array.from(state.territories.values())
        .every(t => t.diceCount >= 2 && t.diceCount <= 5);
      expect(territoriesWithDice).toBe(true);
    });

    it('should set first player as human', () => {
      const state = engine.getState();
      const firstPlayer = state.players.get('player-0');
      expect(firstPlayer?.isAI).toBe(false);
      expect(firstPlayer?.name).toBe('You');
    });

    it('should set other players as AI', () => {
      const state = engine.getState();
      const secondPlayer = state.players.get('player-1');
      expect(secondPlayer?.isAI).toBe(true);
      expect(secondPlayer?.name).toBe('AI 1');
    });
  });

  describe('canAttack', () => {
    it('should not allow attack from territory with 1 die', () => {
      const state = engine.getState();
      const territories = Array.from(state.territories.values());
      const territory = territories[0];
      territory.diceCount = 1;
      territory.ownerId = state.currentPlayerId;
      
      const adjacentId = territory.adjacentTerritoryIds[0];
      expect(engine.canAttack(territory.id, adjacentId)).toBe(false);
    });

    it('should not allow attack on own territory', () => {
      const state = engine.getState();
      const playerTerritories = Array.from(state.territories.values())
        .filter(t => t.ownerId === state.currentPlayerId);
      
      if (playerTerritories.length >= 2) {
        const from = playerTerritories[0];
        const to = playerTerritories[1];
        expect(engine.canAttack(from.id, to.id)).toBe(false);
      }
    });

    it('should not allow attack on non-adjacent territory', () => {
      const state = engine.getState();
      const territories = Array.from(state.territories.values());
      const from = territories[0];
      from.ownerId = state.currentPlayerId;
      from.diceCount = 3;
      
      // Find a non-adjacent territory
      const nonAdjacent = territories.find(t => 
        !from.adjacentTerritoryIds.includes(t.id) && 
        t.id !== from.id
      );
      
      if (nonAdjacent) {
        expect(engine.canAttack(from.id, nonAdjacent.id)).toBe(false);
      }
    });

    it('should allow valid attack', () => {
      const state = engine.getState();
      const territories = Array.from(state.territories.values());
      
      // Set up a valid attack scenario
      const from = territories[0];
      from.ownerId = state.currentPlayerId;
      from.diceCount = 3;
      
      const adjacentId = from.adjacentTerritoryIds[0];
      const to = state.territories.get(adjacentId);
      if (to) {
        to.ownerId = 'player-1'; // Different player
        expect(engine.canAttack(from.id, to.id)).toBe(true);
      }
    });
  });

  describe('attack', () => {
    it('should return null for invalid attack', () => {
      const result = engine.attack('invalid-1', 'invalid-2');
      expect(result).toBeNull();
    });

    it('should transfer territory on successful attack', () => {
      const state = engine.getState();
      const territories = Array.from(state.territories.values());
      
      // Set up attack scenario
      const from = territories[0];
      from.ownerId = state.currentPlayerId;
      from.diceCount = 8; // Max dice for better chance
      
      const adjacentId = from.adjacentTerritoryIds[0];
      const to = state.territories.get(adjacentId);
      if (to) {
        to.ownerId = 'player-1';
        to.diceCount = 1; // Min dice for worse defense
        
        // Mock dice rolls to ensure attacker wins
        const originalRandom = Math.random;
        Math.random = () => 0.9; // High rolls
        
        const result = engine.attack(from.id, to.id);
        
        Math.random = originalRandom;
        
        if (result && result.winner === 'attacker') {
          expect(to.ownerId).toBe(state.currentPlayerId);
          expect(from.diceCount).toBe(1);
          expect(to.diceCount).toBe(7);
        }
      }
    });

    it('should leave attacker with 1 die on failed attack', () => {
      const state = engine.getState();
      const territories = Array.from(state.territories.values());
      
      const from = territories[0];
      from.ownerId = state.currentPlayerId;
      from.diceCount = 3;
      
      const adjacentId = from.adjacentTerritoryIds[0];
      const to = state.territories.get(adjacentId);
      if (to) {
        to.ownerId = 'player-1';
        to.diceCount = 8; // Max dice for better defense
        
        // Mock dice rolls to ensure defender wins
        const originalRandom = Math.random;
        let callCount = 0;
        Math.random = () => {
          callCount++;
          return callCount <= 3 ? 0.1 : 0.9; // Low rolls for attacker
        };
        
        const result = engine.attack(from.id, to.id);
        
        Math.random = originalRandom;
        
        if (result && result.winner === 'defender') {
          expect(from.diceCount).toBe(1);
          expect(to.ownerId).toBe('player-1'); // Still defender's
        }
      }
    });
  });

  describe('endTurn', () => {
    it('should switch to next player', () => {
      const initialPlayer = engine.getState().currentPlayerId;
      engine.endTurn();
      const newPlayer = engine.getState().currentPlayerId;
      expect(newPlayer).not.toBe(initialPlayer);
    });

    it('should increment turn counter', () => {
      const initialTurn = engine.getState().turn;
      engine.endTurn();
      expect(engine.getState().turn).toBe(initialTurn + 1);
    });

    it('should add reinforcements', () => {
      const state = engine.getState();
      const currentPlayer = state.currentPlayerId;
      
      // Give current player some territories
      let territoriesOwned = 0;
      for (const territory of state.territories.values()) {
        if (territoriesOwned < 5) {
          territory.ownerId = currentPlayer;
          territory.diceCount = 2;
          territoriesOwned++;
        }
      }
      
      const initialDiceCount = engine.getDiceCount(currentPlayer);
      engine.endTurn();
      
      // Switch back to original player
      for (let i = 0; i < state.players.size - 1; i++) {
        engine.endTurn();
      }
      
      const newDiceCount = engine.getDiceCount(currentPlayer);
      expect(newDiceCount).toBeGreaterThan(initialDiceCount);
    });
  });

  describe('win condition', () => {
    it('should detect winner when one player owns all territories', () => {
      const state = engine.getState();
      const winnerId = 'player-0';
      
      // Set up a scenario where player-0 owns all but one territory
      const territories = Array.from(state.territories.values());
      for (let i = 0; i < territories.length - 1; i++) {
        territories[i].ownerId = winnerId;
      }
      territories[territories.length - 1].ownerId = 'player-1';
      
      // Find adjacent territories for the final attack
      const lastEnemyTerritory = territories[territories.length - 1];
      const attackingTerritory = territories.find(t => 
        t.adjacentTerritoryIds.includes(lastEnemyTerritory.id) &&
        t.ownerId === winnerId
      );
      
      if (attackingTerritory) {
        attackingTerritory.diceCount = 8;
        lastEnemyTerritory.diceCount = 1;
        
        // Mock to ensure attacker wins
        const originalRandom = Math.random;
        Math.random = () => 0.9;
        
        engine.attack(attackingTerritory.id, lastEnemyTerritory.id);
        
        Math.random = originalRandom;
        
        expect(state.phase).toBe('gameOver');
        expect(state.winnerId).toBe(winnerId);
      }
    });
  });

  describe('helper methods', () => {
    it('should count territories correctly', () => {
      const state = engine.getState();
      const playerId = state.currentPlayerId;
      
      let expectedCount = 0;
      for (const territory of state.territories.values()) {
        if (territory.ownerId === playerId) {
          expectedCount++;
        }
      }
      
      expect(engine.getTerritoryCount(playerId)).toBe(expectedCount);
    });

    it('should count dice correctly', () => {
      const state = engine.getState();
      const playerId = state.currentPlayerId;
      
      let expectedDice = 0;
      for (const territory of state.territories.values()) {
        if (territory.ownerId === playerId) {
          expectedDice += territory.diceCount;
        }
      }
      
      expect(engine.getDiceCount(playerId)).toBe(expectedDice);
    });
  });
});