import { useGameStore } from '../hooks/useGameStore';
import Tooltip from './Tooltip';

export default function RivalBar() {
  const rival = useGameStore(s => s.rival);

  const deltaColor = rival.powerDelta > 0
    ? 'text-rose-400'
    : rival.powerDelta < 0
      ? 'text-emerald-400'
      : 'text-slate-500';
  const deltaPrefix = rival.powerDelta > 0 ? '+' : '';
  const deltaLabel = rival.powerDelta > 0
    ? `Rival power increasing by ${rival.powerDelta} per turn`
    : rival.powerDelta < 0
      ? `Rival power decreasing by ${Math.abs(rival.powerDelta)} per turn`
      : 'Rival power unchanged this turn';

  return (
    <div
      className="rounded-xl p-3 bg-slate-800 border border-rose-400/30"
      style={{
        borderColor: `rgba(251,113,133,${Math.min(rival.power / 100, 0.3).toFixed(2)})`,
        boxShadow: `0 4px 6px -1px rgba(136,19,55,${Math.min(rival.power / 100 * 0.4, 0.2).toFixed(2)})`,
      }}
    >
      <h3 className="text-xs font-semibold text-rose-300 uppercase tracking-wider mb-1 font-pixel">
        Rival
      </h3>
      <p className="text-sm font-medium text-slate-100 truncate">{rival.name}</p>
      <p className="text-xs text-slate-400 mb-2 truncate">{rival.title}</p>

      {/* Rival action text */}
      {rival.lastAction && (
        <p className="text-xs italic text-slate-400/80 mb-2 leading-relaxed" aria-label="Rival's latest action">
          "{rival.lastAction}"
        </p>
      )}

      {/* Effect badges */}
      {(rival.gridlockCountdown > 0 || rival.cultureWarCountdown > 0) && (
        <div className="flex flex-wrap gap-1.5 mb-2" role="list" aria-label="Active rival effects">
          {rival.gridlockCountdown > 0 && (
            <Tooltip text="All policy costs +20%">
              <span
                role="listitem"
                tabIndex={0}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30 cursor-help"
              >
                Gridlock {rival.gridlockCountdown}t
              </span>
            </Tooltip>
          )}
          {rival.cultureWarCountdown > 0 && (
            <Tooltip text="Clergy and Main Street losing loyalty each turn">
              <span
                role="listitem"
                tabIndex={0}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 cursor-help"
              >
                Culture War {rival.cultureWarCountdown}t
              </span>
            </Tooltip>
          )}
        </div>
      )}

      {/* Power bar */}
      <Tooltip text="The opposition's momentum. Grows from polarization, inflation, and low legitimacy. At 100, they win.">
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span id="rival-power-label">Power</span>
            <span className="flex items-center gap-1.5">
              {rival.power}
              {rival.powerDelta !== 0 && (
                <span className={`text-[10px] font-semibold ${deltaColor}`} aria-label={deltaLabel}>
                  {deltaPrefix}{rival.powerDelta}
                </span>
              )}
            </span>
          </div>
          <div
            className="h-2 bg-slate-700 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={rival.power}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-labelledby="rival-power-label"
          >
            <div
              className="h-full rounded-full transition-all duration-500 bg-rose-400"
              style={{
                width: `${rival.power}%`,
                boxShadow: `0 0 ${Math.max(4, rival.power / 5)}px rgba(251,113,133,${Math.min(0.8, rival.power / 100).toFixed(2)})`,
              }}
            />
          </div>
        </div>
      </Tooltip>
    </div>
  );
}
