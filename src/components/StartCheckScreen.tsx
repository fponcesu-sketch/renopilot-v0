import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { QuoteCheckContent, Language } from '../data/quoteCheckContent';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

type StartCheckScreenProps = {
  content: QuoteCheckContent['startCheck'];
  error?: string;
  language: Language;
  note: string;
  onSubmit: (input: { decisionContext: string; quoteText: string }) => void;
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
  missingInput: string;
}> = {
  es: {
    reading: 'Leyendo…',
    readingPdf: 'Leyendo PDF…',
    onlyPdf: 'Ahora mismo solo podemos leer PDFs. Las capturas todavía no se analizan automáticamente.',
    unreadable: 'No hemos podido leer este PDF. Puedes copiar el texto manualmente.',
    scanned: 'No hemos podido leer texto de este PDF. Puede ser un escaneo o una imagen.',
    read: 'PDF leído',
    missingInput: 'Sube un PDF o pega el presupuesto para poder revisarlo.',
  },
  en: {
    reading: 'Reading…',
    readingPdf: 'Reading PDF…',
    onlyPdf: 'Right now we can only read PDFs. Screenshots are not analyzed automatically yet.',
    unreadable: 'We could not read this PDF. You can paste the text manually.',
    scanned: 'We could not read text from this PDF. It may be a scan or image.',
    read: 'PDF read',
    missingInput: 'Upload a PDF or paste the quote so we can review it.',
  },
  pl: {
    reading: 'Czytanie…',
    readingPdf: 'Czytanie PDF…',
    onlyPdf: 'Na razie możemy czytać tylko PDF-y. Zrzuty ekranu nie są jeszcze analizowane automatycznie.',
    unreadable: 'Nie udało się odczytać tego PDF-a. Możesz wkleić tekst ręcznie.',
    scanned: 'Nie udało się odczytać tekstu z tego PDF-a. To może być skan albo obraz.',
    read: 'PDF odczytany',
    missingInput: 'Wgraj PDF albo wklej wycenę, aby ją sprawdzić.',
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

export function StartCheckScreen({ content, error, language, note, onSubmit }: StartCheckScreenProps) {
  const [decisionContext, setDecisionContext] = useState('');
  const [quoteText, setQuoteText] = useState('');
  const [localError, setLocalError] = useState('');
  const [fileStatus, setFileStatus] = useState('');
  const [isReadingFile, setIsReadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileCopy = uploadCopy[language];

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.type !== 'application/pdf') {
      setLocalError(fileCopy.onlyPdf);
      event.target.value = '';
      return;
    }

    setLocalError('');
    setFileStatus(fileCopy.readingPdf);
    setIsReadingFile(true);

    try {
      const extractedText = await extractPdfText(file);

      if (!extractedText.trim()) {
        setFileStatus(fileCopy.scanned);
        return;
      }

      setQuoteText(extractedText);
      setFileStatus(`${fileCopy.read}: ${file.name}`);
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

        if (!quoteText.trim()) {
          setLocalError(fileCopy.missingInput);
          return;
        }

        setLocalError('');
        onSubmit({ decisionContext, quoteText });
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
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />
        </div>
        <p>{content.quoteInputHint}</p>
        {fileStatus && <p className="file-status">{fileStatus}</p>}
        <textarea
          onChange={(event) => setQuoteText(event.target.value)}
          placeholder={content.quotePlaceholder}
          rows={3}
          value={quoteText}
        />
      </section>
      {(localError || error) && <p className="inline-error">{localError || error}</p>}
      <label className="field-group compact-field">
        <span>{content.emailLabel}</span>
        <input type="email" placeholder={content.emailPlaceholder} />
        <small>{content.emailHelper}</small>
      </label>
      <button className="primary-button" disabled={isReadingFile} type="submit">
        {isReadingFile ? fileCopy.readingPdf : content.cta}
      </button>
    </form>
  );
}
