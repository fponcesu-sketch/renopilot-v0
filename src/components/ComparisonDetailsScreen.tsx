import type { ComparisonSummary } from '../types/analysis';

type ComparisonLabels = {
  whyThisOne: string;
  stillUnclear: string;
  beCareful: string;
};

type ComparisonDetailsContent = {
  title: string;
  labels: ComparisonLabels;
  summary: ComparisonSummary;
  cta: string;
};

type ComparisonDetailsScreenProps = {
  content: ComparisonDetailsContent;
  onNext: () => void;
};

const sections = [
  { key: 'whyThisOne', className: 'confirmed' },
  { key: 'stillUnclear', className: 'needsClarification' },
  { key: 'beCareful', className: 'risks' },
] as const;

export function ComparisonDetailsScreen({ content, onNext }: ComparisonDetailsScreenProps) {
  return (
    <div className="screen-content comparison-details-screen">
      <h1>{content.title}</h1>
      <div className="category-list">
        {sections.map((section) => {
          const items = content.summary[section.key];

          if (!items.length) return null;

          return (
            <section className={`decision-category ${section.className}`} key={section.key}>
              <h2>{content.labels[section.key]}</h2>
              <ul>
                {items.slice(0, 3).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      <button className="primary-button" onClick={onNext}>
        {content.cta}
      </button>
    </div>
  );
}
