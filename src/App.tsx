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

type InputMode = 'written_quote' | 'verbal_estimate' | 'contractor_reply';

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
    items: ['Leyendo el presupuesto', 'Detectando puntos poco claros', 'Revisando posibles costes extra', 'Preparando preguntas'],
    slowMessage: 'Está tardando más de lo normal. Estamos terminando la revisión.',
  },
  en: {
    items: ['Reading the quote', 'Spotting unclear points', 'Checking possible extra costs', 'Preparing questions'],
    slowMessage: 'This is taking longer than usual. We are finishing the review.',
  },
  pl: {
    items: ['Czytanie wyceny', 'Wykrywanie niejasnych punktów', 'Sprawdzanie możliwych dodatkowych kosztów', 'Przygotowywanie pytań'],
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
        'Esto se ha hablado solo por teléfono, así que los puntos importantes no están por escrito. Antes de aceptar o pagar, pide al profesional que confirme la oferta por escrito.',
      confirmed: ['Hay una estimación verbal inicial.', 'El siguiente paso está claro: pedir confirmación por escrito.'],
      section: 'Qué pedir por escrito',
      items: [
        ['Precio final y si incluye IVA', 'Sin precio final por escrito, el coste puede cambiar o generar discusión después.', '¿Cuál es el precio final y está incluido el IVA?', 'cost'],
        ['Alcance exacto del trabajo', 'Si el alcance no está detallado, puede haber malentendidos sobre qué está incluido.', '¿Qué trabajo exacto está incluido?', 'scope'],
        ['Detalles del producto/material', 'Sin modelo, marca o características, el resultado puede no coincidir con lo esperado.', '¿Qué producto, modelo, material o características exactas incluye la oferta?', 'quality'],
        ['Fecha de entrega/instalación', 'Sin plazo por escrito, será difícil planificar o reclamar retrasos.', '¿Cuál es la fecha prevista de entrega o instalación?', 'time'],
        ['Garantía', 'Sin garantía clara, no sabes qué pasa si algo falla después.', '¿Qué garantía tiene el producto y la instalación?', 'dispute'],
        ['Forma de pago', 'Sin condiciones de pago claras, puedes pagar demasiado pronto o sin protección suficiente.', '¿Cuál es la forma de pago y cuándo se paga cada parte?', 'payment'],
      ] as Array<[string, string, string, ClarificationItem['consequence_type']]>,
      priceTitle: 'No todavía',
      priceSummary: 'Una estimación verbal no permite juzgar bien el precio. Primero hace falta una oferta escrita con desglose básico.',
      priceNext: 'Pide precio final, IVA, alcance, producto, instalación, plazo, garantía y forma de pago por escrito.',
      questionsTitle: 'Mensaje para pedir presupuesto por escrito',
      message: `Hola, gracias por la llamada. Antes de confirmar, ¿podrías enviarme la oferta por escrito?\n\nPor favor incluye:\n- precio final y si incluye IVA\n- alcance exacto del trabajo\n- detalles del producto/material\n- si la instalación está incluida\n- fecha de entrega/instalación\n- garantía\n- forma de pago\n- cualquier cosa no incluida o posible extra\n\nGracias.`,
    },
    en: {
      title: 'Not ready to accept yet',
      summary:
        'This was only discussed by phone, so the key terms are not written down. Before accepting or paying, ask the contractor to confirm the offer in writing.',
      confirmed: ['There is an initial verbal estimate.', 'The next step is clear: ask for written confirmation.'],
      section: 'What to confirm in writing',
      items: [
        ['Final price and whether VAT is included', 'Without a final written price, the cost may change or create a dispute later.', 'What is the final price, and is VAT included?', 'cost'],
        ['Exact scope of work', 'If the scope is not detailed, there may be misunderstandings about what is included.', 'What exact work is included?', 'scope'],
        ['Product/material details', 'Without model, brand or characteristics, the final result may not match what you expect.', 'What exact product, model, material or characteristics are included?', 'quality'],
        ['Delivery / installation date', 'Without a written timeline, it is harder to plan or challenge delays.', 'What is the expected delivery or installation date?', 'time'],
        ['Warranty', 'Without clear warranty terms, you do not know what happens if something fails later.', 'What warranty applies to the product and installation?', 'dispute'],
        ['Payment terms', 'Without clear payment terms, you may pay too early or without enough protection.', 'What are the payment terms and when is each part due?', 'payment'],
      ] as Array<[string, string, string, ClarificationItem['consequence_type']]>,
      priceTitle: 'No, not yet',
      priceSummary: 'A verbal estimate is not enough to judge the price properly. First, you need a written offer with a basic breakdown.',
      priceNext: 'Ask for final price, VAT, scope, product, installation, timeline, warranty and payment terms in writing.',
      questionsTitle: 'Message to request written quote',
      message: `Hi, thanks for the call. Before confirming, could you please send me the offer in writing?\n\nPlease include:\n- final price and whether VAT is included\n- exact scope of work\n- product/material details\n- whether installation is included\n- delivery/installation date\n- warranty\n- payment terms\n- anything not included or possible extras\n\nThank you.`,
    },
    pl: {
      title: 'To nie jest jeszcze gotowe do akceptacji',
      summary:
        'To było omówione tylko przez telefon, więc najważniejsze warunki nie są zapisane. Przed akceptacją lub płatnością poproś wykonawcę o potwierdzenie oferty na piśmie.',
      confirmed: ['Istnieje wstępna ustna wycena.', 'Następny krok jest jasny: poprosić o potwierdzenie na piśmie.'],
      section: 'Co potwierdzić na piśmie',
      items: [
        ['Cena końcowa i czy zawiera VAT', 'Bez końcowej ceny na piśmie koszt może się zmienić albo spowodować późniejszy spór.', 'Jaka jest końcowa cena i czy zawiera VAT?', 'cost'],
        ['Dokładny zakres prac', 'Jeśli zakres nie jest opisany, może dojść do nieporozumień, co jest w cenie.', 'Jaki dokładnie zakres prac jest w cenie?', 'scope'],
        ['Szczegóły produktu/materiałów', 'Bez modelu, marki lub parametrów efekt końcowy może nie odpowiadać oczekiwaniom.', 'Jaki dokładnie produkt, model, materiał lub parametry są uwzględnione?', 'quality'],
        ['Termin dostawy/montażu', 'Bez terminu na piśmie trudniej planować i reagować na opóźnienia.', 'Jaki jest przewidywany termin dostawy lub montażu?', 'time'],
        ['Gwarancja', 'Bez jasnej gwarancji nie wiadomo, co się stanie, jeśli coś później nie zadziała.', 'Jaka gwarancja obejmuje produkt i montaż?', 'dispute'],
        ['Warunki płatności', 'Bez jasnych płatności możesz zapłacić za wcześnie lub bez wystarczającej ochrony.', 'Jakie są warunki płatności i kiedy płaci się poszczególne części?', 'payment'],
      ] as Array<[string, string, string, ClarificationItem['consequence_type']]>,
      priceTitle: 'Nie, jeszcze nie',
      priceSummary: 'Ustna wycena nie wystarcza, aby dobrze ocenić cenę. Najpierw potrzebna jest pisemna oferta z podstawowym zakresem.',
      priceNext: 'Poproś na piśmie o cenę końcową, VAT, zakres, produkt, montaż, termin, gwarancję i warunki płatności.',
      questionsTitle: 'Wiadomość z prośbą o pisemną ofertę',
      message: `Dzień dobry, dziękuję za rozmowę. Przed potwierdzeniem proszę o przesłanie oferty na piśmie.\n\nProszę uwzględnić:\n- końcową cenę i informację, czy zawiera VAT\n- dokładny zakres prac\n- szczegóły produktu/materiałów\n- czy montaż jest w cenie\n- termin dostawy/montażu\n- gwarancję\n- warunki płatności\n- ewentualne rzeczy nieujęte w cenie lub dodatkowe koszty\n\nDziękuję.`,
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
      beCareful: ['A verbal estimate cannot be fully checked. Request written confirmation before accepting.'],
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
      risks: ['A verbal estimate cannot be fully checked. The next best step is to request written confirmation.'],
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
    assumptions: ['No written quote has been provided yet.'],
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
    setDecisionContext(input.decisionContext);
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
        decisionContext: input.decisionContext,
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
