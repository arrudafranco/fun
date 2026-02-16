import { useGameStore } from './hooks/useGameStore';
import type { Difficulty } from './types/game';
import Dashboard from './components/Dashboard';
import DifficultySelect from './components/DifficultySelect';

export default function App() {
  const initGame = useGameStore(s => s.initGame);
  const gameStarted = useGameStore(s => s.gameStarted);

  const handleSelect = (difficulty: Difficulty) => {
    initGame(difficulty);
  };

  if (!gameStarted) {
    return <DifficultySelect onSelect={handleSelect} />;
  }

  return <Dashboard />;
}
