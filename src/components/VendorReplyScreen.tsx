import { useState, type FormEvent } from 'react';
import type { QuoteCheckContent } from '../data/quoteCheckContent';

type VendorReplyScreenProps = {
  content: QuoteCheckContent['vendorReply'];
  error?: string;
  isLoading?: boolean;
  onSubmit: (vendorReply: string) => void;
};

export function VendorReplyScreen({ content, error, isLoading = false, onSubmit }: VendorReplyScreenProps) {
  const [vendorReply, setVendorReply] = useState('');
  const [localError, setLocalError] = useState('');

  return (
    <form
      className="screen-content form-screen"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!vendorReply.trim()) {
          setLocalError('Pega la respuesta para poder actualizar la recomendación.');
          return;
        }

        setLocalError('');
        onSubmit(vendorReply);
      }}
    >
      <h1>{content.title}</h1>
      <label className="field-group">
        <span>{content.label}</span>
        <textarea
          onChange={(event) => setVendorReply(event.target.value)}
          placeholder={content.placeholder}
          rows={8}
          value={vendorReply}
        />
      </label>
      {(localError || error) && <p className="inline-error">{localError || error}</p>}
      <button className="primary-button" disabled={isLoading} type="submit">
        {isLoading ? 'Actualizando…' : content.cta}
      </button>
    </form>
  );
}
