type ResultContent = {
  title: string;
  status: string;
  explanation: string;
  cta: string;
  disclaimer: string;
};

type ResultScreenProps = {
  content: ResultContent;
  onNext: () => void;
};

export function ResultScreen({ content, onNext }: ResultScreenProps) {
  return (
    <div className="screen-content result-screen simple-verdict-screen">
      <p className="verdict-label">{content.title}</p>
      <p className="status-card verdict-card">{content.status}</p>
      <p className="body-copy verdict-summary">{content.explanation}</p>
      <button className="primary-button" onClick={onNext}>
        {content.cta}
      </button>
      <p className="disclaimer-note">{content.disclaimer}</p>
    </div>
  );
}
