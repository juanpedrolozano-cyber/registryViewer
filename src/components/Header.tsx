import { IconX, IconSearch } from './icons';

interface Props {
  executionId?: string;
  totalSteps: number;
  totalEntries: number;
  search: string;
  onSearchChange: (v: string) => void;
  onReset: () => void;
  loaded: boolean;
}

export function Header({ executionId, totalSteps, totalEntries, search, onSearchChange, onReset, loaded }: Props) {
  return (
    <header className="border-b border-line bg-bg-elev/60 backdrop-blur sticky top-0 z-30">
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-ok text-lg font-semibold tracking-tight">KPU Log Viewer</span>
        </div>
        {loaded && (
          <>
            <span className="h-5 w-px bg-line" />
            <div className="text-[12px] text-ink-muted">
              {executionId ? (
                <>
                  <span className="text-ink-dim">execution</span>{' '}
                  <span className="font-mono text-ink">{executionId}</span>
                </>
              ) : (
                <span className="text-ink-dim">no executionId</span>
              )}
            </div>
            <span className="h-5 w-px bg-line" />
            <div className="text-[12px] text-ink-muted">
              <span className="text-ink">{totalSteps}</span> steps ·{' '}
              <span className="text-ink">{totalEntries}</span> entries
            </div>
          </>
        )}
        <div className="flex-1" />
        {loaded && (
          <>
            <div className="relative">
              <IconSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-ink-dim" />
              <input
                type="text"
                placeholder="Search logs…"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="field !py-1 pl-7 pr-2 w-64"
              />
            </div>
            <button onClick={onReset} className="btn" title="Close / reset">
              <IconX /> close
            </button>
          </>
        )}
      </div>
    </header>
  );
}
