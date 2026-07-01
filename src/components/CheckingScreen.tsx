import type { QuoteCheckContent } from '../data/quoteCheckContent';

type CheckingScreenProps = {
  content: QuoteCheckContent['checking'];
  onNext: () => void;
};

export function CheckingScreen({ content, onNext }: CheckingScreenProps) {
  return (
    <div className="screen-content">
      <div className="checking-orb" aria-hidden="true" />
      <h1>{content.title}</h1>
      <ul className="check-list">
        {content.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <button className="primary-button" onClick={onNext}>
        {content.cta}
      </button>
    </div>
  );
}
