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
      <label className="field-group">
        <span>{content.decisionLabel}</span>
        <textarea rows={3} placeholder={content.decisionPlaceholder} />
      </label>
      <section className="quote-input-card">
        <div>
          <h2>{content.quoteInputLabel}</h2>
          <p>{content.quoteInputHint}</p>
        </div>
        <button className="upload-button" type="button">
          {content.uploadCta}
        </button>
        <textarea rows={5} placeholder={content.quotePlaceholder} />
      </section>
      <label className="field-group compact-field">
        <span>{content.emailLabel}</span>
        <small>{content.emailHelper}</small>
        <input type="email" placeholder={content.emailPlaceholder} />
      </label>
      <button className="primary-button" type="submit">
        {content.cta}
      </button>
    </form>
  );
}
