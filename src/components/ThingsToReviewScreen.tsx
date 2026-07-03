import type { ClarificationItem, QuoteInfoCategories } from '../types/analysis';

type CategoryLabels = {
  confirmed: string;
  needsClarification: string;
  risks: string;
};

type ThingsToReviewContent = {
  title: string;
  categories: QuoteInfoCategories;
  clarificationItems?: ClarificationItem[];
  categoryLabels: CategoryLabels;
  consequenceLabel: string;
  questionLabel: string;
  cta: string;
};

type ThingsToReviewScreenProps = {
  content: ThingsToReviewContent;
  onNext: () => void;
};

const categoryKeys = ['confirmed', 'needsClarification', 'risks'] as const;

export function ThingsToReviewScreen({ content, onNext }: ThingsToReviewScreenProps) {
  const hasClarificationItems = Boolean(content.clarificationItems?.length);

  return (
    <div className="screen-content clarify-screen">
      <h1>{content.title}</h1>
      {hasClarificationItems ? (
        <div className="clarification-item-list">
          {content.clarificationItems?.slice(0, 5).map((item) => (
            <section className="clarification-item-card" key={`${item.title}-${item.question_to_ask}`}>
              <div className="clarification-item-header">
                <h2>{item.title}</h2>
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
            </section>
          ))}
        </div>
      ) : (
        <div className="category-list">
          {categoryKeys.map((key) => {
            const items = content.categories[key];

            if (!items.length) return null;

            return (
              <section className={`decision-category ${key}`} key={key}>
                <h2>{content.categoryLabels[key]}</h2>
                <ul>
                  {items.slice(0, 3).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
      <button className="primary-button" onClick={onNext}>
        {content.cta}
      </button>
    </div>
  );
}
