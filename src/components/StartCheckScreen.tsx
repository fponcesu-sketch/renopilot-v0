import { useState, type ChangeEvent, type FormEvent } from 'react';
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

type PdfTextItem = { str?: string };

const uploadCopy: Record<Language, {
  reading: string;
  readingPdf: string;
  onlyPdf: string;
  unreadable: string;
  attachedLabel: string;
  extraTextPlaceholder: string;
  missingInput: string;
  multiFileNotice: string;
  compareTeaserTitle: string;
  compareTeaserBody: string;
  earlyAccessCta: string;
  earlyAccessSaved: string;
}> = {
  es: {
    reading: 'Leyendo…',
    readingPdf: 'Leyendo PDF…',
    onlyPdf: 'Ahora mismo solo podemos leer PDFs. Si estás en móvil, prueba a elegirlo desde Archivos / Files.',
    unreadable: 'No hemos podido leer el texto del PDF. Prueba de nuevo o copia el texto del presupuesto.',
    attachedLabel: 'Archivo adjuntado',
    extraTextPlaceholder: 'Texto adicional opcional',
    missingInput: 'Sube un PDF legible o pega el presupuesto para poder revisarlo.',
    multiFileNotice: 'RenoPilot revisará estos archivos como un único paquete de presupuesto. La comparación de presupuestos todavía no está disponible en este prototipo.',
    compareTeaserTitle: '¿Necesitas comparar varios presupuestos?',
    compareTeaserBody: 'La comparación de presupuestos llegará pronto.',
    earlyAccessCta: 'Quiero probarlo cuando esté listo',
    earlyAccessSaved: 'Gracias. Lo tendremos en cuenta para acceso temprano.',
  },
  en: {
    reading: 'Reading…',
    readingPdf: 'Reading PDF…',
    onlyPdf: 'Right now we can only read PDFs. On mobile, try choosing it from Files.',
    unreadable: 'We could not read the PDF text. Try again or paste the quote text.',
    attachedLabel: 'File attached',
    extraTextPlaceholder: 'Optional extra text',
    missingInput: 'Upload a readable PDF or paste the quote so we can review it.',
    multiFileNotice: 'RenoPilot will review these files as one quote package. Multi-quote comparison is not available in this prototype yet.',
    compareTeaserTitle: 'Need to compare several quotes?',
    compareTeaserBody: 'Multi-quote comparison is coming soon.',
    earlyAccessCta: 'Join early access',
    earlyAccessSaved: 'Thanks. We will count this as early-access interest.',
  },
  pl: {
    reading: 'Czytanie…',
    readingPdf: 'Czytanie PDF…',
    onlyPdf: 'Na razie możemy czytać tylko PDF-y. Na telefonie spróbuj wybrać plik z aplikacji Pliki / Files.',
    unreadable: 'Nie udało się odczytać tekstu z PDF-a. Spróbuj ponownie albo wklej tekst wyceny.',
    attachedLabel: 'Plik dodany',
    extraTextPlaceholder: 'Opcjonalny dodatkowy tekst',
    missingInput: 'Wgraj czytelny PDF albo wklej wycenę, aby ją sprawdzić.',
    multiFileNotice: 'RenoPilot sprawdzi te pliki jako jeden pakiet wyceny. Porównywanie wycen nie jest jeszcze dostępne w tym prototypie.',
    compareTeaserTitle: 'Chcesz porównać kilka wycen?',
    compareTeaserBody: 'Porównywanie wycen pojawi się wkrótce.',
    earlyAccessCta: 'Chcę przetestować, gdy będzie gotowe',
    earlyAccessSaved: 'Dzięki. Potraktujemy to jako zainteresowanie wczesnym dostępem.',
  },
};

function isPdfFile(file: File) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
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
    .filter((document) => document.text.trim())
    .map((document, index) => `PDF ${index + 1}: ${document.name}\n${document.text}`)
    .join('\n\n---\n\n');

  return [documentText, pastedText.trim()].filter(Boolean).join('\n\n---\n\nPasted text:\n');
}

export function StartCheckScreen({ content, error, language, note, onSubmit }: StartCheckScreenProps) {
  const [decisionContext, setDecisionContext] = useState('');
  const [manualQuoteText, setManualQuoteText] = useState('');
  const [quoteDocuments, setQuoteDocuments] = useState<QuoteDocument[]>([]);
  const [earlyAccessInterest, setEarlyAccessInterest] = useState(false);
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
    setQuoteDocuments([...previousDocuments, ...attachedDocuments]);
    setEarlyAccessInterest(false);

    try {
      const enrichedDocuments: QuoteDocument[] = [];

      for (const file of files) {
        let extractedText = '';
        try {
          extractedText = await extractPdfText(file);
        } catch {
          extractedText = '';
        }

        enrichedDocuments.push({
          name: file.name || 'PDF',
          text: extractedText,
          mimeType: file.type || 'application/pdf',
          sizeBytes: file.size,
        });
      }

      setQuoteDocuments([...previousDocuments, ...enrichedDocuments]);
      if (!enrichedDocuments.some((document) => document.text.trim())) {
        setLocalError(fileCopy.unreadable);
      }
    } finally {
      setIsReadingFile(false);
      input.value = '';
    }
  };

  return (
    <form
      className="screen-content form-screen start-check-screen"
      data-multi-file-intent={earlyAccessInterest ? 'comparison_interest' : 'basic_check'}
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
        {hasMultipleFiles && <p className="inline-warning">{fileCopy.multiFileNotice}</p>}
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
      <section className="comparison-teaser-card">
        <h2>{fileCopy.compareTeaserTitle}</h2>
        <p>{fileCopy.compareTeaserBody}</p>
        {earlyAccessInterest && <p className="file-status">{fileCopy.earlyAccessSaved}</p>}
        <button className="secondary-button" onClick={() => setEarlyAccessInterest(true)} type="button">
          {fileCopy.earlyAccessCta}
        </button>
      </section>
      {(localError || error) && <p className="inline-error">{localError || error}</p>}
      <button className="primary-button" disabled={isReadingFile} type="submit">
        {isReadingFile ? fileCopy.readingPdf : content.cta}
      </button>
    </form>
  );
}
