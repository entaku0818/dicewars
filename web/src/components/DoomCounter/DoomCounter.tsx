import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DoomState } from '../../game/types';
import './DoomCounter.css';

interface DoomCounterProps {
  turn: number;
  doomState?: DoomState;
  doomStartTurn: number;
}

const DoomCounter: React.FC<DoomCounterProps> = ({ turn, doomState }) => {
  if (!doomState) return null;

  const isWarning = doomState.turnsUntilDoom <= 5 && doomState.turnsUntilDoom > 0;
  const isDoomActive = doomState.isActive;

  return (
    <div className={`doom-counter ${isWarning ? 'warning' : ''} ${isDoomActive ? 'active' : ''}`}>
      <div className="doom-content">
        <div className="turn-display">
          <span className="turn-label">ターン</span>
          <span className="turn-number">{turn}</span>
        </div>
        
        <AnimatePresence mode="wait">
          {!isDoomActive ? (
            <motion.div 
              className="doom-status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {doomState.turnsUntilDoom > 0 ? (
                <>
                  <span className="doom-label">破滅まで</span>
                  <motion.span 
                    className="doom-countdown"
                    key={doomState.turnsUntilDoom}
                    initial={{ scale: 1.5, color: '#ff0000' }}
                    animate={{ scale: 1, color: isWarning ? '#ff6666' : '#ffffff' }}
                    transition={{ duration: 0.3 }}
                  >
                    {doomState.turnsUntilDoom}
                  </motion.span>
                  <span className="doom-label">ターン</span>
                </>
              ) : (
                <span className="doom-imminent">破滅の時...</span>
              )}
            </motion.div>
          ) : (
            <motion.div 
              className="doom-active-status"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <span className="doom-active-text">🔥 破滅進行中 🔥</span>
              <span className="territories-destroyed">
                崩壊領土: {doomState.territoriesDestroyed}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {isWarning && !isDoomActive && (
        <motion.div 
          className="warning-flash"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
        />
      )}
    </div>
  );
};

export default DoomCounter;