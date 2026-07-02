const fallbackAnalysis = {
  verdict: {
    level: 'yellow',
    title: 'Buena pinta, pero pregunta antes de firmar',
    summary: 'Parece viable, pero hay que aclarar puntos clave antes de aceptar.',
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

const schema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'verdict',
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
      required: ['title', 'messageToSend', 'questions'],
      properties: {
        title: { type: 'string' },
        messageToSend: { type: 'string' },
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const { decisionContext = '', quoteText = '', language = 'es' } = req.body || {};

  if (!String(quoteText).trim()) {
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
              'You are RenoPilot, a homeowner quote decision assistant. Less reading, one idea per screen. Give confidence, not a technical report. Return consequences, not construction details. Never call quoted prices hidden costs. Classify information into confirmed, needsClarification, and risks. Keep each category short: 0 to 3 items. Generate a ready-to-send vendor message that the homeowner can copy immediately. Respond in the requested language. Do not invent prices. If information is missing, say it needs clarification.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              language,
              decisionContext,
              quoteText,
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
