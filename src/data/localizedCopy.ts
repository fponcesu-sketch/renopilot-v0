import type { Language } from './quoteCheckContent';
import type { ClarificationItem } from '../types/analysis';

export const localizedCopy: Record<Language, {
  prototypeNote: string;
  disclaimerNote: string;
  resultCta: string;
  reviewTitle: string;
  reviewCta: string;
  questionsCta: string;
  consequenceLabel: string;
  questionLabel: string;
  priceSanityTitle: string;
  priceNextStepLabel: string;
  consequenceLabels: Record<ClarificationItem['consequence_type'], string>;
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
    conditionalSuffix: string;
  };
  fallbackWarning: string;
  analysisError: string;
  vendorFallback: string;
  vendorError: string;
}> = {
  es: {
    prototypeNote:
      'Pega lo que te ha enviado el profesional. RenoPilot revisa lo que está claro, lo que falta y qué preguntar antes de aceptar.',
    disclaimerNote:
      'RenoPilot no sustituye el asesoramiento profesional, legal, arquitectónico o técnico. Confirma siempre los puntos importantes directamente con el profesional antes de firmar o pagar.',
    resultCta: 'Continuar',
    reviewTitle: 'Revisión del presupuesto',
    reviewCta: 'Generar preguntas',
    questionsCta: 'Revisar respuesta del profesional',
    consequenceLabel: 'Por qué importa',
    questionLabel: 'Pregunta',
    priceSanityTitle: '¿Podemos juzgar el precio?',
    priceNextStepLabel: 'Antes de aceptar',
    consequenceLabels: {
      cost: 'coste',
      time: 'plazo',
      quality: 'calidad',
      scope: 'alcance',
      payment: 'pago',
      dispute: 'disputa',
      decision_pressure: 'presión',
    },
    categoryLabels: {
      confirmed: '🟢 Confirmado',
      needsClarification: '🟡 A aclarar',
      risks: '🔴 Riesgos',
    },
    comparison: {
      title: 'Revisión RenoPilot',
      recommendationLabel: 'Probable mejor opción — aclara antes de aceptar',
      detailsTitle: 'Por qué la elegimos — y qué revisar primero',
      whyThisOne: 'Por qué parece fuerte',
      stillUnclear: 'Puntos a aclarar',
      beCareful: 'Riesgo principal',
      conditionalSuffix: 'No está listo para aceptar hasta confirmar por escrito los puntos importantes.',
    },
    fallbackWarning: 'No hemos podido completar la revisión automática. Puedes probar de nuevo o copiar el texto de otra forma.',
    analysisError: 'No hemos podido completar la revisión automática. Prueba de nuevo o copia el texto del presupuesto.',
    vendorFallback: 'No hemos podido verificar la respuesta automáticamente. Revisa los puntos pendientes antes de aceptar.',
    vendorError: 'No hemos podido actualizar la revisión. Prueba de nuevo o revisa la respuesta manualmente.',
  },
  en: {
    prototypeNote:
      'Paste what the contractor sent you. RenoPilot checks what is clear, what is missing, and what to ask before accepting.',
    disclaimerNote:
      'RenoPilot does not replace professional, legal, architectural or technical advice. Always confirm important details directly with the contractor or a qualified professional before signing or paying.',
    resultCta: 'Continue',
    reviewTitle: 'Quote review',
    reviewCta: 'Generate questions',
    questionsCta: 'Check contractor reply',
    consequenceLabel: 'Why it matters',
    questionLabel: 'Question',
    priceSanityTitle: 'Can we judge the price?',
    priceNextStepLabel: 'Before accepting',
    consequenceLabels: {
      cost: 'cost',
      time: 'time',
      quality: 'quality',
      scope: 'scope',
      payment: 'payment',
      dispute: 'dispute',
      decision_pressure: 'pressure',
    },
    categoryLabels: {
      confirmed: '🟢 Confirmed',
      needsClarification: '🟡 Needs clarification',
      risks: '🔴 Risks',
    },
    comparison: {
      title: 'RenoPilot Review',
      recommendationLabel: 'Likely best value — clarify before accepting',
      detailsTitle: 'Why we picked this — and what to check first',
      whyThisOne: 'Why it looks strong',
      stillUnclear: 'Points to clarify',
      beCareful: 'Main risk',
      conditionalSuffix: 'It is not ready to accept until the important points are confirmed in writing.',
    },
    fallbackWarning: 'We could not complete the automatic review. Try again or paste the text another way.',
    analysisError: 'We could not complete the automatic review. Try again or paste the quote text.',
    vendorFallback: 'We could not verify the reply automatically. Review the open points before accepting.',
    vendorError: 'We could not update the review. Try again or review the reply manually.',
  },
  pl: {
    prototypeNote:
      'Wklej to, co wysłał wykonawca. RenoPilot sprawdzi, co jest jasne, czego brakuje i o co zapytać przed akceptacją.',
    disclaimerNote:
      'RenoPilot nie zastępuje porady profesjonalnej, prawnej, architektonicznej ani technicznej. Przed podpisaniem umowy lub płatnością zawsze potwierdź ważne szczegóły bezpośrednio z wykonawcą albo odpowiednim specjalistą.',
    resultCta: 'Dalej',
    reviewTitle: 'Sprawdzenie oferty',
    reviewCta: 'Wygeneruj pytania',
    questionsCta: 'Sprawdź odpowiedź wykonawcy',
    consequenceLabel: 'Dlaczego to ważne',
    questionLabel: 'Pytanie',
    priceSanityTitle: 'Czy da się ocenić cenę?',
    priceNextStepLabel: 'Przed akceptacją',
    consequenceLabels: {
      cost: 'koszt',
      time: 'termin',
      quality: 'jakość',
      scope: 'zakres',
      payment: 'płatność',
      dispute: 'spór',
      decision_pressure: 'presja',
    },
    categoryLabels: {
      confirmed: '🟢 Jasne',
      needsClarification: '🟡 Do doprecyzowania',
      risks: '🔴 Ryzyka',
    },
    comparison: {
      title: 'Sprawdzenie RenoPilot',
      recommendationLabel: 'Prawdopodobnie najlepsza opcja — doprecyzuj przed akceptacją',
      detailsTitle: 'Dlaczego ta opcja — i co sprawdzić najpierw',
      whyThisOne: 'Co wygląda dobrze',
      stillUnclear: 'Co doprecyzować',
      beCareful: 'Główne ryzyko',
      conditionalSuffix: 'Nie warto akceptować, dopóki ważne punkty nie zostaną potwierdzone na piśmie.',
    },
    fallbackWarning: 'Nie udało się ukończyć automatycznej analizy. Spróbuj ponownie albo wklej tekst w inny sposób.',
    analysisError: 'Nie udało się ukończyć automatycznej analizy. Spróbuj ponownie albo wklej tekst oferty.',
    vendorFallback: 'Nie udało się automatycznie sprawdzić odpowiedzi. Przejrzyj otwarte punkty przed akceptacją.',
    vendorError: 'Nie udało się zaktualizować analizy. Spróbuj ponownie albo sprawdź odpowiedź ręcznie.',
  },
};
