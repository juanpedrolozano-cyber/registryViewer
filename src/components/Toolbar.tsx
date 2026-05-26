import { IconCopy, IconDownload, IconChevron } from './icons';

export type SeverityFilter = 'all' | 'errors' | 'errors_warnings';

interface Props {
  hidePreparing: boolean;
  onHidePreparingChange: (v: boolean) => void;
  expandByDefault: boolean;
  onExpandByDefaultChange: (v: boolean) => void;
  severity: SeverityFilter;
  onSeverityChange: (v: SeverityFilter) => void;
  onCopyInitialQuery: () => void;
  onCopyJson: () => void;
  onDownloadJson: () => void;
  onCollapseAll: () => void;
  onExpandAll: () => void;
  hasInitialQuery: boolean;
  counters: { success: number; warnings: number; errors: number; retries: number };
}

export function Toolbar(p: Props) {
  return (
    <div className="panel mb-4">
      <div className="flex flex-wrap items-center gap-3 px-3 py-2 border-b border-line">
        <Counter label="success" value={p.counters.success} color="text-ok" />
        <Counter label="warnings" value={p.counters.warnings} color="text-warn" />
        <Counter label="errors" value={p.counters.errors} color="text-err" />
        <Counter label="retries" value={p.counters.retries} color="text-retry" />
      </div>
      <div className="flex flex-wrap items-center gap-3 px-3 py-2">
        <label className="flex items-center gap-2 text-[12px] text-ink-muted cursor-pointer select-none">
          <input
            type="checkbox"
            checked={p.hidePreparing}
            onChange={(e) => p.onHidePreparingChange(e.target.checked)}
            className="accent-info"
          />
          Hide “Preparing to execute step”
        </label>
        <label className="flex items-center gap-2 text-[12px] text-ink-muted cursor-pointer select-none">
          <input
            type="checkbox"
            checked={p.expandByDefault}
            onChange={(e) => p.onExpandByDefaultChange(e.target.checked)}
            className="accent-info"
          />
          Expand all by default
        </label>
        <span className="h-5 w-px bg-line" />
        <div className="flex items-center gap-1">
          <SeverityPill active={p.severity === 'all'} onClick={() => p.onSeverityChange('all')}>All</SeverityPill>
          <SeverityPill active={p.severity === 'errors'} onClick={() => p.onSeverityChange('errors')}>Only errors</SeverityPill>
          <SeverityPill active={p.severity === 'errors_warnings'} onClick={() => p.onSeverityChange('errors_warnings')}>
            Errors + warnings
          </SeverityPill>
        </div>
        <div className="flex-1" />
        {p.hasInitialQuery && (
          <button onClick={p.onCopyInitialQuery} className="btn"><IconCopy /> Copy initial query</button>
        )}
        <button onClick={p.onCopyJson} className="btn"><IconCopy /> Copy JSON</button>
        <button onClick={p.onDownloadJson} className="btn"><IconDownload /> Download JSON</button>
        <button onClick={p.onCollapseAll} className="btn"><IconChevron style={{ transform: 'rotate(-90deg)' }} /> Collapse</button>
        <button onClick={p.onExpandAll} className="btn"><IconChevron /> Expand</button>
      </div>
    </div>
  );
}

function Counter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[12px]">
      <span className={`font-mono text-sm ${color}`}>{value}</span>
      <span className="text-ink-dim">{label}</span>
    </div>
  );
}

function SeverityPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={
        'px-2.5 py-1 rounded-md text-[11px] border transition ' +
        (active
          ? 'bg-info/15 text-info border-info/40'
          : 'bg-bg-elev text-ink-muted border-line hover:border-ink-dim hover:text-ink')
      }
    >
      {children}
    </button>
  );
}
