import { useLayoutEffect, useMemo, useState } from 'react';
import { AppShell } from './components/AppShell';
import { CheckingScreen } from './components/CheckingScreen';
import { ComparisonDetailsScreen } from './components/ComparisonDetailsScreen';
import { ComparisonResultScreen } from './components/ComparisonResultScreen';
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
    items: ['Leyendo lo que has pegado', 'Detectando puntos poco claros', 'Revisando posibles costes extra', 'Preparando preguntas'],
    slowMessage: 'Está tardando más de lo normal. Estamos terminando la revisión.',
  },
  en: {
    items: ['Reading what you shared', 'Spotting unclear points', 'Checking possible extra costs', 'Preparing questions'],
    slowMessage: 'This is taking longer than usual. We are finishing the review.',
  },
  pl: {
    items: ['Czytanie tego, co wkleiłeś', 'Wykrywanie niejasnych punktów', 'Sprawdzanie możliwych dodatkowych kosztów', 'Przygotowywanie pytań'],
    slowMessage: 'To trwa dłużej niż zwykle. Kończymy analizę.',
  },
};

function normalizeProductName(value: string) {
  return value.replace(/\bRENOPILOT\b|\bRenopilot\b|\brenoPilot\b|\brenopilot\b|\bReno Pilot\b/g, 'RenoPilot');
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

function buildVerbalEstimateAnalysis(language: Language): QuoteAnalysis {
  const content = {
    es: {
      title: 'No está listo para aceptar todavía',
      summary:
        'Los puntos clave no están por escrito. Una estimación verbal puede generar malentendidos sobre precio, alcance, IVA, plazos o garantía.',
      confirmed: ['Hay una estimación verbal inicial.', 'El siguiente paso es pedir confirmación por escrito.'],
      section: 'Qué pedir por escrito',
      items: [
        ['Precio final con IVA', 'Sin precio final por escrito, el coste puede cambiar o generar discusión después.', '¿Me puedes confirmar el precio final con IVA?', 'cost'],
        ['Qué incluye exactamente', 'Si el alcance no está claro, puede haber malentendidos sobre qué está incluido.', '¿Qué incluye exactamente la oferta?', 'scope'],
        ['Plazo', 'Sin plazo por escrito, será difícil planificar o reclamar retrasos.', '¿Cuándo podrías hacerlo?', 'time'],
        ['Garantía', 'Sin garantía clara, no sabes qué pasa si algo falla después.', '¿Qué garantía tendría?', 'dispute'],
      ] as Array<[string, string, string, ClarificationItem['consequence_type']]>,
      priceTitle: 'No todavía',
      priceSummary: 'No se puede juzgar bien el precio solo con una estimación verbal.',
      priceNext: 'Pide al profesional que confirme los básicos por escrito antes de aceptar o pagar.',
      questionsTitle: 'Mensaje para confirmar por escrito',
      message: 'Gracias. Antes de confirmar, ¿me puedes pasar el precio final con IVA, qué incluye exactamente, cuándo podrías hacerlo y qué garantía tendría?',
      risk: 'Una estimación verbal no se puede comprobar del todo. Pide confirmación por escrito antes de aceptar.',
      assumption: 'El usuario solo tiene una estimación verbal o notas de memoria.',
    },
    en: {
      title: 'Not ready to accept yet',
      summary:
        'Key details are not written down. A verbal estimate can easily lead to misunderstandings about price, scope, VAT, timing or warranty.',
      confirmed: ['There is an initial verbal estimate.', 'The next step is to ask for written confirmation.'],
      section: 'What to confirm in writing',
      items: [
        ['Final price with VAT', 'Without a final written price, the cost may change or create a dispute later.', 'Could you confirm the final price with VAT?', 'cost'],
        ['What exactly is included', 'If the scope is not clear, there may be misunderstandings about what is included.', 'What exactly is included?', 'scope'],
        ['Timing', 'Without a written timeline, it is harder to plan or challenge delays.', 'When could you do it?', 'time'],
        ['Warranty', 'Without clear warranty terms, you do not know what happens if something fails later.', 'What warranty applies?', 'dispute'],
      ] as Array<[string, string, string, ClarificationItem['consequence_type']]>,
      priceTitle: 'No, not yet',
      priceSummary: 'A verbal estimate is not enough to judge the price properly.',
      priceNext: 'Ask the contractor to confirm the basics in writing before accepting or paying.',
      questionsTitle: 'Message to confirm in writing',
      message: 'Thanks. Before I confirm, could you send me the final price with VAT, what exactly is included, when you could do it, and what warranty applies?',
      risk: 'A verbal estimate cannot be fully checked. Request written confirmation before accepting.',
      assumption: 'The user only has a verbal estimate or notes from memory.',
    },
    pl: {
      title: 'To nie jest jeszcze gotowe do akceptacji',
      summary:
        'Najważniejsze informacje nie są zapisane. Ustna wycena łatwo prowadzi do nieporozumień o cenie, zakresie, VAT, terminie albo gwarancji.',
      confirmed: ['Istnieje wstępna ustna wycena.', 'Następny krok to prośba o potwierdzenie na piśmie.'],
      section: 'Co potwierdzić na piśmie',
      items: [
        ['Cena końcowa z VAT', 'Bez ceny końcowej na piśmie koszt może się zmienić albo spowodować późniejszy spór.', 'Możesz potwierdzić końcową cenę z VAT?', 'cost'],
        ['Co dokładnie jest w cenie', 'Jeśli zakres nie jest jasny, może dojść do nieporozumień, co jest uwzględnione.', 'Co dokładnie jest w cenie?', 'scope'],
        ['Termin', 'Bez terminu na piśmie trudniej planować i reagować na opóźnienia.', 'Kiedy możesz to zrobić?', 'time'],
        ['Gwarancja', 'Bez jasnej gwarancji nie wiadomo, co się stanie, jeśli coś później nie zadziała.', 'Jaka jest gwarancja?', 'dispute'],
      ] as Array<[string, string, string, ClarificationItem['consequence_type']]>,
      priceTitle: 'Nie, jeszcze nie',
      priceSummary: 'Ustna wycena nie wystarcza, aby dobrze ocenić cenę.',
      priceNext: 'Poproś wykonawcę o potwierdzenie podstawowych informacji na piśmie przed akceptacją lub płatnością.',
      questionsTitle: 'Wiadomość z prośbą o potwierdzenie',
      message: 'Dzięki. Zanim potwierdzę, możesz mi proszę wysłać końcową cenę z VAT, co dokładnie jest w cenie, kiedy możesz to zrobić i jaka jest gwarancja?',
      risk: 'Ustnej wyceny nie da się w pełni sprawdzić. Poproś o potwierdzenie na piśmie przed akceptacją.',
      assumption: 'Użytkownik ma tylko ustną wycenę albo notatki z pamięci.',
    },
  }[language];

  const clarificationItems = content.items.map(([title, consequence, question_to_ask, consequence_type]) => ({
    title,
    consequence,
    consequence_type,
    question_to_ask,
  }));

  return {
    verdict: {
      level: 'red',
      title: content.title,
      summary: content.summary,
    },
    mode: 'single_quote',
    recommendedVendor: '',
    comparison: {
      recommendedQuote: '',
      oneLineReason: content.summary,
      whyThisOne: content.confirmed,
      stillUnclear: clarificationItems.map((item) => item.title),
      beCareful: [content.risk],
    },
    clarificationItems,
    priceSanity: {
      status: 'no',
      title: content.priceTitle,
      summary: content.priceSummary,
      next_step: content.priceNext,
    },
    infoCategories: {
      confirmed: content.confirmed,
      needsClarification: [content.section],
      risks: [content.risk],
    },
    vendorQuestions: {
      title: content.questionsTitle,
      messageToSend: content.message,
      messagesByVendor: [
        {
          vendorName: content.questionsTitle,
          messageToSend: content.message,
        },
      ],
      questions: clarificationItems.map((item) => item.question_to_ask),
    },
    nextAction: {
      title: content.questionsTitle,
      summary: content.priceNext,
    },
    confidence: 'high',
    assumptions: [content.assumption],
  };
}

function buildInputContext(inputMode: InputMode, decisionContext: string) {
  const modeContext = {
    written_quote: 'Input type: written contractor quote or uploaded document. Run the normal quote completeness check.',
    informal_message: 'Input type: informal contractor communication such as WhatsApp/email estimate. Treat it as informal and check what is confirmed, what is vague, what might cost extra, and what to ask before confirming.',
    verbal_estimate: 'Input type: verbal estimate from memory. Do not treat as a written quote.',
  }[inputMode];

  return [modeContext, decisionContext.trim()].filter(Boolean).join('\n');
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
    inputMode: InputMode;
  }) => {
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
      const response = await analyzeQuote({
        decisionContext: inputContext,
        quoteText: input.quoteText,
        quoteDocuments: input.quoteDocuments,
        language,
      });

      if (response.source !== 'llm') {
        throw new Error('Quote analysis did not complete');
      }

      setAnalysis(response.analysis);
      setAnalysisSource(response.source);
      setAnalysisWarning('');
    } catch (error) {
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
      showLanguageSwitcher={showLanguageSwitcher}
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
        <ContractorQuestionsScreen content={questionsContent} language={language} onNext={() => setScreen('reply')} />
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
