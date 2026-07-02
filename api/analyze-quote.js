const fallbackAnalysis = {
  verdict: {
    level: 'yellow',
    title: 'Buena pinta, pero pregunta antes de firmar',
    summary: 'Parece viable, pero hay que aclarar puntos clave antes de aceptar.',
  },
  mode: 'single_quote',
  recommendedVendor: '',
  comparison: {
    recommendedQuote: 'Proveedor recomendado',
    oneLineReason: 'Parece la opción más clara, pero faltan confirmaciones importantes.',
    whyThisOne: ['Alcance más fácil de entender.'],
    stillUnclear: ['Precio final con IVA.', 'Plazo y forma de pago.'],
    beCareful: ['No pagar señal sin confirmación escrita.'],
  },
  infoCategories: {
    confirmed: ['Hay una propuesta de trabajo y un precio de referencia.'],
    needsClarification: [
      'Precio final con IVA incluido.',
      'Qué está incluido exactamente en el alcance.',
      'Plazo estimado y forma de pago.',
    ],
    risks: ['Aceptar o pagar señal sin confirmación escrita de los puntos abiertos.'],
  },
  vendorQuestions: {
    title: 'Mensaje para copiar y enviar',
    messageToSend:
      'Hola, gracias por el presupuesto. Antes de aceptar, ¿podéis confirmarme estos puntos por escrito?\n\n1. ¿Cuál será el precio final con IVA incluido?\n2. ¿Qué está incluido exactamente y qué podría costar extra?\n3. ¿Cuánto durará la obra o servicio?\n4. ¿Cuáles son las condiciones de pago y cuándo se paga cada parte?\n\nGracias.',
    messagesByVendor: [
      {
        vendorName: 'Proveedor',
        messageToSend:
          'Hola, gracias por el presupuesto. Antes de aceptar, ¿podéis confirmarme estos puntos por escrito?\n\n1. ¿Cuál será el precio final con IVA incluido?\n2. ¿Qué está incluido exactamente y qué podría costar extra?\n3. ¿Cuánto durará la obra o servicio?\n4. ¿Cuáles son las condiciones de pago y cuándo se paga cada parte?\n\nGracias.',
      },
    ],
    questions: [
      '¿Cuál será el precio final con IVA incluido?',
      '¿Qué está incluido exactamente y qué podría costar extra?',
      '¿Cuánto durará la obra o servicio?',
      '¿Cuáles son las condiciones de pago y cuándo se paga cada parte?',
    ],
  },
  nextAction: {
    title: 'Nuestra recomendación',
    summary: 'No aceptes todavía. Pide confirmación por escrito y decide después.',
  },
  confidence: 'medium',
  assumptions: ['Fallback del prototipo: no se ha podido generar una revisión real con el LLM.'],
};

const listSchema = {
  type: 'array',
  items: { type: 'string' },
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
  if (Array.isArray(quoteDocuments) && quoteDocuments.length) {
    return quoteDocuments
      .filter((document) => String(document?.text || '').trim())
      .map((document, index) => ({
        id: `quote_${index + 1}`,
        fileName: String(document.name || `Quote ${index + 1}`),
        text: String(document.text || ''),
      }));
  }

  return [
    {
      id: 'quote_1',
      fileName: 'Pasted quote',
      text: String(quoteText || ''),
    },
  ];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const { decisionContext = '', quoteText = '', quoteDocuments = [], language = 'es' } = req.body || {};
  const responseLanguage = languageNames[language] || 'Spanish';
  const documents = normalizeDocuments(quoteDocuments, quoteText);
  const hasInput = documents.some((document) => document.text.trim());
  const analysisModeHint = documents.length > 1 ? 'quote_comparison' : 'single_quote';

  if (!hasInput) {
    return sendJson(res, 400, { error: 'Missing quote text' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return sendJson(res, 200, {
      source: 'mock',
      analysis: fallbackAnalysis,
      error: 'No API key configured. Showing mock fallback.',
    });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
        input: [
          {
            role: 'system',
            content:
              `You are RenoPilot, a homeowner quote decision assistant. You MUST respond entirely in ${responseLanguage}. Less reading, one idea per screen. Give confidence, not a technical report. Return consequences, not construction details. Never call quoted prices hidden costs. If one quote is provided, give a single quote decision check. If more than one quote document is provided, set mode to quote_comparison and give a very simple recommendation: recommendedQuote, oneLineReason, whyThisOne, stillUnclear, beCareful. Do not create a scoring table. Do not claim a quote is definitively best; recommend the best one to continue with. Keep all arrays to 0-3 short items. IMPORTANT: extract vendor/company names from the document text. Never use PDF filenames, file extensions, document IDs, or strings like "Oferta190.pdf" as vendor names or recommendedQuote. If the company name is unclear, use a neutral label like "Proveedor 1" / "Vendor 1" / "Wykonawca 1" in the selected language. For multiple vendors, generate a separate ready-to-send message for each vendor in messagesByVendor. The messagesByVendor.vendorName values must also be extracted company names or neutral vendor labels, never filenames. For one vendor, generate one message. Do not invent prices. If information is missing, say it needs clarification.`,
          },
          {
            role: 'user',
            content: JSON.stringify({
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
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('OpenAI quote analysis error', response.status, errorBody);
      throw new Error(`OpenAI request failed: ${response.status}`);
    }

    const data = await response.json();
    const outputText = extractOutputText(data);
    const analysis = JSON.parse(outputText);

    return sendJson(res, 200, { source: 'llm', analysis });
  } catch (error) {
    console.error('Quote analysis fallback', error);
    return sendJson(res, 200, {
      source: 'mock',
      analysis: fallbackAnalysis,
      error: 'LLM unavailable. Showing mock fallback.',
    });
  }
}
