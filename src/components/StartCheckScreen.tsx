import type { FormEvent } from 'react';
import { quoteCheckContent } from '../data/quoteCheckContent';

type StartCheckScreenProps = {
  onNext: () => void;
};

export function StartCheckScreen({ onNext }: StartCheckScreenProps) {
  const { startCheck } = quoteCheckContent;

  return (
    <form
      className="screen-content form-screen"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onNext();
      }}
    >
      <h1>{startCheck.title}</h1>
      <label className="field-group">
        <span>{startCheck.decisionLabel}</span>
        <textarea rows={4} placeholder={startCheck.decisionPlaceholder} />
      </label>
      <div className="upload-placeholder" role="button" tabIndex={0}>
        <strong>{startCheck.uploadLabel}</strong>
        <small>{startCheck.uploadHint}</small>
      </div>
      <label className="field-group">
        <span>{startCheck.pasteLabel}</span>
        <textarea rows={6} placeholder={startCheck.pastePlaceholder} />
      </label>
      <label className="field-group">
        <span>{startCheck.emailLabel}</span>
        <input type="email" placeholder={startCheck.emailPlaceholder} />
      </label>
      <button className="primary-button" type="submit">
        {startCheck.cta}
      </button>
    </form>
  );
}
