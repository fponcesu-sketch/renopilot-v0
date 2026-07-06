import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { Language, QuoteCheckContent } from '../data/quoteCheckContent';
import type { QuoteDocument } from '../types/analysis';

export type InputMode = 'written_quote' | 'informal_message' | 'verbal_estimate';

type Props = {
  content: QuoteCheckContent['startCheck'];
  error?: string;
  language: Language;
  note: string;
  onSubmit: (input: {
    decisionContext: string;
    quoteText: string;
    quoteDocuments: QuoteDocument[];
    inputMode: InputMode;
  }) => void;
};

const copy = {
  es: {
    title: 'Pega lo que tengas',
    subtitle: 'Presupuesto, WhatsApp, email o notas de una conversación.',
    pills: ['Presupuesto', 'Mensaje', 'Lo que recuerdo'],
    helpers: [
      'Sube el archivo o pega el texto del presupuesto.',
      'Pega el WhatsApp o email del profesional.',
      'Escribe lo que recuerdes de la llamada o lo que el profesional te prometió por teléfono. Te preparamos un mensaje para pedir confirmación por escrito.',
    ],
    placeholder: 'Ej: mosquiteras para 4 ventanas, 1200 PLN, instalación incluida, próxima semana.',
    extra: 'Añade más contexto si quieres.',
    upload: '+ Subir PDF, foto o captura',
    cta: 'Revisar esto',
    checking: 'Leyendo archivo…',
    missing: 'Pega, escribe o sube algo para revisarlo.',
    attached: 'Archivo adjuntado',
    expectation: 'Te decimos qué falta, qué no está claro y qué puedes preguntarle.',
    privacy: '🔒 Puedes tapar datos sensibles si quieres.',
    privacyMore: 'Usamos lo que compartes para generar tu revisión en RenoPilot. Podemos guardar aprendizajes anonimizados, pero no publicaremos tus documentos ni datos personales.',
  },
  en: {
    title: 'Paste what you have',
    subtitle: 'Quote, WhatsApp, email, or notes from a conversation.',
    pills: ['Quote', 'Message', 'What I remember'],
    helpers: [
      'Upload the file or paste the quote text.',
      'Paste the contractor WhatsApp or email.',
      'Write what you remember from the call or what the contractor promised by phone. We prepare a message to request written confirmation.',
    ],
    placeholder: 'Example: mosquito screens for 4 windows, 1200 PLN, installation included, next week.',
    extra: 'Add more context if you want.',
    upload: '+ Upload PDF, photo or screenshot',
    cta: 'Review this',
    checking: 'Reading file…',
    missing: 'Paste, write, or upload something so we can review it.',
    attached: 'File attached',
    expectation: 'We tell you what is missing, what is unclear, and what you can ask.',
    privacy: '🔒 You can hide sensitive details if you want.',
    privacyMore: 'We use what you share to generate your RenoPilot review. We may keep anonymised learnings, but we will not publish your documents or personal details.',
  },
  pl: {
    title: 'Wklej to, co masz',
    subtitle: 'Oferta, WhatsApp, e-mail albo notatki z rozmowy.',
    pills: ['Oferta', 'Wiadomość', 'Co pamiętam'],
    helpers: [
      'Wgraj plik albo wklej tekst oferty.',
      'Wklej WhatsAppa albo e-mail od wykonawcy.',
      'Napisz, co pamiętasz z rozmowy albo co wykonawca obiecał przez telefon. Przygotujemy wiadomość z prośbą o potwierdzenie na piśmie.',
    ],
    placeholder: 'Np. moskitiery do 4 okien, 1200 PLN, montaż w cenie, w przyszłym tygodniu.',
    extra: 'Dodaj więcej kontekstu, jeśli chcesz.',
    upload: '+ Wgraj PDF, zdjęcie lub zrzut ekranu',
    cta: 'Sprawdź to',
    checking: 'Czytanie pliku…',
    missing: 'Wklej, napisz albo wgraj coś, aby to sprawdzić.',
    attached: 'Plik dodany',
    expectation: 'Powiemy, czego brakuje, co jest niejasne i o co możesz zapytać.',
    privacy: '🔒 Możesz zasłonić dane wrażliwe, jeśli chcesz.',
    privacyMore: 'Używamy tego, co udostępniasz, aby przygotować analizę w RenoPilot. Możemy zachować anonimowe wnioski, ale nie będziemy publikować Twoich dokumentów ani danych osobowych.',
  },
} as const;

const modes: InputMode[] = ['written_quote', 'informal_message', 'verbal_estimate'];

function readFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

function inferMode(selected: InputMode | null, documents: QuoteDocument[], text: string): InputMode {
  if (selected) return selected;
  if (documents.length) return 'written_quote';

  const value = text.toLowerCase().replace(/\s+/g, ' ').trim();
  const verbalSignals = ['me dijo', 'por teléfono', 'telefono', 'teléfono', 'hablamos', 'llamada', 'said', 'told me', 'phone', 'call', 'telefon', 'powiedział'];
  const quoteSignals = ['presupuesto', 'oferta', 'quote', 'factura', 'total', 'iva', 'vat', 'garantía', 'gwarancja'];
  const hasVerbalSignal = verbalSignals.some((signal) => value.includes(signal));
  const hasQuoteSignal = quoteSignals.some((signal) => value.includes(signal));

  if (hasVerbalSignal && !hasQuoteSignal && value.length < 280) return 'verbal_estimate';
  return 'informal_message';
}

function buildText(documents: QuoteDocument[], text: string) {
  const fileText = documents.map((document, index) => `File ${index + 1}: ${document.name}\n${document.text || '[attached file]'}`).join('\n\n---\n\n');
  return [fileText, text.trim()].filter(Boolean).join('\n\n---\n\nPasted or described content:\n');
}

export function SafeStartCheckScreen({ error, language, onSubmit }: Props) {
  const c = copy[language];
  const [selectedMode, setSelectedMode] = useState<InputMode | null>(null);
  const [text, setText] = useState('');
  const [documents, setDocuments] = useState<QuoteDocument[]>([]);
  const [localError, setLocalError] = useState('');
  const [isReading, setIsReading] = useState(false);
  const effectiveMode = inferMode(selectedMode, documents, text);
  const isMemory = effectiveMode === 'verbal_estimate';
  const helper = selectedMode ? c.helpers[modes.indexOf(selectedMode)] : '';

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files || []);
    if (!files.length) return;

    setIsReading(true);
    setSelectedMode('written_quote');
    setLocalError('');

    try {
      const loaded = await Promise.all(files.slice(0, 3).map(async (file) => ({
        name: file.name || 'File',
        text: '',
        fileData: file.size <= 4_000_000 ? await readFile(file) : '',
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
      })));
      setDocuments((current) => [...current, ...loaded]);
    } finally {
      setIsReading(false);
      event.currentTarget.value = '';
    }
  };

  const submit = () => {
    const mode = inferMode(selectedMode, documents, text);
    const trimmed = text.trim();

    if (!trimmed && !documents.length) {
      setLocalError(c.missing);
      return;
    }

    onSubmit({
      decisionContext: mode === 'verbal_estimate' ? 'Verbal contractor estimate from memory' : mode === 'written_quote' ? 'Written contractor quote' : 'Informal contractor message',
      quoteText: mode === 'verbal_estimate' ? trimmed : buildText(documents, text),
      quoteDocuments: mode === 'verbal_estimate' ? [] : documents,
      inputMode: mode,
    });
  };

  return (
    <form className="screen-content form-screen start-check-screen simple-input-screen" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); submit(); }}>
      <h1>{c.title}</h1>
      <p className="simple-input-subtitle">{c.subtitle}</p>
      <div className="input-pill-row" aria-label={c.title}>
        {modes.map((mode, index) => (
          <button
            aria-pressed={selectedMode === mode}
            className={selectedMode === mode ? 'input-pill active' : 'input-pill'}
            key={mode}
            onClick={() => { setSelectedMode((current) => current === mode ? null : mode); setLocalError(''); }}
            type="button"
          >
            {c.pills[index]}
          </button>
        ))}
      </div>
      {helper && <p className="selected-helper-line">{helper}</p>}
      <section className="simple-input-card">
        <textarea onChange={(event) => { setText(event.target.value); setLocalError(''); }} placeholder={documents.length ? c.extra : c.placeholder} rows={7} value={text} />
        {!isMemory && <label className={isReading ? 'inline-upload-action disabled' : 'inline-upload-action'} htmlFor="quote-file-upload">{isReading ? c.checking : c.upload}</label>}
        <input accept="application/pdf,.pdf,image/*,.png,.jpg,.jpeg,.webp,.heic,.heif" className="file-input-hidden" id="quote-file-upload" multiple onChange={onFileChange} type="file" />
      </section>
      {documents.length > 0 && <div className="attached-file-list compact-attached-list">{documents.map((document, index) => <div className="attached-file-pill" key={`${document.name}-${index}`}><span>✓ {c.attached}</span><strong>{document.name}</strong></div>)}</div>}
      {(localError || error) && <p className="inline-error">{localError || error}</p>}
      <button className="primary-button" disabled={isReading} type="submit">{isReading ? c.checking : c.cta}</button>
      <p className="expectation-line">{c.expectation}</p>
      <details className="privacy-inline-note"><summary>{c.privacy}</summary><p>{c.privacyMore}</p></details>
    </form>
  );
}
