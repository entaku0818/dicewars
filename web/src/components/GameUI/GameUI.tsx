import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BattleResult } from '../../game/types';
import Dice3D from '../Dice3D/Dice3D';
import './GameUI.css';

interface GameUIProps {
  battleResult: BattleResult | null;
}

const GameUI: React.FC<GameUIProps> = ({
  battleResult,
}) => {
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    if (battleResult) {
      setIsRolling(true);
      setTimeout(() => setIsRolling(false), 500);
    }
  }, [battleResult]);

  return (
    <>
      <AnimatePresence>
        {battleResult && (
          <motion.div 
            className="battle-result"
            initial={{ scale: 0.8, opacity: 0, x: 100 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0.8, opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <motion.div 
              className="battle-title"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              ⚔️ Battle Result ⚔️
            </motion.div>
            <div className="battle-rolls">
              <motion.div 
                className="roll-group"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="roll-label attacker-label">⚔️ Attacker</span>
                <div className="dice-container">
                  {battleResult.attacker.rolls.map((roll, i) => (
                    <Dice3D key={i} value={roll} color="#4CAF50" size={50} isRolling={isRolling} />
                  ))}
                  <motion.span 
                    className="roll-total"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring" }}
                  >
                    = {battleResult.attacker.total}
                  </motion.span>
                </div>
              </motion.div>
              <motion.div 
                className="roll-group"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="roll-label defender-label">🛡️ Defender</span>
                <div className="dice-container">
                  {battleResult.defender.rolls.map((roll, i) => (
                    <Dice3D key={i} value={roll} color="#f44336" size={50} isRolling={isRolling} />
                  ))}
                  <motion.span 
                    className="roll-total"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring" }}
                  >
                    = {battleResult.defender.total}
                  </motion.span>
                </div>
              </motion.div>
            </div>
            <motion.div 
              className={`battle-winner ${battleResult.winner}`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1, type: "spring", stiffness: 200 }}
            >
              {battleResult.winner === 'attacker' ? 
                '⚔️ ATTACKER WINS! ⚔️' : 
                '🛡️ DEFENDER HOLDS! 🛡️'
              }
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GameUI;