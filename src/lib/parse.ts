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

    // If the input is an HTML page from the original dashboard, the data is
    // injected as a global. Pull it out before falling back to JSON parsing.
    if (looksLikeHtml(trimmed)) {
      const embedded = extractEmbeddedPayload(trimmed);
      if (embedded == null) {
        throw new ParseError(
          'Input looks like HTML but no `window.__EXECUTION_PAYLOAD__ = {...}` block was found.\n' +
            'Open the dashboard page, View Source, and paste the full HTML.',
        );
      }
      parsed = embedded;
    } else {
      try {
        parsed = JSON.parse(trimmed);
      } catch (e) {
        throw new ParseError(`Invalid JSON: ${(e as Error).message}`);
      }
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

function looksLikeHtml(s: string): boolean {
  return /^\s*<!doctype html|^\s*<html[\s>]/i.test(s) || /<script\b/i.test(s.slice(0, 4096));
}

function extractEmbeddedPayload(html: string): unknown | null {
  // Look for `window.__EXECUTION_PAYLOAD__ = {...};` or `= [...];`
  // We anchor on the assignment and then walk balanced braces/brackets so we
  // don't get confused by `}` inside strings.
  const m = /window\.__EXECUTION_PAYLOAD__\s*=\s*([\{\[])/.exec(html);
  if (!m) return null;
  const start = m.index + m[0].length - 1;
  const open = m[1] as '{' | '[';
  const close = open === '{' ? '}' : ']';
  let depth = 0;
  let inStr = false;
  let strCh = '';
  let esc = false;
  for (let i = start; i < html.length; i++) {
    const c = html[i];
    if (inStr) {
      if (esc) {
        esc = false;
      } else if (c === '\\') {
        esc = true;
      } else if (c === strCh) {
        inStr = false;
      }
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      inStr = true;
      strCh = c;
      continue;
    }
    if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) {
        const slice = html.slice(start, i + 1);
        try {
          return JSON.parse(slice);
        } catch {
          // The payload may be inline JS (single quotes, undefined, etc.).
          // Try a permissive fallback by using Function (sandboxed enough for
          // pasted local content; we only invoke this on user-provided HTML).
          try {
            // eslint-disable-next-line no-new-func
            return new Function(`return (${slice});`)();
          } catch {
            return null;
          }
        }
      }
    }
  }
  return null;
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
