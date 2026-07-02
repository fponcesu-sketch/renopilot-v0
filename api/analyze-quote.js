const fallbackAnalysis = {
  verdict: {
    level: 'yellow',
    title: 'Buena pinta, pero pregunta antes de firmar',
    summary: 'No vemos señales fuertes de alarma, pero hay puntos que conviene cerrar antes de aceptar.',
  },
  costExposure: {
    summary: 'No calculable todavía. Falta confirmar IVA, alcance exacto y posibles extras.',
    calculable: false,
  },
  biggestRisk: {
    title: 'Mayor riesgo',
    summary: 'El presupuesto no deja claro qué está incluido, qué puede variar y qué debe confirmarse por escrito.',
  },
  thingsToReview: [
    'Confirma el precio final con IVA incluido.',
    'Pide el plazo estimado de ejecución.',
    'Aclara qué partidas pueden cambiar de precio.',
    'Confirma por escrito las condiciones de pago.',
  ],
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
    title: 'Siguiente paso',
    summary: 'Pide confirmación escrita antes de firmar o pagar una señal.',
  },
  confidence: 'medium',
  assumptions: ['Fallback del prototipo: no se ha podido generar una revisión real con el LLM.'],
};

const schema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'verdict',
    'costExposure',
    'biggestRisk',
    'thingsToReview',
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
    costExposure: {
      type: 'object',
      additionalProperties: false,
      required: ['summary', 'calculable'],
      properties: {
        summary: { type: 'string' },
        calculable: { type: 'boolean' },
      },
    },
    biggestRisk: {
      type: 'object',
      additionalProperties: false,
      required: ['title', 'summary'],
      properties: {
        title: { type: 'string' },
        summary: { type: 'string' },
      },
    },
    thingsToReview: {
      type: 'array',
      minItems: 3,
      maxItems: 6,
      items: { type: 'string' },
    },
    vendorQuestions: {
      type: 'object',
      additionalProperties: false,
      required: ['title', 'messageToSend', 'questions'],
      properties: {
        title: { type: 'string' },
        messageToSend: { type: 'string' },
        questions: {
          type: 'array',
          minItems: 3,
          maxItems: 6,
          items: { type: 'string' },
        },
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
    assumptions: {
      type: 'array',
      maxItems: 4,
      items: { type: 'string' },
    },
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
              'You are RenoPilot, a homeowner quote decision assistant. Return practical, short, non-legal, non-technical guidance. Do not summarize only; help the user decide what to ask before accepting. Respond in the requested language. Do not invent prices. If information is missing, say it is not calculable yet.',
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
      throw new Error(`OpenAI request failed: ${response.status}`);
    }

    const data = await response.json();
    const outputText = extractOutputText(data);
    const analysis = JSON.parse(outputText);

    return sendJson(res, 200, { source: 'llm', analysis });
  } catch (error) {
    return sendJson(res, 200, {
      source: 'mock',
      analysis: fallbackAnalysis,
      error: 'LLM unavailable. Showing mock fallback.',
    });
  }
}
