import type { FormEvent } from 'react';
import type { QuoteCheckContent } from '../data/quoteCheckContent';

type StartCheckScreenProps = {
  content: QuoteCheckContent['startCheck'];
  onNext: () => void;
};

export function StartCheckScreen({ content, onNext }: StartCheckScreenProps) {
  return (
    <form
      className="screen-content form-screen start-check-screen"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onNext();
      }}
    >
      <h1>{content.title}</h1>
      <label className="field-group decision-field">
        <span>{content.decisionLabel}</span>
        <textarea rows={2} placeholder={content.decisionPlaceholder} />
      </label>
      <section className="quote-input-card">
        <div className="quote-card-header">
          <h2>{content.quoteInputLabel}</h2>
          <button className="upload-button" type="button">
            {content.uploadCta}
          </button>
        </div>
        <p>{content.quoteInputHint}</p>
        <textarea rows={3} placeholder={content.quotePlaceholder} />
      </section>
      <label className="field-group compact-field">
        <span>{content.emailLabel}</span>
        <input type="email" placeholder={content.emailPlaceholder} />
        <small>{content.emailHelper}</small>
      </label>
      <button className="primary-button" type="submit">
        {content.cta}
      </button>
    </form>
  );
}
