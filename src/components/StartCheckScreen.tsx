import { useState, type ChangeEvent, type FormEvent } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { QuoteCheckContent, Language } from '../data/quoteCheckContent';
import type { QuoteDocument } from '../types/analysis';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const MAX_FILE_FALLBACK_BYTES = 4_000_000;

type MultiFileIntent = 'undecided' | 'single_package' | 'comparison_interest';
export type InputMode = 'written_quote' | 'informal_message' | 'verbal_estimate';

type StartCheckScreenProps = {
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

type PdfTextItem = { str?: string };

const uploadCopy: Record<Language, {
  title: string;
  subtitle: string;
  writtenPill: string;
  messagePill: string;
  memoryPill: string;
  writtenHelper: string;
  messageHelper: string;
  memoryHelper: string;
  placeholder: string;
  uploadCta: string;
  submitCta: string;
  expectation: string;
  privacyShort: string;
  privacyMoreLabel: string;
  privacyMore: string;
  reading: string;
  readingPdf: string;
  attachedLabel: string;
  extraTextPlaceholder: string;
  missingInput: string;
  missingMemoryInput: string;
  unsupportedFile: string;
  multiFileQuestion: string;
  onePackageOption: string;
  compareOption: string;
  compareTeaserTitle: string;
  compareTeaserBody: string;
  compareBullets: string[];
  earlyAccessCta: string;
  earlyAccessSaved: string;
  continueBasicCta: string;
}> = {
  es: {
    title: 'Pega lo que tengas',
    subtitle: 'Presupuesto, WhatsApp, email o notas de una conversación.',
    writtenPill: 'Presupuesto',
    messagePill: 'Mensaje',
    memoryPill: 'Lo que recuerdo',
    writtenHelper: 'Sube el archivo o pega el texto del presupuesto.',
    messageHelper: 'Pega el WhatsApp o email del profesional.',
    memoryHelper: 'Escribe lo que recuerdes. Te preparamos un mensaje para pedir confirmación.',
    placeholder: 'Ej: mosquiteras para 4 ventanas, 1200 PLN, instalación incluida, próxima semana.',
    uploadCta: '+ Subir PDF, foto o captura',
    submitCta: 'Revisar esto',
    expectation: 'Te decimos qué falta, qué es vago y qué puedes preguntarle.',
    privacyShort: '🔒 Puedes tapar datos sensibles si quieres.',
    privacyMoreLabel: 'Más info',
    privacyMore:
      'Usamos lo que compartes para generar tu revisión en RenoPilot. Podemos guardar aprendizajes anonimizados, pero no publicaremos tus documentos ni datos personales.',
    reading: 'Leyendo…',
    readingPdf: 'Leyendo archivo…',
    attachedLabel: 'Archivo adjuntado',
    extraTextPlaceholder: 'Añade más contexto si quieres.',
    missingInput: 'Pega, escribe o sube algo para revisarlo.',
    missingMemoryInput: 'Escribe lo que recuerdas para preparar el mensaje.',
    unsupportedFile: 'Puedes subir PDF, foto o captura. Si falla, pega el texto directamente.',
    multiFileQuestion: '¿Estos archivos pertenecen al mismo presupuesto o son presupuestos de distintos profesionales?',
    onePackageOption: 'Un solo presupuesto',
    compareOption: 'Comparar presupuestos distintos',
    compareTeaserTitle: 'Comparación de presupuestos próximamente.',
    compareTeaserBody: 'RenoPilot comparará hasta 3 presupuestos y te dirá:',
    compareBullets: [
      'cuál parece más claro / seguro',
      'qué falta en cada uno',
      'por qué uno puede ser más barato o más arriesgado',
      'qué preguntar antes de elegir',
    ],
    earlyAccessCta: 'Quiero probarlo cuando esté listo',
    earlyAccessSaved: 'Gracias. Lo tendremos en cuenta para acceso temprano.',
    continueBasicCta: 'Seguir con revisión básica',
  },
  en: {
    title: 'Paste what you have',
    subtitle: 'Quote, WhatsApp, email, or notes from a conversation.',
    writtenPill: 'Quote',
    messagePill: 'Message',
    memoryPill: 'What I remember',
    writtenHelper: 'Upload the file or paste the quote text.',
    messageHelper: 'Paste the contractor WhatsApp or email.',
    memoryHelper: 'Write what you remember. We prepare a message to request confirmation.',
    placeholder: 'Example: mosquito screens for 4 windows, 1200 PLN, installation included, next week.',
    uploadCta: '+ Upload PDF, photo or screenshot',
    submitCta: 'Review this',
    expectation: 'We tell you what is missing, what is vague, and what you can ask.',
    privacyShort: '🔒 You can hide sensitive details if you want.',
    privacyMoreLabel: 'More info',
    privacyMore:
      'We use what you share to generate your RenoPilot review. We may keep anonymised learnings, but we will not publish your documents or personal details.',
    reading: 'Reading…',
    readingPdf: 'Reading file…',
    attachedLabel: 'File attached',
    extraTextPlaceholder: 'Add more context if you want.',
    missingInput: 'Paste, write, or upload something so we can review it.',
    missingMemoryInput: 'Write what you remember so we can prepare the message.',
    unsupportedFile: 'You can upload a PDF, photo or screenshot. If it fails, paste the text directly.',
    multiFileQuestion: 'Are these files part of one quote, or are they quotes from different contractors?',
    onePackageOption: 'One quote package',
    compareOption: 'Compare different quotes',
    compareTeaserTitle: 'Multi-quote comparison is coming soon.',
    compareTeaserBody: 'RenoPilot will compare up to 3 quotes and show:',
    compareBullets: [
      'which one is clearer / safer',
      'what each quote is missing',
      'why one may be cheaper or riskier',
      'what to ask before choosing',
    ],
    earlyAccessCta: 'Join early access',
    earlyAccessSaved: 'Thanks. We will count this as early-access interest.',
    continueBasicCta: 'Continue with basic check for now',
  },
  pl: {
    title: 'Wklej to, co masz',
    subtitle: 'Oferta, WhatsApp, e-mail albo notatki z rozmowy.',
    writtenPill: 'Oferta',
    messagePill: 'Wiadomość',
    memoryPill: 'Co pamiętam',
    writtenHelper: 'Wgraj plik albo wklej tekst oferty.',
    messageHelper: 'Wklej WhatsAppa albo e-mail od wykonawcy.',
    memoryHelper: 'Napisz, co pamiętasz. Przygotujemy wiadomość z prośbą o potwierdzenie.',
    placeholder: 'Np. moskitiery do 4 okien, 1200 PLN, montaż w cenie, w przyszłym tygodniu.',
    uploadCta: '+ Wgraj PDF, zdjęcie lub zrzut ekranu',
    submitCta: 'Sprawdź to',
    expectation: 'Powiemy, czego brakuje, co jest niejasne i o co możesz zapytać.',
    privacyShort: '🔒 Możesz zasłonić dane wrażliwe, jeśli chcesz.',
    privacyMoreLabel: 'Więcej informacji',
    privacyMore:
      'Używamy tego, co udostępniasz, aby przygotować analizę w RenoPilot. Możemy zachować anonimowe wnioski, ale nie będziemy publikować Twoich dokumentów ani danych osobowych.',
    reading: 'Czytanie…',
    readingPdf: 'Czytanie pliku…',
    attachedLabel: 'Plik dodany',
    extraTextPlaceholder: 'Dodaj więcej kontekstu, jeśli chcesz.',
    missingInput: 'Wklej, napisz albo wgraj coś, aby to sprawdzić.',
    missingMemoryInput: 'Napisz, co pamiętasz, aby przygotować wiadomość.',
    unsupportedFile: 'Możesz wgrać PDF, zdjęcie lub zrzut ekranu. Jeśli coś nie zadziała, wklej tekst bezpośrednio.',
    multiFileQuestion: 'Czy te pliki są częścią jednej wyceny, czy to wyceny od różnych wykonawców?',
    onePackageOption: 'Jeden pakiet wyceny',
    compareOption: 'Porównaj różne wyceny',
    compareTeaserTitle: 'Porównywanie wycen pojawi się wkrótce.',
    compareTeaserBody: 'RenoPilot porówna do 3 wycen i pokaże:',
    compareBullets: [
      'która wygląda jaśniej / bezpieczniej',
      'czego brakuje w każdej wycenie',
      'dlaczego jedna może być tańsza albo bardziej ryzykowna',
      'o co zapytać przed wyborem',
    ],
    earlyAccessCta: 'Chcę przetestować, gdy będzie gotowe',
    earlyAccessSaved: 'Dzięki. Potraktujemy to jako zainteresowanie wczesnym dostępem.',
    continueBasicCta: 'Kontynuuj podstawową analizę',
  },
};

function isSupportedFile(file: File) {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  return type === 'application/pdf' || name.endsWith('.pdf') || type.startsWith('image/') || /\.(png|jpe?g|webp|heic|heif)$/i.test(name);
}

function isPdfFile(file: File) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

async function extractPdfText(file: File) {
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pageTexts: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => (item as PdfTextItem).str || '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (pageText) pageTexts.push(pageText);
  }

  return pageTexts.join('\n\n');
}

function buildQuoteText(documents: QuoteDocument[], pastedText: string) {
  const documentText = documents
    .map((document, index) => `File ${index + 1}: ${document.name}\n${document.text || '[attached file]'}`)
    .join('\n\n---\n\n');

  return [documentText, pastedText.trim()].filter(Boolean).join('\n\n---\n\nPasted or described content:\n');
}

function inferInputMode(selectedMode: InputMode | null, documents: QuoteDocument[], text: string): InputMode {
  if (selectedMode) return selectedMode;
  if (documents.length > 0) return 'written_quote';

  const value = text.toLowerCase();
  const verbalSignals = [
    'me dijo',
    'por teléfono',
    'telefono',
    'teléfono',
    'hablamos',
    'llamó',
    'llamo',
    'llamada',
    'dijo que',
    'said',
    'told me',
    'phone',
    'call',
    'rozmowa',
    'telefon',
    'powiedział',
    'mówił',
  ];

  if (verbalSignals.some((signal) => value.includes(signal))) return 'verbal_estimate';

  return 'informal_message';
}

export function StartCheckScreen({ content, error, language, onSubmit }: StartCheckScreenProps) {
  const [inputMode, setInputMode] = useState<InputMode | null>(null);
  const [manualQuoteText, setManualQuoteText] = useState('');
  const [quoteDocuments, setQuoteDocuments] = useState<QuoteDocument[]>([]);
  const [earlyAccessInterest, setEarlyAccessInterest] = useState(false);
  const [multiFileIntent, setMultiFileIntent] = useState<MultiFileIntent>('undecided');
  const [localError, setLocalError] = useState('');
  const [isReadingFile, setIsReadingFile] = useState(false);
  const fileCopy = uploadCopy[language];
  const hasMultipleFiles = quoteDocuments.length > 1;
  const hasUploadedFiles = quoteDocuments.length > 0;
  const effectiveMode = inferInputMode(inputMode, quoteDocuments, manualQuoteText);
  const isWrittenMode = effectiveMode === 'written_quote';
  const isVerbalMode = effectiveMode === 'verbal_estimate';

  const submitBasicCheck = () => {
    const inferredMode = inferInputMode(inputMode, quoteDocuments, manualQuoteText);
    const trimmedText = manualQuoteText.trim();

    if (!trimmedText && !quoteDocuments.length) {
      setLocalError(inferredMode === 'verbal_estimate' ? fileCopy.missingMemoryInput : fileCopy.missingInput);
      return;
    }

    setLocalError('');
    onSubmit({
      decisionContext: inferredMode === 'informal_message'
        ? 'Informal contractor message'
        : inferredMode === 'verbal_estimate'
          ? 'Verbal contractor estimate from memory'
          : 'Written contractor quote',
      quoteText: inferredMode === 'verbal_estimate' ? trimmedText : buildQuoteText(quoteDocuments, manualQuoteText),
      quoteDocuments: inferredMode === 'verbal_estimate' ? [] : quoteDocuments,
      inputMode: inferredMode,
    });
  };

  const handleModeChange = (mode: InputMode) => {
    setInputMode((currentMode) => (currentMode === mode ? null : mode));
    setLocalError('');
    setEarlyAccessInterest(false);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const files = Array.from(input.files || []);

    if (!files.length) return;

    if (files.some((file) => !isSupportedFile(file))) {
      setLocalError(fileCopy.unsupportedFile);
      input.value = '';
      return;
    }

    setLocalError('');
    setInputMode('written_quote');
    setIsReadingFile(true);

    const attachedDocuments: QuoteDocument[] = files.map((file) => ({
      name: file.name || 'File',
      text: '',
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
    }));
    const previousDocuments = quoteDocuments;
    const nextDocuments = [...previousDocuments, ...attachedDocuments];
    setQuoteDocuments(nextDocuments);
    setEarlyAccessInterest(false);
    setMultiFileIntent(nextDocuments.length > 1 ? 'undecided' : 'single_package');

    try {
      const enrichedDocuments: QuoteDocument[] = [];

      for (const file of files) {
        let extractedText = '';
        let fileData = '';

        if (isPdfFile(file)) {
          try {
            extractedText = await extractPdfText(file);
          } catch {
            extractedText = '';
          }
        }

        if ((!extractedText.trim() || !isPdfFile(file)) && file.size <= MAX_FILE_FALLBACK_BYTES) {
          try {
            fileData = await fileToDataUrl(file);
          } catch {
            fileData = '';
          }
        }

        enrichedDocuments.push({
          name: file.name || 'File',
          text: extractedText,
          fileData,
          mimeType: file.type || 'application/octet-stream',
          sizeBytes: file.size,
        });
      }

      setQuoteDocuments([...previousDocuments, ...enrichedDocuments]);
    } finally {
      setIsReadingFile(false);
      input.value = '';
    }
  };

  const helperText = inputMode === 'written_quote'
    ? fileCopy.writtenHelper
    : inputMode === 'informal_message'
      ? fileCopy.messageHelper
      : inputMode === 'verbal_estimate'
        ? fileCopy.memoryHelper
        : '';

  return (
    <form
      className="screen-content form-screen start-check-screen simple-input-screen"
      data-input-mode={inputMode || 'unselected'}
      data-multi-file-intent={hasMultipleFiles ? multiFileIntent : 'basic_check'}
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        submitBasicCheck();
      }}
    >
      <h1>{fileCopy.title}</h1>
      <p className="simple-input-subtitle">{fileCopy.subtitle}</p>

      <div className="input-pill-row" aria-label={fileCopy.title}>
        <button
          aria-pressed={inputMode === 'written_quote'}
          className={inputMode === 'written_quote' ? 'input-pill active' : 'input-pill'}
          onClick={() => handleModeChange('written_quote')}
          type="button"
        >
          {fileCopy.writtenPill}
        </button>
        <button
          aria-pressed={inputMode === 'informal_message'}
          className={inputMode === 'informal_message' ? 'input-pill active' : 'input-pill'}
          onClick={() => handleModeChange('informal_message')}
          type="button"
        >
          {fileCopy.messagePill}
        </button>
        <button
          aria-pressed={inputMode === 'verbal_estimate'}
          className={inputMode === 'verbal_estimate' ? 'input-pill active' : 'input-pill'}
          onClick={() => handleModeChange('verbal_estimate')}
          type="button"
        >
          {fileCopy.memoryPill}
        </button>
      </div>

      {helperText && <p className="selected-helper-line">{helperText}</p>}

      <section className="simple-input-card">
        <textarea
          onChange={(event) => {
            setManualQuoteText(event.target.value);
            setLocalError('');
          }}
          placeholder={hasUploadedFiles ? fileCopy.extraTextPlaceholder : fileCopy.placeholder}
          rows={7}
          value={manualQuoteText}
        />
        <label className={isReadingFile ? 'inline-upload-action disabled' : 'inline-upload-action'} htmlFor="quote-file-upload">
          {isReadingFile ? fileCopy.reading : fileCopy.uploadCta}
        </label>
        <input
          accept="application/pdf,.pdf,image/*,.png,.jpg,.jpeg,.webp,.heic,.heif"
          className="file-input-hidden"
          id="quote-file-upload"
          multiple
          onChange={handleFileChange}
          type="file"
        />
      </section>

      {hasUploadedFiles && (
        <div className="attached-file-list compact-attached-list" aria-live="polite">
          {quoteDocuments.map((document, index) => (
            <div className="attached-file-pill" key={`${document.name}-${index}`}>
              <span>✓ {fileCopy.attachedLabel}</span>
              <strong>{document.name}</strong>
            </div>
          ))}
        </div>
      )}

      {isWrittenMode && hasMultipleFiles && (
        <section className="multi-file-intent-card">
          <h2>{fileCopy.multiFileQuestion}</h2>
          <div className="multi-file-actions">
            <button
              className={multiFileIntent === 'single_package' ? 'intent-option active' : 'intent-option'}
              onClick={() => setMultiFileIntent('single_package')}
              type="button"
            >
              {fileCopy.onePackageOption}
            </button>
            <button
              className={multiFileIntent === 'comparison_interest' ? 'intent-option active' : 'intent-option'}
              onClick={() => setMultiFileIntent('comparison_interest')}
              type="button"
            >
              {fileCopy.compareOption}
            </button>
          </div>
        </section>
      )}

      {isWrittenMode && hasMultipleFiles && multiFileIntent === 'comparison_interest' && (
        <section className="comparison-teaser-card">
          <h2>{fileCopy.compareTeaserTitle}</h2>
          <p>{fileCopy.compareTeaserBody}</p>
          <ul>
            {fileCopy.compareBullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          {earlyAccessInterest && <p className="file-status">{fileCopy.earlyAccessSaved}</p>}
          <button className="secondary-button" onClick={() => setEarlyAccessInterest(true)} type="button">
            {fileCopy.earlyAccessCta}
          </button>
          <button className="text-button" onClick={() => setMultiFileIntent('single_package')} type="button">
            {fileCopy.continueBasicCta}
          </button>
        </section>
      )}

      {isVerbalMode && (
        <div className="helper-chip-list subtle-hints" aria-label={fileCopy.memoryHelper}>
          {fileCopy.memoryHelper}
        </div>
      )}

      {(localError || error) && <p className="inline-error">{localError || error}</p>}

      <button className="primary-button" disabled={isReadingFile} type="submit">
        {isReadingFile ? fileCopy.readingPdf : fileCopy.submitCta}
      </button>
      <p className="expectation-line">{fileCopy.expectation}</p>
      <details className="privacy-inline-note">
        <summary>{fileCopy.privacyShort}</summary>
        <p>{fileCopy.privacyMore}</p>
      </details>
    </form>
  );
}
