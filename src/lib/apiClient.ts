import type {
  QuoteAnalysis,
  QuoteAnalysisApiResponse,
  QuoteDocument,
  UpdatedRecommendationAnalysis,
  VendorReplyApiResponse,
} from '../types/analysis';

async function postJson<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}

export async function analyzeQuote(input: {
  decisionContext: string;
  quoteText: string;
  quoteDocuments: QuoteDocument[];
  language: string;
}): Promise<{ analysis: QuoteAnalysis; source: QuoteAnalysisApiResponse['source']; error?: string }> {
  const data = await postJson<QuoteAnalysisApiResponse>('/api/analyze-quote', input);

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
  const data = await postJson<VendorReplyApiResponse>('/api/analyze-vendor-reply', input);

  return {
    analysis: data.analysis,
    source: data.source,
    error: data.error,
  };
}
