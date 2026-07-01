import { quoteCheckContent } from '../data/quoteCheckContent';

type LandingScreenProps = {
  onNext: () => void;
};

export function LandingScreen({ onNext }: LandingScreenProps) {
  const { landing } = quoteCheckContent;

  return (
    <div className="screen-content hero-screen">
      <p className="eyebrow">Revisión rápida de presupuestos</p>
      <h1>{landing.headline}</h1>
      <p className="lead">{landing.subcopy}</p>
      <button className="primary-button" onClick={onNext}>
        {landing.cta}
      </button>
    </div>
  );
}
