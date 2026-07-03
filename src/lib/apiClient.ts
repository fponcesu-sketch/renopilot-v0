import type {
  QuoteAnalysis,
  QuoteAnalysisApiResponse,
  QuoteDocument,
  UpdatedRecommendationAnalysis,
  VendorReplyApiResponse,
} from '../types/analysis';

const MAX_QUOTE_CHARS = 18_000;
const ANALYZE_QUOTE_TIMEOUT_MS = 25_000;

async function postJson<TResponse>(path: string, body: unknown, timeoutMs?: number): Promise<TResponse> {
  const controller = new AbortController();
  const timeoutId = timeoutMs
    ? window.setTimeout(() => controller.abort(), timeoutMs)
    : undefined;

  try {
    const response = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json() as Promise<TResponse>;
  } finally {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  }
}

function buildSafeQuoteText(quoteText: string, quoteDocuments: QuoteDocument[]) {
  const documentText = quoteDocuments
    .map((document, index) => `PDF ${index + 1}: ${document.name}\n${document.text}`)
    .join('\n\n---\n\n');
  const combinedText = [documentText, quoteText.trim()].filter(Boolean).join('\n\n---\n\n');

  return combinedText.slice(0, MAX_QUOTE_CHARS);
}

export async function analyzeQuote(input: {
  decisionContext: string;
  quoteText: string;
  quoteDocuments: QuoteDocument[];
  language: string;
}): Promise<{ analysis: QuoteAnalysis; source: QuoteAnalysisApiResponse['source']; error?: string }> {
  const safeInput = {
    ...input,
    quoteText: buildSafeQuoteText(input.quoteText, input.quoteDocuments),
    quoteDocuments: [],
  };
  const data = await postJson<QuoteAnalysisApiResponse>(
    '/api/analyze-quote',
    safeInput,
    ANALYZE_QUOTE_TIMEOUT_MS,
  );

  return {
    analysis: data.analysis,
    source: data.source,
    error: data.error,
  };
}

export async function analyzeVendorReply(input: {
  decisionContext: string;
  quoteText: string;
  originalAnalysis: QuoteAnalysis;
  vendorReply: string;
  language: string;
}): Promise<{
  analysis: UpdatedRecommendationAnalysis;
  source: VendorReplyApiResponse['source'];
  error?: string;
}> {
  const safeInput = {
    ...input,
    quoteText: input.quoteText.slice(0, MAX_QUOTE_CHARS),
  };
  const data = await postJson<VendorReplyApiResponse>('/api/analyze-vendor-reply', safeInput);

  return {
    analysis: data.analysis,
    source: data.source,
    error: data.error,
  };
}
