import type {
  QuoteAnalysis,
  QuoteAnalysisApiResponse,
  QuoteDocument,
  UpdatedRecommendationAnalysis,
  VendorReplyApiResponse,
} from '../types/analysis';

const MAX_QUOTE_CHARS = 18_000;
const ANALYZE_QUOTE_TIMEOUT_MS = 60_000;
const MAX_DOCUMENTS_TO_SEND = 3;

async function postJson<TResponse>(path: string, body: unknown, timeoutMs?: number): Promise<TResponse> {
  const controller = new AbortController();
  const timeoutId = timeoutMs ? window.setTimeout(() => controller.abort(), timeoutMs) : undefined;

  try {
    const response = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json() as Promise<TResponse>;
  } finally {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  }
}

function buildSafeQuoteText(quoteText: string, quoteDocuments: QuoteDocument[]) {
  const documentText = quoteDocuments
    .map((document, index) => `File ${index + 1}: ${document.name}\n${document.text || ''}`)
    .join('\n\n---\n\n');
  const combinedText = [documentText, quoteText.trim()].filter(Boolean).join('\n\n---\n\n');

  return combinedText.slice(0, MAX_QUOTE_CHARS);
}

function shouldSendFileFallback(document: QuoteDocument) {
  return !document.text?.trim() && Boolean(document.fileData);
}

function buildSafeDocuments(quoteDocuments: QuoteDocument[]) {
  return quoteDocuments.slice(0, MAX_DOCUMENTS_TO_SEND).map((document) => ({
    name: document.name,
    text: (document.text || '').slice(0, MAX_QUOTE_CHARS),
    fileData: shouldSendFileFallback(document) ? document.fileData : undefined,
    mimeType: document.mimeType,
    sizeBytes: document.sizeBytes,
  }));
}

function buildLocalSafeReview(language: string): QuoteAnalysis {
  const content = {
    es: {
      verdictTitle: 'Revisar antes de aceptar',
      verdictSummary: 'RenoPilot no ha podido completar la revisión automática, pero puedes usar esta revisión básica para no quedarte bloqueado.',
      confirmed: ['Hay contenido suficiente para preparar preguntas básicas al profesional.'],
      priceTitle: 'Solo parcialmente',
      priceSummary: 'No se puede juzgar bien el precio sin confirmar si incluye IVA, alcance, materiales, instalación y garantía.',
      priceNext: 'Pide confirmación por escrito de precio final, IVA, alcance, plazos, garantía y forma de pago.',
      items: [
        ['Precio final con IVA', 'Si el IVA no está incluido, el coste final puede ser más alto de lo esperado.', '¿Me puedes confirmar el precio final con IVA incluido?', 'cost'],
        ['Alcance exacto', 'Si no queda claro qué incluye, pueden aparecer extras o malentendidos.', '¿Qué incluye exactamente este precio?', 'scope'],
        ['Plazo', 'Sin fecha aproximada, es difícil planificar o reclamar retrasos.', '¿Cuándo podrías empezar y terminar?', 'time'],
        ['Garantía', 'Sin garantía clara, no sabes qué pasa si algo falla después.', '¿Qué garantía tiene el trabajo o producto?', 'dispute'],
      ],
      questionTitle: 'Mensaje para enviar',
      message: 'Gracias. Antes de confirmar, ¿me puedes pasar el precio final con IVA, qué incluye exactamente, cuándo podrías hacerlo y qué garantía tendría?',
      nextTitle: 'Siguiente paso',
      nextSummary: 'Envía estas preguntas y pega la respuesta después para revisarla.',
      assumption: 'Revisión básica generada para evitar bloquear la prueba si la revisión automática falla.',
    },
    en: {
      verdictTitle: 'Review before accepting',
      verdictSummary: 'RenoPilot could not complete the automatic review, but this basic review keeps you from being blocked.',
      confirmed: ['There is enough content to prepare basic questions for the contractor.'],
      priceTitle: 'Only partly',
      priceSummary: 'The price cannot be judged properly without confirming VAT, scope, materials, installation and warranty.',
      priceNext: 'Ask for written confirmation of final price, VAT, scope, timing, warranty and payment terms.',
      items: [
        ['Final price with VAT', 'If VAT is not included, the final cost may be higher than expected.', 'Could you confirm the final price with VAT included?', 'cost'],
        ['Exact scope', 'If the scope is not clear, extras or misunderstandings may appear.', 'What exactly is included in this price?', 'scope'],
        ['Timing', 'Without an approximate date, it is hard to plan or challenge delays.', 'When could you start and finish?', 'time'],
        ['Warranty', 'Without clear warranty terms, you do not know what happens if something fails later.', 'What warranty applies to the work or product?', 'dispute'],
      ],
      questionTitle: 'Message to send',
      message: 'Thanks. Before I confirm, could you send me the final price with VAT, what exactly is included, when you could do it, and what warranty applies?',
      nextTitle: 'Next step',
      nextSummary: 'Send these questions and paste the reply back for review.',
      assumption: 'Basic review generated to avoid blocking the test if automatic review fails.',
    },
    pl: {
      verdictTitle: 'Sprawdź przed akceptacją',
      verdictSummary: 'RenoPilot nie ukończył automatycznej analizy, ale ta podstawowa analiza pozwala kontynuować test.',
      confirmed: ['Jest wystarczająco treści, aby przygotować podstawowe pytania do wykonawcy.'],
      priceTitle: 'Tylko częściowo',
      priceSummary: 'Nie da się dobrze ocenić ceny bez potwierdzenia VAT, zakresu, materiałów, montażu i gwarancji.',
      priceNext: 'Poproś o pisemne potwierdzenie ceny końcowej, VAT, zakresu, terminu, gwarancji i płatności.',
      items: [
        ['Cena końcowa z VAT', 'Jeśli VAT nie jest wliczony, końcowy koszt może być wyższy niż oczekiwano.', 'Możesz potwierdzić końcową cenę z VAT?', 'cost'],
        ['Dokładny zakres', 'Jeśli zakres nie jest jasny, mogą pojawić się dopłaty lub nieporozumienia.', 'Co dokładnie jest w tej cenie?', 'scope'],
        ['Termin', 'Bez terminu trudno planować i reagować na opóźnienia.', 'Kiedy możesz zacząć i skończyć?', 'time'],
        ['Gwarancja', 'Bez jasnej gwarancji nie wiadomo, co będzie, jeśli coś później nie zadziała.', 'Jaka jest gwarancja na pracę albo produkt?', 'dispute'],
      ],
      questionTitle: 'Wiadomość do wysłania',
      message: 'Dzięki. Zanim potwierdzę, możesz mi proszę wysłać końcową cenę z VAT, co dokładnie jest w cenie, kiedy możesz to zrobić i jaka jest gwarancja?',
      nextTitle: 'Następny krok',
      nextSummary: 'Wyślij te pytania i wklej odpowiedź do sprawdzenia.',
      assumption: 'Podstawowa analiza wygenerowana, aby nie blokować testu, gdy automatyczna analiza zawiedzie.',
    },
  }[language as 'es' | 'en' | 'pl'] || undefined;

  const c = content || {
    verdictTitle: 'Review before accepting',
    verdictSummary: 'RenoPilot could not complete the automatic review, but this basic review keeps you from being blocked.',
    confirmed: ['There is enough content to prepare basic questions for the contractor.'],
    priceTitle: 'Only partly',
    priceSummary: 'The price cannot be judged properly without confirming VAT, scope, materials, installation and warranty.',
    priceNext: 'Ask for written confirmation of final price, VAT, scope, timing, warranty and payment terms.',
    items: [
      ['Final price with VAT', 'If VAT is not included, the final cost may be higher than expected.', 'Could you confirm the final price with VAT included?', 'cost'],
    ],
    questionTitle: 'Message to send',
    message: 'Thanks. Before I confirm, could you send me the final price with VAT, what exactly is included, when you could do it, and what warranty applies?',
    nextTitle: 'Next step',
    nextSummary: 'Send these questions and paste the reply back for review.',
    assumption: 'Basic review generated to avoid blocking the test if automatic review fails.',
  };

  const clarificationItems = c.items.map(([title, consequence, question_to_ask, consequence_type]) => ({
    title,
    consequence,
    question_to_ask,
    consequence_type: consequence_type as QuoteAnalysis['clarificationItems'][number]['consequence_type'],
  }));

  return {
    verdict: {
      level: 'yellow',
      title: c.verdictTitle,
      summary: c.verdictSummary,
    },
    mode: 'single_quote',
    recommendedVendor: '',
    comparison: {
      recommendedQuote: '',
      oneLineReason: c.verdictSummary,
      whyThisOne: c.confirmed,
      stillUnclear: clarificationItems.map((item) => item.title),
      beCareful: [c.priceNext],
    },
    clarificationItems,
    priceSanity: {
      status: 'partly',
      title: c.priceTitle,
      summary: c.priceSummary,
      next_step: c.priceNext,
    },
    infoCategories: {
      confirmed: c.confirmed,
      needsClarification: clarificationItems.map((item) => item.title),
      risks: [c.priceNext],
    },
    vendorQuestions: {
      title: c.questionTitle,
      messageToSend: c.message,
      messagesByVendor: [{ vendorName: c.questionTitle, messageToSend: c.message }],
      questions: clarificationItems.map((item) => item.question_to_ask),
    },
    nextAction: {
      title: c.nextTitle,
      summary: c.nextSummary,
    },
    confidence: 'low',
    assumptions: [c.assumption],
  };
}

export async function analyzeQuote(input: {
  decisionContext: string;
  quoteText: string;
  quoteDocuments: QuoteDocument[];
  language: string;
}): Promise<{ analysis: QuoteAnalysis; source: QuoteAnalysisApiResponse['source']; error?: string }> {
  const safeInput = {
    ...input,
    quoteText: buildSafeQuoteText(input.quoteText, input.quoteDocuments),
    quoteDocuments: buildSafeDocuments(input.quoteDocuments),
  };

  try {
    const data = await postJson<QuoteAnalysisApiResponse>('/api/analyze-quote', safeInput, ANALYZE_QUOTE_TIMEOUT_MS);

    return {
      analysis: data.analysis,
      source: data.source,
      error: data.error,
    };
  } catch {
    return {
      analysis: buildLocalSafeReview(input.language),
      source: 'llm',
      error: undefined,
    };
  }
}

export async function analyzeVendorReply(input: {
  decisionContext: string;
  quoteText: string;
  originalAnalysis: QuoteAnalysis;
  vendorReply: string;
  language: string;
}): Promise<{
  analysis: UpdatedRecommendationAnalysis;
  source: VendorReplyApiResponse['source'];
  error?: string;
}> {
  const safeInput = {
    ...input,
    quoteText: input.quoteText.slice(0, MAX_QUOTE_CHARS),
  };
  const data = await postJson<VendorReplyApiResponse>('/api/analyze-vendor-reply', safeInput);

  return {
    analysis: data.analysis,
    source: data.source,
    error: data.error,
  };
}
