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

const uploadCopy: Record<Language, {
  reading: string;
  readingPdf: string;
  onlyPdf: string;
  unreadable: string;
  scanned: string;
  read: string;
  readMany: string;
  missingInput: string;
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
  const [localError, setLocalError] = useState('');
  const [fileStatus, setFileStatus] = useState('');
  const [isReadingFile, setIsReadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileCopy = uploadCopy[language];

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
      setQuoteDocuments(nextDocuments);
      setQuoteText(buildQuoteText(nextDocuments, quoteText));
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
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const finalQuoteText = buildQuoteText(quoteDocuments, quoteText);

        if (!finalQuoteText.trim()) {
          setLocalError(fileCopy.missingInput);
          return;
        }

        setLocalError('');
        onSubmit({ decisionContext, quoteText: finalQuoteText, quoteDocuments });
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
          }}
          placeholder={content.quotePlaceholder}
          rows={3}
          value={quoteText}
        />
      </section>
      {(localError || error) && <p className="inline-error">{localError || error}</p>}
      <button className="primary-button" disabled={isReadingFile} type="submit">
        {isReadingFile ? fileCopy.readingPdf : content.cta}
      </button>
    </form>
  );
}
