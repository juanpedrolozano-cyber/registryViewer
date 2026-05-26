import type { ReactNode } from 'react';
import type { StepState } from '../types';

const COLOR: Record<StepState, string> = {
  success: 'bg-ok/15 text-ok border-ok/30',
  error: 'bg-err/15 text-err border-err/30',
  warning: 'bg-warn/15 text-warn border-warn/30',
  info: 'bg-info/15 text-info border-info/30',
  retry: 'bg-retry/15 text-retry border-retry/30',
};

export function Badge({ state, children }: { state: StepState; children: ReactNode }) {
  return (
    <span className={`chip border ${COLOR[state]}`}>
      {children}
    </span>
  );
}

export function StatusDot({ state }: { state: StepState }) {
  const dot: Record<StepState, string> = {
    success: 'bg-ok',
    error: 'bg-err',
    warning: 'bg-warn',
    info: 'bg-info',
    retry: 'bg-retry',
  };
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${dot[state]}`} />;
}
