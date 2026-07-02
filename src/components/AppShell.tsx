import type { ReactNode } from 'react';
import { languageOptions, type Language, type QuoteCheckContent } from '../data/quoteCheckContent';

type AppShellProps = {
  brand: string;
  children: ReactNode;
  currentPhase: number | null;
  language: Language;
  onBack?: () => void;
  onLanguageChange: (language: Language) => void;
  shell: QuoteCheckContent['shell'];
};

export function AppShell({
  brand,
  children,
  currentPhase,
  language,
  onBack,
  onLanguageChange,
  shell,
}: AppShellProps) {
  const progressPercent = currentPhase === null ? 0 : ((currentPhase + 1) / shell.phases.length) * 100;
  const currentPhaseLabel = currentPhase === null ? '' : shell.phases[currentPhase];

  return (
    <main className="app-shell">
      <section className="phone-frame" aria-label={shell.ariaLabel}>
        <header className="app-header">
          <div className="brand-cluster">
            {onBack ? (
              <button className="back-button" onClick={onBack} type="button" aria-label={shell.backLabel}>
                ←
              </button>
            ) : (
              <span className="brand-mark">RP</span>
            )}
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
          </div>
        </header>
        {currentPhase !== null && (
          <div className="phase-progress" aria-label={shell.phaseLabel}>
            <div className="phase-label">
              <span>{shell.phaseLabel}</span>
              <strong>{currentPhaseLabel}</strong>
            </div>
            <div className="progress-track" aria-hidden="true">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}
        <div className="screen-card">{children}</div>
      </section>
    </main>
  );
}
