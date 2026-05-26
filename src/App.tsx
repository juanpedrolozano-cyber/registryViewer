import { useEffect, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { Toolbar, type SeverityFilter } from './components/Toolbar';
import { ImportPanel } from './components/ImportPanel';
import { StepCard } from './components/StepCard';
import { InitialQueryPanel } from './components/InitialQueryPanel';
import { FinalSummaryPanel } from './components/FinalSummaryPanel';
import { parsePayload, ParseError } from './lib/parse';
import { groupByStep, entryHasError, entryHasWarning, summarizeEntries } from './lib/groupSteps';
import { copyText, downloadJson } from './lib/clipboard';
import type { LogEntry } from './types';
import { IconAlert } from './components/icons';

const PREPARING_LOG_MSG = 'Preparing to execute step';

interface LoadedState {
  entries: LogEntry[];
  raw: unknown;
  rawText: string;
  source: string;
}

export default function App() {
  const [loaded, setLoaded] = useState<LoadedState | null>(null);
  const [parseErr, setParseErr] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [hidePreparing, setHidePreparing] = useState(true);
  const [expandByDefault, setExpandByDefault] = useState(false);
  const [severity, setSeverity] = useState<SeverityFilter>('all');
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  function handleLoad(text: string, source: string) {
    setParseErr(null);
    try {
      const { entries, raw } = parsePayload(text);
      setLoaded({ entries, raw, rawText: text, source });
      setSearch('');
      setSeverity('all');
    } catch (e) {
      setParseErr(e instanceof ParseError ? e.message : (e as Error).message);
    }
  }

  function handleReset() {
    setLoaded(null);
    setParseErr(null);
    setExpandedSteps(new Set());
  }

  const grouped = useMemo(() => {
    if (!loaded) return null;
    const visibleEntries = loaded.entries.filter((e) => {
      if (hidePreparing && e.logMessage === PREPARING_LOG_MSG) return false;
      if (severity === 'errors' && !entryHasError(e)) return false;
      if (severity === 'errors_warnings' && !entryHasError(e) && !entryHasWarning(e)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const blob = (e.logMessage + ' ' + (e.command ?? '') + ' ' + (e.result ?? '')).toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
    return {
      steps: groupByStep(visibleEntries),
      counters: summarizeEntries(loaded.entries),
    };
  }, [loaded, hidePreparing, severity, search]);

  useEffect(() => {
    if (!loaded || !grouped) return;
    if (expandByDefault) {
      setExpandedSteps(new Set(grouped.steps.map((s) => s.step)));
    } else {
      setExpandedSteps(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, expandByDefault]);

  // Initial query is the `query` field of the very first entry (logMessage === 'Starting execution').
  const initialQuery = useMemo(() => {
    if (!loaded) return null;
    const starter = loaded.entries.find((e) => e.logMessage === 'Starting execution' && e.query);
    return starter?.query ?? null;
  }, [loaded]);

  // Final summary is the `result` field of "Final Execution History:".
  const finalSummary = useMemo(() => {
    if (!loaded) return null;
    const last = loaded.entries.find((e) => e.logMessage === 'Final Execution History:' && e.result);
    return last?.result ?? null;
  }, [loaded]);

  const executionId = loaded?.entries[0]?.executionId;

  function toggleStep(step: number) {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(step)) next.delete(step);
      else next.add(step);
      return next;
    });
  }

  function collapseAll() {
    setExpandedSteps(new Set());
  }
  function expandAll() {
    if (!grouped) return;
    setExpandedSteps(new Set(grouped.steps.map((s) => s.step)));
  }

  async function copyInitialQuery() {
    if (initialQuery) await copyText(initialQuery);
  }
  async function copyJson() {
    if (loaded) await copyText(loaded.rawText);
  }
  function downloadJsonFile() {
    if (!loaded) return;
    const name = executionId ? `execution-${executionId}.json` : 'execution.json';
    downloadJson(name, loaded.raw);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        executionId={executionId}
        totalSteps={grouped?.steps.length ?? 0}
        totalEntries={loaded?.entries.length ?? 0}
        search={search}
        onSearchChange={setSearch}
        onReset={handleReset}
        loaded={!!loaded}
      />

      <main className="flex-1 px-6 py-5 max-w-[1400px] mx-auto w-full">
        {!loaded && (
          <>
            <ImportPanel onLoad={handleLoad} />
            {parseErr && (
              <div className="max-w-3xl mx-auto mt-4 panel border-err/40 bg-err/10 text-err/90 p-3 text-xs flex gap-2">
                <IconAlert className="shrink-0 mt-0.5" />
                <pre className="whitespace-pre-wrap font-mono">{parseErr}</pre>
              </div>
            )}
          </>
        )}

        {loaded && grouped && (
          <>
            <div className="text-[11px] text-ink-dim mb-2 font-mono truncate">source: {loaded.source}</div>
            <Toolbar
              hidePreparing={hidePreparing}
              onHidePreparingChange={setHidePreparing}
              expandByDefault={expandByDefault}
              onExpandByDefaultChange={setExpandByDefault}
              severity={severity}
              onSeverityChange={setSeverity}
              onCopyInitialQuery={copyInitialQuery}
              onCopyJson={copyJson}
              onDownloadJson={downloadJsonFile}
              onCollapseAll={collapseAll}
              onExpandAll={expandAll}
              hasInitialQuery={!!initialQuery}
              counters={grouped.counters}
            />

            {initialQuery && <InitialQueryPanel query={initialQuery} />}

            {grouped.steps.map((s) => (
              <StepCard
                key={s.step}
                step={s}
                expanded={expandedSteps.has(s.step)}
                onToggle={() => toggleStep(s.step)}
              />
            ))}

            {grouped.steps.length === 0 && (
              <div className="panel p-6 text-sm text-ink-muted text-center">No entries match the current filters.</div>
            )}

            {finalSummary && <FinalSummaryPanel title="Final execution history" content={finalSummary} />}
          </>
        )}
      </main>

      <footer className="px-6 py-3 text-[11px] text-ink-dim border-t border-line">
        KPU Log Viewer · runs entirely in your browser ·{' '}
        <a
          className="hover:text-ink underline"
          href="https://github.com/juanpedrolozano-cyber/registryViewer"
          target="_blank"
          rel="noreferrer"
        >
          source
        </a>
      </footer>
    </div>
  );
}
