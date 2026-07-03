import type { ClarificationItem, ComparisonSummary } from '../types/analysis';

type ComparisonLabels = {
  whyThisOne: string;
  stillUnclear: string;
  beCareful: string;
};

type ComparisonDetailsContent = {
  title: string;
  labels: ComparisonLabels;
  summary: ComparisonSummary;
  clarificationItems?: ClarificationItem[];
  consequenceLabel: string;
  questionLabel: string;
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
  const hasClarificationItems = Boolean(content.clarificationItems?.length);

  return (
    <div className="screen-content comparison-details-screen">
      <h1>{content.title}</h1>
      <div className="category-list">
        {sections.map((section) => {
          const items = content.summary[section.key];

          if (!items.length && !(section.key === 'stillUnclear' && hasClarificationItems)) return null;

          return (
            <section className={`decision-category ${section.className}`} key={section.key}>
              <h2>{content.labels[section.key]}</h2>
              {section.key === 'stillUnclear' && hasClarificationItems ? (
                <div className="clarification-item-list compact">
                  {content.clarificationItems?.slice(0, 4).map((item) => (
                    <article className="clarification-item-card" key={`${item.title}-${item.question_to_ask}`}>
                      <div className="clarification-item-header">
                        <h3>{item.title}</h3>
                        <span>{item.consequence_type}</span>
                      </div>
                      <p>
                        <strong>{content.consequenceLabel}: </strong>
                        {item.consequence}
                      </p>
                      <p>
                        <strong>{content.questionLabel}: </strong>
                        {item.question_to_ask}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <ul>
                  {items.slice(0, 3).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
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
