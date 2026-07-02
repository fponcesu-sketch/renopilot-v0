import { useState } from 'react';
import type { VendorMessage } from '../types/analysis';

type ContractorQuestionsContent = {
  title: string;
  message: string;
  messagesByVendor?: VendorMessage[];
  copyCta: string;
  copiedLabel: string;
  cta: string;
};

type ContractorQuestionsScreenProps = {
  content: ContractorQuestionsContent;
  onNext: () => void;
};

export function ContractorQuestionsScreen({ content, onNext }: ContractorQuestionsScreenProps) {
  const messages = content.messagesByVendor?.length
    ? content.messagesByVendor
    : [{ vendorName: content.title, messageToSend: content.message }];
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyMessage = async (message: string, index: number) => {
    await navigator.clipboard.writeText(message);
    setCopiedIndex(index);
  };

  return (
    <div className="screen-content vendor-messages-screen">
      <h1>{content.title}</h1>
      <div className="vendor-message-list">
        {messages.map((message, index) => (
          <section className="vendor-message-card" key={`${message.vendorName}-${index}`}>
            {messages.length > 1 && <h2>{message.vendorName}</h2>}
            <pre className="message-box">{message.messageToSend}</pre>
            <button
              className={`secondary-button${copiedIndex === index ? ' success' : ''}`}
              onClick={() => copyMessage(message.messageToSend, index)}
              type="button"
            >
              {copiedIndex === index ? content.copiedLabel : content.copyCta}
            </button>
          </section>
        ))}
      </div>
      <button className="primary-button" onClick={onNext}>
        {content.cta}
      </button>
    </div>
  );
}
