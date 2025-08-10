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
  doomConfig?: DoomConfig;
  doomState?: DoomState;
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
  isLocalMultiplayer?: boolean;
  doomEnabled?: boolean;
}

export interface DoomConfig {
  enabled: boolean;
  startTurn: number; // 破滅開始ターン
  level: 1 | 2 | 3 | 4; // 破滅レベル
}

export interface DoomState {
  isActive: boolean;
  turnsUntilDoom: number;
  territoriesDestroyed: number;
}