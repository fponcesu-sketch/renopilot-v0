import type { ReactNode } from 'react';
import { languageOptions, type Language, type QuoteCheckContent } from '../data/quoteCheckContent';

type AppShellProps = {
  brand: string;
  children: ReactNode;
  currentStep: number;
  language: Language;
  onLanguageChange: (language: Language) => void;
  shell: QuoteCheckContent['shell'];
  totalSteps: number;
};

export function AppShell({
  brand,
  children,
  currentStep,
  language,
  onLanguageChange,
  shell,
  totalSteps,
}: AppShellProps) {
  return (
    <main className="app-shell">
      <section className="phone-frame" aria-label={shell.ariaLabel}>
        <header className="app-header">
          <div className="brand-cluster">
            <span className="brand-mark">RP</span>
            <span className="brand-name">{brand}</span>
          </div>
          <div className="header-actions">
            <div className="language-switcher" aria-label={shell.languageLabel}>
              {languageOptions.map((option) => (
                <button
                  aria-pressed={option.code === language}
                  className={`language-option${option.code === language ? ' active' : ''}`}
                  key={option.code}
                  onClick={() => onLanguageChange(option.code)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
            <span className="step-pill">
              {currentStep}/{totalSteps}
            </span>
          </div>
        </header>
        <div className="screen-card">{children}</div>
      </section>
    </main>
  );
}
