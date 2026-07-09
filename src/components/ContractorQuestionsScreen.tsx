import { useEffect, useMemo, useState } from 'react';
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
  loopBody: string;
  fallbackQuestions: string[];
  copyCta: string;
  copiedLabel: string;
  replyCta: string;
  scrollCue: string;
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
    loopTitle: 'Cuando responda el profesional',
    loopBody: 'Pega aquí su respuesta y RenoPilot comprobará si ya está claro.',
    fallbackQuestions: [
      'precio final con IVA',
      'qué incluye exactamente',
      'cuándo podría hacerse',
      'qué garantía tendría',
    ],
    copyCta: 'Copiar mensaje',
    copiedLabel: 'Copiado ✓',
    replyCta: 'Revisar respuesta',
    scrollCue: '↓ Copia el mensaje y vuelve con la respuesta',
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
    loopTitle: 'When the contractor replies',
    loopBody: 'Paste their answer here and RenoPilot will check if it is now clear.',
    fallbackQuestions: [
      'final price with VAT',
      'what exactly is included',
      'when it could be done',
      'what warranty applies',
    ],
    copyCta: 'Copy message',
    copiedLabel: 'Copied ✓',
    replyCta: 'Review reply',
    scrollCue: '↓ Copy the message and come back with the reply',
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
    loopTitle: 'Gdy wykonawca odpowie',
    loopBody: 'Wklej tutaj jego odpowiedź, a RenoPilot sprawdzi, czy wszystko jest już jasne.',
    fallbackQuestions: [
      'końcowa cena z VAT',
      'co dokładnie jest w cenie',
      'kiedy można to zrobić',
      'jaka jest gwarancja',
    ],
    copyCta: 'Kopiuj wiadomość',
    copiedLabel: 'Skopiowano ✓',
    replyCta: 'Sprawdź odpowiedź',
    scrollCue: '↓ Skopiuj wiadomość i wróć z odpowiedzią',
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

function isNearBottom() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const documentHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);

  return documentHeight - (scrollTop + viewportHeight) < 180;
}

export function ContractorQuestionsScreen({ content, language, onNext }: ContractorQuestionsScreenProps) {
  const [tone, setTone] = useState<MessageTone>('casual');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showScrollCue, setShowScrollCue] = useState(false);
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

  useEffect(() => {
    const refreshCue = () => {
      setShowScrollCue(!isNearBottom());
    };

    refreshCue();
    window.setTimeout(refreshCue, 250);
    window.addEventListener('scroll', refreshCue, { passive: true });
    window.addEventListener('resize', refreshCue);

    return () => {
      window.removeEventListener('scroll', refreshCue);
      window.removeEventListener('resize', refreshCue);
    };
  }, [tone, tonedMessages.length]);

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
              className={`secondary-button copy-message-button${copiedIndex === index ? ' success' : ''}`}
              onClick={() => copyMessage(message.messageToSend, index)}
              type="button"
            >
              {copiedIndex === index ? copy.copiedLabel : copy.copyCta}
            </button>
          </section>
        ))}
      </div>
      <section className="reply-loop-card">
        <h2>{copy.loopTitle}</h2>
        <p>{copy.loopBody}</p>
      </section>
      <button className="primary-button review-reply-button" onClick={onNext} type="button">
        {copy.replyCta}
      </button>
      {showScrollCue && <div className="mobile-scroll-cue" aria-hidden="true">{copy.scrollCue}</div>}
    </div>
  );
}
