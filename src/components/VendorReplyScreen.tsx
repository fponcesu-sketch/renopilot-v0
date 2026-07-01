import type { FormEvent } from 'react';
import type { QuoteCheckContent } from '../data/quoteCheckContent';

type VendorReplyScreenProps = {
  content: QuoteCheckContent['vendorReply'];
  onNext: () => void;
};

export function VendorReplyScreen({ content, onNext }: VendorReplyScreenProps) {
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
        <span>{content.label}</span>
        <textarea rows={8} placeholder={content.placeholder} />
      </label>
      <button className="primary-button" type="submit">
        {content.cta}
      </button>
    </form>
  );
}
