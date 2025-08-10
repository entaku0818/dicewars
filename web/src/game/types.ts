// ゲームの基本型定義

export type PlayerId = string;

export interface Position {
  x: number;
  y: number;
}

export interface Territory {
  id: string;
  ownerId: PlayerId | null;
  diceCount: number;
  position: Position;
  adjacentTerritoryIds: string[];
  vertices?: Position[]; // 多角形の頂点
  powerUp?: PowerUp | null;
}

export interface Player {
  id: PlayerId;
  name: string;
  color: string;
  isAI: boolean;
  isActive: boolean;
}

export type GamePhase = 'setup' | 'attack' | 'reinforce' | 'gameOver';

export interface GameState {
  territories: Map<string, Territory>;
  players: Map<PlayerId, Player>;
  currentPlayerId: PlayerId;
  phase: GamePhase;
  turn: number;
  winnerId: PlayerId | null;
  activeEffects?: PlayerEffects;
}

export interface BattleResult {
  attacker: {
    territoryId: string;
    rolls: number[];
    total: number;
  };
  defender: {
    territoryId: string;
    rolls: number[];
    total: number;
  };
  winner: 'attacker' | 'defender';
}

export type PowerUpType = 'doubleAttack' | 'ironDefense' | 'teleport';

export interface PowerUp {
  type: PowerUpType;
  name: string;
  description: string;
  icon: string;
}

export interface PlayerEffects {
  [playerId: string]: {
    doubleAttack?: boolean;
    ironDefense?: number; // 防御ボーナスの値
    teleportReady?: boolean;
  };
}

export interface GameConfig {
  playerCount: number;
  mapSize: 'small' | 'medium' | 'large';
  aiDifficulty: 'easy' | 'normal' | 'hard';
}