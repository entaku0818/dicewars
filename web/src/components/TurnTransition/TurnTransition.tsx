import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Player } from '../../game/types';
import './TurnTransition.css';

interface TurnTransitionProps {
  player: Player | undefined;
  isVisible: boolean;
  onComplete: () => void;
}

const TurnTransition: React.FC<TurnTransitionProps> = ({ player, isVisible, onComplete }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible && player && !player.isAI) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    } else if (player?.isAI) {
      onComplete();
    }
  }, [isVisible, player, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="turn-transition-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="turn-transition-content"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <motion.div
              className="player-color-ring"
              style={{ borderColor: player?.color }}
              initial={{ rotate: -180 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.5 }}
            />
            <h1 className="player-name" style={{ color: player?.color }}>
              {player?.name}'s Turn
            </h1>
            <p className="ready-text">Get Ready!</p>
            <motion.div
              className="dice-animation"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🎲
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TurnTransition;