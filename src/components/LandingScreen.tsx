import type { QuoteCheckContent } from '../data/quoteCheckContent';

type LandingScreenProps = {
  content: QuoteCheckContent['landing'];
  onNext?: () => void;
  onStart?: () => void;
};

export function LandingScreen({ content, onNext, onStart }: LandingScreenProps) {
  const handleNext = onNext || onStart;

  return (
    <div className="screen-content hero-screen">
      <p className="eyebrow">{content.eyebrow}</p>
      <h1>{content.headline}</h1>
      <p className="lead">{content.subcopy}</p>
      <button className="primary-button" onClick={handleNext} type="button">
        {content.cta}
      </button>
    </div>
  );
}
