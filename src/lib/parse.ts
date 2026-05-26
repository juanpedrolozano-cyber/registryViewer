import type { LogEntry, ExecutionPayload } from '../types';

export interface ParseResult {
  entries: LogEntry[];
  raw: unknown;
}

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

export function parsePayload(input: string | unknown): ParseResult {
  let parsed: unknown;
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) throw new ParseError('Empty input');
    try {
      parsed = JSON.parse(trimmed);
    } catch (e) {
      throw new ParseError(`Invalid JSON: ${(e as Error).message}`);
    }
  } else {
    parsed = input;
  }

  const entries = extractEntries(parsed);
  if (!entries.length) {
    throw new ParseError('No log entries found. Expected `{ data: [...] }` or an array of entries.');
  }
  return { entries, raw: parsed };
}

function extractEntries(parsed: unknown): LogEntry[] {
  if (Array.isArray(parsed)) {
    return parsed.filter(isEntryLike) as LogEntry[];
  }
  if (parsed && typeof parsed === 'object') {
    const obj = parsed as Partial<ExecutionPayload> & Record<string, unknown>;
    if (Array.isArray(obj.data)) {
      return (obj.data as unknown[]).filter(isEntryLike) as LogEntry[];
    }
    // Heuristic fallback: look for any top-level array of entry-like objects.
    for (const value of Object.values(obj)) {
      if (Array.isArray(value) && value.length && value.every(isEntryLike)) {
        return value as LogEntry[];
      }
    }
  }
  return [];
}

function isEntryLike(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.logMessage === 'string' &&
    typeof v.step === 'number' &&
    (typeof v.status === 'string' || v.status === undefined)
  );
}
