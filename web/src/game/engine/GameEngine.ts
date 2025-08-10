import type { GameState, GameConfig, PlayerId, Territory, Player, BattleResult } from '../types';
import { MapGenerator } from '../map/MapGenerator';

export class GameEngine {
  private state: GameState;
  private config: GameConfig;

  constructor(config: GameConfig) {
    this.config = config;
    this.state = this.initializeGame();
  }

  private initializeGame(): GameState {
    const territories = this.generateMap();
    const players = this.createPlayers();
    this.distributeTerritoriesAndDice(territories, players);

    return {
      territories,
      players,
      currentPlayerId: Array.from(players.keys())[0],
      phase: 'attack',
      turn: 1,
      winnerId: null,
    };
  }

  private generateMap(): Map<string, Territory> {
    const size = this.getMapSizeConfig();
    const mapGenerator = new MapGenerator(800, 600, size.total);
    return mapGenerator.generateMap();
  }

  private getMapSizeConfig() {
    switch (this.config.mapSize) {
      case 'small':
        return { rows: 3, cols: 4, total: 10 };
      case 'medium':
        return { rows: 4, cols: 5, total: 20 };
      case 'large':
        return { rows: 5, cols: 6, total: 30 };
      default:
        return { rows: 3, cols: 4, total: 10 };
    }
  }


  private createPlayers(): Map<PlayerId, Player> {
    const players = new Map<PlayerId, Player>();
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#48C9B0'];
    
    for (let i = 0; i < this.config.playerCount; i++) {
      const id = `player-${i}`;
      const player: Player = {
        id,
        name: i === 0 ? 'You' : `AI ${i}`,
        color: colors[i],
        isAI: i !== 0,
        isActive: true,
      };
      players.set(id, player);
    }
    
    return players;
  }

  private distributeTerritoriesAndDice(
    territories: Map<string, Territory>,
    players: Map<PlayerId, Player>
  ): void {
    const territoryArray = Array.from(territories.values());
    const playerIds = Array.from(players.keys());
    
    // ランダムに領土を配分
    const shuffled = [...territoryArray].sort(() => Math.random() - 0.5);
    shuffled.forEach((territory, index) => {
      territory.ownerId = playerIds[index % playerIds.length];
      territory.diceCount = Math.floor(Math.random() * 4) + 2; // 2-5個のサイコロ
    });
    
    console.log('Initial territory distribution:', {
      totalTerritories: territoryArray.length,
      playersCount: playerIds.length,
      distribution: playerIds.map(id => ({
        player: players.get(id)?.name,
        territories: territoryArray.filter(t => t.ownerId === id).length
      }))
    });
  }

  // パブリックメソッド
  getState(): GameState {
    return this.state;
  }

  canAttack(fromId: string, toId: string): boolean {
    const from = this.state.territories.get(fromId);
    const to = this.state.territories.get(toId);
    
    console.log('canAttack check:', {
      fromId,
      toId,
      from,
      to,
      adjacentIds: from?.adjacentTerritoryIds,
      isAdjacent: from?.adjacentTerritoryIds.includes(toId)
    });
    
    if (!from || !to) return false;
    if (from.ownerId !== this.state.currentPlayerId) return false;
    if (from.ownerId === to.ownerId) return false;
    if (from.diceCount <= 1) return false;
    if (!from.adjacentTerritoryIds.includes(toId)) return false;
    
    return true;
  }

  attack(fromId: string, toId: string): BattleResult | null {
    if (!this.canAttack(fromId, toId)) return null;

    const from = this.state.territories.get(fromId)!;
    const to = this.state.territories.get(toId)!;

    // サイコロを振る
    const attackerRolls = this.rollDice(from.diceCount);
    const defenderRolls = this.rollDice(to.diceCount);
    
    const attackerTotal = attackerRolls.reduce((a, b) => a + b, 0);
    const defenderTotal = defenderRolls.reduce((a, b) => a + b, 0);
    
    const result: BattleResult = {
      attacker: {
        territoryId: fromId,
        rolls: attackerRolls,
        total: attackerTotal,
      },
      defender: {
        territoryId: toId,
        rolls: defenderRolls,
        total: defenderTotal,
      },
      winner: attackerTotal > defenderTotal ? 'attacker' : 'defender',
    };

    // 結果を適用
    if (result.winner === 'attacker') {
      to.ownerId = from.ownerId;
      to.diceCount = from.diceCount - 1;
      from.diceCount = 1;
    } else {
      from.diceCount = 1;
    }

    this.checkWinCondition();
    
    return result;
  }

  private rollDice(count: number): number[] {
    const rolls: number[] = [];
    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * 6) + 1);
    }
    return rolls;
  }

  endTurn(): void {
    const playerIds = Array.from(this.state.players.keys());
    const currentIndex = playerIds.indexOf(this.state.currentPlayerId);
    const nextIndex = (currentIndex + 1) % playerIds.length;
    
    this.state.currentPlayerId = playerIds[nextIndex];
    this.state.turn++;
    
    // 補充フェーズ（簡易版：ランダムに3個のサイコロを配置）
    this.reinforceCurrentPlayer();
  }

  private reinforceCurrentPlayer(): void {
    const playerTerritories = Array.from(this.state.territories.values())
      .filter(t => t.ownerId === this.state.currentPlayerId);
    
    if (playerTerritories.length === 0) return;
    
    // 連続した領土数に応じてサイコロを追加（簡易版）
    const reinforcements = Math.max(3, Math.floor(playerTerritories.length / 3));
    
    for (let i = 0; i < reinforcements; i++) {
      const availableTerritories = playerTerritories.filter(t => t.diceCount < 8);
      if (availableTerritories.length === 0) break;
      
      const randomTerritory = availableTerritories[
        Math.floor(Math.random() * availableTerritories.length)
      ];
      randomTerritory.diceCount = Math.min(8, randomTerritory.diceCount + 1);
    }
  }

  private checkWinCondition(): void {
    const ownerSet = new Set<PlayerId>();
    
    for (const territory of this.state.territories.values()) {
      if (territory.ownerId) {
        ownerSet.add(territory.ownerId);
      }
    }
    
    if (ownerSet.size === 1) {
      this.state.winnerId = Array.from(ownerSet)[0];
      this.state.phase = 'gameOver';
    }
  }

  getTerritoryCount(playerId: PlayerId): number {
    return Array.from(this.state.territories.values())
      .filter(t => t.ownerId === playerId).length;
  }

  getDiceCount(playerId: PlayerId): number {
    return Array.from(this.state.territories.values())
      .filter(t => t.ownerId === playerId)
      .reduce((sum, t) => sum + t.diceCount, 0);
  }
}