import { quoteCheckContent } from '../data/quoteCheckContent';

type ThingsToReviewScreenProps = {
  onNext: () => void;
};

export function ThingsToReviewScreen({ onNext }: ThingsToReviewScreenProps) {
  const { review } = quoteCheckContent;

  return (
    <div className="screen-content">
      <h1>{review.title}</h1>
      <ol className="review-list">
        {review.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
      <button className="primary-button" onClick={onNext}>
        {review.cta}
      </button>
    </div>
  );
}
