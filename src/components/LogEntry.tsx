import type { LogEntry } from '../types';
import type { StepState } from '../types';
import { Badge } from './Badge';
import { CodeBlock } from './CodeBlock';
import { IconClock, IconAlert, IconError, IconRefresh, IconCheck } from './icons';
import { entryHasError, entryHasWarning, entryIsRetry } from '../lib/groupSteps';

interface Props {
  entry: LogEntry;
}

export function LogEntryRow({ entry }: Props) {
  const hasError = entryHasError(entry);
  const hasWarn = entryHasWarning(entry);
  const isRetry = entryIsRetry(entry);
  const state: StepState = hasError
    ? 'error'
    : isRetry
    ? 'retry'
    : hasWarn
    ? 'warning'
    : entry.status === 'success' || entry.status === 'completed'
    ? 'success'
    : 'info';

  return (
    <div className="border-l-2 pl-3 py-2 space-y-2" style={{ borderColor: borderColor(state) }}>
      <div className="flex items-center gap-2 flex-wrap">
        <StateIcon state={state} />
        <span className="text-sm text-ink">{entry.logMessage}</span>
        <Badge state={state}>{entry.status}</Badge>
        {typeof entry.timeUsed === 'number' && entry.timeUsed > 0 && (
          <span className="text-[11px] text-ink-dim flex items-center gap-1">
            <IconClock width={11} height={11} /> {formatMs(entry.timeUsed)}
          </span>
        )}
        {entry.createdAt && (
          <span className="text-[11px] text-ink-dim font-mono">{shortTime(entry.createdAt)}</span>
        )}
      </div>

      {entry.command && (
        <CodeBlock text={entry.command} label="command" language="python" maxHeightClass="max-h-[320px]" />
      )}
      {entry.result && (
        <CodeBlock text={entry.result} label="result" maxHeightClass="max-h-[320px]" />
      )}
    </div>
  );
}

function StateIcon({ state }: { state: StepState }) {
  const cls = {
    success: 'text-ok',
    error: 'text-err',
    warning: 'text-warn',
    info: 'text-info',
    retry: 'text-retry',
  }[state];
  if (state === 'error') return <IconError className={cls} />;
  if (state === 'warning') return <IconAlert className={cls} />;
  if (state === 'retry') return <IconRefresh className={cls} />;
  if (state === 'success') return <IconCheck className={cls} />;
  return <span className={`inline-block w-2.5 h-2.5 rounded-full bg-current ${cls}`} />;
}

function borderColor(state: StepState): string {
  return {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    retry: '#a855f7',
  }[state];
}

function shortTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toISOString().slice(11, 23);
  } catch {
    return iso;
  }
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}
