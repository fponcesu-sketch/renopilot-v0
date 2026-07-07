import type {
  QuoteAnalysis,
  QuoteAnalysisApiResponse,
  QuoteDocument,
  UpdatedRecommendationAnalysis,
  VendorReplyApiResponse,
} from '../types/analysis';
import { enforceShortEstimateGuard } from './shortEstimateGuard';
import { buildTextBasedQuoteReview } from './textBasedQuoteReview';

const MAX_QUOTE_CHARS = 18_000;
const ANALYZE_QUOTE_TIMEOUT_MS = 60_000;
const MAX_DOCUMENTS_TO_SEND = 3;

async function postJson<TResponse>(path: string, body: unknown, timeoutMs?: number): Promise<TResponse> {
  const controller = new AbortController();
  const timeoutId = timeoutMs ? window.setTimeout(() => controller.abort(), timeoutMs) : undefined;

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
    .filter((document) => document.text?.trim())
    .map((document, index) => `File ${index + 1}: ${document.name}\n${document.text || ''}`)
    .join('\n\n---\n\n');
  const combinedText = [documentText, quoteText.trim()].filter(Boolean).join('\n\n---\n\n');

  return combinedText.slice(0, MAX_QUOTE_CHARS);
}

function isPdfDocument(document: QuoteDocument) {
  return document.mimeType === 'application/pdf' || document.name.toLowerCase().endsWith('.pdf');
}

function shouldSendFileFallback(document: QuoteDocument) {
  return !document.text?.trim() && Boolean(document.fileData) && (document.mimeType?.startsWith('image/') || isPdfDocument(document));
}

function buildSafeDocuments(quoteDocuments: QuoteDocument[]) {
  return quoteDocuments.slice(0, MAX_DOCUMENTS_TO_SEND).map((document) => ({
    name: document.name,
    text: (document.text || '').slice(0, MAX_QUOTE_CHARS),
    fileData: shouldSendFileFallback(document) ? document.fileData : undefined,
    mimeType: document.mimeType,
    sizeBytes: document.sizeBytes,
  }));
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
    quoteDocuments: buildSafeDocuments(input.quoteDocuments),
  };

  try {
    const data = await postJson<QuoteAnalysisApiResponse>('/api/analyze-quote', safeInput, ANALYZE_QUOTE_TIMEOUT_MS);

    return {
      analysis: enforceShortEstimateGuard(data.analysis, input.language, safeInput.quoteText),
      source: data.source,
      error: data.error,
    };
  } catch {
    const textBasedReview = buildTextBasedQuoteReview(input.language, safeInput.quoteText);

    if (!textBasedReview) {
      throw new Error('Quote analysis failed');
    }

    return {
      analysis: textBasedReview,
      source: 'llm',
      error: undefined,
    };
  }
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
