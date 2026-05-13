// Analysis types
export interface StartupIdea {
  ideaTitle: string;
  ideaDescription: string;
  targetMarket?: string;
  businessModel?: string;
  industry?: string;
  budget?: string;
  timeline?: string;
  logoUrl?: string;
  coverImageUrl?: string;
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

// Collaboration types
export interface CollaborationUser {
  id: string;
  email: string;
  name?: string | null;
}

export interface Collaborator extends CollaborationUser {
  role?: 'viewer' | 'editor';
  addedAt?: string;
}

export interface CollaborationInfo {
  analysisId: string;
  role: 'owner' | 'collaborator';
  collaborators?: Collaborator[];
  sharedBy?: CollaborationUser | null;
  sharedAt?: string | null;
}

// Notification types
export interface AppNotification {
  id: string;
  userId: string;
  type: 'investor_interest' | 'founder_match' | 'competitor_alert' | 'system';
  title: string;
  body: string;
  data: Record<string, any>;
  read: boolean;
  createdAt: string;
}

// Community types
export interface CommunityIdea {
  ideaTitle: string;
  ideaDescription: string;
  targetMarket?: string;
  businessModel?: string;
  industry?: string;
  budget?: string;
  timeline?: string;
  ideaType: 'startup' | 'hackathon' | '';
}

export interface CommunityAuthor {
  id?: string | null;
  email?: string | null;
  name?: string | null;
}

export interface CommunityPost {
  id: string;
  analysisId: string | null;
  createdAt: string;
  idea: CommunityIdea;
  author?: CommunityAuthor | null;
  upvotes?: number;
  downvotes?: number;
  likes?: number;
  interestedInvestors?: Array<{ userId: string; name?: string; email?: string; expressedAt: string }>;
  interestCount?: number;
}

// Founder matching types
export interface FounderMatch extends CommunityPost {
  matchScore: number;
  matchReasons?: string[];
}

export interface FounderMatchRequest {
  idea: StartupIdea;
  minScore?: number;
  maxResults?: number;
}

// Investor Directory types
export interface Investor {
  id: string;
  name: string;
  type: string;
  stages: string[];
  industries: string[];
  geography: string[];
  ticketMin: number;
  ticketMax: number;
  checkRange?: string;
  thesis: string;
  thesisKeywords?: string[];
  valueAdd: string[];
  notableInvestments: string[];
  preferredModels?: string[];
}

export interface InvestorMatch extends Investor {
  matchScore: number;
  matchReasons: string[];
}

export interface InvestorMatchRequest {
  industry?: string;
  stage?: string;
  geography?: string;
  model?: string;
  ticketSize?: number;
  keywords?: string;
  minScore?: number;
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
