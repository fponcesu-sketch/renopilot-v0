export type Language = 'es' | 'en' | 'pl';

export const defaultLanguage: Language = 'es';

export const languageOptions: Array<{ code: Language; label: string }> = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
  { code: 'pl', label: 'PL' },
];

export const quoteCheckContent: Record<Language, {
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
}> = {
  es: {
    brand: 'RenoPilot',
    shell: {
      ariaLabel: 'RenoPilot',
      backLabel: 'Volver',
      languageLabel: 'Idioma',
      phaseLabel: 'Fase',
      phases: ['Subir', 'Revisar', 'Preguntar', 'Decidir'],
    },
    landing: {
      eyebrow: 'Revisión rápida de presupuestos',
      headline: 'Revisa un presupuesto de obra antes de decir que sí.',
      subcopy:
        'Pega o sube lo que te haya enviado el profesional. RenoPilot te ayuda a ver qué está claro, qué falta y qué preguntar antes de aceptar.',
      cta: 'Revisar un presupuesto',
    },
    startCheck: {
      title: '¿Qué quieres revisar?',
      decisionLabel: 'Contexto opcional',
      decisionPlaceholder:
        'Ejemplo: Quiero saber si este presupuesto está claro antes de pagar la señal.',
      quoteInputLabel: 'Pega o sube lo que tengas',
      quoteInputHint:
        'Pega un presupuesto, WhatsApp, email, texto de una captura o cualquier cosa que te haya dicho el profesional. No tiene que estar perfecto.',
      uploadCta: 'Subir archivo',
      quotePlaceholder:
        'Pega aquí lo que tengas. RenoPilot extrae lo que puede y te pedirá solo lo esencial que falte.',
      emailLabel: 'Email',
      emailHelper: 'Opcional, solo si quieres recibir el resultado o seguir más tarde.',
      emailPlaceholder: 'tu@email.com',
      cta: 'Revisar este presupuesto',
    },
    checking: {
      title: 'RenoPilot está revisando:',
      items: [
        'lo que está claro',
        'lo que falta',
        'posibles costes extra',
        'puntos poco claros',
        'preguntas útiles para enviar',
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
      cta: 'Generar preguntas',
    },
    questions: {
      title: 'Mensaje para enviar',
      message: `Gracias. Antes de confirmar, ¿me puedes pasar el precio final con IVA, qué incluye exactamente, cuándo podrías hacerlo y qué garantía tendría?`,
      copyCta: 'Copiar mensaje',
      copiedLabel: 'Mensaje copiado',
      cta: 'Revisar respuesta del profesional',
    },
    vendorReply: {
      title: 'Pega la respuesta del profesional',
      label: 'Respuesta del profesional',
      placeholder:
        'Ej: Sí, el precio incluye IVA, instalación y garantía de 2 años. Podemos hacerlo el martes.',
      cta: 'Revisar respuesta',
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
      ariaLabel: 'RenoPilot',
      backLabel: 'Back',
      languageLabel: 'Language',
      phaseLabel: 'Phase',
      phases: ['Upload', 'Review', 'Ask', 'Decide'],
    },
    landing: {
      eyebrow: 'Quick quote review',
      headline: 'Review a contractor quote before you say yes.',
      subcopy:
        'Paste or upload whatever the contractor sent you. RenoPilot helps you see what is clear, what is missing, and what to ask before accepting.',
      cta: 'Check a contractor quote',
    },
    startCheck: {
      title: 'What do you want to review?',
      decisionLabel: 'Optional context',
      decisionPlaceholder:
        'Example: I want to know if this quote is clear before I pay the deposit.',
      quoteInputLabel: 'Paste or upload what you have',
      quoteInputHint:
        'Paste a quote, WhatsApp message, email, screenshot text, or anything the contractor told you. It does not need to be perfect.',
      uploadCta: 'Upload file',
      quotePlaceholder:
        'Paste what you have here. RenoPilot extracts what it can and only asks for missing essentials.',
      emailLabel: 'Email',
      emailHelper: 'Optional, only if you want to receive the result or continue later.',
      emailPlaceholder: 'you@email.com',
      cta: 'Check this quote',
    },
    checking: {
      title: 'RenoPilot is checking:',
      items: [
        'what is clear',
        'what is missing',
        'possible extra costs',
        'unclear points',
        'useful questions to send',
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
      cta: 'Generate questions',
    },
    questions: {
      title: 'Message to send',
      message: `Thanks. Before I confirm, could you send me the final price with VAT, what exactly is included, when you could do it, and what warranty applies?`,
      copyCta: 'Copy message',
      copiedLabel: 'Message copied',
      cta: 'Check contractor reply',
    },
    vendorReply: {
      title: 'Paste the contractor reply',
      label: 'Contractor reply',
      placeholder: 'Example: Yes, the price includes VAT, installation and a 2-year warranty. We can do it on Tuesday.',
      cta: 'Review reply',
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
      ariaLabel: 'RenoPilot',
      backLabel: 'Wróć',
      languageLabel: 'Język',
      phaseLabel: 'Etap',
      phases: ['Wgraj', 'Sprawdź', 'Zapytaj', 'Decyzja'],
    },
    landing: {
      eyebrow: 'Szybkie sprawdzenie oferty',
      headline: 'Sprawdź ofertę wykonawcy, zanim powiesz tak.',
      subcopy:
        'Wklej albo wgraj to, co wysłał wykonawca. RenoPilot pokaże, co jest jasne, czego brakuje i o co zapytać przed akceptacją.',
      cta: 'Sprawdź ofertę wykonawcy',
    },
    startCheck: {
      title: 'Co chcesz sprawdzić?',
      decisionLabel: 'Dodatkowy kontekst',
      decisionPlaceholder:
        'Przykład: Chcę wiedzieć, czy ta oferta jest jasna, zanim zapłacę zaliczkę.',
      quoteInputLabel: 'Wklej albo wgraj to, co masz',
      quoteInputHint:
        'Wklej ofertę, wiadomość z WhatsAppa, e-mail, tekst ze zrzutu ekranu albo cokolwiek, co przekazał wykonawca. Nie musi być idealnie.',
      uploadCta: 'Wgraj plik',
      quotePlaceholder:
        'Wklej tutaj to, co masz. RenoPilot wyciągnie najważniejsze informacje i wskaże tylko to, czego brakuje.',
      emailLabel: 'Email',
      emailHelper: 'Opcjonalnie, tylko jeśli chcesz otrzymać wynik lub wrócić później.',
      emailPlaceholder: 'twoj@email.com',
      cta: 'Sprawdź tę ofertę',
    },
    checking: {
      title: 'RenoPilot sprawdza:',
      items: [
        'co jest jasne',
        'czego brakuje',
        'możliwe dodatkowe koszty',
        'niejasne punkty',
        'pytania do wykonawcy',
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
      cta: 'Wygeneruj pytania',
    },
    questions: {
      title: 'Wiadomość do wysłania',
      message: `Dzięki. Zanim potwierdzę, możesz mi proszę wysłać końcową cenę z VAT, co dokładnie jest w cenie, kiedy możesz to zrobić i jaka jest gwarancja?`,
      copyCta: 'Kopiuj wiadomość',
      copiedLabel: 'Wiadomość skopiowana',
      cta: 'Sprawdź odpowiedź wykonawcy',
    },
    vendorReply: {
      title: 'Wklej odpowiedź wykonawcy',
      label: 'Odpowiedź wykonawcy',
      placeholder: 'Np. Tak, cena zawiera VAT, montaż i 2 lata gwarancji. Możemy to zrobić we wtorek.',
      cta: 'Sprawdź odpowiedź',
    },
    updatedRecommendation: {
      status: '🟡 Nadal są punkty do zamknięcia',
      explanation:
        'Dobra odpowiedź, ale końcowa cena z VAT i dokładna zasada drugiej płatności nadal wymagają pisemnego potwierdzenia.',
      nextActionTitle: 'Następny krok',
      nextAction: 'Poproś o pisemne potwierdzenie przed zapłatą zaliczki.',
    },
  },
};
