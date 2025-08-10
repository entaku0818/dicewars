class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map(); // roomCode -> Room
    this.playerRooms = new Map(); // socketId -> roomCode
  }

  generateRoomCode() {
    let code;
    do {
      code = Math.floor(1000 + Math.random() * 9000).toString();
    } while (this.rooms.has(code));
    return code;
  }

  createRoom(socket, playerName, config) {
    const roomCode = this.generateRoomCode();
    const room = {
      code: roomCode,
      host: socket.id,
      config: config,
      players: [
        {
          id: socket.id,
          name: playerName,
          ready: false,
          isHost: true
        }
      ],
      gameState: null,
      status: 'waiting' // waiting, playing, finished
    };

    this.rooms.set(roomCode, room);
    this.playerRooms.set(socket.id, roomCode);
    
    socket.join(roomCode);
    console.log(`ルーム作成: ${roomCode} ホスト: ${playerName}`);
    
    return room;
  }

  joinRoom(socket, roomCode, playerName) {
    const room = this.rooms.get(roomCode);
    
    if (!room) {
      return { success: false, error: 'ルームが見つかりません' };
    }
    
    if (room.status !== 'waiting') {
      return { success: false, error: 'ゲームは既に開始しています' };
    }
    
    if (room.players.length >= 6) {
      return { success: false, error: 'ルームが満員です' };
    }
    
    // 同じ名前のプレイヤーがいないかチェック
    if (room.players.some(p => p.name === playerName)) {
      return { success: false, error: 'その名前は既に使われています' };
    }
    
    room.players.push({
      id: socket.id,
      name: playerName,
      ready: false,
      isHost: false
    });
    
    this.playerRooms.set(socket.id, roomCode);
    socket.join(roomCode);
    
    // 全員に更新を通知
    this.io.to(roomCode).emit('room-updated', {
      players: room.players,
      config: room.config
    });
    
    console.log(`${playerName} がルーム ${roomCode} に参加`);
    
    return { 
      success: true, 
      roomCode: roomCode,
      playerId: socket.id,
      players: room.players,
      config: room.config
    };
  }

  startGame(roomCode) {
    const room = this.rooms.get(roomCode);
    if (!room || room.status !== 'waiting') return;
    
    if (room.players.length < 2) {
      this.io.to(room.host).emit('error', '2人以上のプレイヤーが必要です');
      return;
    }
    
    room.status = 'playing';
    
    // プレイヤーIDマッピングを作成
    const playerMapping = {};
    room.players.forEach((player, index) => {
      playerMapping[`player-${index}`] = {
        socketId: player.id,
        name: player.name
      };
    });
    
    room.playerMapping = playerMapping;
    
    // ゲーム開始を全員に通知
    this.io.to(roomCode).emit('game-started', {
      config: {
        ...room.config,
        playerCount: room.players.length,
        isMultiplayer: true
      },
      playerMapping: playerMapping
    });
    
    console.log(`ゲーム開始: ルーム ${roomCode}`);
  }

  handleGameAction(socketId, data) {
    const roomCode = this.playerRooms.get(socketId);
    if (!roomCode) return;
    
    const room = this.rooms.get(roomCode);
    if (!room || room.status !== 'playing') return;
    
    // アクションを他のプレイヤーに転送
    socket.to(roomCode).emit('game-action', {
      playerId: socketId,
      action: data
    });
  }

  handleDisconnect(socketId) {
    const roomCode = this.playerRooms.get(socketId);
    if (!roomCode) return;
    
    const room = this.rooms.get(roomCode);
    if (!room) return;
    
    // プレイヤーを削除
    room.players = room.players.filter(p => p.id !== socketId);
    this.playerRooms.delete(socketId);
    
    // ルームが空になったら削除
    if (room.players.length === 0) {
      this.rooms.delete(roomCode);
      console.log(`ルーム ${roomCode} を削除`);
      return;
    }
    
    // ホストが切断した場合、次のプレイヤーをホストに
    if (room.host === socketId && room.players.length > 0) {
      room.host = room.players[0].id;
      room.players[0].isHost = true;
    }
    
    // 残りのプレイヤーに通知
    this.io.to(roomCode).emit('player-disconnected', {
      playerId: socketId,
      players: room.players
    });
    
    console.log(`プレイヤー切断: ${socketId} from ルーム ${roomCode}`);
  }

  getRoomCount() {
    return this.rooms.size;
  }
}

module.exports = RoomManager;