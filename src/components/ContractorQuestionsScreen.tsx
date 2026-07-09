import { useMemo, useState } from 'react';
import type { Language } from '../data/quoteCheckContent';
import type { VendorMessage } from '../types/analysis';

type MessageTone = 'casual' | 'email' | 'short' | 'formal';

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
  language?: Language;
  onNext: () => void;
};

const toneCopy: Record<Language, {
  label: string;
  tones: Record<MessageTone, string>;
  loopTitle: string;
  loopSteps: string[];
  fallbackQuestions: string[];
  templates: Record<MessageTone, (questions: string[]) => string>;
}> = {
  es: {
    label: 'Elige el tono del mensaje',
    tones: {
      casual: 'Casual WhatsApp',
      email: 'Email educado',
      short: 'Corto y directo',
      formal: 'Más formal',
    },
    loopTitle: 'Después, pega aquí la respuesta del profesional',
    loopSteps: [
      'RenoPilot prepara las preguntas.',
      'Tú se las envías al profesional.',
      'El profesional responde.',
      'Pegas aquí la respuesta.',
      'RenoPilot te dice si todavía queda algo poco claro.',
    ],
    fallbackQuestions: [
      'precio final con IVA',
      'qué incluye exactamente',
      'cuándo podría hacerse',
      'qué garantía tendría',
    ],
    templates: {
      casual: (questions) => `Gracias. Antes de confirmar, ¿me puedes aclarar esto?\n\n${questions.map((question) => `- ${question}`).join('\n')}`,
      email: (questions) => `Hola, gracias por el presupuesto. Antes de confirmar, ¿podrías aclararme estos puntos?\n\n${questions.map((question) => `- ${question}`).join('\n')}\n\nGracias.`,
      short: (questions) => `Antes de confirmar, necesito aclarar:\n\n${questions.map((question) => `- ${question}`).join('\n')}`,
      formal: (questions) => `Hola, gracias por la información. Antes de aceptar, ¿podrías confirmar por escrito los siguientes puntos?\n\n${questions.map((question) => `- ${question}`).join('\n')}\n\nGracias.`,
    },
  },
  en: {
    label: 'Choose message tone',
    tones: {
      casual: 'Casual WhatsApp',
      email: 'Polite email',
      short: 'Short and direct',
      formal: 'More formal',
    },
    loopTitle: 'After the contractor replies, paste their answer here',
    loopSteps: [
      'RenoPilot prepares questions.',
      'You send them to the contractor.',
      'The contractor replies.',
      'You paste the reply back.',
      'RenoPilot tells you if anything is still unclear.',
    ],
    fallbackQuestions: [
      'final price with VAT',
      'what exactly is included',
      'when it could be done',
      'what warranty applies',
    ],
    templates: {
      casual: (questions) => `Thanks. Before I confirm, could you clarify this?\n\n${questions.map((question) => `- ${question}`).join('\n')}`,
      email: (questions) => `Hi, thanks for the quote. Before confirming, could you please clarify these points?\n\n${questions.map((question) => `- ${question}`).join('\n')}\n\nThank you.`,
      short: (questions) => `Before confirming, I need to clarify:\n\n${questions.map((question) => `- ${question}`).join('\n')}`,
      formal: (questions) => `Hi, thank you for the information. Before accepting, could you please confirm the following points in writing?\n\n${questions.map((question) => `- ${question}`).join('\n')}\n\nThank you.`,
    },
  },
  pl: {
    label: 'Wybierz ton wiadomości',
    tones: {
      casual: 'Luźny WhatsApp',
      email: 'Uprzejmy e-mail',
      short: 'Krótko i konkretnie',
      formal: 'Bardziej formalnie',
    },
    loopTitle: 'Gdy wykonawca odpowie, wklej tutaj jego odpowiedź',
    loopSteps: [
      'RenoPilot przygotowuje pytania.',
      'Wysyłasz je wykonawcy.',
      'Wykonawca odpowiada.',
      'Wklejasz tutaj odpowiedź.',
      'RenoPilot mówi, czy coś nadal jest niejasne.',
    ],
    fallbackQuestions: [
      'końcowa cena z VAT',
      'co dokładnie jest w cenie',
      'kiedy można to zrobić',
      'jaka jest gwarancja',
    ],
    templates: {
      casual: (questions) => `Dzięki. Zanim potwierdzę, możesz mi proszę doprecyzować?\n\n${questions.map((question) => `- ${question}`).join('\n')}`,
      email: (questions) => `Dzień dobry, dziękuję za ofertę. Przed potwierdzeniem proszę o doprecyzowanie kilku punktów:\n\n${questions.map((question) => `- ${question}`).join('\n')}\n\nDziękuję.`,
      short: (questions) => `Przed potwierdzeniem proszę o doprecyzowanie:\n\n${questions.map((question) => `- ${question}`).join('\n')}`,
      formal: (questions) => `Dzień dobry, dziękuję za przesłane informacje. Przed akceptacją proszę o pisemne potwierdzenie poniższych punktów:\n\n${questions.map((question) => `- ${question}`).join('\n')}\n\nDziękuję.`,
    },
  },
};

function inferLanguageFromContent(content: ContractorQuestionsContent): Language {
  const sample = `${content.title} ${content.copyCta} ${content.copiedLabel} ${content.cta}`.toLowerCase();

  if (sample.includes('kopiuj') || sample.includes('skopiowana') || sample.includes('wykonawcy')) return 'pl';
  if (sample.includes('copy') || sample.includes('copied') || sample.includes('contractor')) return 'en';
  return 'es';
}

function extractQuestions(message: string, fallbackQuestions: string[]) {
  const lines = message
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const extracted = lines
    .map((line) => line.replace(/^[-•]\s*/, '').replace(/^\d+[.)]\s*/, '').trim())
    .filter((line) => line.length > 8)
    .filter((line) => !/^(hola|hi|dzień dobry|gracias|thanks|thank you|dziękuję|dzięki)/i.test(line));

  return extracted.length ? extracted.slice(0, 6) : fallbackQuestions;
}

function isAlreadyNaturalCasualMessage(message: string) {
  const clean = message.trim();
  const hasBulletList = /\n\s*[-•]/.test(clean) || /\n\s*\d+[.)]/.test(clean);
  const startsNaturally = /^(gracias|thanks|dzięki)\b/i.test(clean);

  return startsNaturally && !hasBulletList && clean.length < 420;
}

export function ContractorQuestionsScreen({ content, language, onNext }: ContractorQuestionsScreenProps) {
  const [tone, setTone] = useState<MessageTone>('casual');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const resolvedLanguage = language ?? inferLanguageFromContent(content);
  const copy = toneCopy[resolvedLanguage];
  const messages = content.messagesByVendor?.length
    ? content.messagesByVendor
    : [{ vendorName: content.title, messageToSend: content.message }];

  const tonedMessages = useMemo(() => messages.map((message) => {
    if (tone === 'casual' && isAlreadyNaturalCasualMessage(message.messageToSend)) {
      return message;
    }

    const questions = extractQuestions(message.messageToSend, copy.fallbackQuestions);

    return {
      ...message,
      messageToSend: copy.templates[tone](questions),
    };
  }), [copy, messages, tone]);

  const copyMessage = async (message: string, index: number) => {
    await navigator.clipboard.writeText(message);
    setCopiedIndex(index);
  };

  return (
    <div className="screen-content vendor-messages-screen">
      <h1>{content.title}</h1>
      <section className="tone-selector-card" aria-label={copy.label}>
        <h2>{copy.label}</h2>
        <div className="tone-options">
          {(Object.keys(copy.tones) as MessageTone[]).map((toneKey) => (
            <button
              className={tone === toneKey ? 'tone-option active' : 'tone-option'}
              key={toneKey}
              onClick={() => {
                setTone(toneKey);
                setCopiedIndex(null);
              }}
              type="button"
            >
              {copy.tones[toneKey]}
            </button>
          ))}
        </div>
      </section>
      <div className="vendor-message-list">
        {tonedMessages.map((message, index) => (
          <section className="vendor-message-card" key={`${message.vendorName}-${index}`}>
            {tonedMessages.length > 1 && <h2>{message.vendorName}</h2>}
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
      <section className="reply-loop-card">
        <h2>{copy.loopTitle}</h2>
        <ol>
          {copy.loopSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
      <button className="primary-button" onClick={onNext}>
        {content.cta}
      </button>
    </div>
  );
}
