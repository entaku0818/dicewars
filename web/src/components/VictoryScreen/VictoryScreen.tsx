import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './VictoryScreen.css';

interface VictoryScreenProps {
  winner: string;
  isVisible: boolean;
  onNewGame: () => void;
  stats?: {
    turns: number;
    territoriesCaptured: number;
    battlesWon: number;
  };
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({
  winner,
  isVisible,
  onNewGame,
  stats
}) => {
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowFireworks(true);
      const timer = setTimeout(() => setShowFireworks(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const createFirework = (delay: number, x: number, y: number) => (
    <motion.div
      key={`${delay}-${x}-${y}`}
      className="firework"
      initial={{ scale: 0, opacity: 1 }}
      animate={{
        scale: [0, 1, 1.5],
        opacity: [1, 1, 0],
        x: [0, (Math.random() - 0.5) * 200],
        y: [0, (Math.random() - 0.5) * 200]
      }}
      transition={{
        duration: 1.5,
        delay,
        ease: "easeOut"
      }}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
      }}
    >
      {[...Array(12)].map((_, i) => (
        <motion.span
          key={i}
          className="firework-particle"
          animate={{
            x: Math.cos(i * 30 * Math.PI / 180) * 100,
            y: Math.sin(i * 30 * Math.PI / 180) * 100,
            scale: [1, 0],
          }}
          transition={{ duration: 1, delay: delay }}
          style={{
            background: `hsl(${Math.random() * 360}, 100%, 50%)`,
          }}
        />
      ))}
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="victory-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="victory-content"
            initial={{ scale: 0.5, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.2
            }}
          >
            {/* Crown Animation */}
            <motion.div
              className="crown"
              initial={{ y: -200, rotate: -180 }}
              animate={{ y: 0, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 10,
                delay: 0.5
              }}
            >
              👑
            </motion.div>

            {/* Victory Text */}
            <motion.h1
              className="victory-title"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ 
                duration: 0.8,
                delay: 0.8,
                ease: "backOut"
              }}
            >
              VICTORY!
            </motion.h1>

            <motion.h2
              className="winner-name"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              {winner} Wins!
            </motion.h2>

            {/* Stats */}
            {stats && (
              <motion.div
                className="victory-stats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <div className="stat-item">
                  <span className="stat-label">Turns</span>
                  <motion.span
                    className="stat-value"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.4, type: "spring" }}
                  >
                    {stats.turns}
                  </motion.span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Territories</span>
                  <motion.span
                    className="stat-value"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.6, type: "spring" }}
                  >
                    {stats.territoriesCaptured}
                  </motion.span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Battles Won</span>
                  <motion.span
                    className="stat-value"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.8, type: "spring" }}
                  >
                    {stats.battlesWon}
                  </motion.span>
                </div>
              </motion.div>
            )}

            {/* New Game Button */}
            <motion.button
              className="new-game-button"
              onClick={onNewGame}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="button-text">New Game</span>
              <span className="button-icon">🎲</span>
            </motion.button>
          </motion.div>

          {/* Fireworks */}
          {showFireworks && (
            <div className="fireworks-container">
              {[...Array(6)].map((_, i) => 
                createFirework(
                  i * 0.3,
                  20 + (i % 3) * 30,
                  20 + Math.floor(i / 3) * 40
                )
              )}
            </div>
          )}

          {/* Confetti */}
          <div className="confetti-container">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="confetti"
                initial={{ 
                  y: -100,
                  x: Math.random() * window.innerWidth,
                  rotate: 0
                }}
                animate={{ 
                  y: window.innerHeight + 100,
                  rotate: 360 * (Math.random() > 0.5 ? 1 : -1)
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "linear"
                }}
                style={{
                  background: `hsl(${Math.random() * 360}, 100%, 50%)`,
                  width: 10 + Math.random() * 10,
                  height: 10 + Math.random() * 10,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VictoryScreen;