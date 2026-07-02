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
import type { AnalysisSource, QuoteAnalysis, QuoteDocument, UpdatedRecommendationAnalysis } from './types/analysis';

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

const localizedCopy: Record<Language, {
  prototypeNote: string;
  disclaimerNote: string;
  resultCta: string;
  reviewTitle: string;
  reviewCta: string;
  questionsCta: string;
  categoryLabels: {
    confirmed: string;
    needsClarification: string;
    risks: string;
  };
  comparison: {
    title: string;
    recommendationLabel: string;
    detailsTitle: string;
    whyThisOne: string;
    stillUnclear: string;
    beCareful: string;
  };
  fallbackWarning: string;
  analysisError: string;
  vendorFallback: string;
  vendorError: string;
}> = {
  es: {
    prototypeNote:
      'RenoPilot es un prototipo temprano. Te ayuda a detectar puntos poco claros y preparar mejores preguntas antes de aceptar un presupuesto.',
    disclaimerNote:
      'No sustituye asesoramiento profesional, legal, arquitectónico o técnico. Confirma siempre los puntos importantes directamente con el profesional antes de firmar o pagar.',
    resultCta: 'Ver qué aclarar',
    reviewTitle: 'Antes de decidir',
    reviewCta: 'Ver preguntas',
    questionsCta: 'Pegar respuesta',
    categoryLabels: {
      confirmed: '🟢 Confirmado',
      needsClarification: '🟡 A aclarar',
      risks: '🔴 Riesgos',
    },
    comparison: {
      title: 'Recomendación RenoPilot',
      recommendationLabel: 'Mejor opción para seguir',
      detailsTitle: 'Por qué esta opción',
      whyThisOne: '🟢 Por qué esta',
      stillUnclear: '🟡 Aún por aclarar',
      beCareful: '🔴 Cuidado con',
    },
    fallbackWarning: 'Mostramos una revisión de ejemplo porque el LLM no está disponible.',
    analysisError: 'No hemos podido generar una revisión real ahora. Mostramos un ejemplo para que puedas seguir probando.',
    vendorFallback: 'Esta revisión está en modo fallback/mock.',
    vendorError: 'No hemos podido actualizar la recomendación con IA. Mostramos un ejemplo para seguir probando.',
  },
  en: {
    prototypeNote:
      'RenoPilot is an early prototype. It helps you spot unclear points and prepare better questions before accepting a quote.',
    disclaimerNote:
      'It does not replace professional, legal, architectural or technical advice. Always confirm important details directly with the contractor or a qualified professional before signing or paying.',
    resultCta: 'See what to clarify',
    reviewTitle: 'Before you decide',
    reviewCta: 'See questions',
    questionsCta: 'Paste reply',
    categoryLabels: {
      confirmed: '🟢 Confirmed',
      needsClarification: '🟡 Needs clarification',
      risks: '🔴 Risks',
    },
    comparison: {
      title: 'RenoPilot recommendation',
      recommendationLabel: 'Best option to continue with',
      detailsTitle: 'Why this option',
      whyThisOne: '🟢 Why this one',
      stillUnclear: '🟡 Still unclear',
      beCareful: '🔴 Be careful with',
    },
    fallbackWarning: 'Showing an example review because the LLM is not available.',
    analysisError: 'We could not generate a real review right now. Showing an example so you can keep testing.',
    vendorFallback: 'This review is in fallback/mock mode.',
    vendorError: 'We could not update the recommendation with AI. Showing an example so you can keep testing.',
  },
  pl: {
    prototypeNote:
      'RenoPilot to wczesny prototyp. Pomaga wychwycić niejasne punkty i przygotować lepsze pytania przed zaakceptowaniem wyceny.',
    disclaimerNote:
      'Nie zastępuje porady profesjonalnej, prawnej, architektonicznej ani technicznej. Przed podpisaniem umowy lub płatnością zawsze potwierdź ważne szczegóły bezpośrednio z wykonawcą albo odpowiednim specjalistą.',
    resultCta: 'Zobacz, co wyjaśnić',
    reviewTitle: 'Przed decyzją',
    reviewCta: 'Zobacz pytania',
    questionsCta: 'Wklej odpowiedź',
    categoryLabels: {
      confirmed: '🟢 Potwierdzone',
      needsClarification: '🟡 Do wyjaśnienia',
      risks: '🔴 Ryzyka',
    },
    comparison: {
      title: 'Rekomendacja RenoPilot',
      recommendationLabel: 'Najlepsza opcja do dalszej rozmowy',
      detailsTitle: 'Dlaczego ta opcja',
      whyThisOne: '🟢 Dlaczego ta',
      stillUnclear: '🟡 Nadal niejasne',
      beCareful: '🔴 Uważaj na',
    },
    fallbackWarning: 'Pokazujemy przykładową analizę, ponieważ LLM nie jest dostępny.',
    analysisError: 'Nie udało się teraz wygenerować prawdziwej analizy. Pokazujemy przykład, aby można było kontynuować test.',
    vendorFallback: 'Ta analiza działa w trybie fallback/mock.',
    vendorError: 'Nie udało się zaktualizować rekomendacji z AI. Pokazujemy przykład, aby można było kontynuować test.',
  },
};

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

  const fallbackQuoteAnalysis = useMemo(() => buildFallbackQuoteAnalysis(content), [content]);
  const activeAnalysis = analysis ?? fallbackQuoteAnalysis;
  const activeUpdatedAnalysis = updatedAnalysis ?? buildFallbackUpdatedRecommendation(content);
  const isComparison = activeAnalysis.mode === 'quote_comparison';
  const comparisonSummary = activeAnalysis.comparison ?? {
    recommendedQuote: activeAnalysis.recommendedVendor || activeAnalysis.verdict.title,
    oneLineReason: activeAnalysis.verdict.summary,
    whyThisOne: activeAnalysis.infoCategories.confirmed,
    stillUnclear: activeAnalysis.infoCategories.needsClarification,
    beCareful: activeAnalysis.infoCategories.risks,
  };

  const resultContent = {
    title: content.result.title,
    status: `${levelIcon(activeAnalysis.verdict.level)} ${activeAnalysis.verdict.title}`,
    explanation: activeAnalysis.verdict.summary,
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
    categories: activeAnalysis.infoCategories,
    categoryLabels: copy.categoryLabels,
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
    cta: copy.reviewCta,
  };

  const questionsContent = {
    ...content.questions,
    title: activeAnalysis.vendorQuestions.title || content.questions.title,
    message: activeAnalysis.vendorQuestions.messageToSend,
    messagesByVendor: activeAnalysis.vendorQuestions.messagesByVendor,
    cta: copy.questionsCta,
  };

  const updatedContent = {
    ...content.updatedRecommendation,
    status: `${levelIcon(activeUpdatedAnalysis.updatedVerdict.level)} ${activeUpdatedAnalysis.updatedVerdict.title}`,
    explanation: activeUpdatedAnalysis.updatedVerdict.summary,
    nextActionTitle: activeUpdatedAnalysis.nextAction.title,
    nextAction: activeUpdatedAnalysis.nextAction.summary,
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
          content={content.checking}
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
          onSubmit={handleVendorReply}
        />
      )}
      {screen === 'updated' && <UpdatedRecommendationScreen content={updatedContent} />}
    </AppShell>
  );
}
