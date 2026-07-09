import { useLayoutEffect, type ReactNode } from 'react';
import { languageOptions, type Language, type QuoteCheckContent } from '../data/quoteCheckContent';

type AppShellProps = {
  brand: string;
  children: ReactNode;
  currentPhase: number | null;
  language: Language;
  onBack?: () => void;
  onLanguageChange: (language: Language) => void;
  shell: QuoteCheckContent['shell'];
  showLanguageSwitcher?: boolean;
};

export function AppShell({
  brand,
  children,
  currentPhase,
  language,
  onBack,
  onLanguageChange,
  shell,
  showLanguageSwitcher = true,
}: AppShellProps) {
  const progressPercent = currentPhase === null ? 0 : ((currentPhase + 1) / shell.phases.length) * 100;

  const getPhaseState = (index: number) => {
    if (currentPhase === null) return 'pending';
    if (index < currentPhase) return 'done';
    if (index === currentPhase) return 'active';
    return 'pending';
  };

  useLayoutEffect(() => {
    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0 });
      document.documentElement.scrollTop = 0;
      document.documentElement.scrollLeft = 0;
      document.body.scrollTop = 0;
      document.body.scrollLeft = 0;
      document.querySelector('.app-shell')?.scrollTo({ top: 0, left: 0 });
      document.querySelector('.phone-frame')?.scrollTo({ top: 0, left: 0 });
      document.querySelector('.screen-card')?.scrollTo({ top: 0, left: 0 });
    };

    resetScroll();
    window.requestAnimationFrame(resetScroll);
    window.setTimeout(resetScroll, 0);
    window.setTimeout(resetScroll, 80);
    window.setTimeout(resetScroll, 250);
  }, [children]);

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
          {showLanguageSwitcher && (
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
          )}
        </header>
        {currentPhase !== null && (
          <div className="phase-progress" aria-label={shell.phaseLabel}>
            <div className="phase-labels">
              {shell.phases.map((phase, index) => (
                <span className={getPhaseState(index)} key={phase}>
                  {phase}
                </span>
              ))}
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
