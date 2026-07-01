import type { ReactNode } from 'react';
import { quoteCheckContent } from '../data/quoteCheckContent';

type AppShellProps = {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
};

export function AppShell({ children, currentStep, totalSteps }: AppShellProps) {
  return (
    <main className="app-shell">
      <section className="phone-frame" aria-label="Prototipo RenoPilot">
        <header className="app-header">
          <span className="brand-mark">RP</span>
          <span className="brand-name">{quoteCheckContent.brand}</span>
          <span className="step-pill">
            {currentStep}/{totalSteps}
          </span>
        </header>
        <div className="screen-card">{children}</div>
      </section>
    </main>
  );
}
