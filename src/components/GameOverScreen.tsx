import { useEffect, useRef, useState } from 'react';
import type { Difficulty } from '../types/game';
import { useGameStore } from '../hooks/useGameStore';
import DifficultySelect from './DifficultySelect';
import { ENDINGS, TONE_ACCENT, TONE_BORDER, TONE_BUTTON_BG } from '../data/endings';

function statColor(value: number, greenAbove: number, yellowAbove: number): string {
  if (value >= greenAbove) return 'text-green-400';
  if (value >= yellowAbove) return 'text-amber-400';
  return 'text-red-400';
}

function statColorInverse(value: number, greenBelow: number, yellowBelow: number): string {
  if (value <= greenBelow) return 'text-green-400';
  if (value <= yellowBelow) return 'text-amber-400';
  return 'text-red-400';
}

export default function GameOverScreen() {
  const gameOver = useGameStore(s => s.gameOver);
  const showDispatch = useGameStore(s => s.showDispatch);
  const ending = useGameStore(s => s.ending);
  const turn = useGameStore(s => s.turn);
  const maxTurns = useGameStore(s => s.maxTurns);
  const resources = useGameStore(s => s.resources);
  const laborCohesion = useGameStore(s => s.laborCohesion);
  const centralBankIndependence = useGameStore(s => s.centralBankIndependence);
  const colossus = useGameStore(s => s.colossus);
  const rival = useGameStore(s => s.rival);
  const initGame = useGameStore(s => s.initGame);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);

  useEffect(() => {
    if (gameOver && !showDispatch) {
      setShowDifficultySelect(false);
      const id = requestAnimationFrame(() => buttonRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [gameOver, showDispatch]);

  if (!gameOver || !ending || showDispatch) return null;

  if (showDifficultySelect) {
    return (
      <div className="fixed inset-0 z-50 bg-black/85">
        <DifficultySelect onSelect={(difficulty: Difficulty) => initGame(difficulty)} />
      </div>
    );
  }

  const endingData = ENDINGS[ending];
  const accent = TONE_ACCENT[endingData.tone];
  const border = TONE_BORDER[endingData.tone];
  const buttonBg = TONE_BUTTON_BG[endingData.tone];

  const turnLabel = turn >= maxTurns ? 'Full term completed' : `Month ${turn} of ${maxTurns}`;

  const stats: { label: string; value: number | string; colorClass: string }[] = [
    { label: 'Turn reached', value: turnLabel, colorClass: 'text-slate-200' },
    { label: 'Legitimacy', value: resources.legitimacy, colorClass: statColor(resources.legitimacy, 60, 30) },
    { label: 'Narrative', value: resources.narrative, colorClass: statColor(resources.narrative, 60, 30) },
    { label: 'Capital', value: resources.capital, colorClass: statColor(resources.capital, 40, 15) },
    { label: 'Polarization', value: resources.polarization, colorClass: statColorInverse(resources.polarization, 40, 70) },
    { label: 'Rival Power', value: rival.power, colorClass: statColorInverse(rival.power, 30, 60) },
    { label: 'Labor Cohesion (hidden)', value: laborCohesion, colorClass: statColor(laborCohesion, 60, 30) },
    { label: 'Central Bank (hidden)', value: centralBankIndependence, colorClass: statColor(centralBankIndependence, 60, 30) },
    { label: 'Colossus Alignment', value: colossus.alignment, colorClass: statColorInverse(colossus.alignment, 50, 75) },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="ending-title"
      aria-describedby="ending-flavor"
    >
      <div className={`bg-slate-800 border ${border} rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-8 text-center`}>
        <h2
          id="ending-title"
          className={`text-3xl font-bold ${accent} mb-4 font-pixel`}
        >
          {endingData.title}
        </h2>
        <p
          id="ending-flavor"
          className="text-slate-300 text-base leading-relaxed mb-6 italic"
        >
          {endingData.flavor}
        </p>

        {/* Final stats */}
        <div className="bg-slate-900/60 rounded-xl p-4 mb-8 text-left">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center font-pixel">
            Final Report
          </h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {stats.map(s => (
              <div key={s.label} className="flex justify-between">
                <dt className="text-slate-400">{s.label}</dt>
                <dd className={`font-medium ${s.colorClass}`}>{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <button
          ref={buttonRef}
          onClick={() => setShowDifficultySelect(true)}
          className={`px-8 py-3 rounded-lg ${buttonBg} text-white font-semibold transition-colors focus:outline-none focus:ring-2`}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
