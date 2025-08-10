import type { GameState, GameConfig, PlayerId, Territory, Player, BattleResult } from '../types';
import { MapGenerator } from '../map/MapGenerator';
import { soundManager } from '../sound/SoundManager';

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

    // 破滅の時設定（デフォルト20ターン後）
    const doomConfig = {
      enabled: this.config.doomStartTurn !== 99, // 99の場合は無効
      startTurn: this.config.doomStartTurn || 20,
      level: 1 as const, // レベル1: 領土崩壊
    };

    const doomState = {
      isActive: false,
      turnsUntilDoom: doomConfig.startTurn,
      territoriesDestroyed: 0,
    };

    return {
      territories,
      players,
      currentPlayerId: Array.from(players.keys())[0],
      phase: 'attack',
      turn: 1,
      winnerId: null,
      doomConfig,
      doomState,
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
        name: this.config.isLocalMultiplayer ? `Player ${i + 1}` : (i === 0 ? 'You' : `AI ${i}`),
        color: colors[i],
        isAI: this.config.isLocalMultiplayer ? false : (i !== 0),
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
    
    // 破滅の時処理
    this.processDoom();
    
    // 補充フェーズ（簡易版：ランダムに3個のサイコロを配置）
    this.reinforceCurrentPlayer();
  }

  private reinforceCurrentPlayer(): void {
    const playerTerritories = Array.from(this.state.territories.values())
      .filter(t => t.ownerId === this.state.currentPlayerId);
    
    if (playerTerritories.length === 0) return;
    
    // 最大連続領土群を計算
    const largestConnectedGroup = this.getLargestConnectedGroup(this.state.currentPlayerId);
    
    // 基本サイコロ: 領土数 ÷ 3（最小3個）
    const baseReinforcements = Math.max(3, Math.floor(playerTerritories.length / 3));
    
    // 連続領土ボーナス: 最大連続領土群のサイズに応じて追加
    let connectedBonus = 0;
    if (largestConnectedGroup >= 5) {
      connectedBonus = Math.floor(largestConnectedGroup / 4); // 5個以上繋がってたらボーナス
    }
    
    const totalReinforcements = baseReinforcements + connectedBonus;
    
    // コンソールログでデバッグ情報を表示
    console.log(`増援: 基本${baseReinforcements}個 + 連続ボーナス${connectedBonus}個 (最大連続${largestConnectedGroup}領土)`);
    
    for (let i = 0; i < totalReinforcements; i++) {
      const availableTerritories = playerTerritories.filter(t => t.diceCount < 8);
      if (availableTerritories.length === 0) break;
      
      const randomTerritory = availableTerritories[
        Math.floor(Math.random() * availableTerritories.length)
      ];
      randomTerritory.diceCount = Math.min(8, randomTerritory.diceCount + 1);
      soundManager.play('reinforce_dice');
    }
    
    if (totalReinforcements > 0) {
      setTimeout(() => soundManager.play('reinforce_complete'), 200);
    }
  }

  private getLargestConnectedGroup(playerId: PlayerId): number {
    const playerTerritories = Array.from(this.state.territories.values())
      .filter(t => t.ownerId === playerId);
    
    if (playerTerritories.length === 0) return 0;
    
    const visited = new Set<string>();
    let largestGroup = 0;
    
    // 各領土から深さ優先探索で連続領土をカウント
    for (const territory of playerTerritories) {
      if (!visited.has(territory.id)) {
        const groupSize = this.countConnectedTerritories(territory.id, playerId, visited);
        largestGroup = Math.max(largestGroup, groupSize);
      }
    }
    
    return largestGroup;
  }

  private countConnectedTerritories(territoryId: string, playerId: PlayerId, visited: Set<string>): number {
    const territory = this.state.territories.get(territoryId);
    if (!territory || territory.ownerId !== playerId || visited.has(territoryId)) {
      return 0;
    }
    
    visited.add(territoryId);
    let count = 1;
    
    // 隣接する領土を再帰的にチェック
    for (const adjacentId of territory.adjacentTerritoryIds) {
      count += this.countConnectedTerritories(adjacentId, playerId, visited);
    }
    
    return count;
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
      soundManager.play('game_over');
    }
    
    // プレイヤー脱落チェック
    for (const player of this.state.players.values()) {
      if (player.isActive && this.getTerritoryCount(player.id) === 0) {
        player.isActive = false;
        soundManager.play('player_eliminated');
      }
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

  private processDoom(): void {
    if (!this.state.doomConfig?.enabled || !this.state.doomState) return;

    // カウントダウンを減らす
    this.state.doomState.turnsUntilDoom--;

    // 破滅の時が発動
    if (this.state.doomState.turnsUntilDoom <= 0) {
      this.state.doomState.isActive = true;
      
      // レベル1: 領土崩壊
      if (this.state.doomConfig.level === 1) {
        this.destroyRandomTerritory();
      }
    }
  }

  private destroyRandomTerritory(): void {
    const ownedTerritories = Array.from(this.state.territories.values())
      .filter(t => t.ownerId !== null);
    
    if (ownedTerritories.length <= 2) return; // 最後の2領土は破壊しない
    
    // ランダムに領土を選択
    const randomIndex = Math.floor(Math.random() * ownedTerritories.length);
    const territory = ownedTerritories[randomIndex];
    
    // 領土を中立化
    territory.ownerId = null;
    territory.diceCount = 1;
    
    if (this.state.doomState) {
      this.state.doomState.territoriesDestroyed++;
    }
    
    console.log(`破滅の時: 領土 ${territory.id} が崩壊しました`);
    soundManager.play('player_eliminated'); // 崩壊音
  }
}