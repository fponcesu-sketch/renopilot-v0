import type { QuoteCheckContent } from '../data/quoteCheckContent';

type ResultScreenProps = {
  content: QuoteCheckContent['result'];
  onNext: () => void;
};

export function ResultScreen({ content, onNext }: ResultScreenProps) {
  return (
    <div className="screen-content result-screen">
      <h1>{content.title}</h1>
      <p className="status-card">{content.status}</p>
      <p className="body-copy">{content.explanation}</p>
      <p className="cost-exposure">{content.costExposure}</p>
      <section className="insight-card">
        <span>{content.biggestRiskTitle}</span>
        <p>{content.biggestRisk}</p>
      </section>
      <section className="insight-card soft">
        <span>{content.nextActionTitle}</span>
        <p>{content.nextAction}</p>
      </section>
      <button className="primary-button" onClick={onNext}>
        {content.cta}
      </button>
    </div>
  );
}
