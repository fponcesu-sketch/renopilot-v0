import { quoteCheckContent } from '../data/quoteCheckContent';

type CheckingScreenProps = {
  onNext: () => void;
};

export function CheckingScreen({ onNext }: CheckingScreenProps) {
  const { checking } = quoteCheckContent;

  return (
    <div className="screen-content">
      <div className="checking-orb" aria-hidden="true" />
      <h1>{checking.title}</h1>
      <ul className="check-list">
        {checking.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <button className="primary-button" onClick={onNext}>
        {checking.cta}
      </button>
    </div>
  );
}
