import type { Step } from '../types';
import { Badge, StatusDot } from './Badge';
import { LogEntryRow } from './LogEntry';
import { IconChevron, IconClock } from './icons';

interface Props {
  step: Step;
  expanded: boolean;
  onToggle: () => void;
}

export function StepCard({ step, expanded, onToggle }: Props) {
  return (
    <div className="panel mb-3 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-bg-panel transition"
      >
        <StatusDot state={step.state} />
        <span className="text-sm font-medium text-ink">Step {step.step}</span>
        <Badge state={step.state}>{step.state}</Badge>
        <span className="text-[11px] text-ink-dim">{step.entries.length} entries</span>
        {step.errorCount > 0 && (
          <span className="text-[11px] text-err">· {step.errorCount} error{step.errorCount > 1 ? 's' : ''}</span>
        )}
        {step.warningCount > 0 && (
          <span className="text-[11px] text-warn">· {step.warningCount} warning{step.warningCount > 1 ? 's' : ''}</span>
        )}
        {step.retryCount > 0 && (
          <span className="text-[11px] text-retry">· {step.retryCount} retr{step.retryCount > 1 ? 'ies' : 'y'}</span>
        )}
        <div className="flex-1" />
        {step.totalTimeUsedMs > 0 && (
          <span className="text-[11px] text-ink-dim flex items-center gap-1">
            <IconClock width={11} height={11} /> {formatMs(step.totalTimeUsedMs)}
          </span>
        )}
        <IconChevron
          className="text-ink-dim transition"
          style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
        />
      </button>
      {expanded && (
        <div className="px-3 py-3 border-t border-line space-y-3 bg-bg-panel/40">
          {step.entries.map((e) => (
            <LogEntryRow key={e._id ?? `${e.step}-${e.createdAt}-${e.logMessage}`} entry={e} />
          ))}
        </div>
      )}
    </div>
  );
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}
