import type { QuoteAnalysis } from '../types/analysis';

const labels = {
  es: {
    title: 'Revisión básica del texto',
    summary: 'RenoPilot ha revisado el texto extraído o pegado y ha detectado puntos básicos que conviene aclarar antes de aceptar.',
    received: 'Texto recibido y revisado',
    priceFound: 'Precio detectado: ',
    noPrice: 'No hemos detectado un precio claro en el texto.',
    next: 'Pide confirmación por escrito de los puntos abiertos antes de aceptar o pagar.',
    msg: 'Gracias. Antes de confirmar, ¿me puedes pasar el precio final con IVA, qué incluye exactamente, cuándo podrías hacerlo y qué garantía tendría?',
    items: [
      ['IVA no confirmado', 'Sin confirmación escrita, el precio final puede cambiar por impuestos.', '¿El precio final incluye IVA?', 'cost'],
      ['Alcance poco detallado', 'Si el alcance no está claro, pueden aparecer extras o malentendidos.', '¿Qué incluye exactamente este precio y qué no incluye?', 'scope'],
      ['Plazo no claro', 'Sin plazo claro, es difícil planificar o reclamar retrasos.', '¿Cuándo podrías empezar y terminar?', 'time'],
      ['Garantía no indicada', 'Sin garantía clara, no sabes qué pasa si algo falla después.', '¿Qué garantía tiene el trabajo o producto?', 'dispute'],
      ['Forma de pago no clara', 'Si el pago no está claro, puede haber discusión antes o durante el trabajo.', '¿Cuál es la forma de pago y cuándo se paga cada parte?', 'payment'],
    ],
  },
  en: {
    title: 'Basic text review',
    summary: 'RenoPilot checked the extracted or pasted text and found basic points to clarify before accepting.',
    received: 'Text received and checked',
    priceFound: 'Price found: ',
    noPrice: 'No clear price was detected in the text.',
    next: 'Ask for written confirmation of the open points before accepting or paying.',
    msg: 'Thanks. Before I confirm, could you send me the final price with VAT, what exactly is included, when you could do it, and what warranty applies?',
    items: [
      ['VAT not confirmed', 'Without written confirmation, the final price may change because of tax.', 'Does the final price include VAT?', 'cost'],
      ['Scope not detailed enough', 'If the scope is unclear, extras or misunderstandings may appear.', 'What exactly is included in this price and what is excluded?', 'scope'],
      ['Timing not clear', 'Without clear timing, it is hard to plan or challenge delays.', 'When could you start and finish?', 'time'],
      ['Warranty not stated', 'Without clear warranty terms, you do not know what happens if something fails later.', 'What warranty applies to the work or product?', 'dispute'],
      ['Payment terms not clear', 'If payment terms are unclear, there may be disagreement before or during the work.', 'What are the payment terms and when is each part paid?', 'payment'],
    ],
  },
  pl: {
    title: 'Podstawowa analiza tekstu',
    summary: 'RenoPilot sprawdził wyciągnięty albo wklejony tekst i znalazł podstawowe punkty do doprecyzowania przed akceptacją.',
    received: 'Tekst odebrany i sprawdzony',
    priceFound: 'Wykryta cena: ',
    noPrice: 'Nie wykryto jasnej ceny w tekście.',
    next: 'Poproś o pisemne potwierdzenie otwartych punktów przed akceptacją lub płatnością.',
    msg: 'Dzięki. Zanim potwierdzę, możesz mi proszę wysłać końcową cenę z VAT, co dokładnie jest w cenie, kiedy możesz to zrobić i jaka jest gwarancja?',
    items: [
      ['VAT niepotwierdzony', 'Bez pisemnego potwierdzenia cena końcowa może się zmienić przez podatek.', 'Czy cena końcowa zawiera VAT?', 'cost'],
      ['Zakres mało szczegółowy', 'Jeśli zakres nie jest jasny, mogą pojawić się dopłaty albo nieporozumienia.', 'Co dokładnie jest w tej cenie, a czego nie obejmuje?', 'scope'],
      ['Termin niejasny', 'Bez jasnego terminu trudno planować i reagować na opóźnienia.', 'Kiedy możesz zacząć i skończyć?', 'time'],
      ['Brak informacji o gwarancji', 'Bez jasnej gwarancji nie wiadomo, co będzie, jeśli coś później nie zadziała.', 'Jaka jest gwarancja na pracę albo produkt?', 'dispute'],
      ['Warunki płatności niejasne', 'Jeśli płatność nie jest jasna, może być spór przed pracą albo w trakcie.', 'Jakie są warunki płatności i kiedy płaci się każdą część?', 'payment'],
    ],
  },
} as const;

function includesAny(text: string, words: string[]) {
  const value = text.toLowerCase();
  return words.some((word) => value.includes(word));
}

function priceLines(text: string) {
  return text
    .split(/\n|---|\|/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => /(\d+[\d\s.,]*)\s?(pln|zł|zl|eur|€|gbp|£)/i.test(line))
    .slice(0, 3);
}

export function buildTextBasedQuoteReview(language: string, text: string): QuoteAnalysis | null {
  const cleanText = text.trim();
  if (cleanText.length < 20) return null;

  const copy = labels[(language as 'es' | 'en' | 'pl') || 'es'] || labels.es;
  const prices = priceLines(cleanText);
  const hasVat = includesAny(cleanText, ['iva', 'vat', 'brutto', 'netto', 'podatek']);
  const hasWarranty = includesAny(cleanText, ['garantía', 'gwarancja', 'warranty']);
  const hasTiming = includesAny(cleanText, ['semana', 'plazo', 'fecha', 'termin', 'tydzień', 'week', 'instalación', 'montaż']);
  const hasPayment = includesAny(cleanText, ['pago', 'payment', 'zaliczka', 'señal', 'deposit', 'przelew']);
  const hasScope = cleanText.length > 120;

  const needed = copy.items.filter(([title]) => {
    if (String(title).toLowerCase().includes('iva') || String(title).toLowerCase().includes('vat')) return !hasVat;
    if (String(title).toLowerCase().includes('alcance') || String(title).toLowerCase().includes('scope') || String(title).toLowerCase().includes('zakres')) return !hasScope;
    if (String(title).toLowerCase().includes('plazo') || String(title).toLowerCase().includes('timing') || String(title).toLowerCase().includes('termin')) return !hasTiming;
    if (String(title).toLowerCase().includes('garant') || String(title).toLowerCase().includes('warranty')) return !hasWarranty;
    return !hasPayment;
  });

  const clarificationItems = needed.map(([title, consequence, question_to_ask, consequence_type]) => ({
    title,
    consequence,
    question_to_ask,
    consequence_type,
  })) as QuoteAnalysis['clarificationItems'];

  return {
    verdict: { level: clarificationItems.length ? 'yellow' : 'green', title: copy.title, summary: copy.summary },
    mode: 'single_quote',
    recommendedVendor: '',
    comparison: {
      recommendedQuote: '',
      oneLineReason: copy.summary,
      whyThisOne: prices.length ? prices.map((price) => `${copy.priceFound}${price}`) : [copy.noPrice],
      stillUnclear: clarificationItems.map((item) => item.title),
      beCareful: [copy.next],
    },
    clarificationItems,
    priceSanity: {
      status: prices.length && hasVat ? 'partly' : 'no',
      title: prices.length ? 'Parcialmente' : 'No todavía',
      summary: prices.length ? 'Hay una cantidad en el texto, pero hay que confirmar IVA, alcance y posibles extras.' : copy.noPrice,
      next_step: copy.next,
    },
    infoCategories: {
      confirmed: prices.length ? [copy.received, ...prices.map((price) => `${copy.priceFound}${price}`)] : [copy.received, copy.noPrice],
      needsClarification: clarificationItems.map((item) => item.title),
      risks: [copy.next],
    },
    vendorQuestions: {
      title: copy.title,
      messageToSend: copy.msg,
      messagesByVendor: [{ vendorName: copy.title, messageToSend: copy.msg }],
      questions: clarificationItems.map((item) => item.question_to_ask),
    },
    nextAction: { title: copy.title, summary: copy.next },
    confidence: 'low',
    assumptions: ['Basic review based only on the actual extracted or pasted text.'],
  };
}
