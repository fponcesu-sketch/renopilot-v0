import type { FormEvent } from 'react';
import { quoteCheckContent } from '../data/quoteCheckContent';

type VendorReplyScreenProps = {
  onNext: () => void;
};

export function VendorReplyScreen({ onNext }: VendorReplyScreenProps) {
  const { vendorReply } = quoteCheckContent;

  return (
    <form
      className="screen-content form-screen"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onNext();
      }}
    >
      <h1>{vendorReply.title}</h1>
      <label className="field-group">
        <span>{vendorReply.label}</span>
        <textarea rows={8} placeholder={vendorReply.placeholder} />
      </label>
      <button className="primary-button" type="submit">
        {vendorReply.cta}
      </button>
    </form>
  );
}
