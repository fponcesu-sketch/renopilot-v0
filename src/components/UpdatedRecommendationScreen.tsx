import type { QuoteCheckContent } from '../data/quoteCheckContent';

type UpdatedRecommendationScreenProps = {
  content: QuoteCheckContent['updatedRecommendation'];
};

export function UpdatedRecommendationScreen({ content }: UpdatedRecommendationScreenProps) {
  return (
    <div className="screen-content updated-screen">
      <p className="status-card">{content.status}</p>
      <p className="body-copy">{content.explanation}</p>
      <section className="insight-card soft">
        <span>{content.nextActionTitle}</span>
        <p>{content.nextAction}</p>
      </section>
    </div>
  );
}
