import { useState } from 'react';
import Game from './pages/Game';
import Title from './pages/Title';
import Lobby from './pages/Lobby';
import type { GameConfig } from './game/types';
import './App.css';

type AppState = 'title' | 'game' | 'lobby';

function App() {
  const [appState, setAppState] = useState<AppState>('title');
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    playerCount: 4,
    mapSize: 'small',
    aiDifficulty: 'normal',
  });
  const [lobbyMode, setLobbyMode] = useState<'create' | 'join'>('create');

  const handleStartGame = (config: GameConfig) => {
    setGameConfig(config);
    setAppState('game');
  };

  const handleStartOnline = (mode: 'create' | 'join') => {
    setLobbyMode(mode);
    setAppState('lobby');
  };

  const handleBackToTitle = () => {
    setAppState('title');
  };

  if (appState === 'game') {
    return <Game config={gameConfig} onBackToTitle={handleBackToTitle} />;
  }

  if (appState === 'lobby') {
    return (
      <Lobby
        mode={lobbyMode}
        config={gameConfig}
        onGameStart={handleStartGame}
        onBack={handleBackToTitle}
      />
    );
  }

  return <Title onStartGame={handleStartGame} onStartOnline={handleStartOnline} />;
}

export default App;