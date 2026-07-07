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

export function isShortInformalEstimate(text: string) {
  const clean = text.replace(/\s+/g, ' ').trim();
  const value = clean.toLowerCase();
  if (clean.length < 30 || clean.length > 700) return false;

  const hasPrice = priceMatches(clean).length >= 1;
  const hasUnitLanguage = /\b(per|each|unit|standard|medium|screen|door|window|por|unidad|szt|za)\b/i.test(clean);
  const hasInstallSupplyLanguage = includesAny(value, ['installation', 'installed', 'instalación', 'montaż', 'supply', 'suministro', 'dostawa']);
  const missingSeveralEssentials = [
    includesAny(value, essentials.vat),
    includesAny(value, essentials.warranty),
    includesAny(value, essentials.timing),
    includesAny(value, essentials.payment),
    includesAny(value, essentials.validity),
    includesAny(value, essentials.total),
  ].filter(Boolean).length <= 2;

  return hasPrice && hasUnitLanguage && hasInstallSupplyLanguage && missingSeveralEssentials;
}

function labels(language: string) {
  if (language === 'en') {
    return {
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
    return {
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

  return {
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

  const copy = labels(language);
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
    assumptions: [...(analysis.assumptions || []), 'Short informal estimate: unit prices are useful, but essential quote details are missing.'],
  };
}
