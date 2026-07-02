import type { QuoteCheckContent } from '../data/quoteCheckContent';
import type { QuoteAnalysis, UpdatedRecommendationAnalysis } from '../types/analysis';

export function buildFallbackQuoteAnalysis(content: QuoteCheckContent): QuoteAnalysis {
  return {
    verdict: {
      level: 'yellow',
      title: content.result.status.replace(/^[🟢🟡🔴]\s*/, ''),
      summary: content.result.explanation,
    },
    costExposure: {
      summary: content.result.costExposure.replace(/^Posible coste extra:\s*/i, ''),
      calculable: false,
    },
    biggestRisk: {
      title: content.result.biggestRiskTitle,
      summary: content.result.biggestRisk,
    },
    thingsToReview: content.review.items,
    vendorQuestions: {
      title: content.questions.title,
      messageToSend: content.questions.message,
      questions: content.questions.message
        .split('\n')
        .filter((line) => /^\d+\./.test(line.trim()))
        .map((line) => line.replace(/^\d+\.\s*/, '').trim()),
    },
    nextAction: {
      title: content.result.nextActionTitle,
      summary: content.result.nextAction,
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
