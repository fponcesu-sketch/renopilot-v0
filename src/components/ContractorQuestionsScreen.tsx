import { useState } from 'react';
import { quoteCheckContent } from '../data/quoteCheckContent';

type ContractorQuestionsScreenProps = {
  onNext: () => void;
};

export function ContractorQuestionsScreen({ onNext }: ContractorQuestionsScreenProps) {
  const { questions } = quoteCheckContent;
  const [copied, setCopied] = useState(false);

  const copyMessage = async () => {
    await navigator.clipboard.writeText(questions.message);
    setCopied(true);
  };

  return (
    <div className="screen-content">
      <h1>{questions.title}</h1>
      <pre className="message-box">{questions.message}</pre>
      <button className="secondary-button" onClick={copyMessage}>
        {copied ? questions.copiedLabel : questions.copyCta}
      </button>
      <button className="primary-button" onClick={onNext}>
        {questions.cta}
      </button>
    </div>
  );
}
