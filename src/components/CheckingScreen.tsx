import { useEffect, useState } from 'react';
import type { QuoteCheckContent } from '../data/quoteCheckContent';

type CheckingScreenProps = {
  content: QuoteCheckContent['checking'] & { slowMessage?: string };
  error?: string;
  isReady: boolean;
  onNext: () => void;
};

export function CheckingScreen({ content, error, isReady, onNext }: CheckingScreenProps) {
  const [progressIndex, setProgressIndex] = useState(0);
  const [showSlowMessage, setShowSlowMessage] = useState(false);
  const animationComplete = progressIndex >= content.items.length;
  const canContinue = animationComplete && isReady;
  const slowMessage = content.slowMessage || 'This is taking longer than usual.';

  useEffect(() => {
    setProgressIndex(0);
    setShowSlowMessage(false);

    const interval = window.setInterval(() => {
      setProgressIndex((currentIndex) => {
        if (currentIndex >= content.items.length) {
          window.clearInterval(interval);
          return currentIndex;
        }

        return currentIndex + 1;
      });
    }, 850);
    const slowTimer = window.setTimeout(() => {
      if (!isReady) {
        setShowSlowMessage(true);
      }
    }, 9000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(slowTimer);
    };
  }, [content.items.length, isReady]);

  return (
    <div className="screen-content checking-screen">
      <div className="checking-orb" aria-hidden="true" />
      <h1>{content.title}</h1>
      <ul className="check-list animated-check-list">
        {content.items.map((item, index) => {
          const itemState = index < progressIndex ? 'done' : index === progressIndex ? 'active' : 'pending';

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
      <button className="primary-button" disabled={!canContinue} onClick={onNext}>
        {content.cta}
      </button>
    </div>
  );
}
