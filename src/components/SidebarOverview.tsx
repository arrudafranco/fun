import { useState } from 'react';
import type { ResourceState } from '../types/resources';
import type { BlocId } from '../types/blocs';
import { ALL_BLOC_IDS } from '../types/blocs';
import { useGameStore } from '../hooks/useGameStore';
import { getDifficultyConfig } from '../types/game';
import Tooltip from './Tooltip';
import ColossusPanel from './ColossusPanel';
import CongressPanel from './CongressPanel';
import RivalBar from './RivalBar';

interface ResourceDef {
  key: keyof ResourceState;
  label: string;
  getDotColor: (value: number) => string;
  max: number;
}

const RESOURCE_DEFS: ResourceDef[] = [
  { key: 'legitimacy', label: 'Legit', max: 100,
    getDotColor: v => v < 30 ? 'bg-rose-400' : v < 50 ? 'bg-amber-400' : 'bg-sky-300' },
  { key: 'narrative', label: 'Narr', max: 100,
    getDotColor: v => v < 30 ? 'bg-rose-400' : v < 50 ? 'bg-amber-400' : 'bg-amber-300' },
  { key: 'capital', label: 'Cap', max: 999,
    getDotColor: v => v < 100 ? 'bg-rose-400' : v < 200 ? 'bg-amber-400' : 'bg-emerald-300' },
  { key: 'mobilization', label: 'Mob', max: 100,
    getDotColor: v => v < 25 ? 'bg-rose-400' : v < 50 ? 'bg-amber-400' : 'bg-rose-300' },
  { key: 'polarization', label: 'Polar', max: 100,
    getDotColor: v => v < 30 ? 'bg-emerald-300' : v < 60 ? 'bg-amber-400' : 'bg-orange-300' },
  { key: 'inflation', label: 'Infl', max: 30,
    getDotColor: v => v < 8 ? 'bg-emerald-300' : v < 15 ? 'bg-yellow-200' : 'bg-rose-400' },
  { key: 'dread', label: 'Dread', max: 100,
    getDotColor: v => v < 20 ? 'bg-emerald-300' : v < 45 ? 'bg-amber-400' : 'bg-rose-400' },
];

const NEGATIVE_RESOURCES = new Set<keyof ResourceState>(['polarization', 'inflation', 'dread']);

function getTrendArrow(
  key: keyof ResourceState,
  current: number,
  previous: number | undefined
): { symbol: string; colorClass: string; srText: string } | null {
  if (previous === undefined) return null;
  const delta = current - previous;
  if (delta === 0) return { symbol: '~', colorClass: 'text-slate-500', srText: 'stable' };
  const isUp = delta > 0;
  const isBad = NEGATIVE_RESOURCES.has(key) ? isUp : !isUp;
  return {
    symbol: isUp ? '\u25B2' : '\u25BC',
    colorClass: isBad ? 'text-rose-400' : 'text-emerald-400',
    srText: `trending ${isUp ? 'up' : 'down'}`,
  };
}

type PanelId = 'cbi' | 'colossus' | 'congress' | 'rival';

export default function SidebarOverview() {
  const resources = useGameStore(s => s.resources);
  const previousResources = useGameStore(s => s.previousResources);
  const centralBankIndependence = useGameStore(s => s.centralBankIndependence);
  const colossus = useGameStore(s => s.colossus);
  const congress = useGameStore(s => s.congress);
  const blocs = useGameStore(s => s.blocs);
  const rival = useGameStore(s => s.rival);
  const difficulty = useGameStore(s => s.difficulty);
  const config = getDifficultyConfig(difficulty);

  const [expandedPanel, setExpandedPanel] = useState<PanelId | null>(null);

  function togglePanel(id: PanelId) {
    setExpandedPanel(prev => prev === id ? null : id);
  }

  // Calculate friendly percentage
  let friendlyPct = 0;
  for (const id of ALL_BLOC_IDS) {
    if (blocs[id].loyalty >= 50) {
      friendlyPct += (congress.seatShares[id] ?? 0) * 100;
    }
  }
  friendlyPct = Math.round(friendlyPct);

  const baseIncome = config.baseCapitalIncome;
  const rawTrade = Math.round(10 * (colossus.tradeDependency / 100));
  const tradeIncome = colossus.alignment < 30 ? Math.round(rawTrade * 0.5) : rawTrade;
  const totalIncome = baseIncome + tradeIncome;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Compact resource lines */}
      <div data-tutorial="resources">
        {RESOURCE_DEFS.map(r => {
          const value = resources[r.key];
          const prevValue = previousResources ? previousResources[r.key] : undefined;
          const trend = getTrendArrow(r.key, value, prevValue);

          return (
            <Tooltip key={r.key} text={r.key === 'capital' ? `${value} (${totalIncome}/turn)` : `${value}/${r.max}`}>
              <div className="flex items-center gap-1.5 px-1 py-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${r.getDotColor(value)} shrink-0`} aria-hidden="true" />
                <span className="text-[11px] text-slate-400 flex-1">{r.label}</span>
                <span className="text-[11px] text-slate-200 font-medium tabular-nums w-8 text-right">
                  {value}
                </span>
                <span className="w-3 text-center">
                  {trend && (
                    <>
                      <span className={`text-[9px] leading-none ${trend.colorClass}`} aria-hidden="true">
                        {trend.symbol}
                      </span>
                      <span className="sr-only">{r.label} {trend.srText}</span>
                    </>
                  )}
                </span>
              </div>
            </Tooltip>
          );
        })}
      </div>

      <hr className="border-slate-700/50 my-0.5" />

      {/* Collapsed panel summaries */}
      <div className="flex flex-col gap-0.5" data-tutorial="panels">
        {/* Central Bank */}
        <button
          onClick={() => togglePanel('cbi')}
          aria-expanded={expandedPanel === 'cbi'}
          className="flex items-center gap-1.5 px-1 py-1 text-left hover:bg-slate-800/60 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-inset"
        >
          <span className="text-sm" aria-hidden="true">🏦</span>
          <span className="text-[11px] text-teal-300 flex-1">Central Bank</span>
          <span className="text-[11px] text-teal-200 font-medium tabular-nums">{centralBankIndependence}</span>
        </button>
        <div className={`overflow-hidden transition-all duration-200 ${expandedPanel === 'cbi' ? 'max-h-24' : 'max-h-0'}`}>
          <div className="px-1 pb-1">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500 bg-teal-300" style={{ width: `${centralBankIndependence}%` }} />
            </div>
          </div>
        </div>

        {/* Colossus */}
        <button
          onClick={() => togglePanel('colossus')}
          aria-expanded={expandedPanel === 'colossus'}
          className="flex items-center gap-1.5 px-1 py-1 text-left hover:bg-slate-800/60 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-inset"
        >
          <span className="text-sm" aria-hidden="true">🌐</span>
          <span className="text-[11px] text-slate-400 shrink-0">Colossus</span>
          <span className="text-[11px] text-violet-300 flex-1 text-right truncate">
            {colossus.alignment} align / {colossus.patience} pat
          </span>
        </button>
        <div className={`overflow-hidden transition-all duration-200 ${expandedPanel === 'colossus' ? 'max-h-60' : 'max-h-0'}`}>
          <div className="px-1 pb-1">
            <ColossusPanel />
          </div>
        </div>

        {/* Congress */}
        <button
          onClick={() => togglePanel('congress')}
          aria-expanded={expandedPanel === 'congress'}
          data-tutorial="congress"
          className="flex items-center gap-1.5 px-1 py-1 text-left hover:bg-slate-800/60 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-inset"
        >
          <span className="text-sm" aria-hidden="true">🗳</span>
          <span className="text-[11px] text-slate-400 shrink-0">Congress</span>
          <span className={`text-[11px] flex-1 text-right ${congress.friendlyMajority ? 'text-green-400' : 'text-red-400'}`}>
            {friendlyPct}%{congress.friendlyMajority ? '' : ' (no majority)'}
          </span>
        </button>
        <div className={`overflow-hidden transition-all duration-200 ${expandedPanel === 'congress' ? 'max-h-40' : 'max-h-0'}`}>
          <div className="px-1 pb-1">
            <CongressPanel />
          </div>
        </div>

        {/* Rival */}
        <button
          onClick={() => togglePanel('rival')}
          aria-expanded={expandedPanel === 'rival'}
          data-tutorial="rival"
          className="flex items-center gap-1.5 px-1 py-1 text-left hover:bg-slate-800/60 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-inset"
        >
          <span className="text-sm" aria-hidden="true">⚔</span>
          <span className="text-[11px] text-rose-300 truncate flex-1">{rival.name}</span>
          <span className="text-[11px] text-rose-200 font-medium tabular-nums">{rival.power}</span>
          {rival.powerDelta !== 0 && (
            <span className={`text-[9px] font-semibold ${rival.powerDelta > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {rival.powerDelta > 0 ? '+' : ''}{rival.powerDelta}
            </span>
          )}
        </button>
        <div className={`overflow-hidden transition-all duration-200 ${expandedPanel === 'rival' ? 'max-h-60' : 'max-h-0'}`}>
          <div className="px-1 pb-1">
            <RivalBar />
          </div>
        </div>
      </div>
    </div>
  );
}
