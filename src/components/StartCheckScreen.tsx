import { useState, type ChangeEvent, type FormEvent } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { QuoteCheckContent, Language } from '../data/quoteCheckContent';
import type { QuoteDocument } from '../types/analysis';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const MAX_PDF_FALLBACK_BYTES = 2_500_000;

type MultiFileIntent = 'undecided' | 'single_package' | 'comparison_interest';
type InputMode = 'written_quote' | 'verbal_estimate' | 'contractor_reply';

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
  entryTitle: string;
  writtenOption: string;
  writtenSubtext: string;
  verbalOption: string;
  verbalSubtext: string;
  replyOption: string;
  replySubtext: string;
  verbalTitle: string;
  verbalSubtitle: string;
  verbalInputLabel: string;
  verbalPlaceholder: string;
  verbalChips: string[];
  verbalCta: string;
  replyTitle: string;
  replySubtitle: string;
  replyInputLabel: string;
  replyPlaceholder: string;
  replyCta: string;
  reading: string;
  readingPdf: string;
  onlyPdf: string;
  attachedLabel: string;
  extraTextPlaceholder: string;
  missingInput: string;
  missingVerbalInput: string;
  missingReplyInput: string;
  privacyNoteTitle: string;
  privacyNoteBody: string;
  privacyNoteUse: string;
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
    entryTitle: '¿Qué tienes?',
    writtenOption: 'Tengo un presupuesto por escrito',
    writtenSubtext: 'PDF, foto, email, captura o mensaje',
    verbalOption: 'Solo tengo una estimación verbal',
    verbalSubtext: 'Llamada, conversación rápida o audio de WhatsApp',
    replyOption: 'Tengo una respuesta del profesional',
    replySubtext: 'Me ha contestado y quiero revisar la respuesta',
    verbalTitle: '¿Aún no tienes presupuesto por escrito?',
    verbalSubtitle:
      'Cuéntale a RenoPilot lo que recuerdas de la llamada. Te ayudaremos a pedirle al profesional que lo confirme todo por escrito antes de decir que sí.',
    verbalInputLabel: 'Escribe lo que recuerdas de la llamada',
    verbalPlaceholder:
      'Mosquiteras para 5 ventanas. Unos 1.200 PLN. Dijo que la instalación estaba incluida, quizá en 2 semanas. No sé si incluye IVA, garantía o modelo exacto.',
    verbalChips: ['Precio', 'Plazo', 'Pago', 'Materiales / producto', 'Garantía / IVA', 'Qué no está claro'],
    verbalCta: 'Preparar mensaje para pedir presupuesto por escrito',
    replyTitle: 'Revisar respuesta del profesional',
    replySubtitle: 'Pega la respuesta que te han dado. RenoPilot revisará si aclara lo importante o si todavía falta algo.',
    replyInputLabel: 'Pega la respuesta recibida',
    replyPlaceholder: 'Copia aquí la respuesta del profesional.',
    replyCta: 'Revisar respuesta',
    reading: 'Leyendo…',
    readingPdf: 'Leyendo PDF…',
    onlyPdf: 'Ahora mismo solo podemos leer PDFs. Si estás en móvil, prueba a elegirlo desde Archivos / Files.',
    attachedLabel: 'Archivo adjuntado',
    extraTextPlaceholder: 'Texto adicional opcional',
    missingInput: 'Sube un PDF o pega el presupuesto para poder revisarlo.',
    missingVerbalInput: 'Escribe lo que recuerdas de la llamada para preparar el mensaje.',
    missingReplyInput: 'Pega la respuesta del profesional para revisarla.',
    privacyNoteTitle: 'Nota de privacidad',
    privacyNoteBody:
      'Borra o tapa datos sensibles antes de compartir: nombres, dirección, teléfono, datos bancarios o firmas.',
    privacyNoteUse:
      'Usaremos el contenido solo para generar tu revisión en RenoPilot y mejorar el prototipo. No publicaremos tus documentos ni tus datos personales.',
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
    entryTitle: 'What do you have?',
    writtenOption: 'I have a written quote',
    writtenSubtext: 'PDF, photo, email, screenshot or message',
    verbalOption: 'I only have a verbal estimate',
    verbalSubtext: 'Phone call, quick chat or WhatsApp audio',
    replyOption: 'I have a contractor reply',
    replySubtext: 'They answered my questions and I want to check it',
    verbalTitle: 'No written quote yet?',
    verbalSubtitle:
      'Tell RenoPilot what you remember from the call. We will help you ask the contractor to confirm everything in writing before you say yes.',
    verbalInputLabel: 'Write what you remember from the call',
    verbalPlaceholder:
      'Mosquito screens for 5 windows. Around 1,200 PLN. He said installation included, maybe 2 weeks. Not sure about VAT, warranty or exact model.',
    verbalChips: ['Price', 'Timeline', 'Payment', 'Materials / product', 'Warranty / VAT', 'What is unclear'],
    verbalCta: 'Prepare message to request written quote',
    replyTitle: 'Check contractor reply',
    replySubtitle: 'Paste the answer you received. RenoPilot will check whether it clarifies the important points or if something is still missing.',
    replyInputLabel: 'Paste the reply received',
    replyPlaceholder: 'Copy the contractor reply here.',
    replyCta: 'Review reply',
    reading: 'Reading…',
    readingPdf: 'Reading PDF…',
    onlyPdf: 'Right now we can only read PDFs. On mobile, try choosing it from Files.',
    attachedLabel: 'File attached',
    extraTextPlaceholder: 'Optional extra text',
    missingInput: 'Upload a PDF or paste the quote so we can review it.',
    missingVerbalInput: 'Write what you remember from the call so we can prepare the message.',
    missingReplyInput: 'Paste the contractor reply so we can review it.',
    privacyNoteTitle: 'Privacy note',
    privacyNoteBody:
      'Remove or blur sensitive details before sharing: names, addresses, phone numbers, bank details or signatures.',
    privacyNoteUse:
      'We will use the content only to generate your RenoPilot quote check and improve the prototype. We will not publish your documents or personal details.',
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
    entryTitle: 'Co masz?',
    writtenOption: 'Mam pisemną ofertę',
    writtenSubtext: 'PDF, zdjęcie, e-mail, zrzut ekranu lub wiadomość',
    verbalOption: 'Mam tylko ustną wycenę',
    verbalSubtext: 'Telefon, krótka rozmowa lub wiadomość głosowa',
    replyOption: 'Mam odpowiedź wykonawcy',
    replySubtext: 'Odpowiedział i chcę sprawdzić odpowiedź',
    verbalTitle: 'Nie masz jeszcze pisemnej oferty?',
    verbalSubtitle:
      'Napisz w RenoPilot, co pamiętasz z rozmowy. Pomożemy Ci poprosić wykonawcę o potwierdzenie wszystkiego na piśmie, zanim zaakceptujesz ofertę.',
    verbalInputLabel: 'Napisz, co pamiętasz z rozmowy',
    verbalPlaceholder:
      'Moskitiery do 5 okien. Około 1 200 PLN. Powiedział, że montaż jest w cenie, może za 2 tygodnie. Nie wiem, czy cena zawiera VAT, gwarancję albo dokładny model.',
    verbalChips: ['Cena', 'Termin', 'Płatność', 'Materiały / produkt', 'Gwarancja / VAT', 'Co jest niejasne'],
    verbalCta: 'Przygotuj wiadomość z prośbą o pisemną ofertę',
    replyTitle: 'Sprawdź odpowiedź wykonawcy',
    replySubtitle: 'Wklej otrzymaną odpowiedź. RenoPilot sprawdzi, czy wyjaśnia ważne punkty i czy coś nadal brakuje.',
    replyInputLabel: 'Wklej otrzymaną odpowiedź',
    replyPlaceholder: 'Skopiuj tutaj odpowiedź wykonawcy.',
    replyCta: 'Sprawdź odpowiedź',
    reading: 'Czytanie…',
    readingPdf: 'Czytanie PDF…',
    onlyPdf: 'Na razie możemy czytać tylko PDF-y. Na telefonie spróbuj wybrać plik z aplikacji Pliki / Files.',
    attachedLabel: 'Plik dodany',
    extraTextPlaceholder: 'Opcjonalny dodatkowy tekst',
    missingInput: 'Wgraj PDF albo wklej wycenę, aby ją sprawdzić.',
    missingVerbalInput: 'Napisz, co pamiętasz z rozmowy, aby przygotować wiadomość.',
    missingReplyInput: 'Wklej odpowiedź wykonawcy, aby ją sprawdzić.',
    privacyNoteTitle: 'Informacja o prywatności',
    privacyNoteBody:
      'Usuń lub zasłoń dane wrażliwe przed udostępnieniem: nazwiska, adres, telefon, dane bankowe lub podpisy.',
    privacyNoteUse:
      'Użyjemy treści tylko do przygotowania analizy w RenoPilot i ulepszania prototypu. Nie będziemy publikować Twoich dokumentów ani danych osobowych.',
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
  const [inputMode, setInputMode] = useState<InputMode>('written_quote');
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
    if (inputMode === 'verbal_estimate') {
      const verbalText = manualQuoteText.trim();

      if (!verbalText) {
        setLocalError(fileCopy.missingVerbalInput);
        return;
      }

      setLocalError('');
      onSubmit({
        decisionContext,
        quoteText: verbalText,
        quoteDocuments: [],
        inputMode,
      });
      return;
    }

    if (inputMode === 'contractor_reply') {
      const replyText = manualQuoteText.trim();

      if (!replyText) {
        setLocalError(fileCopy.missingReplyInput);
        return;
      }

      setLocalError('');
      onSubmit({
        decisionContext: decisionContext || fileCopy.replyTitle,
        quoteText: `Contractor reply:\n${replyText}`,
        quoteDocuments: [],
        inputMode,
      });
      return;
    }

    const combinedQuoteText = buildQuoteText(quoteDocuments, manualQuoteText);

    if (!combinedQuoteText.trim()) {
      setLocalError(fileCopy.missingInput);
      return;
    }

    setLocalError('');
    onSubmit({ decisionContext, quoteText: combinedQuoteText, quoteDocuments, inputMode });
  };

  const handleModeChange = (mode: InputMode) => {
    setInputMode(mode);
    setLocalError('');
    setEarlyAccessInterest(false);
  };

  const handleChipClick = (chip: string) => {
    setManualQuoteText((current) => {
      const prefix = current.trim() ? `${current.trim()}\n` : '';
      return `${prefix}${chip}: `;
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
    setInputMode('written_quote');
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

  const isWrittenMode = inputMode === 'written_quote';
  const isVerbalMode = inputMode === 'verbal_estimate';
  const isReplyMode = inputMode === 'contractor_reply';

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
      <section className="input-mode-card">
        <h2>{fileCopy.entryTitle}</h2>
        <div className="input-mode-options">
          <button
            className={isWrittenMode ? 'input-mode-option active' : 'input-mode-option'}
            onClick={() => handleModeChange('written_quote')}
            type="button"
          >
            <strong>{fileCopy.writtenOption}</strong>
            <span>{fileCopy.writtenSubtext}</span>
          </button>
          <button
            className={isVerbalMode ? 'input-mode-option active' : 'input-mode-option'}
            onClick={() => handleModeChange('verbal_estimate')}
            type="button"
          >
            <strong>{fileCopy.verbalOption}</strong>
            <span>{fileCopy.verbalSubtext}</span>
          </button>
          <button
            className={isReplyMode ? 'input-mode-option active' : 'input-mode-option'}
            onClick={() => handleModeChange('contractor_reply')}
            type="button"
          >
            <strong>{fileCopy.replyOption}</strong>
            <span>{fileCopy.replySubtext}</span>
          </button>
        </div>
      </section>
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
        {isWrittenMode && (
          <>
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
          </>
        )}
        {isVerbalMode && (
          <div className="verbal-estimate-intro">
            <h2>{fileCopy.verbalTitle}</h2>
            <p>{fileCopy.verbalSubtitle}</p>
          </div>
        )}
        {isReplyMode && (
          <div className="verbal-estimate-intro">
            <h2>{fileCopy.replyTitle}</h2>
            <p>{fileCopy.replySubtitle}</p>
          </div>
        )}
        <div className="privacy-note-card">
          <span className="privacy-note-title">{fileCopy.privacyNoteTitle}</span>
          <span className="privacy-note-text">{fileCopy.privacyNoteBody}</span>
          <span className="privacy-note-text">{fileCopy.privacyNoteUse}</span>
        </div>
        {isWrittenMode && hasUploadedFiles && (
          <div className="attached-file-list" aria-live="polite">
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
          <div className="helper-chip-list" aria-label={fileCopy.verbalInputLabel}>
            {fileCopy.verbalChips.map((chip) => (
              <button className="helper-chip" key={chip} onClick={() => handleChipClick(chip)} type="button">
                {chip}
              </button>
            ))}
          </div>
        )}
        <label className="field-group compact-field">
          {(isVerbalMode || isReplyMode) && (
            <span>{isVerbalMode ? fileCopy.verbalInputLabel : fileCopy.replyInputLabel}</span>
          )}
          <textarea
            onChange={(event) => {
              setManualQuoteText(event.target.value);
              if (hasUploadedFiles || isVerbalMode || isReplyMode) setLocalError('');
            }}
            placeholder={
              isVerbalMode
                ? fileCopy.verbalPlaceholder
                : isReplyMode
                  ? fileCopy.replyPlaceholder
                  : hasUploadedFiles
                    ? fileCopy.extraTextPlaceholder
                    : content.quotePlaceholder
            }
            rows={isVerbalMode ? 5 : 3}
            value={manualQuoteText}
          />
        </label>
      </section>
      {(localError || error) && <p className="inline-error">{localError || error}</p>}
      <button className="primary-button" disabled={isReadingFile} type="submit">
        {isReadingFile ? fileCopy.readingPdf : isVerbalMode ? fileCopy.verbalCta : isReplyMode ? fileCopy.replyCta : content.cta}
      </button>
    </form>
  );
}
