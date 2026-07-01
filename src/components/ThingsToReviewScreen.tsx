import type { QuoteCheckContent } from '../data/quoteCheckContent';

type ThingsToReviewScreenProps = {
  content: QuoteCheckContent['review'];
  onNext: () => void;
};

export function ThingsToReviewScreen({ content, onNext }: ThingsToReviewScreenProps) {
  return (
    <div className="screen-content">
      <h1>{content.title}</h1>
      <ol className="review-list">
        {content.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
      <button className="primary-button" onClick={onNext}>
        {content.cta}
      </button>
    </div>
  );
}
