import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { GameConfig } from '../game/types';
import './Title.css';

interface TitleProps {
  onStartGame: (config: GameConfig) => void;
  onStartOnline: (mode: 'create' | 'join') => void;
}

const Title: React.FC<TitleProps> = ({ onStartGame, onStartOnline }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [gameMode, setGameMode] = useState<'single' | 'local' | 'online' | null>(null);
  const [config, setConfig] = useState<GameConfig>({
    playerCount: 4,
    mapSize: 'small',
    aiDifficulty: 'normal',
  });

  const handleStart = () => {
    onStartGame({
      ...config,
      isLocalMultiplayer: gameMode === 'local'
    });
  };

  return (
    <div className="title-container">
      <motion.div 
        className="title-content"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="main-title">
          <span className="dice-icon">🎲</span>
          陣取りサイコロ
          <span className="dice-icon">🎲</span>
        </h1>
        
        <p className="subtitle">サイコロで領土を奪い合え！</p>

        {!showMenu && !gameMode ? (
          <motion.div
            className="mode-selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h2>ゲームモードを選択</h2>
            <div className="mode-buttons">
              <motion.button
                className="mode-button"
                onClick={() => {
                  setGameMode('single');
                  setShowMenu(true);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mode-icon">🤖</span>
                <span className="mode-title">ひとりで遊ぶ</span>
                <span className="mode-desc">AIと対戦</span>
              </motion.button>
              <motion.button
                className="mode-button"
                onClick={() => {
                  setGameMode('local');
                  setShowMenu(true);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mode-icon">👥</span>
                <span className="mode-title">みんなで遊ぶ</span>
                <span className="mode-desc">同じ端末で交代でプレイ</span>
              </motion.button>
              <motion.button
                className="mode-button"
                onClick={() => {
                  setGameMode('online');
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mode-icon">🌐</span>
                <span className="mode-title">オンライン対戦</span>
                <span className="mode-desc">ルームコードで友達と対戦</span>
              </motion.button>
            </div>
          </motion.div>
        ) : gameMode === 'online' ? (
          <motion.div
            className="mode-selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2>オンライン対戦</h2>
            <div className="mode-buttons">
              <motion.button
                className="mode-button"
                onClick={() => onStartOnline('create')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mode-icon">🏠</span>
                <span className="mode-title">ルームを作成</span>
                <span className="mode-desc">友達を招待する</span>
              </motion.button>
              <motion.button
                className="mode-button"
                onClick={() => onStartOnline('join')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mode-icon">🔑</span>
                <span className="mode-title">ルームに参加</span>
                <span className="mode-desc">コードを入力して参加</span>
              </motion.button>
            </div>
            <button
              className="back-button"
              onClick={() => setGameMode(null)}
              style={{ marginTop: '20px' }}
            >
              戻る
            </button>
          </motion.div>
        ) : (
          <motion.div 
            className="game-menu"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="menu-section">
              <h3>プレイヤー数</h3>
              <div className="button-group">
                {[2, 3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    className={`option-button ${config.playerCount === num ? 'active' : ''}`}
                    onClick={() => setConfig({ ...config, playerCount: num })}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="menu-section">
              <h3>破滅の時（ターン）</h3>
              <div className="button-group">
                {[5, 15, 20, 25, 30, 99].map(turn => (
                  <button
                    key={turn}
                    className={`option-button ${(config.doomStartTurn || 20) === turn ? 'active' : ''}`}
                    onClick={() => setConfig({ ...config, doomStartTurn: turn })}
                  >
                    {turn === 99 ? 'なし' : turn}
                  </button>
                ))}
              </div>
            </div>

            <div className="menu-section">
              <h3>マップサイズ</h3>
              <div className="button-group">
                {(['small', 'medium', 'large'] as const).map(size => (
                  <button
                    key={size}
                    className={`option-button ${config.mapSize === size ? 'active' : ''}`}
                    onClick={() => setConfig({ ...config, mapSize: size })}
                  >
                    {size === 'small' ? '小' : size === 'medium' ? '中' : '大'}
                  </button>
                ))}
              </div>
            </div>

            {gameMode === 'single' && (
              <div className="menu-section">
                <h3>AIの強さ</h3>
                <div className="button-group">
                  {(['easy', 'normal', 'hard'] as const).map(difficulty => (
                    <button
                      key={difficulty}
                      className={`option-button ${config.aiDifficulty === difficulty ? 'active' : ''}`}
                      onClick={() => setConfig({ ...config, aiDifficulty: difficulty })}
                    >
                      {difficulty === 'easy' ? 'かんたん' : difficulty === 'normal' ? 'ふつう' : 'むずかしい'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {gameMode === 'local' && (
              <div className="menu-section">
                <h3>ゲーム設定</h3>
                <p className="mode-info">🎮 同じ端末で交代にプレイします</p>
              </div>
            )}

            <div className="menu-actions">
              <motion.button
                className="play-button"
                onClick={handleStart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ゲーム開始
              </motion.button>
              <button
                className="back-button"
                onClick={() => {
                  setShowMenu(false);
                  setGameMode(null);
                }}
              >
                戻る
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      <div className="background-dice">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="floating-dice"
            initial={{ y: 100, opacity: 0 }}
            animate={{ 
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5
            }}
            style={{
              left: `${10 + i * 15}%`,
              fontSize: `${30 + i * 5}px`
            }}
          >
            🎲
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Title;