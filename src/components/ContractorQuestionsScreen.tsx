import { useState } from 'react';

type ContractorQuestionsContent = {
  title: string;
  message: string;
  copyCta: string;
  copiedLabel: string;
  cta: string;
};

type ContractorQuestionsScreenProps = {
  content: ContractorQuestionsContent;
  onNext: () => void;
};

export function ContractorQuestionsScreen({ content, onNext }: ContractorQuestionsScreenProps) {
  const [copied, setCopied] = useState(false);

  const copyMessage = async () => {
    await navigator.clipboard.writeText(content.message);
    setCopied(true);
  };

  return (
    <div className="screen-content">
      <h1>{content.title}</h1>
      <pre className="message-box">{content.message}</pre>
      <button
        className={`secondary-button${copied ? ' success' : ''}`}
        onClick={copyMessage}
        type="button"
      >
        {copied ? content.copiedLabel : content.copyCta}
      </button>
      <button className="primary-button" onClick={onNext}>
        {content.cta}
      </button>
    </div>
  );
}
