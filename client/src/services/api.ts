import axios, { AxiosResponse } from 'axios';
import { StartupIdea, AnalysisResponse, CommunityPost, CommunityIdea, Investor, InvestorMatch, InvestorMatchRequest } from '../types';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 30 seconds timeout
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    // Attach auth token if present
    try {
      const token = localStorage.getItem('iv_token');
      if (token) {
        if (!config.headers) config.headers = {} as any;
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('API endpoint not found. Please check your configuration.');
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    // Return the error for component handling
    throw error;
  }
);

class ApiService {
  // Submit startup idea for analysis
  async analyzeIdea(ideaData: StartupIdea): Promise<AnalysisResponse> {
    try {
      const response: AxiosResponse<AnalysisResponse> = await api.post('/analyze', ideaData);
      return response.data;
    } catch (error: any) {
      console.error('Analysis submission failed:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Failed to analyze startup idea. Please try again.');
    }
  }

  // Get analysis result by ID
  async getAnalysis(analysisId: string): Promise<any> {
    try {
      const response = await api.get(`/analyze/${analysisId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to retrieve analysis:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Analysis not found. It may have expired.');
      }
      
      throw new Error('Failed to retrieve analysis results.');
    }
  }

  // Collaboration: get collaboration info for an analysis
  async getCollaboration(analysisId: string): Promise<any> {
    try {
      const response = await api.get(`/collaboration/${analysisId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to load collaboration info:', error);
      if (error.response?.status === 401) {
        throw new Error('Please log in to manage collaborators.');
      }
      throw new Error(error.response?.data?.message || 'Failed to load collaboration info.');
    }
  }

  // Collaboration: invite collaborators by email
  async inviteCollaborators(analysisId: string, emails: string[]): Promise<any> {
    try {
      const response = await api.post(`/collaboration/${analysisId}/invite`, { emails });
      return response.data;
    } catch (error: any) {
      console.error('Failed to invite collaborators:', error);
      if (error.response?.status === 401) {
        throw new Error('Please log in to invite collaborators.');
      }
      throw new Error(error.response?.data?.message || 'Failed to invite collaborators.');
    }
  }

  // Extract form fields from PDF text using Gemini AI
  async extractFormFieldsFromPdf(pdfText: string): Promise<any> {
    try {
      const response = await api.post('/analyze/extract-pdf-fields', { pdfText });
      return response.data;
    } catch (error: any) {
      console.error('Failed to extract form fields from PDF:', error);
      throw new Error(error.response?.data?.message || 'Failed to extract form fields from PDF.');
    }
  }

  // Download PDF report
  async downloadReport(analysisId: string): Promise<void> {
    try {
      const response = await api.get(`/reports/${analysisId}`, {
        responseType: 'arraybuffer',
        headers: {
          'Accept': 'application/pdf',
        },
      });

      const contentType = (response.headers && (response.headers['content-type'] || response.headers['Content-Type'])) || '';

      // If server returned JSON (error), try to parse it and throw a readable error
      if (contentType.includes('application/json')) {
        const text = new TextDecoder().decode(response.data);
        let parsed = null;
        try {
          parsed = JSON.parse(text);
        } catch (e) {
          parsed = { message: text };
        }
        console.error('Server-side error while generating/downloading PDF:', parsed);
        console.error('Error details:', {
          error: parsed.error,
          message: parsed.message,
          requestId: parsed.requestId,
          stack: parsed.stack
        });
        throw new Error(parsed.message || parsed.error || JSON.stringify(parsed));
      }

      console.log(`PDF response received - Content-Type: ${contentType}, Size: ${response.data.byteLength} bytes`);

      // Build a proper PDF Blob with correct MIME
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });

      // Parse filename from Content-Disposition header if provided
      const cd = (response.headers && (response.headers['content-disposition'] || response.headers['Content-Disposition'])) || '';
      let filename = `startup-analysis-${analysisId}.pdf`;
      const match = /filename\*?=(?:UTF-8'')?"?([^;"']+)"?/i.exec(cd);
      if (match && match[1]) {
        try {
          filename = decodeURIComponent(match[1]);
        } catch {
          filename = match[1];
        }
      }

      console.log(`Triggering PDF download with filename: ${filename}`);
      
      // Trigger browser download
      downloadFile(pdfBlob, filename);
      console.log(`PDF download triggered successfully`);
    } catch (error: any) {
      console.error('PDF download failed:', error);

      // If server responded with arraybuffer error payload, try to decode and show message
      try {
        const resp = error.response;
        if (resp && resp.data) {
          // resp.data might be an ArrayBuffer
          const text = new TextDecoder().decode(resp.data);
          try {
            const parsed = JSON.parse(text);
            console.error('Decoded server error response:', parsed);
            throw new Error(parsed.message || parsed.error || JSON.stringify(parsed));
          } catch (parseErr) {
            console.error('Raw response text:', text);
            throw new Error(text || 'Unknown server error');
          }
        }
      } catch (e) {
        // Fall through to next catch
      }

      // Preserve the original error for better diagnostics
      throw error;
    }
  }

  // Get report information
  async getReportInfo(analysisId: string): Promise<any> {
    try {
      const response = await api.get(`/reports/${analysisId}/info`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to get report info:', error);
      throw new Error('Failed to retrieve report information.');
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await api.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Get API information
  async getApiInfo(): Promise<any> {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      console.error('Failed to get API info:', error);
      return null;
    }
  }

  // Download Pitch Deck (PPTX)
  async downloadPitchDeck(analysisId: string): Promise<void> {
    try {
      const response = await api.get(`/pitch-decks/${analysisId}`, {
        responseType: 'arraybuffer',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        },
      });

      const contentType = (response.headers && (response.headers['content-type'] || response.headers['Content-Type'])) || '';

      if (contentType.includes('application/json')) {
        const text = new TextDecoder().decode(response.data);
        let parsed = null;
        try {
          parsed = JSON.parse(text);
        } catch (e) {
          parsed = { message: text };
        }
        throw new Error(parsed.message || parsed.error || JSON.stringify(parsed));
      }

      const deckBlob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      });

      const cd = (response.headers && (response.headers['content-disposition'] || response.headers['Content-Disposition'])) || '';
      let filename = `pitch-deck-${analysisId}.pptx`;
      const match = /filename\*?=(?:UTF-8'')?"?([^;"']+)"?/i.exec(cd);
      if (match && match[1]) {
        try {
          filename = decodeURIComponent(match[1]);
        } catch {
          filename = match[1];
        }
      }

      downloadFile(deckBlob, filename);
    } catch (error: any) {
      console.error('Pitch deck download failed:', error);
      throw error;
    }
  }

  // Investor Directory: list investors
  async listInvestors(params?: {
    q?: string;
    industry?: string;
    stage?: string;
    geography?: string;
    type?: string;
    minCheck?: number;
    maxCheck?: number;
  }): Promise<Investor[]> {
    try {
      const response = await api.get('/investors', { params });
      return response.data?.data || [];
    } catch (error: any) {
      console.error('Failed to fetch investors:', error);
      throw new Error('Failed to load investors.');
    }
  }

  // Investor Directory: match investors
  async matchInvestors(criteria: InvestorMatchRequest): Promise<InvestorMatch[]> {
    try {
      const response = await api.post('/investors/match', criteria);
      return response.data?.data || [];
    } catch (error: any) {
      console.error('Failed to match investors:', error);
      throw new Error(error.response?.data?.message || 'Failed to match investors.');
    }
  }

  // Get user's research/analysis history
  async getUserResearches(): Promise<any> {
    try {
      const response = await api.get('/auth/requests');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch user researches:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Please log in to view your research history.');
      }
      
      throw new Error('Failed to retrieve your research history.');
    }
  }

  // Community: list posts
  async listCommunityPosts(): Promise<CommunityPost[]> {
    try {
      const response = await api.get('/community');
      return response.data?.data || [];
    } catch (error: any) {
      console.error('Failed to fetch community posts:', error);
      throw new Error('Failed to load community posts.');
    }
  }

  // Community: create post from form data
  async createCommunityPost(payload: { idea: CommunityIdea; analysisId?: string | null }): Promise<CommunityPost> {
    try {
      const response = await api.post('/community', payload);
      return response.data?.data;
    } catch (error: any) {
      console.error('Failed to create community post:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to publish to community.');
    }
  }

  // Community: publish directly from analysis ID (legacy)
  async publishCommunityPost(analysisId: string): Promise<CommunityPost> {
    try {
      const response = await api.post(`/community/publish/${analysisId}`);
      return response.data?.data;
    } catch (error: any) {
      console.error('Failed to publish community post:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to publish to community.');
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export utility functions
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};



