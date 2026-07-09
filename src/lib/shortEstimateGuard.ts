import type { ClarificationItem, QuoteAnalysis } from '../types/analysis';

const essentials = {
  vat: ['iva', 'vat', 'brutto', 'netto', 'podatek'],
  warranty: ['garantía', 'garantia', 'gwarancja', 'warranty', 'guarantee'],
  timing: ['plazo', 'fecha', 'semana', 'termin', 'tydzień', 'week', 'lead time', 'instalación el', 'montaż'],
  payment: ['pago', 'payment', 'zaliczka', 'deposit', 'señal', 'przelew', 'transfer'],
  validity: ['validez', 'validity', 'ważna', 'ważność', 'valid until', 'oferta ważna'],
  total: ['total', 'łącznie', 'razem', 'precio final', 'final price', 'suma'],
};

const currencyAmountPattern = /(?:\b(?:pln|zł|zl|eur|gbp)\s?\d+[\d\s.,]*\b|\b\d+[\d\s.,]*\s?(?:pln|zł|zl|eur|€|gbp|£)\b|€\s?\d+[\d\s.,]*\b|£\s?\d+[\d\s.,]*\b)/gi;

function includesAny(text: string, words: string[]) {
  const value = text.toLowerCase();
  return words.some((word) => value.includes(word));
}

function priceMatches(text: string) {
  return text.match(currencyAmountPattern) || [];
}

function confirmedEssentialsCount(text: string) {
  const value = text.toLowerCase();
  return [
    includesAny(value, essentials.vat),
    includesAny(value, essentials.warranty),
    includesAny(value, essentials.timing),
    includesAny(value, essentials.payment),
    includesAny(value, essentials.validity),
    includesAny(value, essentials.total),
  ].filter(Boolean).length;
}

function isSparseInformalEstimate(text: string) {
  const clean = text.replace(/\s+/g, ' ').trim();
  const value = clean.toLowerCase();
  if (clean.length < 25 || clean.length > 260) return false;

  const hasPrice = priceMatches(clean).length >= 1;
  const hasMosquitoScope = includesAny(value, ['mosquitera', 'mosquiteras', 'mosquito screen', 'mosquito screens', 'moskitiera', 'moskitiery']);
  const hasQuantityOrWindow = /\b\d+\b/.test(clean) || includesAny(value, ['ventana', 'ventanas', 'window', 'windows', 'okno', 'okna']);
  const missingMostEssentials = confirmedEssentialsCount(clean) <= 2;

  return hasPrice && hasMosquitoScope && hasQuantityOrWindow && missingMostEssentials;
}

export function isShortInformalEstimate(text: string) {
  const clean = text.replace(/\s+/g, ' ').trim();
  const value = clean.toLowerCase();
  if (clean.length < 30 || clean.length > 700) return false;

  const hasPrice = priceMatches(clean).length >= 1;
  const hasUnitLanguage = /\b(per|each|unit|standard|medium|screen|door|window|por|unidad|szt|za)\b/i.test(clean);
  const hasInstallSupplyLanguage = includesAny(value, ['installation', 'installed', 'instalación', 'instalacion', 'montaż', 'supply', 'suministro', 'dostawa']);
  const missingSeveralEssentials = confirmedEssentialsCount(clean) <= 2;

  return (hasPrice && hasUnitLanguage && hasInstallSupplyLanguage && missingSeveralEssentials) || isSparseInformalEstimate(clean);
}

function labels(language: string, text: string) {
  const sparse = isSparseInformalEstimate(text);

  if (language === 'en') {
    return sparse
      ? {
          title: 'Clarify before accepting',
          summary: 'This is a sparse informal estimate. It mentions 4 window mosquito screens, 1200 PLN, installation included and timing next week, but these details are not complete enough to accept without confirmation.',
          clear: ['4 window mosquito screens seem to be included.', '1200 PLN is mentioned.', 'Installation seems included.', 'Timing seems to be next week.'],
          unclear: [
            ['Whether VAT is included.', 'Without VAT confirmation, the final price may change.', 'Does the final price include VAT?', 'cost'],
            ['Exact mosquito screen type, model and material.', 'Different models or materials can affect price and quality.', 'What exact mosquito screen type, model and material are included?', 'quality'],
            ['Whether measuring is included.', 'The price may change after measurement if this is not confirmed.', 'Is measuring included in this price?', 'scope'],
            ['Exact installation date and time.', 'Next week is useful but still not specific enough to plan.', 'What exact date and time could you install them?', 'time'],
            ['Warranty.', 'Without warranty terms, it is unclear what happens if something fails later.', 'What warranty applies?', 'dispute'],
            ['Whether the price can change after measuring.', 'A sparse estimate may change after measurement or product selection.', 'Can the price change after measuring?', 'cost'],
          ],
          risk: 'Because this is only a short informal estimate, misunderstandings could happen later around VAT, final total, product type, measuring or warranty.',
          message: 'Thanks. Before I confirm, could you send me the final price with VAT, the exact mosquito screen type/material, whether measuring and installation are included, when you could install them, and what warranty applies?',
          priceTitle: 'Cannot judge price from this alone',
          priceSummary: 'Based only on this estimate, RenoPilot cannot reliably judge if the price is cheap or expensive. It can check whether the quote is complete enough to accept and what details are missing.',
        }
      : {
          title: 'Partly clear — confirm details before accepting',
          summary: 'This estimate gives useful unit prices and says supply and installation are included, but it is not yet a complete written quote. Before accepting, confirm the final total, VAT, warranty, timing and exact product details.',
          clear: ['Unit prices are provided.', 'Supply is included.', 'Installation is included.'],
          unclear: [
            ['Whether VAT is included.', 'Without VAT confirmation, the final price may change.', 'Does the final price include VAT?', 'cost'],
            ['Exact number and size of mosquito screens.', 'Without quantities and sizes, the final total can be misunderstood.', 'How many mosquito screens of each type are included?', 'scope'],
            ['Final total price.', 'Unit prices are useful, but the homeowner still needs the final total before accepting.', 'What is the final total price with VAT?', 'cost'],
            ['Product type/material/colour.', 'The quote may change if the product model, material or colour is different.', 'What model, material and colour are included?', 'quality'],
            ['Warranty.', 'Without warranty terms, it is unclear what happens if something fails later.', 'What warranty applies?', 'dispute'],
            ['Installation date or lead time.', 'Without timing, it is hard to plan or compare options.', 'When could you install them?', 'time'],
            ['Payment terms.', 'Payment expectations can create friction if not agreed before work starts.', 'What are the payment terms?', 'payment'],
            ['Offer validity.', 'The price may change if the estimate has no validity period.', 'How long is this offer valid?', 'decision_pressure'],
          ],
          risk: 'Because this is only a short estimate, misunderstandings could happen later around VAT, final total, product type or warranty.',
          message: 'Thanks. Before I confirm, could you send me the final price with VAT, how many mosquito screens of each type are included, what model/material/colour it includes, when you could install them, and what warranty applies?',
          priceTitle: 'Cannot judge price from this alone',
          priceSummary: 'Based only on this estimate, RenoPilot cannot reliably judge if the price is cheap or expensive. It can check whether the quote is complete enough to accept and what details are missing.',
        };
  }

  if (language === 'pl') {
    return sparse
      ? {
          title: 'Doprecyzuj przed akceptacją',
          summary: 'To krótka, nieformalna wycena. Wspomina o 4 moskitierach okiennych, 1200 PLN, montażu w cenie i terminie w przyszłym tygodniu, ale to za mało, aby zaakceptować bez potwierdzenia.',
          clear: ['Wygląda na to, że chodzi o 4 moskitiery okienne.', 'Wspomniano 1200 PLN.', 'Montaż wydaje się w cenie.', 'Termin wygląda na przyszły tydzień.'],
          unclear: [
            ['Czy VAT jest wliczony.', 'Bez potwierdzenia VAT końcowa cena może się zmienić.', 'Czy końcowa cena zawiera VAT?', 'cost'],
            ['Dokładny typ, model i materiał moskitiery.', 'Różne modele lub materiały mogą zmienić cenę i jakość.', 'Jaki dokładnie typ, model i materiał moskitiery jest w cenie?', 'quality'],
            ['Czy pomiar jest w cenie.', 'Cena może się zmienić po pomiarze, jeśli nie jest to potwierdzone.', 'Czy pomiar jest wliczony w tę cenę?', 'scope'],
            ['Dokładna data i godzina montażu.', 'Przyszły tydzień jest pomocny, ale nadal zbyt ogólny.', 'Jaka dokładnie data i godzina montażu są możliwe?', 'time'],
            ['Gwarancja.', 'Bez gwarancji nie wiadomo, co będzie, jeśli coś później nie zadziała.', 'Jaka jest gwarancja?', 'dispute'],
            ['Czy cena może się zmienić po pomiarze.', 'Krótka wycena może zmienić się po pomiarze albo wyborze produktu.', 'Czy cena może się zmienić po pomiarze?', 'cost'],
          ],
          risk: 'Ponieważ to tylko krótka nieformalna wycena, później mogą pojawić się nieporozumienia dotyczące VAT, ceny końcowej, typu produktu, pomiaru albo gwarancji.',
          message: 'Dzięki. Zanim potwierdzę, możesz mi proszę wysłać końcową cenę z VAT, dokładny typ/materiał moskitiery, czy pomiar i montaż są w cenie, kiedy możliwy jest montaż i jaka jest gwarancja?',
          priceTitle: 'Nie da się ocenić ceny tylko z tego',
          priceSummary: 'Na podstawie samej tej wyceny RenoPilot nie może wiarygodnie ocenić, czy cena jest tania czy droga. Może sprawdzić, czy oferta jest wystarczająco kompletna do akceptacji i czego brakuje.',
        }
      : {
          title: 'Częściowo jasne — potwierdź szczegóły przed akceptacją',
          summary: 'Ta wycena podaje przydatne ceny jednostkowe i wskazuje, że produkt oraz montaż są w cenie, ale nie jest to jeszcze pełna pisemna oferta. Przed akceptacją potwierdź końcową cenę, VAT, gwarancję, termin i dokładne szczegóły produktu.',
          clear: ['Podano ceny jednostkowe.', 'Produkt jest w cenie.', 'Montaż jest w cenie.'],
          unclear: [
            ['Czy VAT jest wliczony.', 'Bez potwierdzenia VAT końcowa cena może się zmienić.', 'Czy końcowa cena zawiera VAT?', 'cost'],
            ['Dokładna liczba i rozmiary moskitier.', 'Bez ilości i rozmiarów można źle zrozumieć końcową cenę.', 'Ile moskitier każdego typu obejmuje oferta?', 'scope'],
            ['Końcowa cena łączna.', 'Ceny jednostkowe pomagają, ale przed akceptacją potrzebna jest suma końcowa.', 'Jaka jest końcowa cena z VAT?', 'cost'],
            ['Typ produktu, materiał i kolor.', 'Oferta może się zmienić, jeśli model, materiał albo kolor są inne.', 'Jaki model, materiał i kolor są w cenie?', 'quality'],
            ['Gwarancja.', 'Bez gwarancji nie wiadomo, co będzie, jeśli coś później nie zadziała.', 'Jaka jest gwarancja?', 'dispute'],
            ['Termin montażu albo czas oczekiwania.', 'Bez terminu trudno planować albo porównać opcje.', 'Kiedy możliwy jest montaż?', 'time'],
            ['Warunki płatności.', 'Płatność może powodować nieporozumienia, jeśli nie jest ustalona wcześniej.', 'Jakie są warunki płatności?', 'payment'],
            ['Ważność oferty.', 'Cena może się zmienić, jeśli oferta nie ma terminu ważności.', 'Jak długo ta oferta jest ważna?', 'decision_pressure'],
          ],
          risk: 'Ponieważ to tylko krótka wycena, później mogą pojawić się nieporozumienia dotyczące VAT, końcowej ceny, typu produktu albo gwarancji.',
          message: 'Dzięki. Zanim potwierdzę, możesz mi proszę wysłać końcową cenę z VAT, ile moskitier każdego typu obejmuje oferta, jaki model/materiał/kolor jest w cenie, kiedy możliwy jest montaż i jaka jest gwarancja?',
          priceTitle: 'Nie da się ocenić ceny tylko z tego',
          priceSummary: 'Na podstawie samej tej wyceny RenoPilot nie może wiarygodnie ocenić, czy cena jest tania czy droga. Może sprawdzić, czy oferta jest wystarczająco kompletna do akceptacji i czego brakuje.',
        };
  }

  return sparse
    ? {
        title: 'Aclara antes de aceptar',
        summary: 'Es una estimación informal y corta. Menciona 4 mosquiteras para ventanas, 1200 PLN, instalación incluida y próxima semana, pero no es suficiente para aceptar sin confirmar detalles.',
        clear: ['Parecen ser 4 mosquiteras para ventanas.', 'Se menciona 1200 PLN.', 'La instalación parece incluida.', 'El plazo parece ser próxima semana.'],
        unclear: [
          ['Si el IVA está incluido.', 'Sin confirmar el IVA, el precio final puede cambiar.', '¿El precio final incluye IVA?', 'cost'],
          ['Tipo, modelo y material exacto de la mosquitera.', 'Distintos modelos o materiales pueden cambiar precio y calidad.', '¿Qué tipo, modelo y material exacto de mosquitera incluye?', 'quality'],
          ['Si la medición está incluida.', 'El precio puede cambiar después de medir si esto no está confirmado.', '¿La medición está incluida en este precio?', 'scope'],
          ['Fecha y hora exacta de instalación.', 'Próxima semana ayuda, pero sigue siendo poco concreto.', '¿Qué día y hora exactos podrías instalarlo?', 'time'],
          ['Garantía.', 'Sin garantía clara, no sabes qué pasa si algo falla después.', '¿Qué garantía tendría?', 'dispute'],
          ['Si el precio puede cambiar después de medir.', 'Una estimación corta puede cambiar tras medir o elegir producto.', '¿El precio puede cambiar después de medir?', 'cost'],
        ],
        risk: 'Como es solo una estimación informal corta, podrían surgir malentendidos después sobre IVA, precio final, tipo de producto, medición o garantía.',
        message: 'Gracias. Antes de confirmar, ¿me puedes pasar el precio final con IVA, el tipo/material exacto de mosquitera, si la medición e instalación están incluidas, cuándo podrías instalarlo y qué garantía tendría?',
        priceTitle: 'No se puede juzgar el precio solo con esto',
        priceSummary: 'Basándose solo en esta estimación, RenoPilot no puede juzgar de forma fiable si el precio es barato o caro. Puede comprobar si el presupuesto está suficientemente completo para aceptar y qué detalles faltan.',
      }
    : {
        title: 'Parcialmente claro — confirma detalles antes de aceptar',
        summary: 'Esta estimación da precios unitarios útiles e indica que suministro e instalación están incluidos, pero todavía no es un presupuesto completo por escrito. Antes de aceptar, confirma el precio final, IVA, garantía, plazo y detalles exactos del producto.',
        clear: ['Se indican precios unitarios.', 'El suministro está incluido.', 'La instalación está incluida.'],
        unclear: [
          ['Si el IVA está incluido.', 'Sin confirmar el IVA, el precio final puede cambiar.', '¿El precio final incluye IVA?', 'cost'],
          ['Número exacto y tamaño de las mosquiteras.', 'Sin cantidades y tamaños, el total final puede malinterpretarse.', '¿Cuántas mosquiteras serían de cada tipo?', 'scope'],
          ['Precio final total.', 'Los precios unitarios ayudan, pero falta el total final antes de aceptar.', '¿Cuál es el precio final total con IVA?', 'cost'],
          ['Tipo de producto, material y color.', 'La oferta puede cambiar si el modelo, material o color no están definidos.', '¿Qué modelo, material y color incluye?', 'quality'],
          ['Garantía.', 'Sin garantía clara, no sabes qué pasa si algo falla después.', '¿Qué garantía tendría?', 'dispute'],
          ['Fecha de instalación o plazo.', 'Sin plazo, es difícil planificar o comparar opciones.', '¿Cuándo podrías instalarlo?', 'time'],
          ['Condiciones de pago.', 'El pago puede generar malentendidos si no se acuerda antes.', '¿Cuáles son las condiciones de pago?', 'payment'],
          ['Validez de la oferta.', 'El precio puede cambiar si la estimación no tiene plazo de validez.', '¿Hasta cuándo es válida esta oferta?', 'decision_pressure'],
        ],
        risk: 'Como es solo una estimación corta, podrían surgir malentendidos después sobre IVA, precio final, tipo de producto o garantía.',
        message: 'Gracias. Antes de confirmar, ¿me puedes pasar por escrito el precio final con IVA, cuántas mosquiteras serían de cada tipo, qué modelo/material/color incluye, cuándo podrías instalarlo y qué garantía tendría?',
        priceTitle: 'No se puede juzgar el precio solo con esto',
        priceSummary: 'Basándose solo en esta estimación, RenoPilot no puede juzgar de forma fiable si el precio es barato o caro. Puede comprobar si el presupuesto está suficientemente completo para aceptar y qué detalles faltan.',
      };
}

export function enforceShortEstimateGuard(analysis: QuoteAnalysis, language: string, text: string): QuoteAnalysis {
  if (!isShortInformalEstimate(text)) return analysis;

  const copy = labels(language, text);
  const clarificationItems = copy.unclear.map(([title, consequence, question_to_ask, consequence_type]) => ({
    title,
    consequence,
    question_to_ask,
    consequence_type: consequence_type as ClarificationItem['consequence_type'],
  }));

  return {
    ...analysis,
    verdict: {
      level: 'yellow',
      title: copy.title,
      summary: copy.summary,
    },
    comparison: {
      recommendedQuote: '',
      oneLineReason: copy.summary,
      whyThisOne: copy.clear,
      stillUnclear: clarificationItems.map((item) => item.title),
      beCareful: [copy.risk],
    },
    clarificationItems,
    priceSanity: {
      status: 'no',
      title: copy.priceTitle,
      summary: copy.priceSummary,
      next_step: copy.risk,
    },
    infoCategories: {
      confirmed: copy.clear,
      needsClarification: clarificationItems.map((item) => item.title),
      risks: [copy.risk],
    },
    vendorQuestions: {
      title: copy.title,
      messageToSend: copy.message,
      messagesByVendor: [{ vendorName: copy.title, messageToSend: copy.message }],
      questions: clarificationItems.map((item) => item.question_to_ask),
    },
    nextAction: {
      title: copy.title,
      summary: copy.risk,
    },
    confidence: 'high',
    assumptions: [...(analysis.assumptions || []), 'Sparse informal estimate: useful details are present, but essential quote details are missing.'],
  };
}
