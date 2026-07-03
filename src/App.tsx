import { useLayoutEffect, useMemo, useState } from 'react';
import { AppShell } from './components/AppShell';
import { CheckingScreen } from './components/CheckingScreen';
import { ComparisonDetailsScreen } from './components/ComparisonDetailsScreen';
import { ComparisonResultScreen } from './components/ComparisonResultScreen';
import { ContractorQuestionsScreen } from './components/ContractorQuestionsScreen';
import { LandingScreen } from './components/LandingScreen';
import { ResultScreen } from './components/ResultScreen';
import { StartCheckScreen } from './components/StartCheckScreen';
import { ThingsToReviewScreen } from './components/ThingsToReviewScreen';
import { UpdatedRecommendationScreen } from './components/UpdatedRecommendationScreen';
import { VendorReplyScreen } from './components/VendorReplyScreen';
import { analyzeQuote, analyzeVendorReply } from './lib/apiClient';
import { buildFallbackQuoteAnalysis, buildFallbackUpdatedRecommendation, levelIcon } from './lib/fallbackAnalysis';
import { defaultLanguage, quoteCheckContent, type Language } from './data/quoteCheckContent';
import { localizedCopy } from './data/localizedCopy';
import type { AnalysisSource, ClarificationItem, QuoteAnalysis, QuoteDocument, UpdatedRecommendationAnalysis } from './types/analysis';

type Screen =
  | 'landing'
  | 'start'
  | 'checking'
  | 'result'
  | 'review'
  | 'questions'
  | 'reply'
  | 'updated';

const screenOrder: Screen[] = [
  'landing',
  'start',
  'checking',
  'result',
  'review',
  'questions',
  'reply',
  'updated',
];

const screenPhase: Record<Screen, number | null> = {
  landing: null,
  start: 0,
  checking: 1,
  result: 1,
  review: 1,
  questions: 2,
  reply: 3,
  updated: 3,
};

const checkingCopy: Record<Language, { items: string[]; slowMessage: string }> = {
  es: {
    items: ['Leyendo el presupuesto', 'Detectando puntos poco claros', 'Preparando preguntas'],
    slowMessage: 'Está tardando un poco más de lo normal. Estamos preparando una revisión básica.',
  },
  en: {
    items: ['Reading the quote', 'Spotting unclear points', 'Preparing questions'],
    slowMessage: 'This is taking a little longer than usual. We are preparing a basic review.',
  },
  pl: {
    items: ['Czytanie wyceny', 'Wykrywanie niejasnych punktów', 'Przygotowywanie pytań'],
    slowMessage: 'To trwa trochę dłużej niż zwykle. Przygotowujemy podstawową analizę.',
  },
};

function normalizeProductName(value: string) {
  return value.replace(/\bRENOPILOT\b|\bRenopilot\b|\brenoPilot\b|\brenopilot\b/g, 'RenoPilot');
}

function withConditionalSuffix(value: string, suffix: string) {
  const normalizedValue = normalizeProductName(value).trim();
  const lowerValue = normalizedValue.toLowerCase();
  const lowerSuffix = suffix.toLowerCase();

  if (lowerValue.includes('clarify') || lowerValue.includes('confirm') || lowerValue.includes('aclar') || lowerValue.includes('potwier')) {
    return normalizedValue;
  }

  if (lowerValue.includes(lowerSuffix)) {
    return normalizedValue;
  }

  return `${normalizedValue} ${suffix}`;
}

function normalizeTextList(items: string[]) {
  return items.map((item) => normalizeProductName(item));
}

function normalizeClarificationItems(items: ClarificationItem[]) {
  return items.map((item) => ({
    ...item,
    title: normalizeProductName(item.title),
    consequence: normalizeProductName(item.consequence),
    consequence_type: item.consequence_type,
    question_to_ask: normalizeProductName(item.question_to_ask),
  }));
}

function fallbackClarificationItems(items: string[]): ClarificationItem[] {
  return items.slice(0, 4).map((item) => ({
    title: normalizeProductName(item),
    consequence: 'Puede afectar al precio, al plazo o al alcance real si no queda confirmado por escrito.',
    consequence_type: 'scope',
    question_to_ask: `¿Puedes confirmar por escrito este punto: ${normalizeProductName(item)}?`,
  }));
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const [decisionContext, setDecisionContext] = useState('');
  const [quoteText, setQuoteText] = useState('');
  const [quoteDocuments, setQuoteDocuments] = useState<QuoteDocument[]>([]);
  const [analysis, setAnalysis] = useState<QuoteAnalysis | null>(null);
  const [updatedAnalysis, setUpdatedAnalysis] = useState<UpdatedRecommendationAnalysis | null>(null);
  const [analysisSource, setAnalysisSource] = useState<AnalysisSource>('mock');
  const [analysisWarning, setAnalysisWarning] = useState('');
  const [startError, setStartError] = useState('');
  const [vendorReplyError, setVendorReplyError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzingVendorReply, setIsAnalyzingVendorReply] = useState(false);
  const content = quoteCheckContent[language];
  const copy = localizedCopy[language];
  const currentPhase = screenPhase[screen];
  const checkingContent = {
    ...content.checking,
    items: checkingCopy[language].items,
    slowMessage: checkingCopy[language].slowMessage,
  };

  const fallbackQuoteAnalysis = useMemo(() => buildFallbackQuoteAnalysis(content), [content]);
  const activeAnalysis = analysis ?? fallbackQuoteAnalysis;
  const activeUpdatedAnalysis = updatedAnalysis ?? buildFallbackUpdatedRecommendation(content);
  const isComparison = activeAnalysis.mode === 'quote_comparison';
  const clarificationItems = activeAnalysis.clarificationItems?.length
    ? normalizeClarificationItems(activeAnalysis.clarificationItems)
    : fallbackClarificationItems([
        ...activeAnalysis.infoCategories.needsClarification,
        ...activeAnalysis.infoCategories.risks,
      ]);
  const rawComparisonSummary = activeAnalysis.comparison ?? {
    recommendedQuote: activeAnalysis.recommendedVendor || activeAnalysis.verdict.title,
    oneLineReason: activeAnalysis.verdict.summary,
    whyThisOne: activeAnalysis.infoCategories.confirmed,
    stillUnclear: activeAnalysis.infoCategories.needsClarification,
    beCareful: activeAnalysis.infoCategories.risks,
  };
  const comparisonSummary = {
    ...rawComparisonSummary,
    recommendedQuote: normalizeProductName(rawComparisonSummary.recommendedQuote),
    oneLineReason: withConditionalSuffix(rawComparisonSummary.oneLineReason, copy.comparison.conditionalSuffix),
    whyThisOne: normalizeTextList(rawComparisonSummary.whyThisOne),
    stillUnclear: normalizeTextList(rawComparisonSummary.stillUnclear),
    beCareful: normalizeTextList(rawComparisonSummary.beCareful),
  };

  const resultContent = {
    title: normalizeProductName(content.result.title),
    status: `${levelIcon(activeAnalysis.verdict.level)} ${normalizeProductName(activeAnalysis.verdict.title)}`,
    explanation: normalizeProductName(activeAnalysis.verdict.summary),
    cta: copy.resultCta,
    disclaimer: copy.disclaimerNote,
  };

  const comparisonResultContent = {
    title: copy.comparison.title,
    recommendationLabel: copy.comparison.recommendationLabel,
    summary: comparisonSummary,
    cta: copy.resultCta,
    disclaimer: copy.disclaimerNote,
  };

  const reviewContent = {
    title: copy.reviewTitle,
    categories: {
      confirmed: normalizeTextList(activeAnalysis.infoCategories.confirmed),
      needsClarification: normalizeTextList(activeAnalysis.infoCategories.needsClarification),
      risks: normalizeTextList(activeAnalysis.infoCategories.risks),
    },
    clarificationItems,
    categoryLabels: copy.categoryLabels,
    consequenceLabel: copy.consequenceLabel,
    questionLabel: copy.questionLabel,
    cta: copy.reviewCta,
  };

  const comparisonDetailsContent = {
    title: copy.comparison.detailsTitle,
    labels: {
      whyThisOne: copy.comparison.whyThisOne,
      stillUnclear: copy.comparison.stillUnclear,
      beCareful: copy.comparison.beCareful,
    },
    summary: comparisonSummary,
    clarificationItems,
    consequenceLabel: copy.consequenceLabel,
    questionLabel: copy.questionLabel,
    cta: copy.reviewCta,
  };

  const questionsContent = {
    ...content.questions,
    title: normalizeProductName(activeAnalysis.vendorQuestions.title || content.questions.title),
    message: normalizeProductName(activeAnalysis.vendorQuestions.messageToSend),
    messagesByVendor: activeAnalysis.vendorQuestions.messagesByVendor.map((message) => ({
      vendorName: normalizeProductName(message.vendorName),
      messageToSend: normalizeProductName(message.messageToSend),
    })),
    cta: copy.questionsCta,
  };

  const updatedContent = {
    ...content.updatedRecommendation,
    status: `${levelIcon(activeUpdatedAnalysis.updatedVerdict.level)} ${normalizeProductName(activeUpdatedAnalysis.updatedVerdict.title)}`,
    explanation: normalizeProductName(activeUpdatedAnalysis.updatedVerdict.summary),
    nextActionTitle: normalizeProductName(activeUpdatedAnalysis.nextAction.title),
    nextAction: normalizeProductName(activeUpdatedAnalysis.nextAction.summary),
    disclaimer: copy.disclaimerNote,
  };

  useLayoutEffect(() => {
    const resetScroll = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      document.querySelector('.app-shell')?.scrollTo({ top: 0 });
      document.querySelector('.phone-frame')?.scrollTo({ top: 0 });
      document.querySelector('.screen-card')?.scrollTo({ top: 0 });
    };

    resetScroll();
    window.requestAnimationFrame(resetScroll);
    window.setTimeout(resetScroll, 0);
  }, [screen]);

  const goBack = () => {
    const currentIndex = screenOrder.indexOf(screen);

    if (currentIndex > 0) {
      setScreen(screenOrder[currentIndex - 1]);
    }
  };

  const handleStartCheck = async (input: {
    decisionContext: string;
    quoteText: string;
    quoteDocuments: QuoteDocument[];
  }) => {
    setDecisionContext(input.decisionContext);
    setQuoteText(input.quoteText);
    setQuoteDocuments(input.quoteDocuments);
    setAnalysis(null);
    setUpdatedAnalysis(null);
    setAnalysisWarning('');
    setStartError('');
    setIsAnalyzing(true);
    setScreen('checking');

    try {
      const response = await analyzeQuote({
        decisionContext: input.decisionContext,
        quoteText: input.quoteText,
        quoteDocuments: input.quoteDocuments,
        language,
      });

      setAnalysis(response.analysis);
      setAnalysisSource(response.source);
      setAnalysisWarning(response.error || (response.source === 'mock' ? copy.fallbackWarning : ''));
    } catch (error) {
      setAnalysis(fallbackQuoteAnalysis);
      setAnalysisSource('mock');
      setAnalysisWarning(copy.analysisError);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleVendorReply = async (vendorReply: string) => {
    setVendorReplyError('');
    setIsAnalyzingVendorReply(true);

    try {
      const response = await analyzeVendorReply({
        decisionContext,
        quoteText,
        originalAnalysis: activeAnalysis,
        vendorReply,
        language,
      });

      setUpdatedAnalysis(response.analysis);
      setAnalysisSource(response.source);
      setVendorReplyError(response.error || '');
    } catch (error) {
      setUpdatedAnalysis(buildFallbackUpdatedRecommendation(content));
      setAnalysisSource('mock');
      setVendorReplyError(copy.vendorError);
    } finally {
      setIsAnalyzingVendorReply(false);
      setScreen('updated');
    }
  };

  return (
    <AppShell
      brand={content.brand}
      currentPhase={currentPhase}
      language={language}
      onBack={screen === 'landing' ? undefined : goBack}
      onLanguageChange={setLanguage}
      shell={content.shell}
    >
      {screen === 'landing' && (
        <LandingScreen content={content.landing} onNext={() => setScreen('start')} />
      )}
      {screen === 'start' && (
        <StartCheckScreen
          content={content.startCheck}
          error={startError}
          language={language}
          note={copy.prototypeNote}
          onSubmit={handleStartCheck}
        />
      )}
      {screen === 'checking' && (
        <CheckingScreen
          content={checkingContent}
          error={analysisWarning}
          isReady={!isAnalyzing && Boolean(analysis)}
          onNext={() => setScreen('result')}
        />
      )}
      {screen === 'result' && (
        isComparison ? (
          <ComparisonResultScreen content={comparisonResultContent} onNext={() => setScreen('review')} />
        ) : (
          <ResultScreen content={resultContent} onNext={() => setScreen('review')} />
        )
      )}
      {screen === 'review' && (
        isComparison ? (
          <ComparisonDetailsScreen content={comparisonDetailsContent} onNext={() => setScreen('questions')} />
        ) : (
          <ThingsToReviewScreen content={reviewContent} onNext={() => setScreen('questions')} />
        )
      )}
      {screen === 'questions' && (
        <ContractorQuestionsScreen content={questionsContent} onNext={() => setScreen('reply')} />
      )}
      {screen === 'reply' && (
        <VendorReplyScreen
          content={content.vendorReply}
          error={vendorReplyError || (analysisSource === 'mock' ? copy.vendorFallback : '')}
          isLoading={isAnalyzingVendorReply}
          language={language}
          replyTargets={activeAnalysis.vendorQuestions.messagesByVendor}
          onSubmit={handleVendorReply}
        />
      )}
      {screen === 'updated' && <UpdatedRecommendationScreen content={updatedContent} />}
    </AppShell>
  );
}
