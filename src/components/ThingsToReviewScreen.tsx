import type { QuoteInfoCategories } from '../types/analysis';

type CategoryLabels = {
  confirmed: string;
  needsClarification: string;
  risks: string;
};

type ThingsToReviewContent = {
  title: string;
  categories: QuoteInfoCategories;
  categoryLabels: CategoryLabels;
  cta: string;
};

type ThingsToReviewScreenProps = {
  content: ThingsToReviewContent;
  onNext: () => void;
};

const categoryKeys = ['confirmed', 'needsClarification', 'risks'] as const;

export function ThingsToReviewScreen({ content, onNext }: ThingsToReviewScreenProps) {
  return (
    <div className="screen-content clarify-screen">
      <h1>{content.title}</h1>
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
      <button className="primary-button" onClick={onNext}>
        {content.cta}
      </button>
    </div>
  );
}
