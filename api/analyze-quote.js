const fallbackClarificationItems = [
  {
    title: 'IVA no confirmado',
    consequence: 'Si el IVA no está incluido, el precio final puede ser más alto de lo que parece.',
    consequence_type: 'cost',
    question_to_ask: '¿El precio final incluye IVA?',
  },
  {
    title: 'Plazo de ejecución no indicado',
    consequence: 'Sin un plazo por escrito, la obra puede alargarse y será más difícil reclamar retrasos.',
    consequence_type: 'time',
    question_to_ask: '¿Cuál es la fecha estimada de inicio y finalización?',
  },
  {
    title: 'Instalación eléctrica pendiente de definir',
    consequence: 'Si el alcance no está cerrado, el precio puede cambiar durante la obra.',
    consequence_type: 'scope',
    question_to_ask: '¿Qué parte exacta de la instalación eléctrica está incluida en este presupuesto?',
  },
  {
    title: 'Segundo pago no definido',
    consequence: 'Puede generar discusión sobre cuándo toca abonar la siguiente parte si el hito no está claro.',
    consequence_type: 'payment',
    question_to_ask: '¿Qué hito concreto marca el segundo pago?',
  },
];

const fallbackMessage = `Hola, gracias por el presupuesto. Antes de aceptar, ¿podéis confirmarme estos puntos por escrito?\n\n${fallbackClarificationItems
  .map((item, index) => `${index + 1}. ${item.question_to_ask}`)
  .join('\n')}\n\nGracias.`;

const fallbackAnalysis = {
  verdict: {
    level: 'yellow',
    title: 'Buena pinta, pero pregunta antes de firmar',
    summary: 'Parece viable, pero hay puntos clave que conviene aclarar antes de aceptar.',
  },
  mode: 'single_quote',
  recommendedVendor: '',
  comparison: {
    recommendedQuote: 'Proveedor recomendado',
    oneLineReason: 'Parece la opción más clara, pero faltan confirmaciones importantes.',
    whyThisOne: ['Alcance más fácil de entender.'],
    stillUnclear: fallbackClarificationItems.map((item) => item.title),
    beCareful: ['No decidir solo por precio si otra oferta está más detallada.'],
  },
  clarificationItems: fallbackClarificationItems,
  priceSanity: {
    status: 'partly',
    title: 'Solo parcialmente',
    summary:
      'Hay un precio de referencia, pero faltan detalles para saber si incluye todos los conceptos importantes o si puede haber extras.',
    next_step: 'Pide un desglose sencillo de mano de obra, materiales, IVA y partidas opcionales.',
  },
  infoCategories: {
    confirmed: ['Hay una propuesta de trabajo y un precio de referencia.'],
    needsClarification: fallbackClarificationItems.map((item) => `${item.title}. ${item.consequence}`),
    risks: ['Aceptar sin confirmación escrita de los puntos abiertos puede generar discusión después.'],
  },
  vendorQuestions: {
    title: 'Mensaje para copiar y enviar',
    messageToSend: fallbackMessage,
    messagesByVendor: [
      {
        vendorName: 'Proveedor',
        messageToSend: fallbackMessage,
      },
    ],
    questions: fallbackClarificationItems.map((item) => item.question_to_ask),
  },
  nextAction: {
    title: 'Siguiente paso',
    summary: 'Pide confirmación por escrito y decide después.',
  },
  confidence: 'medium',
  assumptions: ['No se ha podido completar una revisión automática real, así que estos puntos sirven solo como guía de prueba.'],
};

const listSchema = {
  type: 'array',
  items: { type: 'string' },
};

const clarificationItemSchema = {
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: false,
    required: ['title', 'consequence', 'consequence_type', 'question_to_ask'],
    properties: {
      title: { type: 'string' },
      consequence: { type: 'string' },
      consequence_type: {
        type: 'string',
        enum: ['cost', 'time', 'quality', 'scope', 'payment', 'dispute', 'decision_pressure'],
      },
      question_to_ask: { type: 'string' },
    },
  },
};

const priceSanitySchema = {
  type: 'object',
  additionalProperties: false,
  required: ['status', 'title', 'summary', 'next_step'],
  properties: {
    status: { type: 'string', enum: ['yes', 'partly', 'no'] },
    title: { type: 'string' },
    summary: { type: 'string' },
    next_step: { type: 'string' },
  },
};

const vendorMessageSchema = {
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: false,
    required: ['vendorName', 'messageToSend'],
    properties: {
      vendorName: { type: 'string' },
      messageToSend: { type: 'string' },
    },
  },
};

const comparisonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['recommendedQuote', 'oneLineReason', 'whyThisOne', 'stillUnclear', 'beCareful'],
  properties: {
    recommendedQuote: { type: 'string' },
    oneLineReason: { type: 'string' },
    whyThisOne: listSchema,
    stillUnclear: listSchema,
    beCareful: listSchema,
  },
};

const schema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'verdict',
    'mode',
    'recommendedVendor',
    'comparison',
    'clarificationItems',
    'priceSanity',
    'infoCategories',
    'vendorQuestions',
    'nextAction',
    'confidence',
    'assumptions',
  ],
  properties: {
    verdict: {
      type: 'object',
      additionalProperties: false,
      required: ['level', 'title', 'summary'],
      properties: {
        level: { type: 'string', enum: ['green', 'yellow', 'red'] },
        title: { type: 'string' },
        summary: { type: 'string' },
      },
    },
    mode: { type: 'string', enum: ['single_quote', 'quote_comparison'] },
    recommendedVendor: { type: 'string' },
    comparison: comparisonSchema,
    clarificationItems: clarificationItemSchema,
    priceSanity: priceSanitySchema,
    infoCategories: {
      type: 'object',
      additionalProperties: false,
      required: ['confirmed', 'needsClarification', 'risks'],
      properties: {
        confirmed: listSchema,
        needsClarification: listSchema,
        risks: listSchema,
      },
    },
    vendorQuestions: {
      type: 'object',
      additionalProperties: false,
      required: ['title', 'messageToSend', 'messagesByVendor', 'questions'],
      properties: {
        title: { type: 'string' },
        messageToSend: { type: 'string' },
        messagesByVendor: vendorMessageSchema,
        questions: listSchema,
      },
    },
    nextAction: {
      type: 'object',
      additionalProperties: false,
      required: ['title', 'summary'],
      properties: {
        title: { type: 'string' },
        summary: { type: 'string' },
      },
    },
    confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
    assumptions: listSchema,
  },
};

const languageNames = {
  es: 'Spanish',
  en: 'English',
  pl: 'Polish',
};

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function extractOutputText(data) {
  if (typeof data.output_text === 'string') return data.output_text;

  const texts = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === 'output_text' && typeof content.text === 'string') {
        texts.push(content.text);
      }
    }
  }

  return texts.join('');
}

function normalizeDocuments(quoteDocuments, quoteText) {
  const normalized = Array.isArray(quoteDocuments)
    ? quoteDocuments.map((document, index) => ({
        id: `quote_${index + 1}`,
        fileName: String(document?.name || `Quote ${index + 1}`),
        text: String(document?.text || ''),
        fileData: typeof document?.fileData === 'string' ? document.fileData : '',
        mimeType: String(document?.mimeType || ''),
      }))
    : [];

  if (normalized.length) return normalized;

  return [
    {
      id: 'quote_1',
      fileName: 'Pasted quote',
      text: String(quoteText || ''),
      fileData: '',
      mimeType: '',
    },
  ];
}

function isImageDocument(document) {
  return document.mimeType.toLowerCase().startsWith('image/') || /^data:image\//i.test(document.fileData);
}

function documentMetadata(document) {
  return {
    id: document.id,
    fileNameLength: document.fileName.length,
    mimeType: document.mimeType || 'text/plain',
    textLength: document.text.trim().length,
    hasFileData: Boolean(document.fileData),
    isImage: isImageDocument(document),
  };
}

function buildDebugBase({ requestId, language, decisionContext, documents, hasInput }) {
  return {
    event: 'quote_analysis_debug',
    requestId,
    language,
    inputModeHint: String(decisionContext || '').slice(0, 80),
    documentCount: documents.length,
    hasInput,
    hasReadableText: documents.some((document) => document.text.trim().length > 0),
    totalTextLength: documents.reduce((total, document) => total + document.text.trim().length, 0),
    hasFileData: documents.some((document) => Boolean(document.fileData)),
    documents: documents.map(documentMetadata),
  };
}

function logInfo(payload) {
  console.info(JSON.stringify(payload));
}

function logError(payload) {
  console.error(JSON.stringify(payload));
}

function buildUserContent({ responseLanguage, analysisModeHint, decisionContext, documents }) {
  const textDocuments = documents.map((document) => ({
    id: document.id,
    fileName: document.fileName,
    text: document.text,
    mimeType: document.mimeType,
    hasAttachedFile: Boolean(document.fileData),
  }));
  const content = [
    {
      type: 'input_text',
      text: JSON.stringify({
        responseLanguage,
        analysisModeHint,
        decisionContext,
        documents: textDocuments,
      }),
    },
  ];

  for (const document of documents) {
    if (document.fileData && isImageDocument(document)) {
      content.push({
        type: 'input_image',
        image_url: document.fileData,
      });
    }
  }

  return content;
}

function buildOpenAiPayload({ model, responseLanguage, analysisModeHint, decisionContext, documents, includeTemperature }) {
  const payload = {
    model,
    input: [
      {
        role: 'system',
        content:
          `You are RenoPilot, a homeowner quote decision assistant. You MUST respond entirely in ${responseLanguage}. This is a basic quote-check flow, not multi-quote comparison. Treat uploaded files and pasted text as one contractor communication package. The first answer should stay short and answer whether the homeowner can relax or should ask questions. Detailed consequences belong in clarificationItems. Every item in clarificationItems must explain: what is unclear, why it matters to the homeowner, and the exact question to ask. Use consequence_type as one of: cost, time, quality, scope, payment, dispute, decision_pressure. Include genuine missing, unclear, conditional or ambiguous points only. Do not invent hidden costs. If something is already quoted or confirmed, do not present it as a potential extra cost. In infoCategories.confirmed, include short fair points that appear clear. For priceSanity, judge only price transparency from the content, not market pricing. Use status yes, partly or no. Do not say overpriced, below market or fair market unless the documents themselves provide data. Prefer hard to judge, partly clear, cannot compare properly without breakdown, cheaper but missing details, or higher but includes more scope. For vendorQuestions, build the message from clarificationItems.question_to_ask. Keep the content practical, calm, homeowner-friendly and concise. Always write the product name exactly as RenoPilot. Never use PDF filenames as vendor names. Extract company names from the content; if unclear, use a neutral vendor label in ${responseLanguage}.`,
      },
      {
        role: 'user',
        content: buildUserContent({
          responseLanguage,
          analysisModeHint,
          decisionContext,
          documents,
        }),
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'quote_analysis',
        strict: true,
        schema,
      },
    },
  };

  if (includeTemperature) {
    payload.temperature = 0;
  }

  return payload;
}

async function callOpenAi(payload) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const bodyText = await response.text();

  if (!response.ok) {
    const error = new Error(`OpenAI request failed: ${response.status}`);
    error.status = response.status;
    error.bodyText = bodyText.slice(0, 1200);
    throw error;
  }

  return JSON.parse(bodyText);
}

export default async function handler(req, res) {
  const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const { decisionContext = '', quoteText = '', quoteDocuments = [], language = 'es' } = req.body || {};
  const responseLanguage = languageNames[language] || 'Spanish';
  const documents = normalizeDocuments(quoteDocuments, quoteText);
  const hasInput = documents.some((document) => document.text.trim() || document.fileData);
  const hasReadableContent = documents.some((document) => document.text.trim().length >= 20 || document.fileData);
  const analysisModeHint = 'single_quote';
  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
  const debugBase = buildDebugBase({ requestId, language, decisionContext, documents, hasInput });

  logInfo({ ...debugBase, stage: 'received' });

  if (!hasInput || !hasReadableContent) {
    logInfo({ ...debugBase, stage: 'rejected_unreadable' });
    return sendJson(res, 422, { error: 'Quote content unreadable' });
  }

  if (!process.env.OPENAI_API_KEY) {
    logError({ ...debugBase, stage: 'missing_api_key' });
    return sendJson(res, 503, { error: 'Quote analysis unavailable' });
  }

  try {
    const basePayload = {
      model,
      responseLanguage,
      analysisModeHint,
      decisionContext,
      documents,
    };
    let data;

    try {
      logInfo({ ...debugBase, stage: 'openai_attempt', includeTemperature: true });
      data = await callOpenAi(buildOpenAiPayload({ ...basePayload, includeTemperature: true }));
    } catch (firstError) {
      logError({
        ...debugBase,
        stage: 'openai_first_attempt_failed',
        status: firstError.status || null,
        errorMessage: firstError.message,
        errorBody: firstError.bodyText || '',
      });
      logInfo({ ...debugBase, stage: 'openai_attempt', includeTemperature: false });
      data = await callOpenAi(buildOpenAiPayload({ ...basePayload, includeTemperature: false }));
    }

    const outputText = extractOutputText(data);
    if (!outputText) throw new Error('OpenAI response had no output text');

    const analysis = JSON.parse(outputText);

    logInfo({ ...debugBase, stage: 'success', outputLength: outputText.length });
    return sendJson(res, 200, { source: 'llm', analysis });
  } catch (error) {
    logError({
      ...debugBase,
      stage: 'failed',
      status: error.status || null,
      errorMessage: error.message,
      errorBody: error.bodyText || '',
    });
    return sendJson(res, 502, { error: 'Quote analysis failed', requestId });
  }
}
