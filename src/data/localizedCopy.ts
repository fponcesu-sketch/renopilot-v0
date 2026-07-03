import type { Language } from './quoteCheckContent';

export const localizedCopy: Record<Language, {
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
    reviewTitle: 'Antes de decidir',
    reviewCta: 'Ver preguntas',
    questionsCta: 'Pegar respuesta',
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
      stillUnclear: 'Aclara antes de aceptar',
      beCareful: 'Riesgo principal',
      conditionalSuffix: 'No está listo para aceptar hasta confirmar por escrito los puntos importantes.',
    },
    fallbackWarning: 'Mostramos una revisión de ejemplo porque el LLM no está disponible.',
    analysisError: 'No hemos podido generar una revisión real ahora. Mostramos un ejemplo para que puedas seguir probando.',
    vendorFallback: 'Esta revisión está en modo fallback/mock.',
    vendorError: 'No hemos podido actualizar la revisión con IA. Mostramos un ejemplo para seguir probando.',
  },
  en: {
    prototypeNote:
      'RenoPilot is an initial prototype. It helps you spot unclear points and prepare better questions before accepting a quote.',
    disclaimerNote:
      'RenoPilot does not replace professional, legal, architectural or technical advice. Always confirm important details directly with the contractor or a qualified professional before signing or paying.',
    resultCta: 'Prepare vendor questions',
    reviewTitle: 'Before you decide',
    reviewCta: 'See questions',
    questionsCta: 'Paste reply',
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
      stillUnclear: 'Clarify before accepting',
      beCareful: 'Main risk',
      conditionalSuffix: 'It is not ready to accept until the important points are confirmed in writing.',
    },
    fallbackWarning: 'Showing an example review because the LLM is not available.',
    analysisError: 'We could not generate a real review right now. Showing an example so you can keep testing.',
    vendorFallback: 'This review is in fallback/mock mode.',
    vendorError: 'We could not update the review with AI. Showing an example so you can keep testing.',
  },
  pl: {
    prototypeNote:
      'RenoPilot to wstępny prototyp. Pomaga wychwycić niejasne punkty i przygotować lepsze pytania przed zaakceptowaniem wyceny.',
    disclaimerNote:
      'RenoPilot nie zastępuje porady profesjonalnej, prawnej, architektonicznej ani technicznej. Przed podpisaniem umowy lub płatnością zawsze potwierdź ważne szczegóły bezpośrednio z wykonawcą albo odpowiednim specjalistą.',
    resultCta: 'Przygotuj pytania do wykonawcy',
    reviewTitle: 'Przed decyzją',
    reviewCta: 'Zobacz pytania',
    questionsCta: 'Wklej odpowiedź',
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
      stillUnclear: 'Wyjaśnij przed akceptacją',
      beCareful: 'Główne ryzyko',
      conditionalSuffix: 'Nie jest jeszcze gotowa do zaakceptowania, dopóki ważne punkty nie zostaną potwierdzone pisemnie.',
    },
    fallbackWarning: 'Pokazujemy przykładową analizę, ponieważ LLM nie jest dostępny.',
    analysisError: 'Nie udało się teraz wygenerować prawdziwej analizy. Pokazujemy przykład, aby można było kontynuować test.',
    vendorFallback: 'Ta analiza działa w trybie fallback/mock.',
    vendorError: 'Nie udało się zaktualizować analizy z AI. Pokazujemy przykład, aby można było kontynuować test.',
  },
};
