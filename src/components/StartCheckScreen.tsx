import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { QuoteCheckContent } from '../data/quoteCheckContent';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

type StartCheckScreenProps = {
  content: QuoteCheckContent['startCheck'];
  error?: string;
  note: string;
  onSubmit: (input: { decisionContext: string; quoteText: string }) => void;
};

type PdfTextItem = {
  str?: string;
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

export function StartCheckScreen({ content, error, note, onSubmit }: StartCheckScreenProps) {
  const [decisionContext, setDecisionContext] = useState('');
  const [quoteText, setQuoteText] = useState('');
  const [localError, setLocalError] = useState('');
  const [fileStatus, setFileStatus] = useState('');
  const [isReadingFile, setIsReadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.type !== 'application/pdf') {
      setLocalError('Ahora mismo solo podemos leer PDFs. Las capturas todavía no se analizan automáticamente.');
      event.target.value = '';
      return;
    }

    setLocalError('');
    setFileStatus('Leyendo PDF…');
    setIsReadingFile(true);

    try {
      const extractedText = await extractPdfText(file);

      if (!extractedText.trim()) {
        setFileStatus('No hemos podido leer texto de este PDF. Puede ser un escaneo o una imagen.');
        return;
      }

      setQuoteText(extractedText);
      setFileStatus(`PDF leído: ${file.name}`);
    } catch (fileError) {
      setFileStatus('No hemos podido leer este PDF. Puedes copiar el texto manualmente.');
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
          setLocalError('Sube un PDF o pega el presupuesto para poder revisarlo.');
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
            {isReadingFile ? 'Leyendo…' : content.uploadCta}
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
        {isReadingFile ? 'Leyendo PDF…' : content.cta}
      </button>
    </form>
  );
}
