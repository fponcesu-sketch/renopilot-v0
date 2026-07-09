import { useLayoutEffect, useMemo, useState } from 'react';
import { AppShell } from './components/AppShell';
import { CheckingScreen } from './components/CheckingScreen';
import { ContractorQuestionsScreen } from './components/ContractorQuestionsScreen';
import { LandingScreen } from './components/LandingScreen';
import { ResultScreen } from './components/ResultScreen';
import { StartCheckScreen, type InputMode } from './components/StartCheckScreen';
import { ThingsToReviewScreen } from './components/ThingsToReviewScreen';
import { UpdatedRecommendationScreen } from './components/UpdatedRecommendationScreen';
import { VendorReplyScreen } from './components/VendorReplyScreen';
import { analyzeQuote, analyzeVendorReply } from './lib/apiClient';
import { buildFallbackQuoteAnalysis, buildFallbackUpdatedRecommendation, levelIcon } from './lib/fallbackAnalysis';
import { defaultLanguage, quoteCheckContent, type Language } from './data/quoteCheckContent';
import { localizedCopy } from './data/localizedCopy';
import type { AnalysisSource, ClarificationItem, QuoteAnalysis, QuoteDocument, UpdatedRecommendationAnalysis } from './types/analysis';

type Screen = 'landing' | 'start' | 'checking' | 'result' | 'review' | 'questions' | 'reply' | 'updated';

const screenOrder: Screen[] = ['landing', 'start', 'checking', 'result', 'review', 'questions', 'reply', 'updated'];

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
    items: ['Leyendo lo que has pegado', 'Detectando puntos poco claros', 'Revisando posibles costes extra', 'Preparando preguntas'],
    slowMessage: 'Seguimos revisando. Puede tardar unos segundos más.',
  },
  en: {
    items: ['Reading what you shared', 'Spotting unclear points', 'Checking possible extra costs', 'Preparing questions'],
    slowMessage: 'Still checking. This can take a few more seconds.',
  },
  pl: {
    items: ['Czytanie tego, co wkleiłeś', 'Wykrywanie niejasnych punktów', 'Sprawdzanie możliwych dodatkowych kosztów', 'Przygotowywanie pytań'],
    slowMessage: 'Nadal sprawdzamy. To może potrwać jeszcze kilka sekund.',
  },
};

function normalizeProductName(value = '') {
  return value.replace(/\bRENOPILOT\b|\bRenopilot\b|\brenoPilot\b|\brenopilot\b|\bReno Pilot\b/g, 'RenoPilot');
}

function normalizeTextList(items: string[] = []) {
  return items.map((item) => normalizeProductName(item));
}

function normalizeClarificationItems(items: ClarificationItem[] = []) {
  return items.map((item) => ({
    ...item,
    title: normalizeProductName(item.title),
    consequence: normalizeProductName(item.consequence),
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

function buildInputContext(inputMode: InputMode, decisionContext: string) {
  const modeContext = {
    written_quote: 'Input type: written contractor quote or uploaded document. Run the normal quote completeness check.',
    informal_message: 'Input type: informal contractor communication such as WhatsApp/email estimate. Treat it as informal and check what is confirmed, what is vague, what might cost extra, and what to ask before confirming.',
    verbal_estimate: 'Input type: verbal estimate from memory. Do not treat as a written quote.',
  }[inputMode];

  return [modeContext, decisionContext.trim()].filter(Boolean).join('\n');
}

function buildVerbalEstimateAnalysis(language: Language): QuoteAnalysis {
  const copy = {
    es: {
      title: 'No está listo para aceptar todavía',
      summary: 'Una estimación verbal o de memoria necesita confirmación por escrito antes de aceptar.',
      confirmed: ['Hay una estimación inicial.', 'El siguiente paso es pedir confirmación por escrito.'],
      questionsTitle: 'Mensaje para confirmar por escrito',
      message: 'Gracias. Antes de confirmar, ¿me puedes pasar el precio final con IVA, qué incluye exactamente, cuándo podrías hacerlo y qué garantía tendría?',
    },
    en: {
      title: 'Not ready to accept yet',
      summary: 'A verbal or memory-based estimate needs written confirmation before accepting.',
      confirmed: ['There is an initial estimate.', 'The next step is to ask for written confirmation.'],
      questionsTitle: 'Message to confirm in writing',
      message: 'Thanks. Before I confirm, could you send me the final price with VAT, what exactly is included, when you could do it, and what warranty applies?',
    },
    pl: {
      title: 'To nie jest jeszcze gotowe do akceptacji',
      summary: 'Ustna wycena albo notatka z pamięci wymaga potwierdzenia na piśmie przed akceptacją.',
      confirmed: ['Istnieje wstępna wycena.', 'Następny krok to prośba o potwierdzenie na piśmie.'],
      questionsTitle: 'Wiadomość z prośbą o potwierdzenie',
      message: 'Dzięki. Zanim potwierdzę, możesz mi proszę wysłać końcową cenę z VAT, co dokładnie jest w cenie, kiedy możesz to zrobić i jaka jest gwarancja?',
    },
  }[language];

  const clarificationItems: ClarificationItem[] = [
    { title: 'Precio final con IVA', consequence: 'Sin precio final por escrito, el coste puede cambiar.', consequence_type: 'cost', question_to_ask: '¿Me puedes confirmar el precio final con IVA?' },
    { title: 'Qué incluye exactamente', consequence: 'Si el alcance no está claro, pueden aparecer extras.', consequence_type: 'scope', question_to_ask: '¿Qué incluye exactamente la oferta?' },
    { title: 'Plazo', consequence: 'Sin plazo por escrito, es difícil planificar.', consequence_type: 'time', question_to_ask: '¿Cuándo podrías hacerlo?' },
    { title: 'Garantía', consequence: 'Sin garantía clara, no sabes qué pasa si algo falla.', consequence_type: 'dispute', question_to_ask: '¿Qué garantía tendría?' },
  ];

  return {
    verdict: { level: 'red', title: copy.title, summary: copy.summary },
    mode: 'single_quote',
    recommendedVendor: '',
    comparison: {
      recommendedQuote: '',
      oneLineReason: copy.summary,
      whyThisOne: copy.confirmed,
      stillUnclear: clarificationItems.map((item) => item.title),
      beCareful: [copy.summary],
    },
    clarificationItems,
    priceSanity: {
      status: 'no',
      title: 'No todavía',
      summary: copy.summary,
      next_step: copy.message,
    },
    infoCategories: {
      confirmed: copy.confirmed,
      needsClarification: clarificationItems.map((item) => item.title),
      risks: [copy.summary],
    },
    vendorQuestions: {
      title: copy.questionsTitle,
      messageToSend: copy.message,
      messagesByVendor: [{ vendorName: copy.questionsTitle, messageToSend: copy.message }],
      questions: clarificationItems.map((item) => item.question_to_ask),
    },
    nextAction: { title: copy.questionsTitle, summary: copy.message },
    confidence: 'high',
    assumptions: ['The user only has a verbal estimate or notes from memory.'],
  };
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
  const showLanguageSwitcher = screen === 'landing' || (screen === 'start' && !analysis && !isAnalyzing);
  const checkingContent = { ...content.checking, items: checkingCopy[language].items, slowMessage: checkingCopy[language].slowMessage };

  const fallbackQuoteAnalysis = useMemo(() => buildFallbackQuoteAnalysis(content), [content]);
  const activeAnalysis = analysis ?? fallbackQuoteAnalysis;
  const activeUpdatedAnalysis = updatedAnalysis ?? buildFallbackUpdatedRecommendation(content);
  const clarificationItems = activeAnalysis.clarificationItems?.length
    ? normalizeClarificationItems(activeAnalysis.clarificationItems)
    : fallbackClarificationItems([...activeAnalysis.infoCategories.needsClarification, ...activeAnalysis.infoCategories.risks]);

  const resultContent = {
    title: normalizeProductName(content.result.title),
    status: `${levelIcon(activeAnalysis.verdict.level)} ${normalizeProductName(activeAnalysis.verdict.title)}`,
    explanation: normalizeProductName(activeAnalysis.verdict.summary),
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
    priceSanity: activeAnalysis.priceSanity
      ? {
          ...activeAnalysis.priceSanity,
          title: normalizeProductName(activeAnalysis.priceSanity.title),
          summary: normalizeProductName(activeAnalysis.priceSanity.summary),
          next_step: normalizeProductName(activeAnalysis.priceSanity.next_step),
        }
      : undefined,
    priceSanityTitle: copy.priceSanityTitle,
    priceNextStepLabel: copy.priceNextStepLabel,
    categoryLabels: copy.categoryLabels,
    consequenceLabels: copy.consequenceLabels,
    consequenceLabel: copy.consequenceLabel,
    questionLabel: copy.questionLabel,
    cta: copy.reviewCta,
  };

  const messagesByVendor = activeAnalysis.vendorQuestions.messagesByVendor?.length
    ? activeAnalysis.vendorQuestions.messagesByVendor
    : [{ vendorName: activeAnalysis.vendorQuestions.title || content.questions.title, messageToSend: activeAnalysis.vendorQuestions.messageToSend }];

  const questionsContent = {
    ...content.questions,
    title: normalizeProductName(activeAnalysis.vendorQuestions.title || content.questions.title),
    message: normalizeProductName(activeAnalysis.vendorQuestions.messageToSend),
    messagesByVendor: messagesByVendor.map((message) => ({
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
      window.scrollTo({ top: 0, left: 0 });
      document.documentElement.scrollTop = 0;
      document.documentElement.scrollLeft = 0;
      document.body.scrollTop = 0;
      document.body.scrollLeft = 0;
      document.querySelector('.app-shell')?.scrollTo({ top: 0, left: 0 });
      document.querySelector('.phone-frame')?.scrollTo({ top: 0, left: 0 });
      document.querySelector('.screen-card')?.scrollTo({ top: 0, left: 0 });
    };

    resetScroll();
    window.requestAnimationFrame(resetScroll);
    window.setTimeout(resetScroll, 0);
    window.setTimeout(resetScroll, 120);
  }, [screen]);

  const goBack = () => {
    const currentIndex = screenOrder.indexOf(screen);
    if (currentIndex > 0) setScreen(screenOrder[currentIndex - 1]);
  };

  const handleStartCheck = async (input: { decisionContext: string; quoteText: string; quoteDocuments: QuoteDocument[]; inputMode: InputMode }) => {
    const inputContext = buildInputContext(input.inputMode, input.decisionContext);

    setDecisionContext(inputContext);
    setQuoteText(input.quoteText);
    setQuoteDocuments(input.quoteDocuments);
    setAnalysis(null);
    setUpdatedAnalysis(null);
    setAnalysisWarning('');
    setStartError('');

    if (input.inputMode === 'verbal_estimate') {
      setAnalysis(buildVerbalEstimateAnalysis(language));
      setAnalysisSource('llm');
      setScreen('result');
      return;
    }

    setIsAnalyzing(true);
    setScreen('checking');

    try {
      const response = await analyzeQuote({ decisionContext: inputContext, quoteText: input.quoteText, quoteDocuments: input.quoteDocuments, language });
      if (response.source !== 'llm') throw new Error('Quote analysis did not complete');
      setAnalysis(response.analysis);
      setAnalysisSource(response.source);
      setAnalysisWarning('');
    } catch {
      setAnalysis(null);
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
      const response = await analyzeVendorReply({ decisionContext, quoteText, originalAnalysis: activeAnalysis, vendorReply, language });
      setUpdatedAnalysis(response.analysis);
      setAnalysisSource(response.source);
      setVendorReplyError(response.error || '');
      setScreen('updated');
    } catch {
      setUpdatedAnalysis(buildFallbackUpdatedRecommendation(content));
      setAnalysisSource('mock');
      setVendorReplyError(copy.vendorError);
      setScreen('updated');
    } finally {
      setIsAnalyzingVendorReply(false);
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
      showLanguageSwitcher={showLanguageSwitcher}
    >
      {screen === 'landing' && <LandingScreen content={content.landing} onStart={() => setScreen('start')} />}
      {screen === 'start' && <StartCheckScreen content={content.startCheck} error={startError} language={language} note={copy.startCheckNote} onSubmit={handleStartCheck} />}
      {screen === 'checking' && <CheckingScreen content={checkingContent} error={analysisWarning} isReady={!isAnalyzing && Boolean(analysis)} onBack={goBack} onNext={() => setScreen('result')} />}
      {screen === 'result' && <ResultScreen content={resultContent} onNext={() => setScreen('review')} />}
      {screen === 'review' && <ThingsToReviewScreen content={reviewContent} onNext={() => setScreen('questions')} />}
      {screen === 'questions' && <ContractorQuestionsScreen content={questionsContent} language={language} onNext={() => setScreen('reply')} />}
      {screen === 'reply' && (
        <VendorReplyScreen
          content={content.vendorReply}
          error={vendorReplyError}
          isLoading={isAnalyzingVendorReply}
          language={language}
          replyTargets={questionsContent.messagesByVendor}
          onSubmit={handleVendorReply}
        />
      )}
      {screen === 'updated' && <UpdatedRecommendationScreen content={updatedContent} />}
    </AppShell>
  );
}
