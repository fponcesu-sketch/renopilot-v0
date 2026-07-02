import { useState, type FormEvent } from 'react';
import type { QuoteCheckContent } from '../data/quoteCheckContent';

type StartCheckScreenProps = {
  content: QuoteCheckContent['startCheck'];
  error?: string;
  note: string;
  onSubmit: (input: { decisionContext: string; quoteText: string }) => void;
};

export function StartCheckScreen({ content, error, note, onSubmit }: StartCheckScreenProps) {
  const [decisionContext, setDecisionContext] = useState('');
  const [quoteText, setQuoteText] = useState('');
  const [localError, setLocalError] = useState('');

  return (
    <form
      className="screen-content form-screen start-check-screen"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!quoteText.trim()) {
          setLocalError('Pega el presupuesto o mensaje para poder revisarlo.');
          return;
        }

        setLocalError('');
        onSubmit({ decisionContext, quoteText });
      }}
    >
      <h1>{content.title}</h1>
      <p className="prototype-note">{note}</p>
      <label className="field-group decision-field">
        <span>{content.decisionLabel}</span>
        <textarea
          onChange={(event) => setDecisionContext(event.target.value)}
          placeholder={content.decisionPlaceholder}
          rows={2}
          value={decisionContext}
        />
      </label>
      <section className="quote-input-card">
        <div className="quote-card-header">
          <h2>{content.quoteInputLabel}</h2>
          <button className="upload-button" type="button">
            {content.uploadCta}
          </button>
        </div>
        <p>{content.quoteInputHint}</p>
        <textarea
          onChange={(event) => setQuoteText(event.target.value)}
          placeholder={content.quotePlaceholder}
          rows={3}
          value={quoteText}
        />
      </section>
      {(localError || error) && <p className="inline-error">{localError || error}</p>}
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
