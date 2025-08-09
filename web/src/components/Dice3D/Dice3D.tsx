import React from 'react';
import { motion } from 'framer-motion';
import './Dice3D.css';

interface Dice3DProps {
  value: number;
  isRolling?: boolean;
  color?: string;
  size?: number;
}

const Dice3D: React.FC<Dice3DProps> = ({ 
  value, 
  isRolling = false, 
  color = '#fff',
  size = 60 
}) => {
  const dotPositions: { [key: number]: { x: number; y: number }[] } = {
    1: [{ x: 50, y: 50 }],
    2: [{ x: 30, y: 30 }, { x: 70, y: 70 }],
    3: [{ x: 30, y: 30 }, { x: 50, y: 50 }, { x: 70, y: 70 }],
    4: [{ x: 30, y: 30 }, { x: 30, y: 70 }, { x: 70, y: 30 }, { x: 70, y: 70 }],
    5: [{ x: 30, y: 30 }, { x: 30, y: 70 }, { x: 50, y: 50 }, { x: 70, y: 30 }, { x: 70, y: 70 }],
    6: [{ x: 30, y: 25 }, { x: 30, y: 50 }, { x: 30, y: 75 }, { x: 70, y: 25 }, { x: 70, y: 50 }, { x: 70, y: 75 }]
  };

  const Face = ({ faceValue, rotation }: { faceValue: number; rotation: string }) => (
    <div 
      className="dice-face" 
      style={{ 
        transform: rotation,
        width: size,
        height: size,
        background: `linear-gradient(145deg, ${color}ee, ${color}99)`,
        boxShadow: `inset 0 0 10px rgba(0,0,0,0.3), 0 0 20px ${color}66`
      }}
    >
      {dotPositions[faceValue].map((pos, i) => (
        <div
          key={i}
          className="dice-dot"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            width: size * 0.15,
            height: size * 0.15,
            background: `radial-gradient(circle, #fff, #ddd)`
          }}
        />
      ))}
    </div>
  );

  const getRotation = () => {
    switch (value) {
      case 1: return { x: 0, y: 0, z: 0 };
      case 2: return { x: 0, y: 90, z: 0 };
      case 3: return { x: 0, y: 180, z: 0 };
      case 4: return { x: 0, y: -90, z: 0 };
      case 5: return { x: -90, y: 0, z: 0 };
      case 6: return { x: 90, y: 0, z: 0 };
      default: return { x: 0, y: 0, z: 0 };
    }
  };

  const rotation = getRotation();

  return (
    <div className="dice-3d-container" style={{ width: size, height: size }}>
      <motion.div
        className="dice-3d"
        style={{ width: size, height: size }}
        animate={isRolling ? {
          rotateX: [0, 720, rotation.x],
          rotateY: [0, 720, rotation.y],
          rotateZ: [0, 720, rotation.z],
        } : {
          rotateX: rotation.x,
          rotateY: rotation.y,
          rotateZ: rotation.z,
        }}
        transition={isRolling ? {
          duration: 1.5,
          ease: "easeOut",
          times: [0, 0.8, 1]
        } : {
          duration: 0.3
        }}
      >
        <Face faceValue={1} rotation={`rotateY(0deg) translateZ(${size/2}px)`} />
        <Face faceValue={2} rotation={`rotateY(90deg) translateZ(${size/2}px)`} />
        <Face faceValue={3} rotation={`rotateY(180deg) translateZ(${size/2}px)`} />
        <Face faceValue={4} rotation={`rotateY(-90deg) translateZ(${size/2}px)`} />
        <Face faceValue={5} rotation={`rotateX(-90deg) translateZ(${size/2}px)`} />
        <Face faceValue={6} rotation={`rotateX(90deg) translateZ(${size/2}px)`} />
      </motion.div>
    </div>
  );
};

export default Dice3D;