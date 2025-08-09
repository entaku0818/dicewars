import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './BattleEffects.css';

interface BattleEffectsProps {
  isAttacking: boolean;
  fromPosition?: { x: number; y: number };
  toPosition?: { x: number; y: number };
  winner?: 'attacker' | 'defender';
}

const BattleEffects: React.FC<BattleEffectsProps> = ({
  isAttacking,
  fromPosition,
  toPosition,
  winner
}) => {
  const [showImpact, setShowImpact] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (isAttacking && fromPosition && toPosition) {
      setTimeout(() => setShowImpact(true), 500);
      setTimeout(() => {
        setShowImpact(false);
        setShowResult(true);
      }, 1000);
      setTimeout(() => setShowResult(false), 2500);
    }
  }, [isAttacking, fromPosition, toPosition]);

  if (!fromPosition || !toPosition) return null;

  return (
    <div className="battle-effects">
      <AnimatePresence>
        {isAttacking && (
          <>
            {/* Attack Line */}
            <motion.svg className="attack-svg">
              <motion.line
                x1={fromPosition.x}
                y1={fromPosition.y}
                x2={toPosition.x}
                y2={toPosition.y}
                stroke="#FFD700"
                strokeWidth="3"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </motion.svg>

            {/* Energy Projectile */}
            <motion.div
              className="energy-projectile"
              initial={{ 
                x: fromPosition.x - 15, 
                y: fromPosition.y - 15,
                scale: 0
              }}
              animate={{ 
                x: toPosition.x - 15, 
                y: toPosition.y - 15,
                scale: [0, 1.5, 1]
              }}
              transition={{ 
                duration: 0.5,
                ease: "easeOut"
              }}
            />

            {/* Impact Effect */}
            {showImpact && (
              <motion.div
                className="impact-effect"
                style={{
                  left: toPosition.x,
                  top: toPosition.y
                }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            )}

            {/* Result Text */}
            {showResult && winner && (
              <motion.div
                className={`battle-result-text ${winner}`}
                style={{
                  left: toPosition.x,
                  top: toPosition.y - 50
                }}
                initial={{ y: 0, opacity: 0, scale: 0.5 }}
                animate={{ y: -30, opacity: 1, scale: 1.2 }}
                exit={{ y: -60, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.8, ease: "backOut" }}
              >
                {winner === 'attacker' ? '⚔️ CAPTURED!' : '🛡️ DEFENDED!'}
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BattleEffects;