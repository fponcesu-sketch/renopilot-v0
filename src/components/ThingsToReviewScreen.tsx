import type { ClarificationItem, PriceSanity, QuoteInfoCategories } from '../types/analysis';

type CategoryLabels = {
  confirmed: string;
  needsClarification: string;
  risks: string;
};

type ThingsToReviewContent = {
  title: string;
  categories: QuoteInfoCategories;
  clarificationItems?: ClarificationItem[];
  priceSanity?: PriceSanity;
  priceSanityTitle: string;
  priceNextStepLabel: string;
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
const priceStatusIcon: Record<PriceSanity['status'], string> = {
  yes: '🟢',
  partly: '🟡',
  no: '🔴',
};

function getConfirmedTitle(label: string) {
  if (label.toLowerCase().includes('confirmed')) return 'What looks clear';
  if (label.toLowerCase().includes('potwier')) return 'Co wygląda jasno';
  return 'Lo que parece claro';
}

function getClarificationTitle(label: string) {
  if (label.toLowerCase().includes('clarification')) return 'To confirm before accepting';
  if (label.toLowerCase().includes('wyja')) return 'Do potwierdzenia przed akceptacją';
  return 'A confirmar antes de aceptar';
}

export function ThingsToReviewScreen({ content, onNext }: ThingsToReviewScreenProps) {
  const hasClarificationItems = Boolean(content.clarificationItems?.length);
  const confirmedItems = content.categories.confirmed.slice(0, 3);
  const priceSanity = content.priceSanity;

  return (
    <div className="screen-content clarify-screen">
      <div className="clarify-header">
        <span>Quote review</span>
        <h1>{content.title}</h1>
      </div>
      {hasClarificationItems ? (
        <>
          {confirmedItems.length > 0 && (
            <section className="confirmed-secondary-card confirmed-first-card">
              <h2>{getConfirmedTitle(content.categoryLabels.confirmed)}</h2>
              <ul>
                {confirmedItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}
          <div className="clarification-section-heading">
            <h2>{getClarificationTitle(content.categoryLabels.needsClarification)}</h2>
          </div>
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
                <div className="question-to-ask">
                  <strong>{content.questionLabel}</strong>
                  <p>{item.question_to_ask}</p>
                </div>
              </section>
            ))}
          </div>
          {priceSanity && (
            <section className="price-sanity-card">
              <h2>{content.priceSanityTitle}</h2>
              <strong>
                {priceStatusIcon[priceSanity.status]} {priceSanity.title}
              </strong>
              <p>{priceSanity.summary}</p>
              <p>
                <span>{content.priceNextStepLabel}: </span>
                {priceSanity.next_step}
              </p>
            </section>
          )}
        </>
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
