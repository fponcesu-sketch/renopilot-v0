import { useState, type ChangeEvent, type FormEvent } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { QuoteCheckContent, Language } from '../data/quoteCheckContent';
import type { QuoteDocument } from '../types/analysis';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const MAX_PDF_FALLBACK_BYTES = 2_500_000;

type MultiFileIntent = 'undecided' | 'single_package' | 'comparison_interest';

type StartCheckScreenProps = {
  content: QuoteCheckContent['startCheck'];
  error?: string;
  language: Language;
  note: string;
  onSubmit: (input: { decisionContext: string; quoteText: string; quoteDocuments: QuoteDocument[] }) => void;
};

type PdfTextItem = { str?: string };

const uploadCopy: Record<Language, {
  reading: string;
  readingPdf: string;
  onlyPdf: string;
  attachedLabel: string;
  extraTextPlaceholder: string;
  missingInput: string;
  privacyNote: string;
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
    reading: 'Leyendo…',
    readingPdf: 'Leyendo PDF…',
    onlyPdf: 'Ahora mismo solo podemos leer PDFs. Si estás en móvil, prueba a elegirlo desde Archivos / Files.',
    attachedLabel: 'Archivo adjuntado',
    extraTextPlaceholder: 'Texto adicional opcional',
    missingInput: 'Sube un PDF o pega el presupuesto para poder revisarlo.',
    privacyNote: 'Puedes ocultar datos personales antes de subir el presupuesto. RenoPilot revisa el contenido del presupuesto; no necesita tus datos personales.',
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
    reading: 'Reading…',
    readingPdf: 'Reading PDF…',
    onlyPdf: 'Right now we can only read PDFs. On mobile, try choosing it from Files.',
    attachedLabel: 'File attached',
    extraTextPlaceholder: 'Optional extra text',
    missingInput: 'Upload a PDF or paste the quote so we can review it.',
    privacyNote: 'You can remove personal details before uploading. RenoPilot reviews the quote content; it does not need your personal data.',
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
    reading: 'Czytanie…',
    readingPdf: 'Czytanie PDF…',
    onlyPdf: 'Na razie możemy czytać tylko PDF-y. Na telefonie spróbuj wybrać plik z aplikacji Pliki / Files.',
    attachedLabel: 'Plik dodany',
    extraTextPlaceholder: 'Opcjonalny dodatkowy tekst',
    missingInput: 'Wgraj PDF albo wklej wycenę, aby ją sprawdzić.',
    privacyNote: 'Możesz ukryć dane osobowe przed przesłaniem wyceny. RenoPilot analizuje treść wyceny; nie potrzebuje Twoich danych osobowych.',
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
    .map((document, index) => `PDF ${index + 1}: ${document.name}\n${document.text || '[PDF adjuntado]'}`)
    .join('\n\n---\n\n');

  return [documentText, pastedText.trim()].filter(Boolean).join('\n\n---\n\nPasted text:\n');
}

export function StartCheckScreen({ content, error, language, note, onSubmit }: StartCheckScreenProps) {
  const [decisionContext, setDecisionContext] = useState('');
  const [manualQuoteText, setManualQuoteText] = useState('');
  const [quoteDocuments, setQuoteDocuments] = useState<QuoteDocument[]>([]);
  const [earlyAccessInterest, setEarlyAccessInterest] = useState(false);
  const [multiFileIntent, setMultiFileIntent] = useState<MultiFileIntent>('undecided');
  const [localError, setLocalError] = useState('');
  const [isReadingFile, setIsReadingFile] = useState(false);
  const fileCopy = uploadCopy[language];
  const hasMultipleFiles = quoteDocuments.length > 1;
  const hasUploadedFiles = quoteDocuments.length > 0;

  const submitBasicCheck = () => {
    const combinedQuoteText = buildQuoteText(quoteDocuments, manualQuoteText);

    if (!combinedQuoteText.trim()) {
      setLocalError(fileCopy.missingInput);
      return;
    }

    setLocalError('');
    onSubmit({ decisionContext, quoteText: combinedQuoteText, quoteDocuments });
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const files = Array.from(input.files || []);

    if (!files.length) return;

    if (files.some((file) => !isPdfFile(file))) {
      setLocalError(fileCopy.onlyPdf);
      input.value = '';
      return;
    }

    setLocalError('');
    setIsReadingFile(true);

    const attachedDocuments: QuoteDocument[] = files.map((file) => ({
      name: file.name || 'PDF',
      text: '',
      mimeType: file.type || 'application/pdf',
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

        try {
          extractedText = await extractPdfText(file);
        } catch {
          extractedText = '';
        }

        if (!extractedText.trim() && file.size <= MAX_PDF_FALLBACK_BYTES) {
          try {
            fileData = await fileToDataUrl(file);
          } catch {
            fileData = '';
          }
        }

        enrichedDocuments.push({
          name: file.name || 'PDF',
          text: extractedText,
          fileData,
          mimeType: file.type || 'application/pdf',
          sizeBytes: file.size,
        });
      }

      setQuoteDocuments([...previousDocuments, ...enrichedDocuments]);
    } finally {
      setIsReadingFile(false);
      input.value = '';
    }
  };

  return (
    <form
      className="screen-content form-screen start-check-screen"
      data-multi-file-intent={hasMultipleFiles ? multiFileIntent : 'basic_check'}
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
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
          <label className={isReadingFile ? 'upload-button disabled' : 'upload-button'} htmlFor="quote-file-upload">
            {isReadingFile ? fileCopy.reading : content.uploadCta}
          </label>
          <input
            accept="application/pdf,.pdf"
            className="file-input-hidden"
            id="quote-file-upload"
            multiple
            onChange={handleFileChange}
            type="file"
          />
        </div>
        <p>{content.quoteInputHint}</p>
        <p className="privacy-note">{fileCopy.privacyNote}</p>
        {hasUploadedFiles && (
          <div className="attached-file-list" aria-live="polite">
            {quoteDocuments.map((document, index) => (
              <div className="attached-file-pill" key={`${document.name}-${index}`}>
                <span>✓ {fileCopy.attachedLabel}</span>
                <strong>{document.name}</strong>
              </div>
            ))}
          </div>
        )}
        {hasMultipleFiles && (
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
        {hasMultipleFiles && multiFileIntent === 'comparison_interest' && (
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
        <textarea
          onChange={(event) => {
            setManualQuoteText(event.target.value);
            if (hasUploadedFiles) setLocalError('');
          }}
          placeholder={hasUploadedFiles ? fileCopy.extraTextPlaceholder : content.quotePlaceholder}
          rows={3}
          value={manualQuoteText}
        />
      </section>
      {(localError || error) && <p className="inline-error">{localError || error}</p>}
      <button className="primary-button" disabled={isReadingFile} type="submit">
        {isReadingFile ? fileCopy.readingPdf : content.cta}
      </button>
    </form>
  );
}
