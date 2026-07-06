export type Language = 'es' | 'en' | 'pl';

export const defaultLanguage: Language = 'es';

export const languageOptions: Array<{ code: Language; label: string }> = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
  { code: 'pl', label: 'PL' },
];

export const quoteCheckContent = {
  es: {
    brand: 'RenoPilot',
    shell: {
      ariaLabel: 'Prototipo RenoPilot',
      backLabel: 'Volver',
      languageLabel: 'Idioma',
      phaseLabel: 'Fase',
      phases: ['Subir', 'Revisar', 'Preguntar', 'Decidir'],
    },
    landing: {
      eyebrow: 'Revisión rápida de presupuestos',
      headline: 'Revisa un presupuesto de obra antes de decir que sí.',
      subcopy:
        'Sube o copia aquí un presupuesto, mensaje de quien te pasó la oferta, captura o factura. RenoPilot te muestra qué falta, qué podría costar extra y qué preguntar antes de aceptar.',
      cta: 'Empezar revisión',
    },
    startCheck: {
      title: '¿Qué quieres revisar?',
      decisionLabel: '¿Qué quieres decidir?',
      decisionPlaceholder:
        'Ejemplo: Quiero saber si este presupuesto para reformar el baño está claro antes de pagar la señal.',
      quoteInputLabel: 'Presupuesto, mensaje o captura',
      quoteInputHint: 'Sube uno o varios PDFs, o copia el texto aquí. RenoPilot revisará el contenido disponible.',
      uploadCta: 'Subir archivo o captura',
      quotePlaceholder:
        'Copia aquí el texto del presupuesto, WhatsApp, email o factura que quieres revisar.',
      emailLabel: 'Email',
      emailHelper: 'Opcional, solo si quieres recibir el resultado o seguir más tarde.',
      emailPlaceholder: 'tu@email.com',
      cta: 'Revisar presupuesto',
    },
    checking: {
      title: 'RenoPilot está revisando:',
      items: [
        'detalles que faltan',
        'posibles costes extra',
        'condiciones de pago poco claras',
        'puntos poco claros',
        'preguntas que hacer antes de aceptar',
      ],
      cta: 'Ver resultado',
    },
    result: {
      title: 'Veredicto RenoPilot',
      status: '🟡 Buena pinta, pero pregunta antes de firmar',
      explanation:
        'No vemos señales fuertes de alarma, pero hay 4 puntos que conviene cerrar antes de firmar.',
      costExposure:
        'Posible coste extra: no calculable todavía. Falta confirmar IVA y electricidad.',
      biggestRiskTitle: 'Mayor riesgo',
      biggestRisk:
        'El IVA no está incluido y parte de la instalación eléctrica está pendiente de estudio.',
      nextActionTitle: 'Siguiente paso',
      nextAction: 'Envía estas preguntas antes de firmar o pagar la señal.',
      cta: 'Ver qué revisar',
    },
    review: {
      title: 'Qué revisar antes de aceptar',
      items: [
        'El IVA no está incluido.',
        'No aparece un plazo de ejecución.',
        'Parte de la instalación eléctrica está pendiente de estudio.',
        'El pago del 45% “a mitad de obra” no está definido.',
      ],
      cta: 'Ver preguntas para la empresa',
    },
    questions: {
      title: 'Mensaje para copiar y enviar',
      message: `Hola, gracias por el presupuesto. Antes de aceptar, ¿podéis confirmarme estos puntos por escrito?\n\n1. ¿Cuál será el precio final con IVA incluido?\n2. ¿Cuánto durará la obra?\n3. ¿Puede cambiar el precio de la instalación eléctrica?\n4. ¿Qué significa exactamente ‘mitad de obra’ para el segundo pago?\n\nGracias.`,
      copyCta: 'Copiar mensaje',
      copiedLabel: 'Mensaje copiado',
      cta: 'Ya lo he enviado / tengo respuesta',
    },
    vendorReply: {
      title: 'Añade la respuesta',
      label: 'Pega o adjunta aquí la respuesta',
      placeholder:
        'Copia aquí la respuesta que te han enviado para actualizar la recomendación.',
      cta: 'Actualizar recomendación',
    },
    updatedRecommendation: {
      status: '🟡 Todavía faltan puntos por cerrar',
      explanation:
        'Buena respuesta, pero aún falta confirmar por escrito el precio final con IVA y el criterio exacto del segundo pago.',
      nextActionTitle: 'Siguiente paso',
      nextAction: 'Pide confirmación escrita antes de pagar la señal.',
    },
  },
  en: {
    brand: 'RenoPilot',
    shell: {
      ariaLabel: 'RenoPilot prototype',
      backLabel: 'Back',
      languageLabel: 'Language',
      phaseLabel: 'Phase',
      phases: ['Upload', 'Review', 'Ask', 'Decide'],
    },
    landing: {
      eyebrow: 'Quick quote review',
      headline: 'Review a renovation quote before you say yes.',
      subcopy:
        'Upload or copy in a quote, message from the person who sent it, screenshot or invoice. RenoPilot shows what is missing, what could cost extra and what to ask before accepting.',
      cta: 'Start review',
    },
    startCheck: {
      title: 'What do you want to review?',
      decisionLabel: 'What do you want to decide?',
      decisionPlaceholder:
        'Example: I want to know if this bathroom renovation quote is clear before I pay the deposit.',
      quoteInputLabel: 'Quote, message or screenshot',
      quoteInputHint: 'Upload one or more PDFs, or copy the text here. RenoPilot will review the available content.',
      uploadCta: 'Upload file or screenshot',
      quotePlaceholder:
        'Copy the quote, WhatsApp, email or invoice text you want to review here.',
      emailLabel: 'Email',
      emailHelper: 'Optional, only if you want to receive the result or continue later.',
      emailPlaceholder: 'you@email.com',
      cta: 'Review quote',
    },
    checking: {
      title: 'RenoPilot is checking:',
      items: [
        'missing details',
        'possible extra costs',
        'unclear payment conditions',
        'unclear points',
        'questions to ask before accepting',
      ],
      cta: 'See result',
    },
    result: {
      title: 'RenoPilot verdict',
      status: '🟡 Looks OK, but ask before signing',
      explanation:
        'We do not see strong red flags, but there are 4 points worth closing before you sign.',
      costExposure:
        'Possible extra cost: not calculable yet. VAT and electrical work still need confirmation.',
      biggestRiskTitle: 'Biggest risk',
      biggestRisk:
        'VAT is not included and part of the electrical installation is still pending review.',
      nextActionTitle: 'Next step',
      nextAction: 'Send these questions before signing or paying the deposit.',
      cta: 'See what to review',
    },
    review: {
      title: 'What to check before accepting',
      items: [
        'VAT is not included.',
        'There is no execution timeline.',
        'Part of the electrical installation is still pending review.',
        'The 45% payment “halfway through the work” is not defined.',
      ],
      cta: 'See questions to send',
    },
    questions: {
      title: 'Message to copy and send',
      message: `Hi, thanks for the quote. Before accepting, could you please confirm these points in writing?\n\n1. What will the final price be including VAT?\n2. How long will the work take?\n3. Could the electrical installation price change?\n4. What exactly does “halfway through the work” mean for the second payment?\n\nThanks.`,
      copyCta: 'Copy message',
      copiedLabel: 'Message copied',
      cta: 'I sent it / I have a reply',
    },
    vendorReply: {
      title: 'Add the reply',
      label: 'Paste or attach the reply here',
      placeholder: 'Copy the reply they sent you here to update the recommendation.',
      cta: 'Update recommendation',
    },
    updatedRecommendation: {
      status: '🟡 There are still points to close',
      explanation:
        'Good reply, but the final price including VAT and the exact rule for the second payment still need written confirmation.',
      nextActionTitle: 'Next step',
      nextAction: 'Ask for written confirmation before paying the deposit.',
    },
  },
  pl: {
    brand: 'RenoPilot',
    shell: {
      ariaLabel: 'Prototyp RenoPilot',
      backLabel: 'Wróć',
      languageLabel: 'Język',
      phaseLabel: 'Etap',
      phases: ['Wgraj', 'Sprawdź', 'Zapytaj', 'Decyzja'],
    },
    landing: {
      eyebrow: 'Szybka weryfikacja wycen',
      headline: 'Sprawdź wycenę remontu, zanim powiesz tak.',
      subcopy:
        'Wgraj albo wklej wycenę, wiadomość od osoby lub firmy, która ją wysłała, zrzut ekranu albo fakturę. RenoPilot pokaże, czego brakuje, co może kosztować dodatkowo i o co zapytać przed akceptacją.',
      cta: 'Rozpocznij sprawdzanie',
    },
    startCheck: {
      title: 'Co chcesz sprawdzić?',
      decisionLabel: 'Jaką decyzję chcesz podjąć?',
      decisionPlaceholder:
        'Przykład: Chcę wiedzieć, czy ta wycena remontu łazienki jest jasna, zanim zapłacę zaliczkę.',
      quoteInputLabel: 'Wycena, wiadomość lub zrzut ekranu',
      quoteInputHint: 'Wgraj jeden lub więcej PDF-ów albo wklej tekst tutaj. RenoPilot sprawdzi dostępne treści.',
      uploadCta: 'Wgraj plik lub zrzut ekranu',
      quotePlaceholder:
        'Wklej tutaj tekst wyceny, WhatsAppa, e-maila albo faktury, którą chcesz sprawdzić.',
      emailLabel: 'Email',
      emailHelper: 'Opcjonalnie, tylko jeśli chcesz otrzymać wynik lub wrócić później.',
      emailPlaceholder: 'twoj@email.com',
      cta: 'Sprawdź wycenę',
    },
    checking: {
      title: 'RenoPilot sprawdza:',
      items: [
        'brakujące szczegóły',
        'możliwe dodatkowe koszty',
        'niejasne warunki płatności',
        'niejasne punkty',
        'pytania, które warto zadać przed akceptacją',
      ],
      cta: 'Zobacz wynik',
    },
    result: {
      title: 'Werdykt RenoPilot',
      status: '🟡 Wygląda dobrze, ale zapytaj przed podpisaniem',
      explanation:
        'Nie widzimy dużych sygnałów alarmowych, ale są 4 punkty, które warto zamknąć przed podpisaniem.',
      costExposure:
        'Możliwy dodatkowy koszt: nie da się jeszcze policzyć. Trzeba potwierdzić VAT i elektrykę.',
      biggestRiskTitle: 'Największe ryzyko',
      biggestRisk:
        'VAT nie jest wliczony, a część instalacji elektrycznej wymaga jeszcze sprawdzenia.',
      nextActionTitle: 'Następny krok',
      nextAction: 'Wyślij te pytania przed podpisaniem lub zapłatą zaliczki.',
      cta: 'Zobacz, co sprawdzić',
    },
    review: {
      title: 'Co sprawdzić przed akceptacją',
      items: [
        'VAT nie jest wliczony.',
        'Nie ma podanego terminu wykonania.',
        'Część instalacji elektrycznej wymaga jeszcze sprawdzenia.',
        'Płatność 45% „w połowie prac” nie jest dokładnie zdefiniowana.',
      ],
      cta: 'Zobacz pytania do wysłania',
    },
    questions: {
      title: 'Wiadomość do skopiowania i wysłania',
      message: `Dzień dobry, dziękuję za wycenę. Przed akceptacją proszę o pisemne potwierdzenie kilku punktów:\n\n1. Jaka będzie końcowa cena z VAT?\n2. Ile potrwają prace?\n3. Czy cena instalacji elektrycznej może się zmienić?\n4. Co dokładnie oznacza „połowa prac” przy drugiej płatności?\n\nDziękuję.`,
      copyCta: 'Kopiuj wiadomość',
      copiedLabel: 'Wiadomość skopiowana',
      cta: 'Wysłane / mam odpowiedź',
    },
    vendorReply: {
      title: 'Dodaj odpowiedź',
      label: 'Wklej lub załącz tutaj odpowiedź',
      placeholder: 'Wklej tutaj odpowiedź, którą dostałeś, aby zaktualizować rekomendację.',
      cta: 'Zaktualizuj rekomendację',
    },
    updatedRecommendation: {
      status: '🟡 Nadal są punkty do zamknięcia',
      explanation:
        'Dobra odpowiedź, ale końcowa cena z VAT i dokładna zasada drugiej płatności nadal wymagają pisemnego potwierdzenia.',
      nextActionTitle: 'Następny krok',
      nextAction: 'Poproś o pisemne potwierdzenie przed zapłatą zaliczki.',
    },
  },
} satisfies Record<Language, {
  brand: string;
  shell: {
    ariaLabel: string;
    backLabel: string;
    languageLabel: string;
    phaseLabel: string;
    phases: string[];
  };
  landing: {
    eyebrow: string;
    headline: string;
    subcopy: string;
    cta: string;
  };
  startCheck: {
    title: string;
    decisionLabel: string;
    decisionPlaceholder: string;
    quoteInputLabel: string;
    quoteInputHint: string;
    uploadCta: string;
    quotePlaceholder: string;
    emailLabel: string;
    emailHelper: string;
    emailPlaceholder: string;
    cta: string;
  };
  checking: {
    title: string;
    items: string[];
    cta: string;
  };
  result: {
    title: string;
    status: string;
    explanation: string;
    costExposure: string;
    biggestRiskTitle: string;
    biggestRisk: string;
    nextActionTitle: string;
    nextAction: string;
    cta: string;
  };
  review: {
    title: string;
    items: string[];
    cta: string;
  };
  questions: {
    title: string;
    message: string;
    copyCta: string;
    copiedLabel: string;
    cta: string;
  };
  vendorReply: {
    title: string;
    label: string;
    placeholder: string;
    cta: string;
  };
  updatedRecommendation: {
    status: string;
    explanation: string;
    nextActionTitle: string;
    nextAction: string;
  };
};
