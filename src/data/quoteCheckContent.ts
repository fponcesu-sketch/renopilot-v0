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
      languageLabel: 'Idioma',
    },
    landing: {
      eyebrow: 'Revisión rápida de presupuestos',
      headline: 'Revisa un presupuesto de obra antes de decir que sí.',
      subcopy:
        'Sube o pega un presupuesto, mensaje del contratista, captura o factura. RenoPilot te muestra qué falta, qué podría costar extra y qué preguntar antes de aceptar.',
      cta: 'Empezar revisión',
    },
    startCheck: {
      title: 'Empecemos con lo que te han enviado',
      decisionLabel: '¿Qué estás intentando decidir?',
      decisionPlaceholder:
        'Ejemplo: Quiero saber si este presupuesto para reformar el baño es claro antes de pagar la señal.',
      uploadLabel: 'Subir presupuesto, mensaje o captura',
      uploadHint: 'Placeholder visual: todavía no analizamos archivos reales.',
      pasteLabel: 'O pega aquí el presupuesto o mensaje',
      pastePlaceholder:
        'Pega el texto del presupuesto, WhatsApp, email o factura que quieres revisar.',
      emailLabel: 'Email opcional',
      emailPlaceholder: 'tu@email.com',
      cta: 'Revisar presupuesto',
    },
    checking: {
      title: 'RenoPilot está revisando:',
      items: [
        'detalles que faltan',
        'posibles costes extra',
        'condiciones de pago poco claras',
        'supuestos arriesgados',
        'preguntas que hacer antes de aceptar',
      ],
      cta: 'Ver resultado',
    },
    result: {
      status: '🟡 Buena pinta, pero pregunta antes de firmar',
      explanation:
        'Este presupuesto no presenta señales importantes de alarma, pero hemos encontrado 4 puntos que merece la pena revisar antes de firmar.',
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
      cta: 'Ver preguntas para el contratista',
    },
    questions: {
      title: 'Mensaje para copiar y enviar',
      message: `Hola, gracias por el presupuesto. Antes de aceptar, ¿podéis confirmarme estos puntos por escrito?\n\n1. ¿Cuál será el precio final con IVA incluido?\n2. ¿Cuánto durará la obra?\n3. ¿Puede cambiar el precio de la instalación eléctrica?\n4. ¿Qué significa exactamente ‘mitad de obra’ para el segundo pago?\n\nGracias.`,
      copyCta: 'Copiar mensaje',
      copiedLabel: 'Mensaje copiado',
      cta: 'Ya lo he enviado / tengo respuesta',
    },
    vendorReply: {
      title: 'Añade la respuesta del contratista',
      label: 'Pega aquí la respuesta del contratista',
      placeholder:
        'Pega la respuesta que te han enviado para actualizar la recomendación.',
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
      languageLabel: 'Language',
    },
    landing: {
      eyebrow: 'Quick quote review',
      headline: 'Review a renovation quote before you say yes.',
      subcopy:
        'Upload or paste a contractor quote, message, screenshot or invoice. RenoPilot shows what is missing, what could cost extra and what to ask before accepting.',
      cta: 'Start review',
    },
    startCheck: {
      title: "Let's start with what they sent you",
      decisionLabel: 'What are you trying to decide?',
      decisionPlaceholder:
        'Example: I want to know if this bathroom renovation quote is clear before I pay the deposit.',
      uploadLabel: 'Upload quote, message or screenshot',
      uploadHint: 'Visual placeholder: we do not analyze real files yet.',
      pasteLabel: 'Or paste the quote or message here',
      pastePlaceholder:
        'Paste the quote, WhatsApp, email or invoice text you want to review.',
      emailLabel: 'Optional email',
      emailPlaceholder: 'you@email.com',
      cta: 'Review quote',
    },
    checking: {
      title: 'RenoPilot is checking:',
      items: [
        'missing details',
        'possible extra costs',
        'unclear payment conditions',
        'risky assumptions',
        'questions to ask before accepting',
      ],
      cta: 'See result',
    },
    result: {
      status: '🟡 Looks OK, but ask before signing',
      explanation:
        'This quote does not show major red flags, but we found 4 points worth checking before you sign.',
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
      cta: 'See contractor questions',
    },
    questions: {
      title: 'Message to copy and send',
      message: `Hi, thanks for the quote. Before accepting, could you please confirm these points in writing?\n\n1. What will the final price be including VAT?\n2. How long will the work take?\n3. Could the electrical installation price change?\n4. What exactly does “halfway through the work” mean for the second payment?\n\nThanks.`,
      copyCta: 'Copy message',
      copiedLabel: 'Message copied',
      cta: 'I sent it / I have a reply',
    },
    vendorReply: {
      title: 'Add the contractor reply',
      label: 'Paste the contractor reply here',
      placeholder: 'Paste the reply they sent you to update the recommendation.',
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
      languageLabel: 'Język',
    },
    landing: {
      eyebrow: 'Szybka weryfikacja wycen',
      headline: 'Sprawdź wycenę remontu, zanim powiesz tak.',
      subcopy:
        'Wgraj albo wklej wycenę, wiadomość od wykonawcy, zrzut ekranu lub fakturę. RenoPilot pokaże, czego brakuje, co może kosztować dodatkowo i o co zapytać przed akceptacją.',
      cta: 'Rozpocznij sprawdzanie',
    },
    startCheck: {
      title: 'Zacznijmy od tego, co dostałeś',
      decisionLabel: 'Jaką decyzję próbujesz podjąć?',
      decisionPlaceholder:
        'Przykład: Chcę wiedzieć, czy ta wycena remontu łazienki jest jasna, zanim zapłacę zaliczkę.',
      uploadLabel: 'Wgraj wycenę, wiadomość lub zrzut ekranu',
      uploadHint: 'Placeholder wizualny: na razie nie analizujemy prawdziwych plików.',
      pasteLabel: 'Albo wklej tutaj wycenę lub wiadomość',
      pastePlaceholder:
        'Wklej tekst wyceny, WhatsAppa, e-maila lub faktury, którą chcesz sprawdzić.',
      emailLabel: 'Email opcjonalny',
      emailPlaceholder: 'twoj@email.com',
      cta: 'Sprawdź wycenę',
    },
    checking: {
      title: 'RenoPilot sprawdza:',
      items: [
        'brakujące szczegóły',
        'możliwe dodatkowe koszty',
        'niejasne warunki płatności',
        'ryzykowne założenia',
        'pytania, które warto zadać przed akceptacją',
      ],
      cta: 'Zobacz wynik',
    },
    result: {
      status: '🟡 Wygląda dobrze, ale zapytaj przed podpisaniem',
      explanation:
        'Ta wycena nie ma dużych sygnałów alarmowych, ale znaleźliśmy 4 punkty, które warto sprawdzić przed podpisaniem.',
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
      cta: 'Zobacz pytania do wykonawcy',
    },
    questions: {
      title: 'Wiadomość do skopiowania i wysłania',
      message: `Dzień dobry, dziękuję za wycenę. Przed akceptacją proszę o pisemne potwierdzenie kilku punktów:\n\n1. Jaka będzie końcowa cena z VAT?\n2. Ile potrwają prace?\n3. Czy cena instalacji elektrycznej może się zmienić?\n4. Co dokładnie oznacza „połowa prac” przy drugiej płatności?\n\nDziękuję.`,
      copyCta: 'Kopiuj wiadomość',
      copiedLabel: 'Wiadomość skopiowana',
      cta: 'Wysłane / mam odpowiedź',
    },
    vendorReply: {
      title: 'Dodaj odpowiedź wykonawcy',
      label: 'Wklej tutaj odpowiedź wykonawcy',
      placeholder: 'Wklej odpowiedź, którą dostałeś, aby zaktualizować rekomendację.',
      cta: 'Zaktualizuj rekomendację',
    },
    updatedRecommendation: {
      status: '🟡 Nadal są punkty do zamknięcia',
      explanation:
        'Odpowiedź jest dobra, ale nadal brakuje pisemnego potwierdzenia końcowej ceny z VAT i dokładnej zasady drugiej płatności.',
      nextActionTitle: 'Następny krok',
      nextAction: 'Poproś o pisemne potwierdzenie przed zapłatą zaliczki.',
    },
  },
};

export type QuoteCheckContent = (typeof quoteCheckContent)[Language];
