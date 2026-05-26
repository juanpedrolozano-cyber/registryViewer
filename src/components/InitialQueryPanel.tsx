import { useState } from 'react';
import { CodeBlock } from './CodeBlock';
import { IconChevron } from './icons';

export function InitialQueryPanel({ query }: { query: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="panel mb-3 overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-bg-panel transition">
        <span className="text-sm font-medium text-ink">Initial query</span>
        <span className="text-[11px] text-ink-dim">{query.length.toLocaleString()} chars</span>
        <div className="flex-1" />
        <IconChevron className="text-ink-dim transition" style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }} />
      </button>
      {open && (
        <div className="px-3 py-3 border-t border-line bg-bg-panel/40">
          <CodeBlock text={query} label="query" language="markdown" maxHeightClass="max-h-[600px]" />
        </div>
      )}
    </div>
  );
}
