// Analysis types
export interface StartupIdea {
  ideaTitle: string;
  ideaDescription: string;
  targetMarket?: string;
  businessModel?: string;
  industry?: string;
  budget?: string;
  timeline?: string;
}

export interface AnalysisSection {
  score: number;
  summary: string;
}

export interface UniquenessAnalysis extends AnalysisSection {
  strengths: string[];
  concerns: string[];
}

export interface MarketViabilityAnalysis extends AnalysisSection {
  marketSize: string;
  targetAudience: string;
  trends: string[];
}

export interface CompetitionAnalysis extends AnalysisSection {
  directCompetitors: string[];
  indirectCompetitors: string[];
  competitiveAdvantage: string;
}

export interface Risk {
  category: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  mitigation: string;
}

export interface Opportunity {
  category: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface Recommendation {
  category: string;
  action: string;
  priority: 'High' | 'Medium' | 'Low';
  timeline: string;
}

export interface KeyMetrics {
  fundingRequired: string;
  timeToMarket: string;
  breakEvenPoint: string;
  scalabilityRating: 'High' | 'Medium' | 'Low';
}

export interface DetailedAnalysis {
  uniqueness: UniquenessAnalysis;
  marketViability: MarketViabilityAnalysis;
  competition: CompetitionAnalysis;
  risks: Risk[];
  opportunities: Opportunity[];
}

export interface AnalysisResult {
  uniquenessScore: number;
  marketViabilityScore: number;
  competitionScore: number;
  overallScore: number;
  analysis: DetailedAnalysis;
  recommendations: Recommendation[];
  keyMetrics: KeyMetrics;
}

export interface AnalysisResponse {
  analysisId: string;
  success: boolean;
  data: AnalysisResult;
  timestamp: string;
}

// UI component types
export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
}

export interface ScoreBadgeProps {
  score: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

// API types
export interface ApiError {
  error: string;
  message: string;
  details?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// Form types
export interface FormErrors {
  [key: string]: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  required: boolean;
  placeholder?: string;
  options?: string[];
  maxLength?: number;
  rows?: number;
}
