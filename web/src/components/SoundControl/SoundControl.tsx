import React, { useState } from 'react';
import { soundManager } from '../../game/sound/SoundManager';
import './SoundControl.css';

const SoundControl: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(soundManager.isEnabled());
  const [volume, setVolume] = useState(soundManager.getVolume() * 100);

  const handleToggleSound = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    soundManager.setEnabled(newState);
    if (newState) {
      soundManager.play('click');
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    soundManager.setVolume(newVolume / 100);
    soundManager.play('click', newVolume / 100);
  };

  return (
    <div className="sound-control">
      <button 
        className={`sound-toggle ${isEnabled ? 'enabled' : 'disabled'}`}
        onClick={handleToggleSound}
        title={isEnabled ? 'Mute sound' : 'Enable sound'}
      >
        {isEnabled ? '🔊' : '🔇'}
      </button>
      {isEnabled && (
        <div className="volume-control">
          <span className="volume-icon">🔈</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
          <span className="volume-icon">🔊</span>
          <span className="volume-value">{Math.round(volume)}%</span>
        </div>
      )}
    </div>
  );
};

export default SoundControl;