import axios, { AxiosResponse } from 'axios';
import { StartupIdea, AnalysisResponse, ApiResponse } from '../types';

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
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    
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
        throw new Error(parsed.message || parsed.error || JSON.stringify(parsed));
      }

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

      // Trigger browser download
      downloadFile(pdfBlob, filename);
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
            throw new Error(parsed.message || parsed.error || JSON.stringify(parsed));
          } catch (e) {
            // not JSON
            console.warn('PDF download failed, server response:', text);
          }
        }
      } catch (readErr) {
        console.warn('Could not decode server error payload for PDF download:', readErr);
      }

      if (error.response?.status === 404) {
        throw new Error('Report not found. Please generate the analysis first.');
      }

      throw new Error('Failed to download PDF report.');
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
