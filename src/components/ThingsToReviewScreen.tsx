import type { QuoteInfoCategories } from '../types/analysis';

type ThingsToReviewContent = {
  title: string;
  categories: QuoteInfoCategories;
  cta: string;
};

type ThingsToReviewScreenProps = {
  content: ThingsToReviewContent;
  onNext: () => void;
};

const categoryRows = [
  { key: 'confirmed', label: '🟢 Confirmado' },
  { key: 'needsClarification', label: '🟡 A aclarar' },
  { key: 'risks', label: '🔴 Riesgos' },
] as const;

export function ThingsToReviewScreen({ content, onNext }: ThingsToReviewScreenProps) {
  return (
    <div className="screen-content clarify-screen">
      <h1>{content.title}</h1>
      <div className="category-list">
        {categoryRows.map((category) => {
          const items = content.categories[category.key];

          if (!items.length) return null;

          return (
            <section className={`decision-category ${category.key}`} key={category.key}>
              <h2>{category.label}</h2>
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
