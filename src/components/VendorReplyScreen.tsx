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
    defaultVendor: 'Proveedor',
    missing: 'Pega al menos una respuesta para poder actualizar la recomendación.',
    loading: 'Actualizando…',
    helperSingle: 'Pega aquí la respuesta de quien te pasó el presupuesto.',
    helperMultiple: 'Pega cada respuesta debajo de su proveedor. Puedes dejar vacío si aún no ha respondido.',
  },
  en: {
    defaultVendor: 'Vendor',
    missing: 'Paste at least one reply so we can update the recommendation.',
    loading: 'Updating…',
    helperSingle: 'Paste the reply from the person or company who sent the quote.',
    helperMultiple: 'Paste each reply under the right vendor. You can leave it empty if they have not replied yet.',
  },
  pl: {
    defaultVendor: 'Wykonawca',
    missing: 'Wklej przynajmniej jedną odpowiedź, aby zaktualizować rekomendację.',
    loading: 'Aktualizacja…',
    helperSingle: 'Wklej tutaj odpowiedź od osoby lub firmy, która wysłała wycenę.',
    helperMultiple: 'Wklej każdą odpowiedź pod właściwym wykonawcą. Możesz zostawić puste, jeśli jeszcze nie odpowiedział.',
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
