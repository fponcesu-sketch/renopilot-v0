import { quoteCheckContent } from '../data/quoteCheckContent';

type ResultScreenProps = {
  onNext: () => void;
};

export function ResultScreen({ onNext }: ResultScreenProps) {
  const { result } = quoteCheckContent;

  return (
    <div className="screen-content">
      <p className="status-card">{result.status}</p>
      <p className="body-copy">{result.explanation}</p>
      <section className="insight-card">
        <span>{result.biggestRiskTitle}</span>
        <p>{result.biggestRisk}</p>
      </section>
      <section className="insight-card soft">
        <span>{result.nextActionTitle}</span>
        <p>{result.nextAction}</p>
      </section>
      <button className="primary-button" onClick={onNext}>
        {result.cta}
      </button>
    </div>
  );
}
