import { useState } from 'react';
import Game from './pages/Game';
import Title from './pages/Title';
import type { GameConfig } from './game/types';
import './App.css';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    playerCount: 4,
    mapSize: 'small',
    aiDifficulty: 'normal',
  });

  const handleStartGame = (config: GameConfig) => {
    setGameConfig(config);
    setGameStarted(true);
  };

  const handleBackToTitle = () => {
    setGameStarted(false);
  };

  if (gameStarted) {
    return <Game config={gameConfig} onBackToTitle={handleBackToTitle} />;
  }

  return <Title onStartGame={handleStartGame} />;
}

export default App;