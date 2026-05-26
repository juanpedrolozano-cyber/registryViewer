import { useState } from 'react';
import { copyText } from '../lib/clipboard';
import { IconCopy, IconCheck } from './icons';

interface Props {
  text: string;
  label?: string;
  maxHeightClass?: string;
  language?: string;
}

const WARN_RE = /warning|deprecation/i;
const ERR_RE = /error|exception|traceback|failed/i;

export function CodeBlock({ text, label, maxHeightClass = 'max-h-[420px]', language }: Props) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    await copyText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  const lines = text.split('\n');

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-3 py-1.5 text-[11px] text-ink-muted">
        <span className="flex items-center gap-2">
          {label && <span className="font-medium uppercase tracking-wide">{label}</span>}
          {language && <span className="text-ink-dim">{language}</span>}
          <span className="text-ink-dim">· {lines.length} lines</span>
        </span>
        <button onClick={onCopy} className="btn !py-0.5 !text-[10px]" title="Copy">
          {copied ? <IconCheck /> : <IconCopy />}
          {copied ? 'copied' : 'copy'}
        </button>
      </div>
      <div className={`overflow-auto ${maxHeightClass}`}>
        <pre className="px-3 py-2 text-[12px] leading-[1.55] font-mono">
          {lines.map((line, i) => (
            <div key={i} className={lineClass(line)}>
              <span className="select-none mr-3 inline-block w-8 text-right text-ink-dim">{i + 1}</span>
              <span className="whitespace-pre-wrap break-words">{line || ' '}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

function lineClass(line: string): string {
  if (ERR_RE.test(line)) return 'text-err/90';
  if (WARN_RE.test(line)) return 'text-warn/90';
  return 'text-ink';
}
