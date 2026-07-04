const fallbackAnalysis = {
  updatedVerdict: {
    level: 'yellow',
    title: 'Todavía faltan puntos por cerrar',
    summary:
      'Buena respuesta, pero aún falta confirmar por escrito el precio final y cualquier condición importante antes de pagar.',
  },
  resolvedItems: [],
  remainingOpenItems: ['Precio final por escrito', 'Condiciones exactas antes de pagar'],
  changedRisk: {
    title: 'Riesgo actualizado',
    summary: 'El principal riesgo sigue siendo aceptar sin confirmación escrita de los puntos abiertos.',
  },
  nextAction: {
    title: 'Siguiente paso',
    summary: 'Pide confirmación escrita antes de pagar la señal.',
  },
  messageToSend:
    'Gracias. Antes de aceptar, ¿podéis confirmar por escrito el precio final y los puntos que siguen pendientes?',
  confidence: 'medium',
};

const schema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'updatedVerdict',
    'resolvedItems',
    'remainingOpenItems',
    'changedRisk',
    'nextAction',
    'messageToSend',
    'confidence',
  ],
  properties: {
    updatedVerdict: {
      type: 'object',
      additionalProperties: false,
      required: ['level', 'title', 'summary'],
      properties: {
        level: { type: 'string', enum: ['green', 'yellow', 'red'] },
        title: { type: 'string' },
        summary: { type: 'string' },
      },
    },
    resolvedItems: {
      type: 'array',
      items: { type: 'string' },
    },
    remainingOpenItems: {
      type: 'array',
      items: { type: 'string' },
    },
    changedRisk: {
      type: 'object',
      additionalProperties: false,
      required: ['title', 'summary'],
      properties: {
        title: { type: 'string' },
        summary: { type: 'string' },
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
    messageToSend: { type: 'string' },
    confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const {
    decisionContext = '',
    quoteText = '',
    originalAnalysis = null,
    vendorReply = '',
    language = 'es',
  } = req.body || {};
  const responseLanguage = languageNames[language] || 'Spanish';

  if (!String(vendorReply).trim()) {
    return sendJson(res, 400, { error: 'Missing vendor reply' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return sendJson(res, 200, {
      source: 'mock',
      analysis: fallbackAnalysis,
      error: '',
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
        temperature: 0,
        input: [
          {
            role: 'system',
            content:
              `You are RenoPilot, a homeowner quote decision assistant. You MUST respond entirely in ${responseLanguage}. Update the recommendation based only on the original quote context, previous analysis, and vendor replies. The vendorReply field may contain one reply or several replies separated and labelled by vendor name. If there are multiple labelled replies, compare what changed per vendor and update the recommendation accordingly. Keep it short, practical, and decision-oriented. Do not invent missing confirmations. Keep arrays concise: 0 to 6 items maximum. Always write the product name exactly as RenoPilot.`,
          },
          {
            role: 'user',
            content: JSON.stringify({
              responseLanguage,
              decisionContext,
              quoteText,
              originalAnalysis,
              vendorReply,
            }),
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'vendor_reply_analysis',
            strict: true,
            schema,
          },
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('OpenAI vendor reply error', response.status, errorBody);
      throw new Error(`OpenAI request failed: ${response.status}`);
    }

    const data = await response.json();
    const outputText = extractOutputText(data);
    const analysis = JSON.parse(outputText);

    return sendJson(res, 200, { source: 'llm', analysis });
  } catch (error) {
    console.error('Vendor reply fallback', error);
    return sendJson(res, 200, {
      source: 'mock',
      analysis: fallbackAnalysis,
      error: '',
    });
  }
}
