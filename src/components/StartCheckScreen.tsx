import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { QuoteCheckContent, Language } from '../data/quoteCheckContent';
import type { QuoteDocument } from '../types/analysis';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

type StartCheckScreenProps = {
  content: QuoteCheckContent['startCheck'];
  error?: string;
  language: Language;
  note: string;
  onSubmit: (input: { decisionContext: string; quoteText: string; quoteDocuments: QuoteDocument[] }) => void;
};

type PdfTextItem = {
  str?: string;
};

type MultiFileIntent = 'one_package' | 'compare_quotes' | null;

const uploadCopy: Record<Language, {
  reading: string;
  readingPdf: string;
  onlyPdf: string;
  unreadable: string;
  scanned: string;
  read: string;
  readMany: string;
  missingInput: string;
  intentQuestion: string;
  onePackage: string;
  compareQuotes: string;
  comingSoonTitle: string;
  comingSoonBodyIntro: string;
  comingSoonBullets: string[];
  earlyAccessCta: string;
  continueBasicCta: string;
  earlyAccessSaved: string;
}> = {
  es: {
    reading: 'Leyendo…',
    readingPdf: 'Leyendo PDFs…',
    onlyPdf: 'Ahora mismo solo podemos leer PDFs. Las capturas todavía no se analizan automáticamente.',
    unreadable: 'No hemos podido leer este PDF. Puedes copiar el texto manualmente.',
    scanned: 'No hemos podido leer texto de uno de los PDFs. Puede ser un escaneo o una imagen.',
    read: 'PDF leído',
    readMany: 'PDFs leídos',
    missingInput: 'Sube uno o varios PDFs o pega el presupuesto para poder revisarlo.',
    intentQuestion: '¿Estos archivos pertenecen al mismo presupuesto o son presupuestos de distintos profesionales?',
    onePackage: 'Un solo presupuesto',
    compareQuotes: 'Comparar presupuestos distintos',
    comingSoonTitle: 'Comparación de presupuestos próximamente',
    comingSoonBodyIntro: 'RenoPilot comparará hasta 3 presupuestos y te dirá:',
    comingSoonBullets: [
      'cuál parece más claro / seguro',
      'qué falta en cada uno',
      'por qué uno puede ser más barato o más arriesgado',
      'qué preguntar antes de elegir',
    ],
    earlyAccessCta: 'Quiero probarlo cuando esté listo',
    continueBasicCta: 'Seguir con revisión básica',
    earlyAccessSaved: 'Gracias. Lo tendremos en cuenta para acceso temprano.',
  },
  en: {
    reading: 'Reading…',
    readingPdf: 'Reading PDFs…',
    onlyPdf: 'Right now we can only read PDFs. Screenshots are not analyzed automatically yet.',
    unreadable: 'We could not read this PDF. You can paste the text manually.',
    scanned: 'We could not read text from one PDF. It may be a scan or image.',
    read: 'PDF read',
    readMany: 'PDFs read',
    missingInput: 'Upload one or more PDFs, or paste the quote so we can review it.',
    intentQuestion: 'Are these files part of one quote, or are they quotes from different contractors?',
    onePackage: 'One quote package',
    compareQuotes: 'Compare different quotes',
    comingSoonTitle: 'Multi-quote comparison is coming soon.',
    comingSoonBodyIntro: 'RenoPilot will compare up to 3 quotes and show:',
    comingSoonBullets: [
      'which one is clearer / safer',
      'what each quote is missing',
      'why one may be cheaper or riskier',
      'what to ask before choosing',
    ],
    earlyAccessCta: 'Join early access',
    continueBasicCta: 'Continue with basic check for now',
    earlyAccessSaved: 'Thanks. We will count this as early-access interest.',
  },
  pl: {
    reading: 'Czytanie…',
    readingPdf: 'Czytanie PDF-ów…',
    onlyPdf: 'Na razie możemy czytać tylko PDF-y. Zrzuty ekranu nie są jeszcze analizowane automatycznie.',
    unreadable: 'Nie udało się odczytać tego PDF-a. Możesz wkleić tekst ręcznie.',
    scanned: 'Nie udało się odczytać tekstu z jednego PDF-a. To może być skan albo obraz.',
    read: 'PDF odczytany',
    readMany: 'PDF-y odczytane',
    missingInput: 'Wgraj jeden lub więcej PDF-ów albo wklej wycenę, aby ją sprawdzić.',
    intentQuestion: 'Czy te pliki należą do jednej wyceny, czy są wycenami od różnych wykonawców?',
    onePackage: 'Jedna wycena',
    compareQuotes: 'Porównaj różne wyceny',
    comingSoonTitle: 'Porównywanie wycen już wkrótce',
    comingSoonBodyIntro: 'RenoPilot porówna do 3 wycen i pokaże:',
    comingSoonBullets: [
      'która wygląda jaśniej / bezpieczniej',
      'czego brakuje w każdej wycenie',
      'dlaczego jedna może być tańsza lub bardziej ryzykowna',
      'o co zapytać przed wyborem',
    ],
    earlyAccessCta: 'Chcę przetestować, gdy będzie gotowe',
    continueBasicCta: 'Kontynuuj podstawową analizę',
    earlyAccessSaved: 'Dzięki. Potraktujemy to jako zainteresowanie wczesnym dostępem.',
  },
};

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

    if (pageText) {
      pageTexts.push(pageText);
    }
  }

  return pageTexts.join('\n\n');
}

function buildQuoteText(documents: QuoteDocument[], pastedText: string) {
  const documentText = documents
    .map((document, index) => `PDF ${index + 1}: ${document.name}\n${document.text}`)
    .join('\n\n---\n\n');

  return [documentText, pastedText.trim()].filter(Boolean).join('\n\n---\n\nPasted text:\n');
}

export function StartCheckScreen({ content, error, language, note, onSubmit }: StartCheckScreenProps) {
  const [decisionContext, setDecisionContext] = useState('');
  const [quoteText, setQuoteText] = useState('');
  const [quoteDocuments, setQuoteDocuments] = useState<QuoteDocument[]>([]);
  const [multiFileIntent, setMultiFileIntent] = useState<MultiFileIntent>(null);
  const [earlyAccessInterest, setEarlyAccessInterest] = useState(false);
  const [localError, setLocalError] = useState('');
  const [fileStatus, setFileStatus] = useState('');
  const [isReadingFile, setIsReadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileCopy = uploadCopy[language];
  const showMultiFileQuestion = quoteDocuments.length > 1;
  const showFakeDoor = showMultiFileQuestion && multiFileIntent === 'compare_quotes';

  const submitBasicCheck = () => {
    if (!quoteText.trim()) {
      setLocalError(fileCopy.missingInput);
      return;
    }

    setLocalError('');
    const shouldTreatAsOnePackage = quoteDocuments.length > 1;
    onSubmit({
      decisionContext,
      quoteText,
      quoteDocuments: shouldTreatAsOnePackage ? [] : quoteDocuments,
    });
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    if (files.some((file) => file.type !== 'application/pdf')) {
      setLocalError(fileCopy.onlyPdf);
      event.target.value = '';
      return;
    }

    setLocalError('');
    setFileStatus(fileCopy.readingPdf);
    setIsReadingFile(true);

    try {
      const extractedDocuments: QuoteDocument[] = [];

      for (const file of files) {
        const extractedText = await extractPdfText(file);

        if (!extractedText.trim()) {
          setFileStatus(fileCopy.scanned);
          continue;
        }

        extractedDocuments.push({ name: file.name, text: extractedText });
      }

      if (!extractedDocuments.length) {
        return;
      }

      const nextDocuments = [...quoteDocuments, ...extractedDocuments];
      const manualText = quoteDocuments.length ? '' : quoteText;
      setQuoteDocuments(nextDocuments);
      setQuoteText(buildQuoteText(nextDocuments, manualText));
      setMultiFileIntent(null);
      setEarlyAccessInterest(false);
      setFileStatus(
        nextDocuments.length === 1
          ? `${fileCopy.read}: ${nextDocuments[0].name}`
          : `${fileCopy.readMany}: ${nextDocuments.length}`,
      );
    } catch (fileError) {
      setFileStatus(fileCopy.unreadable);
    } finally {
      setIsReadingFile(false);
      event.target.value = '';
    }
  };

  return (
    <form
      className="screen-content form-screen start-check-screen"
      data-multi-file-intent={multiFileIntent || 'not_selected'}
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (showMultiFileQuestion && !multiFileIntent) {
          setLocalError(fileCopy.intentQuestion);
          return;
        }

        if (showFakeDoor) {
          return;
        }

        submitBasicCheck();
      }}
    >
      <h1>{content.title}</h1>
      <p className="prototype-note">{note}</p>
      <label className="field-group decision-field">
        <span>{content.decisionLabel}</span>
        <textarea
          onChange={(event) => setDecisionContext(event.target.value)}
          placeholder={content.decisionPlaceholder}
          rows={2}
          value={decisionContext}
        />
      </label>
      <section className="quote-input-card">
        <div className="quote-card-header">
          <h2>{content.quoteInputLabel}</h2>
          <button
            className="upload-button"
            disabled={isReadingFile}
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            {isReadingFile ? fileCopy.reading : content.uploadCta}
          </button>
          <input
            accept="application/pdf,.pdf"
            className="file-input-hidden"
            multiple
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />
        </div>
        <p>{content.quoteInputHint}</p>
        {fileStatus && <p className="file-status">{fileStatus}</p>}
        <textarea
          onChange={(event) => {
            setQuoteText(event.target.value);
            setQuoteDocuments([]);
            setMultiFileIntent(null);
            setEarlyAccessInterest(false);
          }}
          placeholder={content.quotePlaceholder}
          rows={3}
          value={quoteText}
        />
      </section>
      {showMultiFileQuestion && (
        <section className="multi-file-intent-card">
          <h2>{fileCopy.intentQuestion}</h2>
          <div className="intent-option-group">
            <button
              className={multiFileIntent === 'one_package' ? 'intent-option selected' : 'intent-option'}
              onClick={() => {
                setMultiFileIntent('one_package');
                setEarlyAccessInterest(false);
                setLocalError('');
              }}
              type="button"
            >
              {fileCopy.onePackage}
            </button>
            <button
              className={multiFileIntent === 'compare_quotes' ? 'intent-option selected' : 'intent-option'}
              onClick={() => {
                setMultiFileIntent('compare_quotes');
                setLocalError('');
              }}
              type="button"
            >
              {fileCopy.compareQuotes}
            </button>
          </div>
        </section>
      )}
      {showFakeDoor && (
        <section className="fake-door-card">
          <h2>{fileCopy.comingSoonTitle}</h2>
          <p>{fileCopy.comingSoonBodyIntro}</p>
          <ul>
            {fileCopy.comingSoonBullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          {earlyAccessInterest && <p className="file-status">{fileCopy.earlyAccessSaved}</p>}
          <button
            className="primary-button"
            onClick={() => setEarlyAccessInterest(true)}
            type="button"
          >
            {fileCopy.earlyAccessCta}
          </button>
          <button
            className="secondary-button"
            onClick={submitBasicCheck}
            type="button"
          >
            {fileCopy.continueBasicCta}
          </button>
        </section>
      )}
      {(localError || error) && <p className="inline-error">{localError || error}</p>}
      {!showFakeDoor && (
        <button className="primary-button" disabled={isReadingFile} type="submit">
          {isReadingFile ? fileCopy.readingPdf : content.cta}
        </button>
      )}
    </form>
  );
}
