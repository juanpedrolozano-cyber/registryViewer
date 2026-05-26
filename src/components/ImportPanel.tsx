import { useRef, useState } from 'react';
import { IconFile, IconLink, IconAlert } from './icons';
import { fetchLogFromUrl } from '../lib/fetchLog';

interface Props {
  onLoad: (text: string, source: string) => void;
}

type Mode = 'upload' | 'paste' | 'url';

export function ImportPanel({ onLoad }: Props) {
  const [mode, setMode] = useState<Mode>('upload');
  const [url, setUrl] = useState('');
  const [pasted, setPasted] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    try {
      const text = await file.text();
      onLoad(text, file.name);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleUrl() {
    setError(null);
    setLoading(true);
    try {
      const { text, via } = await fetchLogFromUrl(url.trim());
      onLoad(text, `${url} (via ${via})`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function handlePaste() {
    setError(null);
    if (!pasted.trim()) {
      setError('Paste a JSON payload first.');
      return;
    }
    onLoad(pasted, 'pasted');
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="max-w-3xl mx-auto mt-16">
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Load an execution log</h1>
      <p className="text-ink-muted text-sm mb-6">
        Open any KPU execution log (JSON with <code className="text-ok">{'{ status, data }'}</code> shape, or a raw array).
        Everything is processed locally in your browser — nothing is uploaded.
      </p>

      <div className="flex gap-1 mb-3">
        <TabBtn active={mode === 'upload'} onClick={() => setMode('upload')}>
          <IconFile /> Upload / drop
        </TabBtn>
        <TabBtn active={mode === 'paste'} onClick={() => setMode('paste')}>
          Paste JSON
        </TabBtn>
        <TabBtn active={mode === 'url'} onClick={() => setMode('url')}>
          <IconLink /> Import from URL
        </TabBtn>
      </div>

      {mode === 'upload' && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className="panel cursor-pointer p-10 text-center hover:border-info/40 hover:bg-info/5 transition"
        >
          <div className="flex flex-col items-center gap-2 text-ink-muted">
            <IconFile width={32} height={32} />
            <div className="text-sm">
              <span className="text-info underline">Click to select</span> or drop a <code>.json</code> / <code>.txt</code> log file
            </div>
            <div className="text-xs text-ink-dim">Anything up to a few MB works fine</div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".json,.txt,application/json,text/plain"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      )}

      {mode === 'paste' && (
        <div className="panel p-3">
          <textarea
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            placeholder='{ "status": "success", "data": [ … ] }'
            spellCheck={false}
            className="field font-mono text-xs min-h-[260px] resize-y"
          />
          <div className="mt-2 flex justify-end">
            <button className="btn-primary" onClick={handlePaste}>Parse</button>
          </div>
        </div>
      )}

      {mode === 'url' && (
        <div className="panel p-3 space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…/logger.json or any URL that returns the log JSON"
              className="field flex-1"
            />
            <button className="btn-primary" onClick={handleUrl} disabled={loading || !url.trim()}>
              {loading ? 'Fetching…' : 'Fetch'}
            </button>
          </div>
          <p className="text-[11px] text-ink-dim">
            Tries direct <code>fetch</code> first. If the target blocks CORS, falls back to a public CORS proxy
            (<code>corsproxy.io</code> or <code>allorigins</code>). Don’t use URLs containing secrets.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-3 panel border-err/40 bg-err/10 text-err/90 p-3 text-xs flex gap-2">
          <IconAlert className="shrink-0 mt-0.5" />
          <pre className="whitespace-pre-wrap font-mono">{error}</pre>
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={
        'px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 border transition ' +
        (active
          ? 'bg-bg-elev text-ink border-line'
          : 'bg-transparent text-ink-muted border-transparent hover:text-ink hover:bg-bg-elev/60')
      }
    >
      {children}
    </button>
  );
}
