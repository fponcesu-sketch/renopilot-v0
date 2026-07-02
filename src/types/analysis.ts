export type VerdictLevel = 'green' | 'yellow' | 'red';
export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type AnalysisSource = 'llm' | 'mock';

export type QuoteInfoCategories = {
  confirmed: string[];
  needsClarification: string[];
  risks: string[];
};

export type QuoteAnalysis = {
  verdict: {
    level: VerdictLevel;
    title: string;
    summary: string;
  };
  infoCategories: QuoteInfoCategories;
  vendorQuestions: {
    title: string;
    messageToSend: string;
    questions: string[];
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
