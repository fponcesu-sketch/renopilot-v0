import type { FormEvent } from 'react';
import type { QuoteCheckContent } from '../data/quoteCheckContent';

type StartCheckScreenProps = {
  content: QuoteCheckContent['startCheck'];
  onNext: () => void;
};

export function StartCheckScreen({ content, onNext }: StartCheckScreenProps) {
  return (
    <form
      className="screen-content form-screen"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onNext();
      }}
    >
      <h1>{content.title}</h1>
      <label className="field-group">
        <span>{content.decisionLabel}</span>
        <textarea rows={4} placeholder={content.decisionPlaceholder} />
      </label>
      <div className="upload-placeholder" role="button" tabIndex={0}>
        <strong>{content.uploadLabel}</strong>
        <small>{content.uploadHint}</small>
      </div>
      <label className="field-group">
        <span>{content.pasteLabel}</span>
        <textarea rows={6} placeholder={content.pastePlaceholder} />
      </label>
      <label className="field-group">
        <span>{content.emailLabel}</span>
        <input type="email" placeholder={content.emailPlaceholder} />
      </label>
      <button className="primary-button" type="submit">
        {content.cta}
      </button>
    </form>
  );
}
