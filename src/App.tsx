import { useLayoutEffect, useMemo, useState } from 'react';
import { AppShell } from './components/AppShell';
import { CheckingScreen } from './components/CheckingScreen';
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
import type { AnalysisSource, QuoteAnalysis, UpdatedRecommendationAnalysis } from './types/analysis';

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

const prototypeNote =
  'Este prototipo no guarda todavía tu revisión. Mantén esta página abierta si quieres pegar la respuesta del proveedor.';

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const [decisionContext, setDecisionContext] = useState('');
  const [quoteText, setQuoteText] = useState('');
  const [analysis, setAnalysis] = useState<QuoteAnalysis | null>(null);
  const [updatedAnalysis, setUpdatedAnalysis] = useState<UpdatedRecommendationAnalysis | null>(null);
  const [analysisSource, setAnalysisSource] = useState<AnalysisSource>('mock');
  const [analysisWarning, setAnalysisWarning] = useState('');
  const [startError, setStartError] = useState('');
  const [vendorReplyError, setVendorReplyError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzingVendorReply, setIsAnalyzingVendorReply] = useState(false);
  const content = quoteCheckContent[language];
  const currentPhase = screenPhase[screen];

  const fallbackQuoteAnalysis = useMemo(() => buildFallbackQuoteAnalysis(content), [content]);
  const activeAnalysis = analysis ?? fallbackQuoteAnalysis;
  const activeUpdatedAnalysis = updatedAnalysis ?? buildFallbackUpdatedRecommendation(content);

  const resultContent = {
    ...content.result,
    status: `${levelIcon(activeAnalysis.verdict.level)} ${activeAnalysis.verdict.title}`,
    explanation: activeAnalysis.verdict.summary,
    costExposure: `Posible coste extra: ${activeAnalysis.costExposure.summary}`,
    biggestRiskTitle: activeAnalysis.biggestRisk.title,
    biggestRisk: activeAnalysis.biggestRisk.summary,
    nextActionTitle: activeAnalysis.nextAction.title,
    nextAction: activeAnalysis.nextAction.summary,
  };

  const reviewContent = {
    ...content.review,
    items: activeAnalysis.thingsToReview,
  };

  const questionsContent = {
    ...content.questions,
    title: activeAnalysis.vendorQuestions.title || content.questions.title,
    message: activeAnalysis.vendorQuestions.messageToSend,
  };

  const updatedContent = {
    ...content.updatedRecommendation,
    status: `${levelIcon(activeUpdatedAnalysis.updatedVerdict.level)} ${activeUpdatedAnalysis.updatedVerdict.title}`,
    explanation: activeUpdatedAnalysis.updatedVerdict.summary,
    nextActionTitle: activeUpdatedAnalysis.nextAction.title,
    nextAction: activeUpdatedAnalysis.nextAction.summary,
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

  const handleStartCheck = async (input: { decisionContext: string; quoteText: string }) => {
    setDecisionContext(input.decisionContext);
    setQuoteText(input.quoteText);
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
        language,
      });

      setAnalysis(response.analysis);
      setAnalysisSource(response.source);
      setAnalysisWarning(response.error || (response.source === 'mock' ? 'Mostramos una revisión de ejemplo porque el LLM no está disponible.' : ''));
    } catch (error) {
      setAnalysis(fallbackQuoteAnalysis);
      setAnalysisSource('mock');
      setAnalysisWarning('No hemos podido generar una revisión real ahora. Mostramos un ejemplo para que puedas seguir probando.');
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
      setVendorReplyError('No hemos podido actualizar la recomendación con IA. Mostramos un ejemplo para seguir probando.');
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
          note={prototypeNote}
          onSubmit={handleStartCheck}
        />
      )}
      {screen === 'checking' && (
        <CheckingScreen
          content={content.checking}
          error={analysisWarning}
          isReady={!isAnalyzing && Boolean(analysis)}
          onNext={() => setScreen('result')}
        />
      )}
      {screen === 'result' && (
        <ResultScreen content={resultContent} onNext={() => setScreen('review')} />
      )}
      {screen === 'review' && (
        <ThingsToReviewScreen content={reviewContent} onNext={() => setScreen('questions')} />
      )}
      {screen === 'questions' && (
        <ContractorQuestionsScreen content={questionsContent} onNext={() => setScreen('reply')} />
      )}
      {screen === 'reply' && (
        <VendorReplyScreen
          content={content.vendorReply}
          error={vendorReplyError || (analysisSource === 'mock' ? 'Esta revisión está en modo fallback/mock.' : '')}
          isLoading={isAnalyzingVendorReply}
          onSubmit={handleVendorReply}
        />
      )}
      {screen === 'updated' && <UpdatedRecommendationScreen content={updatedContent} />}
    </AppShell>
  );
}
