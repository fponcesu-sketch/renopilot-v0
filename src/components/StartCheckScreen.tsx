import { useState, type ChangeEvent, type FormEvent } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { QuoteCheckContent, Language } from '../data/quoteCheckContent';
import type { QuoteDocument } from '../types/analysis';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const MAX_PDF_FALLBACK_BYTES = 2_500_000;

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
  entryTitle: string;
  writtenOption: string;
  writtenSubtext: string;
  informalOption: string;
  informalSubtext: string;
  verbalOption: string;
  verbalSubtext: string;
  writtenTitle: string;
  writtenSubtitle: string;
  informalTitle: string;
  informalSubtitle: string;
  verbalTitle: string;
  verbalSubtitle: string;
  verbalInputLabel: string;
  verbalPlaceholder: string;
  verbalHintsLabel: string;
  verbalHints: string[];
  verbalCta: string;
  reading: string;
  readingPdf: string;
  onlyPdf: string;
  attachedLabel: string;
  extraTextPlaceholder: string;
  missingInput: string;
  missingVerbalInput: string;
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
    writtenOption: 'Presupuesto por escrito',
    writtenSubtext: 'PDF, documento, email o captura',
    informalOption: 'Mensaje informal',
    informalSubtext: 'WhatsApp o email con precio aproximado',
    verbalOption: 'Solo estimación verbal',
    verbalSubtext: 'Llamada, conversación rápida o audio de WhatsApp',
    writtenTitle: 'Pega o sube lo que te han enviado',
    writtenSubtitle:
      'Puedes subir un PDF o pegar un presupuesto, email, WhatsApp o texto de una captura. No tiene que estar perfecto.',
    informalTitle: 'Pega el mensaje informal',
    informalSubtitle:
      'Sirve aunque sea un WhatsApp corto o un precio aproximado. RenoPilot comprobará qué falta y qué conviene preguntar.',
    verbalTitle: 'Describe lo que te dijeron',
    verbalSubtitle:
      'Escribe lo que recuerdes de la llamada. RenoPilot lo convertirá en el siguiente paso: pedir confirmación por escrito antes de aceptar.',
    verbalInputLabel: 'Escribe lo que recuerdas',
    verbalPlaceholder:
      'Mosquiteras para 4 ventanas, unos 1.200 PLN, instalación incluida, dijo que podría hacerlo la semana que viene.',
    verbalHintsLabel: 'Puedes mencionar:',
    verbalHints: ['trabajo', 'precio', 'qué incluye', 'materiales / modelo', 'plazo', 'garantía', 'IVA'],
    verbalCta: 'Preparar mensaje para confirmar por escrito',
    reading: 'Leyendo…',
    readingPdf: 'Leyendo PDF…',
    onlyPdf: 'Ahora mismo solo podemos leer PDFs. Si estás en móvil, prueba a elegirlo desde Archivos / Files.',
    attachedLabel: 'Archivo adjuntado',
    extraTextPlaceholder: 'Texto adicional opcional',
    missingInput: 'Pega o sube lo que tengas para poder revisarlo.',
    missingVerbalInput: 'Escribe lo que recuerdas de la conversación para preparar el mensaje.',
    privacyNoteTitle: 'Nota de privacidad',
    privacyNoteBody:
      'Borra o tapa datos sensibles antes de compartir: nombres, dirección, teléfono, datos bancarios o firmas.',
    privacyNoteUse:
      'Usaremos el contenido solo para generar tu revisión en RenoPilot y mejorar RenoPilot. No publicaremos tus documentos ni tus datos personales.',
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
    writtenOption: 'Written quote',
    writtenSubtext: 'PDF, document, email or screenshot',
    informalOption: 'Informal message',
    informalSubtext: 'WhatsApp or email estimate',
    verbalOption: 'Verbal estimate only',
    verbalSubtext: 'Phone call, quick chat or WhatsApp audio',
    writtenTitle: 'Paste or upload what they sent you',
    writtenSubtitle:
      'You can upload a PDF or paste a quote, email, WhatsApp message or screenshot text. It does not need to be perfect.',
    informalTitle: 'Paste the informal message',
    informalSubtitle:
      'A short WhatsApp or rough price is enough. RenoPilot will check what is missing and what to ask next.',
    verbalTitle: 'Describe what they told you',
    verbalSubtitle:
      'Write whatever you remember from the call. RenoPilot turns it into the right next step: asking for written confirmation before accepting.',
    verbalInputLabel: 'Write what you remember',
    verbalPlaceholder:
      'Mosquito screens for 4 windows, around 1,200 PLN, installation included, said he could do it next week.',
    verbalHintsLabel: 'You can mention:',
    verbalHints: ['work', 'price', 'what is included', 'materials / model', 'timing', 'warranty', 'VAT'],
    verbalCta: 'Prepare message to confirm in writing',
    reading: 'Reading…',
    readingPdf: 'Reading PDF…',
    onlyPdf: 'Right now we can only read PDFs. On mobile, try choosing it from Files.',
    attachedLabel: 'File attached',
    extraTextPlaceholder: 'Optional extra text',
    missingInput: 'Paste or upload what you have so we can check it.',
    missingVerbalInput: 'Write what you remember from the conversation so we can prepare the message.',
    privacyNoteTitle: 'Privacy note',
    privacyNoteBody:
      'Remove or blur sensitive details before sharing: names, addresses, phone numbers, bank details or signatures.',
    privacyNoteUse:
      'We will use the content only to generate your RenoPilot quote check and improve RenoPilot. We will not publish your documents or personal details.',
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
    writtenOption: 'Pisemna oferta',
    writtenSubtext: 'PDF, dokument, e-mail albo zrzut ekranu',
    informalOption: 'Nieformalna wiadomość',
    informalSubtext: 'Wycena z WhatsAppa albo e-maila',
    verbalOption: 'Tylko ustna wycena',
    verbalSubtext: 'Telefon, krótka rozmowa albo wiadomość głosowa',
    writtenTitle: 'Wklej albo wgraj to, co dostałeś',
    writtenSubtitle:
      'Możesz wgrać PDF albo wkleić ofertę, e-mail, wiadomość z WhatsAppa lub tekst ze zrzutu ekranu. Nie musi być idealnie.',
    informalTitle: 'Wklej nieformalną wiadomość',
    informalSubtitle:
      'Wystarczy krótki WhatsApp albo orientacyjna cena. RenoPilot sprawdzi, czego brakuje i o co warto zapytać.',
    verbalTitle: 'Opisz, co powiedział wykonawca',
    verbalSubtitle:
      'Napisz, co pamiętasz z rozmowy. RenoPilot zamieni to w kolejny krok: prośbę o potwierdzenie szczegółów na piśmie przed akceptacją.',
    verbalInputLabel: 'Napisz, co pamiętasz',
    verbalPlaceholder:
      'Moskitiery do 4 okien, około 1 200 PLN, montaż w cenie, powiedział, że może zrobić w przyszłym tygodniu.',
    verbalHintsLabel: 'Możesz wspomnieć:',
    verbalHints: ['zakres prac', 'cena', 'co jest w cenie', 'materiały / model', 'termin', 'gwarancja', 'VAT'],
    verbalCta: 'Przygotuj wiadomość z prośbą o potwierdzenie',
    reading: 'Czytanie…',
    readingPdf: 'Czytanie PDF…',
    onlyPdf: 'Na razie możemy czytać tylko PDF-y. Na telefonie spróbuj wybrać plik z aplikacji Pliki / Files.',
    attachedLabel: 'Plik dodany',
    extraTextPlaceholder: 'Opcjonalny dodatkowy tekst',
    missingInput: 'Wklej albo wgraj to, co masz, aby to sprawdzić.',
    missingVerbalInput: 'Napisz, co pamiętasz z rozmowy, aby przygotować wiadomość.',
    privacyNoteTitle: 'Informacja o prywatności',
    privacyNoteBody:
      'Usuń lub zasłoń dane wrażliwe przed udostępnieniem: nazwiska, adres, telefon, dane bankowe lub podpisy.',
    privacyNoteUse:
      'Użyjemy treści tylko do przygotowania analizy w RenoPilot i ulepszania RenoPilot. Nie będziemy publikować Twoich dokumentów ani danych osobowych.',
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
    .map((document, index) => `PDF ${index + 1}: ${document.name}\n${document.text || '[PDF attached]'}`)
    .join('\n\n---\n\n');

  return [documentText, pastedText.trim()].filter(Boolean).join('\n\n---\n\nPasted or described content:\n');
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
      onSubmit({ decisionContext, quoteText: verbalText, quoteDocuments: [], inputMode });
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
    if (mode !== inputMode) {
      setLocalError('');
      setEarlyAccessInterest(false);
    }

    setInputMode(mode);
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
  const isInformalMode = inputMode === 'informal_message';
  const isVerbalMode = inputMode === 'verbal_estimate';

  return (
    <form
      className="screen-content form-screen start-check-screen"
      data-input-mode={inputMode}
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
            className={isInformalMode ? 'input-mode-option active' : 'input-mode-option'}
            onClick={() => handleModeChange('informal_message')}
            type="button"
          >
            <strong>{fileCopy.informalOption}</strong>
            <span>{fileCopy.informalSubtext}</span>
          </button>
          <button
            className={isVerbalMode ? 'input-mode-option active' : 'input-mode-option'}
            onClick={() => handleModeChange('verbal_estimate')}
            type="button"
          >
            <strong>{fileCopy.verbalOption}</strong>
            <span>{fileCopy.verbalSubtext}</span>
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
        <div className="quote-card-header">
          <h2>{isVerbalMode ? fileCopy.verbalTitle : isInformalMode ? fileCopy.informalTitle : fileCopy.writtenTitle}</h2>
          {isWrittenMode && (
            <label className={isReadingFile ? 'upload-button disabled' : 'upload-button'} htmlFor="quote-file-upload">
              {isReadingFile ? fileCopy.reading : content.uploadCta}
            </label>
          )}
          <input
            accept="application/pdf,.pdf"
            className="file-input-hidden"
            id="quote-file-upload"
            multiple
            onChange={handleFileChange}
            type="file"
          />
        </div>
        <p>{isVerbalMode ? fileCopy.verbalSubtitle : isInformalMode ? fileCopy.informalSubtitle : fileCopy.writtenSubtitle}</p>
        <div className="privacy-note-card">
          <span className="privacy-note-title">{fileCopy.privacyNoteTitle}</span>
          <span className="privacy-note-text">{fileCopy.privacyNoteBody}</span>
          <span className="privacy-note-text">{fileCopy.privacyNoteUse}</span>
        </div>
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
          <div className="helper-chip-list" aria-label={fileCopy.verbalHintsLabel}>
            <span className="helper-chip-label">{fileCopy.verbalHintsLabel}</span>
            {fileCopy.verbalHints.map((hint) => (
              <span className="helper-chip" key={hint}>{hint}</span>
            ))}
          </div>
        )}
        <label className="field-group compact-field">
          {isVerbalMode && <span>{fileCopy.verbalInputLabel}</span>}
          <textarea
            onChange={(event) => {
              setManualQuoteText(event.target.value);
              setLocalError('');
            }}
            placeholder={
              isVerbalMode
                ? fileCopy.verbalPlaceholder
                : hasUploadedFiles
                  ? fileCopy.extraTextPlaceholder
                  : content.quotePlaceholder
            }
            rows={isVerbalMode ? 5 : 4}
            value={manualQuoteText}
          />
        </label>
      </section>
      {(localError || error) && <p className="inline-error">{localError || error}</p>}
      <button className="primary-button" disabled={isReadingFile} type="submit">
        {isReadingFile ? fileCopy.readingPdf : isVerbalMode ? fileCopy.verbalCta : content.cta}
      </button>
    </form>
  );
}
