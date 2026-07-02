type UpdatedRecommendationContent = {
  status: string;
  explanation: string;
  nextActionTitle: string;
  nextAction: string;
  disclaimer: string;
};

type UpdatedRecommendationScreenProps = {
  content: UpdatedRecommendationContent;
};

export function UpdatedRecommendationScreen({ content }: UpdatedRecommendationScreenProps) {
  return (
    <div className="screen-content updated-screen">
      <p className="status-card">{content.status}</p>
      <p className="body-copy">{content.explanation}</p>
      <section className="insight-card soft">
        <span>{content.nextActionTitle}</span>
        <p>{content.nextAction}</p>
      </section>
      <p className="disclaimer-note">{content.disclaimer}</p>
    </div>
  );
}
