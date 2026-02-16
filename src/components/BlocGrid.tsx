import type { BlocId } from '../types/blocs';
import BlocCard from './BlocCard';

interface BlocGroup {
  label: string;
  color: string;
  blocs: BlocId[];
}

const BLOC_GROUPS: BlocGroup[] = [
  { label: 'State Power', color: 'border-rose-500/50', blocs: ['court', 'military', 'enforcers'] },
  { label: 'Capital', color: 'border-emerald-500/50', blocs: ['finance', 'industry', 'tech', 'agri', 'mainStreet'] },
  { label: 'Culture', color: 'border-amber-500/50', blocs: ['media', 'clergy', 'academy', 'artists'] },
  { label: 'Labor', color: 'border-violet-500/50', blocs: ['labor'] },
  { label: 'Shadow', color: 'border-slate-500/50', blocs: ['syndicate'] },
];

interface BlocGridProps {
  compact?: boolean;
}

export default function BlocGrid({ compact }: BlocGridProps) {
  if (compact) {
    return (
      <div className="p-3 flex flex-col gap-3">
        {BLOC_GROUPS.map(group => (
          <div key={group.label}>
            <h3 className={`text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 pl-1 border-l-2 ${group.color}`}>
              {group.label}
            </h3>
            <div className="flex flex-col gap-1">
              {group.blocs.map(id => (
                <BlocCard key={id} blocId={id} compact />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4">
      {BLOC_GROUPS.map(group => (
        <div key={group.label} className="mb-4">
          <h3 className={`text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 pl-2 border-l-2 ${group.color}`}>
            {group.label}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {group.blocs.map(id => (
              <BlocCard key={id} blocId={id} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
