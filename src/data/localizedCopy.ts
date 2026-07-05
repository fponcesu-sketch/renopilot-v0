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
      'RenoPilot es un prototipo inicial. Te ayuda a detectar aspectos que no están claros y a preparar mejores preguntas antes de aceptar un presupuesto.',
    disclaimerNote:
      'RenoPilot no sustituye el asesoramiento profesional, legal, arquitectónico o técnico. Confirma siempre los puntos importantes directamente con el profesional antes de firmar o pagar.',
    resultCta: 'Preparar preguntas para el proveedor',
    reviewTitle: 'Revisión del presupuesto',
    reviewCta: 'Ver preguntas',
    questionsCta: 'Pegar respuesta',
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
      title: 'RenoPilot Review',
      recommendationLabel: 'Probable mejor valor — aclara antes de aceptar',
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
      'RenoPilot is an initial prototype. It helps you spot unclear points and prepare better questions before accepting a quote.',
    disclaimerNote:
      'RenoPilot does not replace professional, legal, architectural or technical advice. Always confirm important details directly with the contractor or a qualified professional before signing or paying.',
    resultCta: 'Prepare vendor questions',
    reviewTitle: 'Quote review',
    reviewCta: 'See questions',
    questionsCta: 'Paste reply',
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
      'RenoPilot to wstępny prototyp. Pomaga wychwycić niejasne punkty i przygotować lepsze pytania przed zaakceptowaniem wyceny.',
    disclaimerNote:
      'RenoPilot nie zastępuje porady profesjonalnej, prawnej, architektonicznej ani technicznej. Przed podpisaniem umowy lub płatnością zawsze potwierdź ważne szczegóły bezpośrednio z wykonawcą albo odpowiednim specjalistą.',
    resultCta: 'Przygotuj pytania do wykonawcy',
    reviewTitle: 'Przegląd wyceny',
    reviewCta: 'Zobacz pytania',
    questionsCta: 'Wklej odpowiedź',
    consequenceLabel: 'Dlaczego to ważne',
    questionLabel: 'Pytanie',
    priceSanityTitle: 'Czy możemy ocenić cenę?',
    priceNextStepLabel: 'Przed akceptacją',
    consequenceLabels: {
      cost: 'koszt',
      time: 'czas',
      quality: 'jakość',
      scope: 'zakres',
      payment: 'płatność',
      dispute: 'spór',
      decision_pressure: 'presja',
    },
    categoryLabels: {
      confirmed: '🟢 Potwierdzone',
      needsClarification: '🟡 Do wyjaśnienia',
      risks: '🔴 Ryzyka',
    },
    comparison: {
      title: 'RenoPilot Review',
      recommendationLabel: 'Prawdopodobnie najlepsza wartość — wyjaśnij przed akceptacją',
      detailsTitle: 'Dlaczego ją wybraliśmy — i co najpierw sprawdzić',
      whyThisOne: 'Dlaczego wygląda mocno',
      stillUnclear: 'Punkty do wyjaśnienia',
      beCareful: 'Główne ryzyko',
      conditionalSuffix: 'Nie jest jeszcze gotowa do zaakceptowania, dopóki ważne punkty nie zostaną potwierdzone pisemnie.',
    },
    fallbackWarning: 'Nie udało się ukończyć automatycznej analizy. Spróbuj ponownie albo wklej tekst w inny sposób.',
    analysisError: 'Nie udało się ukończyć automatycznej analizy. Spróbuj ponownie albo wklej tekst wyceny.',
    vendorFallback: 'Nie udało się automatycznie sprawdzić odpowiedzi. Przejrzyj otwarte punkty przed akceptacją.',
    vendorError: 'Nie udało się zaktualizować analizy. Spróbuj ponownie albo sprawdź odpowiedź ręcznie.',
  },
};
