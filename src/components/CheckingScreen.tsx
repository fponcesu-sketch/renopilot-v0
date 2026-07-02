import { useEffect, useState } from 'react';
import type { QuoteCheckContent } from '../data/quoteCheckContent';

type CheckingScreenProps = {
  content: QuoteCheckContent['checking'];
  onNext: () => void;
};

export function CheckingScreen({ content, onNext }: CheckingScreenProps) {
  const [progressIndex, setProgressIndex] = useState(0);
  const isComplete = progressIndex >= content.items.length;

  useEffect(() => {
    setProgressIndex(0);

    const interval = window.setInterval(() => {
      setProgressIndex((currentIndex) => {
        if (currentIndex >= content.items.length) {
          window.clearInterval(interval);
          return currentIndex;
        }

        return currentIndex + 1;
      });
    }, 850);

    return () => window.clearInterval(interval);
  }, [content.items.length]);

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
      <button className="primary-button" disabled={!isComplete} onClick={onNext}>
        {content.cta}
      </button>
    </div>
  );
}
