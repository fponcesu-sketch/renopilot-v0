import { useEffect, useState } from 'react';
import type { QuoteCheckContent } from '../data/quoteCheckContent';

type CheckingScreenProps = {
  content: QuoteCheckContent['checking'] & { slowMessage?: string; errorCta?: string };
  error?: string;
  isReady: boolean;
  onBack?: () => void;
  onNext: () => void;
};

export function CheckingScreen({ content, error, isReady, onBack, onNext }: CheckingScreenProps) {
  const [progressIndex, setProgressIndex] = useState(0);
  const [showSlowMessage, setShowSlowMessage] = useState(false);
  const lastStepIndex = Math.max(content.items.length - 1, 0);
  const activeStepIndex = isReady ? content.items.length : Math.min(progressIndex, lastStepIndex);
  const canContinue = isReady;
  const slowMessage = content.slowMessage || 'Still checking. This can take a few more seconds.';
  const buttonLabel = error ? content.errorCta || 'Volver' : content.cta;

  const handleButtonClick = () => {
    if (error) {
      if (onBack) {
        onBack();
        return;
      }

      window.location.reload();
      return;
    }

    onNext();
  };

  useEffect(() => {
    setProgressIndex(0);
    setShowSlowMessage(false);
  }, [content.items.length]);

  useEffect(() => {
    if (isReady || error) return undefined;

    const interval = window.setInterval(() => {
      setProgressIndex((currentIndex) => Math.min(currentIndex + 1, lastStepIndex));
    }, 1000);

    const slowTimer = window.setTimeout(() => {
      setShowSlowMessage(true);
    }, 8000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(slowTimer);
    };
  }, [error, isReady, lastStepIndex]);

  return (
    <div className="screen-content checking-screen">
      <div className="checking-orb" aria-hidden="true" />
      <h1>{content.title}</h1>
      <ul className="check-list animated-check-list">
        {content.items.map((item, index) => {
          const itemState = index < activeStepIndex ? 'done' : index === activeStepIndex ? 'active' : 'pending';

          return (
            <li className={itemState} key={item}>
              <span className="check-state" aria-hidden="true" />
              <span>{item}</span>
            </li>
          );
        })}
      </ul>
      {showSlowMessage && !error && !isReady && <p className="inline-warning">{slowMessage}</p>}
      {error && <p className="inline-warning">{error}</p>}
      <button className="primary-button" disabled={!error && !canContinue} onClick={handleButtonClick}>
        {buttonLabel}
      </button>
    </div>
  );
}
