import type { LogEntry, Step, StepState } from '../types';

const WARNING_RE = /warning|deprecation/i;
const ERROR_RE = /error|exception|traceback|failed/i;

export function entryHasError(e: LogEntry): boolean {
  if (/error|exception|fail/i.test(e.logMessage)) return true;
  if (e.result && ERROR_RE.test(e.result)) return true;
  return false;
}

export function entryHasWarning(e: LogEntry): boolean {
  if (e.result && WARNING_RE.test(e.result)) return true;
  return false;
}

export function entryIsRetry(e: LogEntry): boolean {
  return e.status === 'retry' || /retry/i.test(e.logMessage);
}

export function groupByStep(entries: LogEntry[]): Step[] {
  const map = new Map<number, LogEntry[]>();
  for (const e of entries) {
    if (!map.has(e.step)) map.set(e.step, []);
    map.get(e.step)!.push(e);
  }

  const steps: Step[] = [];
  for (const [step, list] of map) {
    list.sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''));
    let warningCount = 0;
    let errorCount = 0;
    let retryCount = 0;
    let totalTimeUsedMs = 0;
    let maxTime = 0;
    for (const e of list) {
      if (entryHasWarning(e)) warningCount++;
      if (entryHasError(e)) errorCount++;
      if (entryIsRetry(e)) retryCount++;
      if (typeof e.timeUsed === 'number') {
        maxTime = Math.max(maxTime, e.timeUsed);
      }
    }
    totalTimeUsedMs = maxTime; // timeUsed appears cumulative-per-step in this format

    const state = deriveState(list, { warningCount, errorCount, retryCount });

    steps.push({
      step,
      entries: list,
      state,
      warningCount,
      errorCount,
      retryCount,
      totalTimeUsedMs,
      startedAt: list[0]?.createdAt,
      endedAt: list[list.length - 1]?.updatedAt ?? list[list.length - 1]?.createdAt,
    });
  }

  steps.sort((a, b) => a.step - b.step);
  return steps;
}

function deriveState(
  entries: LogEntry[],
  counts: { warningCount: number; errorCount: number; retryCount: number },
): StepState {
  if (counts.errorCount > 0) return 'error';
  if (counts.retryCount > 0) return 'retry';
  const hasCompleted = entries.some((e) => e.status === 'completed' || e.status === 'success');
  if (counts.warningCount > 0) return hasCompleted ? 'warning' : 'warning';
  if (hasCompleted) return 'success';
  return 'info';
}

export function summarizeEntries(entries: LogEntry[]) {
  let warnings = 0;
  let errors = 0;
  let retries = 0;
  let success = 0;
  for (const e of entries) {
    if (entryHasWarning(e)) warnings++;
    if (entryHasError(e)) errors++;
    if (entryIsRetry(e)) retries++;
    if (e.status === 'success' || e.status === 'completed') success++;
  }
  return { warnings, errors, retries, success, total: entries.length };
}
