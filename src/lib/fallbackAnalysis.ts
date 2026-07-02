import type { QuoteCheckContent } from '../data/quoteCheckContent';
import type { QuoteAnalysis, UpdatedRecommendationAnalysis } from '../types/analysis';

export function buildFallbackQuoteAnalysis(content: QuoteCheckContent): QuoteAnalysis {
  return {
    verdict: {
      level: 'yellow',
      title: content.result.status.replace(/^[🟢🟡🔴]\s*/, ''),
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
      title: content.questions.title,
      messageToSend: content.questions.message,
      questions: content.questions.message
        .split('\n')
        .filter((line) => /^\d+\./.test(line.trim()))
        .map((line) => line.replace(/^\d+\.\s*/, '').trim()),
    },
    nextAction: {
      title: 'Nuestra recomendación',
      summary: 'No aceptes todavía. Pide confirmación por escrito y decide después.',
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
