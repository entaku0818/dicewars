import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { socketService, type RoomPlayer } from '../services/SocketService';
import type { GameConfig } from '../game/types';
import './Lobby.css';

interface LobbyProps {
  mode: 'create' | 'join';
  config?: GameConfig;
  onGameStart: (config: GameConfig) => void;
  onBack: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ mode, config, onGameStart, onBack }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);

  useEffect(() => {
    // Socket.ioイベントリスナー設定
    socketService.onRoomUpdated((data) => {
      setPlayers(data.players);
    });

    socketService.onGameStarted((data) => {
      onGameStart(data.config);
    });

    socketService.onPlayerDisconnected((data) => {
      setPlayers(data.players);
    });

    return () => {
      socketService.disconnect();
    };
  }, [onGameStart]);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('名前を入力してください');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      await socketService.connect();
      const { roomCode: code } = await socketService.createRoom(playerName, config || {
        playerCount: 4,
        mapSize: 'small',
        aiDifficulty: 'normal'
      });
      setRoomCode(code);
      setIsHost(true);
      setIsInRoom(true);
      setPlayers([{
        id: socketService.getPlayerId()!,
        name: playerName,
        ready: false,
        isHost: true
      }]);
    } catch (err: any) {
      setError(err.message || 'ルーム作成に失敗しました');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      setError('名前を入力してください');
      return;
    }
    if (!joinRoomCode.trim()) {
      setError('ルームコードを入力してください');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      await socketService.connect();
      const result = await socketService.joinRoom(joinRoomCode, playerName);
      setRoomCode(joinRoomCode);
      setPlayers(result.players);
      setIsInRoom(true);
    } catch (err: any) {
      setError(err.message || 'ルーム参加に失敗しました');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleStartGame = () => {
    if (isHost && players.length >= 2) {
      socketService.startGame();
    }
  };

  const handleBack = () => {
    socketService.disconnect();
    onBack();
  };

  // 名前入力画面
  if (!isInRoom) {
    return (
      <div className="lobby-container">
        <motion.div 
          className="lobby-content"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>{mode === 'create' ? 'ルームを作成' : 'ルームに参加'}</h2>
          
          <div className="lobby-form">
            <input
              type="text"
              placeholder="あなたの名前"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={10}
              className="lobby-input"
            />
            
            {mode === 'join' && (
              <input
                type="text"
                placeholder="ルームコード（4桁）"
                value={joinRoomCode}
                onChange={(e) => setJoinRoomCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                className="lobby-input"
              />
            )}
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="lobby-actions">
              <button
                onClick={mode === 'create' ? handleCreateRoom : handleJoinRoom}
                disabled={isConnecting}
                className="lobby-button primary"
              >
                {isConnecting ? '接続中...' : (mode === 'create' ? 'ルーム作成' : '参加')}
              </button>
              <button onClick={handleBack} className="lobby-button">
                戻る
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ルーム待機画面
  return (
    <div className="lobby-container">
      <motion.div 
        className="lobby-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h2>ルームコード: <span className="room-code">{roomCode}</span></h2>
        <p className="room-hint">友達にこのコードを共有してください</p>
        
        <div className="players-list">
          <h3>プレイヤー ({players.length}/6)</h3>
          <div className="players-grid">
            {players.map((player, index) => (
              <motion.div 
                key={player.id}
                className="player-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="player-number">P{index + 1}</span>
                <span className="player-name">{player.name}</span>
                {player.isHost && <span className="host-badge">ホスト</span>}
              </motion.div>
            ))}
            
            {/* 空きスロット */}
            {[...Array(6 - players.length)].map((_, index) => (
              <div key={`empty-${index}`} className="player-card empty">
                <span className="player-number">P{players.length + index + 1}</span>
                <span className="waiting-text">待機中...</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lobby-actions">
          {isHost ? (
            <button
              onClick={handleStartGame}
              disabled={players.length < 2}
              className="lobby-button primary large"
            >
              {players.length < 2 ? '最低2人必要です' : 'ゲーム開始'}
            </button>
          ) : (
            <div className="waiting-message">
              ホストがゲームを開始するのを待っています...
            </div>
          )}
          <button onClick={handleBack} className="lobby-button">
            退出
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Lobby;