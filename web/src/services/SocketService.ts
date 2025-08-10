import { io, Socket } from 'socket.io-client';
import type { GameConfig } from '../game/types';

export interface RoomPlayer {
  id: string;
  name: string;
  ready: boolean;
  isHost: boolean;
}

class SocketService {
  private socket: Socket | null = null;
  private roomCode: string | null = null;
  private playerId: string | null = null;
  
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io('http://localhost:3001', {
        transports: ['websocket']
      });
      
      this.socket.on('connect', () => {
        console.log('サーバー接続成功');
        resolve();
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('接続エラー:', error);
        reject(error);
      });
    });
  }
  
  createRoom(playerName: string, config: GameConfig): Promise<{ roomCode: string; playerId: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('サーバーに接続されていません'));
        return;
      }
      
      this.socket.emit('create-room', playerName, config, (response: any) => {
        if (response.success) {
          this.roomCode = response.roomCode;
          this.playerId = response.playerId;
          resolve({ roomCode: response.roomCode, playerId: response.playerId });
        } else {
          reject(new Error(response.error || 'ルーム作成に失敗しました'));
        }
      });
    });
  }
  
  joinRoom(roomCode: string, playerName: string): Promise<{
    players: RoomPlayer[];
    config: GameConfig;
    playerId: string;
  }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('サーバーに接続されていません'));
        return;
      }
      
      this.socket.emit('join-room', roomCode, playerName, (response: any) => {
        if (response.success) {
          this.roomCode = roomCode;
          this.playerId = response.playerId;
          resolve({
            players: response.players,
            config: response.config,
            playerId: response.playerId
          });
        } else {
          reject(new Error(response.error || 'ルーム参加に失敗しました'));
        }
      });
    });
  }
  
  startGame(): void {
    if (!this.socket || !this.roomCode) return;
    this.socket.emit('start-game', this.roomCode);
  }
  
  sendGameAction(action: any): void {
    if (!this.socket) return;
    this.socket.emit('game-action', action);
  }
  
  onRoomUpdated(callback: (data: { players: RoomPlayer[]; config: GameConfig }) => void): void {
    if (!this.socket) return;
    this.socket.on('room-updated', callback);
  }
  
  onGameStarted(callback: (data: { config: GameConfig; playerMapping: any }) => void): void {
    if (!this.socket) return;
    this.socket.on('game-started', callback);
  }
  
  onGameAction(callback: (data: { playerId: string; action: any }) => void): void {
    if (!this.socket) return;
    this.socket.on('game-action', callback);
  }
  
  onPlayerDisconnected(callback: (data: { playerId: string; players: RoomPlayer[] }) => void): void {
    if (!this.socket) return;
    this.socket.on('player-disconnected', callback);
  }
  
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.roomCode = null;
      this.playerId = null;
    }
  }
  
  getRoomCode(): string | null {
    return this.roomCode;
  }
  
  getPlayerId(): string | null {
    return this.playerId;
  }
  
  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }
}

export const socketService = new SocketService();