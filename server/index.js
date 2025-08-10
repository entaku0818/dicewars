const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const RoomManager = require('./RoomManager');

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

const roomManager = new RoomManager(io);

// REST API エンドポイント
app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: roomManager.getRoomCount() });
});

// Socket.io接続処理
io.on('connection', (socket) => {
  console.log('新しい接続:', socket.id);

  // ルーム作成
  socket.on('create-room', (playerName, config, callback) => {
    const room = roomManager.createRoom(socket, playerName, config);
    callback({ success: true, roomCode: room.code, playerId: socket.id });
  });

  // ルーム参加
  socket.on('join-room', (roomCode, playerName, callback) => {
    const result = roomManager.joinRoom(socket, roomCode, playerName);
    callback(result);
  });

  // ゲーム開始
  socket.on('start-game', (roomCode) => {
    roomManager.startGame(roomCode);
  });

  // ゲームアクション
  socket.on('game-action', (data) => {
    roomManager.handleGameAction(socket.id, data);
  });

  // 切断処理
  socket.on('disconnect', () => {
    console.log('切断:', socket.id);
    roomManager.handleDisconnect(socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🎲 陣取りサイコロ サーバー起動: http://localhost:${PORT}`);
});