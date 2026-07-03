import type { QuoteCheckContent } from '../data/quoteCheckContent';
import type { QuoteAnalysis, UpdatedRecommendationAnalysis } from '../types/analysis';

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

export function buildFallbackQuoteAnalysis(content: QuoteCheckContent): QuoteAnalysis {
  const messageToSend = `Hola, gracias por el presupuesto. Antes de aceptar, ¿podéis confirmarme estos puntos por escrito?\n\n${fallbackClarificationItems
    .map((item, index) => `${index + 1}. ${item.question_to_ask}`)
    .join('\n')}\n\nGracias.`;

  return {
    verdict: {
      level: 'yellow',
      title: content.result.status.replace(/^[🟢🟡🔴]\s*/, ''),
      summary: 'Parece viable, pero hay puntos clave que conviene aclarar antes de aceptar.',
    },
    mode: 'single_quote',
    comparison: {
      recommendedQuote: 'Oferta del proveedor',
      oneLineReason: 'Parece la opción más clara, pero faltan confirmaciones importantes antes de aceptar.',
      whyThisOne: ['Alcance más fácil de entender.'],
      stillUnclear: fallbackClarificationItems.map((item) => item.title),
      beCareful: ['No decidir solo por precio si otra oferta está más detallada.'],
    },
    clarificationItems: fallbackClarificationItems,
    infoCategories: {
      confirmed: ['Hay una propuesta de trabajo y un precio de referencia.'],
      needsClarification: fallbackClarificationItems.map((item) => `${item.title}. ${item.consequence}`),
      risks: ['Aceptar sin confirmación escrita de los puntos abiertos puede generar discusión después.'],
    },
    vendorQuestions: {
      title: content.questions.title,
      messageToSend,
      messagesByVendor: [
        {
          vendorName: 'Proveedor',
          messageToSend,
        },
      ],
      questions: fallbackClarificationItems.map((item) => item.question_to_ask),
    },
    nextAction: {
      title: 'Siguiente paso',
      summary: 'Pide confirmación por escrito y decide después.',
    },
    confidence: 'medium',
    assumptions: ['Revisión de ejemplo usada como fallback del prototipo.'],
  };
}

export function buildFallbackUpdatedRecommendation(content: QuoteCheckContent): UpdatedRecommendationAnalysis {
  return {
    updatedVerdict: {
      level: 'yellow',
      title: content.updatedRecommendation.status.replace(/^[🟢🟡🔴]\s*/, ''),
      summary: content.updatedRecommendation.explanation,
    },
    resolvedItems: [],
    remainingOpenItems: [content.updatedRecommendation.nextAction],
    changedRisk: {
      title: content.updatedRecommendation.nextActionTitle,
      summary: content.updatedRecommendation.nextAction,
    },
    nextAction: {
      title: content.updatedRecommendation.nextActionTitle,
      summary: content.updatedRecommendation.nextAction,
    },
    confidence: 'medium',
  };
}

export function levelIcon(level: QuoteAnalysis['verdict']['level']) {
  if (level === 'green') return '🟢';
  if (level === 'red') return '🔴';
  return '🟡';
}
