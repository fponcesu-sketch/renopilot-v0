import type { ComparisonSummary } from '../types/analysis';

type ComparisonResultContent = {
  title: string;
  recommendationLabel: string;
  summary: ComparisonSummary;
  cta: string;
  disclaimer: string;
};

type ComparisonResultScreenProps = {
  content: ComparisonResultContent;
  onNext: () => void;
};

export function ComparisonResultScreen({ content, onNext }: ComparisonResultScreenProps) {
  return (
    <div className="screen-content comparison-result-screen">
      <p className="verdict-label">{content.title}</p>
      <section className="comparison-hero-card">
        <span>{content.recommendationLabel}</span>
        <h1>{content.summary.recommendedQuote}</h1>
        <p>{content.summary.oneLineReason}</p>
      </section>
      <button className="primary-button" onClick={onNext}>
        {content.cta}
      </button>
      <p className="disclaimer-note">{content.disclaimer}</p>
    </div>
  );
}
