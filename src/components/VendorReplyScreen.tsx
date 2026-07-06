import { useMemo, useState, type FormEvent } from 'react';
import type { QuoteCheckContent, Language } from '../data/quoteCheckContent';
import type { VendorMessage } from '../types/analysis';

type VendorReplyScreenProps = {
  content: QuoteCheckContent['vendorReply'];
  error?: string;
  isLoading?: boolean;
  language: Language;
  replyTargets?: VendorMessage[];
  onSubmit: (vendorReply: string) => void;
};

const replyCopy: Record<Language, {
  defaultVendor: string;
  missing: string;
  loading: string;
  helperSingle: string;
  helperMultiple: string;
}> = {
  es: {
    defaultVendor: 'Profesional',
    missing: 'Pega la respuesta del profesional para poder revisarla.',
    loading: 'Revisando respuesta…',
    helperSingle: 'Cuando el profesional responda, pega aquí su respuesta y RenoPilot comprobará si los puntos pendientes ya están claros.',
    helperMultiple: 'Pega cada respuesta debajo de su profesional. Puedes dejar vacío si aún no ha respondido.',
  },
  en: {
    defaultVendor: 'Contractor',
    missing: 'Paste the contractor reply so we can check it.',
    loading: 'Checking reply…',
    helperSingle: 'After the contractor replies, paste their answer here and RenoPilot will check if the missing points are now clear.',
    helperMultiple: 'Paste each reply under the right contractor. You can leave it empty if they have not replied yet.',
  },
  pl: {
    defaultVendor: 'Wykonawca',
    missing: 'Wklej odpowiedź wykonawcy, aby ją sprawdzić.',
    loading: 'Sprawdzanie odpowiedzi…',
    helperSingle: 'Gdy wykonawca odpowie, wklej tutaj jego odpowiedź. RenoPilot sprawdzi, czy brakujące informacje są już jasne.',
    helperMultiple: 'Wklej każdą odpowiedź pod właściwym wykonawcą. Możesz zostawić puste, jeśli ktoś jeszcze nie odpowiedział.',
  },
};

export function VendorReplyScreen({
  content,
  error,
  isLoading = false,
  language,
  replyTargets = [],
  onSubmit,
}: VendorReplyScreenProps) {
  const targets = useMemo(() => {
    const uniqueTargets = replyTargets
      .filter((target) => target.vendorName?.trim())
      .filter((target, index, allTargets) =>
        allTargets.findIndex((other) => other.vendorName === target.vendorName) === index,
      );

    return uniqueTargets.length
      ? uniqueTargets
      : [{ vendorName: replyCopy[language].defaultVendor, messageToSend: '' }];
  }, [language, replyTargets]);

  const [vendorReplies, setVendorReplies] = useState<Record<string, string>>({});
  const [localError, setLocalError] = useState('');
  const copy = replyCopy[language];
  const isMultiple = targets.length > 1;

  return (
    <form
      className="screen-content form-screen vendor-reply-screen"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const labelledReplies = targets
          .map((target, index) => {
            const reply = vendorReplies[target.vendorName]?.trim();

            if (!reply) return null;

            return `${target.vendorName || `${copy.defaultVendor} ${index + 1}`}:\n${reply}`;
          })
          .filter(Boolean);

        if (!labelledReplies.length) {
          setLocalError(copy.missing);
          return;
        }

        setLocalError('');
        onSubmit(labelledReplies.join('\n\n---\n\n'));
      }}
    >
      <h1>{content.title}</h1>
      <p className="reply-helper">{isMultiple ? copy.helperMultiple : copy.helperSingle}</p>
      <div className="vendor-reply-list">
        {targets.map((target, index) => {
          const key = target.vendorName || `${copy.defaultVendor} ${index + 1}`;

          return (
            <label className="field-group vendor-reply-card" key={key}>
              <span>{isMultiple ? key : content.label}</span>
              <textarea
                onChange={(event) =>
                  setVendorReplies((currentReplies) => ({
                    ...currentReplies,
                    [key]: event.target.value,
                  }))
                }
                placeholder={content.placeholder}
                rows={isMultiple ? 4 : 7}
                value={vendorReplies[key] || ''}
              />
            </label>
          );
        })}
      </div>
      {(localError || error) && <p className="inline-error">{localError || error}</p>}
      <button className="primary-button" disabled={isLoading} type="submit">
        {isLoading ? copy.loading : content.cta}
      </button>
    </form>
  );
}
