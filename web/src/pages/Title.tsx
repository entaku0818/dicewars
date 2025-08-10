import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { GameConfig } from '../game/types';
import './Title.css';

interface TitleProps {
  onStartGame: (config: GameConfig) => void;
}

const Title: React.FC<TitleProps> = ({ onStartGame }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [gameMode, setGameMode] = useState<'single' | 'local' | null>(null);
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
          DICEWARS
          <span className="dice-icon">🎲</span>
        </h1>
        
        <p className="subtitle">Conquer the world with dice!</p>

        {!showMenu && !gameMode ? (
          <motion.div
            className="mode-selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h2>Select Game Mode</h2>
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
                <span className="mode-title">Single Player</span>
                <span className="mode-desc">Play against AI</span>
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
                <span className="mode-title">Local Multiplayer</span>
                <span className="mode-desc">Pass & Play with friends</span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="game-menu"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="menu-section">
              <h3>Players</h3>
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
              <h3>Map Size</h3>
              <div className="button-group">
                {(['small', 'medium', 'large'] as const).map(size => (
                  <button
                    key={size}
                    className={`option-button ${config.mapSize === size ? 'active' : ''}`}
                    onClick={() => setConfig({ ...config, mapSize: size })}
                  >
                    {size.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {gameMode === 'single' && (
              <div className="menu-section">
                <h3>AI Difficulty</h3>
                <div className="button-group">
                  {(['easy', 'normal', 'hard'] as const).map(difficulty => (
                    <button
                      key={difficulty}
                      className={`option-button ${config.aiDifficulty === difficulty ? 'active' : ''}`}
                      onClick={() => setConfig({ ...config, aiDifficulty: difficulty })}
                    >
                      {difficulty.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {gameMode === 'local' && (
              <div className="menu-section">
                <h3>Game Settings</h3>
                <p className="mode-info">🎮 Players will take turns on the same device</p>
              </div>
            )}

            <div className="menu-actions">
              <motion.button
                className="play-button"
                onClick={handleStart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                PLAY NOW
              </motion.button>
              <button
                className="back-button"
                onClick={() => {
                  setShowMenu(false);
                  setGameMode(null);
                }}
              >
                BACK
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