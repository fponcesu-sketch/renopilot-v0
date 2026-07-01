import { quoteCheckContent } from '../data/quoteCheckContent';

export function UpdatedRecommendationScreen() {
  const { updatedRecommendation } = quoteCheckContent;

  return (
    <div className="screen-content final-screen">
      <p className="status-card">{updatedRecommendation.status}</p>
      <p className="body-copy">{updatedRecommendation.explanation}</p>
      <section className="insight-card soft">
        <span>{updatedRecommendation.nextActionTitle}</span>
        <p>{updatedRecommendation.nextAction}</p>
      </section>
    </div>
  );
}
