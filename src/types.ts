export type EntryStatus = 'in_progress' | 'retry' | 'success' | 'completed';

export interface LogEntry {
  _id?: string;
  userId?: string;
  executionId?: string;
  logMessage: string;
  step: number;
  query?: string;
  command?: string;
  result?: string;
  timeUsed?: number;
  status: EntryStatus | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExecutionPayload {
  status?: string;
  data: LogEntry[];
}

export type StepState = 'success' | 'error' | 'warning' | 'info' | 'retry';

export interface Step {
  step: number;
  entries: LogEntry[];
  state: StepState;
  warningCount: number;
  errorCount: number;
  retryCount: number;
  totalTimeUsedMs: number;
  startedAt?: string;
  endedAt?: string;
}
