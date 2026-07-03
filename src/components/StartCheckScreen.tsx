import { useState, type ChangeEvent, type FormEvent } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { QuoteCheckContent, Language } from '../data/quoteCheckContent';
import type { QuoteDocument } from '../types/analysis';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const MAX_PDF_PAYLOAD_BYTES = 2_500_000;

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

const uploadCopy: Record<Language, {
  reading: string;
  readingPdf: string;
  onlyPdf: string;
  unreadable: string;
  scanned: string;
  read: string;
  readMany: string;
  missingInput: string;
  multiFileNotice: string;
  compareTeaserTitle: string;
  compareTeaserBody: string;
  earlyAccessCta: string;
  earlyAccessSaved: string;
}> = {
  es: {
    reading: 'Leyendo…',
    readingPdf: 'Adjuntando PDF…',
    onlyPdf: 'Ahora mismo solo podemos leer PDFs. Si estás en móvil, prueba a elegirlo desde Archivos / Files.',
    unreadable: 'PDF adjuntado. Si el análisis sale incompleto, copia también el texto manualmente.',
    scanned: 'PDF adjuntado. Puede ser un escaneo, así que quizá necesitemos el texto manual si el análisis sale incompleto.',
    read: 'PDF adjuntado',
    readMany: 'PDFs adjuntados',
    missingInput: 'Sube uno o varios PDFs o pega el presupuesto para poder revisarlo.',
    multiFileNotice:
      'RenoPilot revisará estos archivos como un único paquete de presupuesto. La comparación de presupuestos todavía no está disponible en este prototipo.',
    compareTeaserTitle: '¿Necesitas comparar varios presupuestos?',
    compareTeaserBody: 'La comparación de presupuestos llegará pronto.',
    earlyAccessCta: 'Quiero probarlo cuando esté listo',
    earlyAccessSaved: 'Gracias. Lo tendremos en cuenta para acceso temprano.',
  },
  en: {
    reading: 'Reading…',
    readingPdf: 'Attaching PDF…',
    onlyPdf: 'Right now we can only read PDFs. On mobile, try choosing it from Files.',
    unreadable: 'PDF attached. If the review is incomplete, paste the text manually too.',
    scanned: 'PDF attached. It may be a scan, so we may need pasted text if the review is incomplete.',
    read: 'PDF attached',
    readMany: 'PDFs attached',
    missingInput: 'Upload one or more PDFs, or paste the quote so we can review it.',
    multiFileNotice:
      'RenoPilot will review these files as one quote package. Multi-quote comparison is not available in this prototype yet.',
    compareTeaserTitle: 'Need to compare several quotes?',
    compareTeaserBody: 'Multi-quote comparison is coming soon.',
    earlyAccessCta: 'Join early access',
    earlyAccessSaved: 'Thanks. We will count this as early-access interest.',
  },
  pl: {
    reading: 'Czytanie…',
    readingPdf: 'Dodawanie PDF…',
    onlyPdf: 'Na razie możemy czytać tylko PDF-y. Na telefonie spróbuj wybrać plik z aplikacji Pliki / Files.',
    unreadable: 'PDF dodany. Jeśli analiza będzie niepełna, wklej też tekst ręcznie.',
    scanned: 'PDF dodany. To może być skan, więc jeśli analiza będzie niepełna, wklej też tekst ręcznie.',
    read: 'PDF dodany',
    readMany: 'PDF-y dodane',
    missingInput: 'Wgraj jeden lub więcej PDF-ów albo wklej wycenę, aby ją sprawdzić.',
    multiFileNotice:
      'RenoPilot sprawdzi te pliki jako jeden pakiet wyceny. Porównywanie wycen nie jest jeszcze dostępne w tym prototypie.',
    compareTeaserTitle: 'Chcesz porównać kilka wycen?',
    compareTeaserBody: 'Porównywanie wycen pojawi się wkrótce.',
    earlyAccessCta: 'Chcę przetestować, gdy będzie gotowe',
    earlyAccessSaved: 'Dzięki. Potraktujemy to jako zainteresowanie wczesnym dostępem.',
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

    if (pageText) {
      pageTexts.push(pageText);
    }
  }

  return pageTexts.join('\n\n');
}

function buildQuoteText(documents: QuoteDocument[], pastedText: string) {
  const documentText = documents
    .map((document, index) => `PDF ${index + 1}: ${document.name}\n${document.text || '[PDF attached]'}`)
    .join('\n\n---\n\n');

  return [documentText, pastedText.trim()].filter(Boolean).join('\n\n---\n\nPasted text:\n');
}

export function StartCheckScreen({ content, error, language, note, onSubmit }: StartCheckScreenProps) {
  const [decisionContext, setDecisionContext] = useState('');
  const [manualQuoteText, setManualQuoteText] = useState('');
  const [quoteDocuments, setQuoteDocuments] = useState<QuoteDocument[]>([]);
  const [earlyAccessInterest, setEarlyAccessInterest] = useState(false);
  const [localError, setLocalError] = useState('');
  const [fileStatus, setFileStatus] = useState('');
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
    onSubmit({
      decisionContext,
      quoteText: combinedQuoteText,
      quoteDocuments,
    });
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
    setFileStatus(fileCopy.readingPdf);
    setIsReadingFile(true);

    try {
      const newDocuments: QuoteDocument[] = files.map((file) => ({
        name: file.name || 'PDF',
        text: '',
        mimeType: file.type || 'application/pdf',
        sizeBytes: file.size,
      }));
      let nextDocuments = [...quoteDocuments, ...newDocuments];

      setQuoteDocuments(nextDocuments);
      setEarlyAccessInterest(false);
      setFileStatus(
        nextDocuments.length === 1
          ? `${fileCopy.read}: ${nextDocuments[0].name}`
          : `${fileCopy.readMany}: ${nextDocuments.length}`,
      );

      const enrichedDocuments: QuoteDocument[] = [];

      for (const file of files) {
        let extractedText = '';
        let fileData = '';

        try {
          if (file.size <= MAX_PDF_PAYLOAD_BYTES) {
            fileData = await fileToDataUrl(file);
          }
        } catch {
          fileData = '';
        }

        try {
          extractedText = await extractPdfText(file);
        } catch {
          extractedText = '';
        }

        enrichedDocuments.push({
          name: file.name || 'PDF',
          text: extractedText,
          fileData,
          mimeType: file.type || 'application/pdf',
          sizeBytes: file.size,
        });
      }

      nextDocuments = [...quoteDocuments, ...enrichedDocuments];
      setQuoteDocuments(nextDocuments);
      setFileStatus(
        nextDocuments.length === 1
          ? `${fileCopy.read}: ${nextDocuments[0].name}`
          : `${fileCopy.readMany}: ${nextDocuments.length}`,
      );
    } catch (fileError) {
      setFileStatus(fileCopy.unreadable);
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
        {fileStatus && <p className="file-status">{fileStatus}</p>}
        {hasMultipleFiles && <p className="inline-warning">{fileCopy.multiFileNotice}</p>}
        <textarea
          onChange={(event) => {
            setManualQuoteText(event.target.value);
            if (hasUploadedFiles) {
              setLocalError('');
            }
          }}
          placeholder={hasUploadedFiles ? 'Texto adicional opcional' : content.quotePlaceholder}
          rows={3}
          value={manualQuoteText}
        />
      </section>
      <section className="comparison-teaser-card">
        <h2>{fileCopy.compareTeaserTitle}</h2>
        <p>{fileCopy.compareTeaserBody}</p>
        {earlyAccessInterest && <p className="file-status">{fileCopy.earlyAccessSaved}</p>}
        <button
          className="secondary-button"
          onClick={() => setEarlyAccessInterest(true)}
          type="button"
        >
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
