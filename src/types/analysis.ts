export type VerdictLevel = 'green' | 'yellow' | 'red';
export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type AnalysisSource = 'llm' | 'mock';

export type QuoteDocument = {
  name: string;
  text: string;
  fileData?: string;
  mimeType?: string;
  sizeBytes?: number;
};

export type ClarificationItem = {
  title: string;
  consequence: string;
  consequence_type: string;
  question_to_ask: string;
};

export type QuoteInfoCategories = {
  confirmed: string[];
  needsClarification: string[];
  risks: string[];
};

export type ComparisonSummary = {
  recommendedQuote: string;
  oneLineReason: string;
  whyThisOne: string[];
  stillUnclear: string[];
  beCareful: string[];
};

export type VendorMessage = {
  vendorName: string;
  messageToSend: string;
};

export type QuoteAnalysis = {
  verdict: {
    level: VerdictLevel;
    title: string;
    summary: string;
  };
  mode: 'single_quote' | 'quote_comparison';
  recommendedVendor?: string;
  comparison?: ComparisonSummary;
  clarificationItems?: ClarificationItem[];
  infoCategories: QuoteInfoCategories;
  vendorQuestions: {
    title: string;
    messageToSend: string;
    questions: string[];
    messagesByVendor: VendorMessage[];
  };
  nextAction: {
    title: string;
    summary: string;
  };
  confidence: ConfidenceLevel;
  assumptions: string[];
};

export type UpdatedRecommendationAnalysis = {
  updatedVerdict: {
    level: VerdictLevel;
    title: string;
    summary: string;
  };
  resolvedItems: string[];
  remainingOpenItems: string[];
  changedRisk: {
    title: string;
    summary: string;
  };
  nextAction: {
    title: string;
    summary: string;
  };
  messageToSend?: string;
  confidence: ConfidenceLevel;
};

export type QuoteAnalysisApiResponse = {
  source: AnalysisSource;
  analysis: QuoteAnalysis;
  error?: string;
};

export type VendorReplyApiResponse = {
  source: AnalysisSource;
  analysis: UpdatedRecommendationAnalysis;
  error?: string;
};
