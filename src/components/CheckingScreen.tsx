import { useEffect, useState } from 'react';
import type { QuoteCheckContent } from '../data/quoteCheckContent';

type CheckingScreenProps = {
  content: QuoteCheckContent['checking'];
  onNext: () => void;
};

export function CheckingScreen({ content, onNext }: CheckingScreenProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((currentIndex) =>
        currentIndex >= content.items.length - 1 ? currentIndex : currentIndex + 1,
      );
    }, 850);

    return () => window.clearInterval(interval);
  }, [content.items.length]);

  return (
    <div className="screen-content checking-screen">
      <div className="checking-orb" aria-hidden="true" />
      <h1>{content.title}</h1>
      <ul className="check-list animated-check-list">
        {content.items.map((item, index) => {
          const itemState = index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'pending';

          return (
            <li className={itemState} key={item}>
              <span className="check-state" aria-hidden="true" />
              <span>{item}</span>
            </li>
          );
        })}
      </ul>
      <button className="primary-button" onClick={onNext}>
        {content.cta}
      </button>
    </div>
  );
}
