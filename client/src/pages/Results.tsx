import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Download, AlertCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import ScoreChart from "../components/ScoreChart";
import ScoreBadge from "../components/ScoreBadge";
import LoadingSpinner from "../components/LoadingSpinner";

const Results: React.FC = () => {
  const navigate = useNavigate();
  const { analysisId } = useParams<{ analysisId: string }>();
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    if (analysisId) fetchAnalysisData(analysisId);
  }, [analysisId]);

  const fetchAnalysisData = async (id: string) => {
    try {
      console.log(`📊 Fetching analysis data for ID: ${id}`);
      setLoading(true);
      const response = await apiService.getAnalysis(id);
      const resolved = response?.data?.analysis ?? response?.data ?? response ?? null;
      
      if (!resolved) {
        console.error('❌ No analysis data in response:', response);
        setError("Analysis data not found in response.");
        return;
      }
      
      console.log(`✅ Analysis data loaded successfully`);
      setAnalysisData(resolved);
    } catch (err: any) {
      console.error("❌ Failed to fetch analysis:", err);
      console.error("Error details:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      setError(err.message || "Unable to load analysis data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!analysisId) {
      console.error('❌ No analysis ID provided');
      setPdfError("Analysis ID is missing");
      return;
    }
    
    let startTime = 0;
    
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📥 PDF DOWNLOAD REQUEST`);
      console.log(`Analysis ID: ${analysisId}`);
      console.log(`Timestamp: ${new Date().toISOString()}`);
      console.log(`${'='.repeat(60)}\n`);
      
      setDownloadingPdf(true);
      setPdfError(null);
      
      startTime = performance.now();
      console.log('🔄 Initiating PDF download...');
      console.log(`📌 API Endpoint: /api/reports/${analysisId}/download`);
      
      await apiService.downloadReport(analysisId);
      
      console.log(`✅ PDF download succeeded`);
      console.log(`${'='.repeat(60)}\n`);
      
    } catch (error: any) {
      console.error(`\n${'='.repeat(60)}`);
      //console.error(`❌ PDF DOWNLOAD FAILED (${duration.toFixed(2)}ms)`);
      console.error(`Analysis ID: ${analysisId}`);
      console.error(`Timestamp: ${new Date().toISOString()}`);
      console.error(`${'='.repeat(60)}`);
      
      // Log error details
      console.error('📋 Error Message:', error.message);
      console.error('📋 Error Code:', error.code);
      console.error('📋 HTTP Status:', error.response?.status);
      console.error('📋 HTTP Status Text:', error.response?.statusText);
      console.error('📋 Response Data:', error.response?.data);
      
      // Log request context
      if (error.config) {
        console.error('\n📝 Request Details:');
        console.error('   URL:', error.config.url);
        console.error('   Method:', error.config.method);
        console.error('   Headers:', error.config.headers);
        console.error('   Data:', error.config.data);
      }
      
      // Log response headers
      if (error.response?.headers) {
        console.error('\n📤 Response Headers:', error.response.headers);
      }
      
      // Log stack trace for debugging
      if (error.stack) {
        console.error('\n🔗 Stack Trace:');
        console.error(error.stack);
      }
      
      // Log full error object for inspection
      console.error('\n📊 Full Error Object:', JSON.stringify({
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      }, null, 2));
      
      console.error(`${'='.repeat(60)}\n`);
      
      // Determine error message for user with diagnosis
      let userErrorMessage = "Failed to download PDF. Please try again.";
      let diagnosis = "";
      
      if (error.response?.status === 404) {
        userErrorMessage = "Analysis not found. It may have been deleted or expired.";
        diagnosis = "Analysis doesn't exist in storage";
      } else if (error.response?.status === 500) {
        userErrorMessage = "Server error during PDF generation. Details: " + (error.response?.data?.error || error.response?.data?.message || "Unknown server error");
        diagnosis = "PDF generation failed on server";
        console.error('🔴 Server Error Details:', error.response?.data);
      } else if (error.response?.status === 401) {
        userErrorMessage = "Your session has expired. Please log in again.";
        diagnosis = "Authentication failed";
      } else if (error.response?.status === 400) {
        userErrorMessage = `Invalid request: ${error.response?.data?.error || error.response?.data?.message || 'Unknown error'}`;
        diagnosis = "Bad request - Invalid parameters";
      } else if (error.code === 'ERR_NETWORK') {
        userErrorMessage = "Network error. Please check your connection and try again.";
        diagnosis = "Network connectivity issue";
      } else if (error.message?.toLowerCase().includes('timeout')) {
        userErrorMessage = "Request timed out. The file may be too large or the server is slow.";
        diagnosis = "Timeout occurred";
      } else if (error.message?.toLowerCase().includes('abort')) {
        userErrorMessage = "Download was aborted. Please try again.";
        diagnosis = "Request aborted";
      }
      
      console.error(`📌 Diagnosis: ${diagnosis}`);
      console.error(`📌 Suggested Action: ${userErrorMessage}\n`);
      
      setPdfError(userErrorMessage);
      alert(`PDF Download Error:\n${userErrorMessage}\n\nOpen Developer Tools (F12 → Console) for detailed logs.`);
      
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading analysis results..." />;

  if (error || !analysisData)
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <p className="text-lg text-gray-300">{error}</p>
      </div>
    );

  const { 
    overallScore, uniquenessScore, marketViabilityScore, competitionScore, 
    analysis, recommendations, risks, opportunities, keyMetrics 
  } = analysisData;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="max-w-6xl mx-auto px-6 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* PDF Error Display */}
      {pdfError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-red-300 font-semibold mb-1">PDF Download Error</h3>
              <p className="text-red-200 text-sm">{pdfError}</p>
              <p className="text-red-200/60 text-xs mt-2">Check the browser console for more details</p>
            </div>
            <button
              onClick={() => setPdfError(null)}
              className="text-red-400 hover:text-red-300 text-lg"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
     
      {/* Header */}
      <motion.div 
        variants={itemVariants}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-400" />
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Startup Analysis Results
            </h1>
          </div>
          <p className="text-gray-400 ml-14">Analysis ID: {analysisId}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownloadPdf}
          disabled={downloadingPdf}
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Download className="h-5 w-5" />
          {downloadingPdf ? "Downloading..." : "Download PDF"}
        </motion.button>
      </motion.div>

      {/* Overall Score */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl rounded-xl p-8 text-center mb-10 border border-gray-700"
      >
        <h2 className="text-2xl font-semibold text-gray-200 mb-4">Overall Viability Score</h2>
        <div className="text-6xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
          {overallScore ?? 0}
        </div>
        <p className="text-gray-400 mt-2">out of 100</p>
      </motion.div>

      {/* Score Breakdown */}
      <motion.div 
        variants={containerVariants}
        className="grid md:grid-cols-3 gap-6 mb-10"
      >
        {[
          { label: "Uniqueness", score: uniquenessScore },
          { label: "Market Viability", score: marketViabilityScore },
          { label: "Competition", score: competitionScore },
        ].map((item, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl shadow-lg hover:shadow-xl hover:border-blue-500/50 transition-all"
          >
            <h3 className="text-xl font-semibold text-gray-200 mb-4">{item.label}</h3>
            <ScoreBadge score={item.score ?? 0} label={`${item.label} Score`} />
            <div className="mt-4">
              <ScoreChart score={item.score ?? 0} />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* --- Uniqueness --- */}
      <motion.section 
        variants={itemVariants}
        className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg p-8 mb-10"
      >
        <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Uniqueness Analysis</h2>
        <p className="text-gray-300 mb-6">{analysis?.uniqueness?.summary}</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Strengths
            </h4>
            <ul className="space-y-2 text-gray-300">
              {analysis?.uniqueness?.strengths?.map((s: string, i: number) => (
                <li key={i} className="flex gap-2">
                  <span className="text-green-400">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
              Concerns
            </h4>
            <ul className="space-y-2 text-gray-300">
              {analysis?.uniqueness?.concerns?.map((c: string, i: number) => (
                <li key={i} className="flex gap-2">
                  <span className="text-red-400">⚠</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.section>

      {/* --- Market Viability --- */}
      <motion.section 
        variants={itemVariants}
        className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg p-8 mb-10"
      >
        <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Market Viability</h2>
        <p className="text-gray-300 mb-6">{analysis?.marketViability?.summary}</p>
        <div className="space-y-3 text-gray-300">
          <div className="p-3 bg-gray-900/50 rounded border border-gray-700">
            <span className="font-semibold text-blue-400">Market Size:</span> {analysis?.marketViability?.marketSize}
          </div>
          <div className="p-3 bg-gray-900/50 rounded border border-gray-700">
            <span className="font-semibold text-blue-400">Target Audience:</span> {analysis?.marketViability?.targetAudience}
          </div>
          {analysis?.marketViability?.trends && (
            <div className="p-3 bg-gray-900/50 rounded border border-gray-700">
              <span className="font-semibold text-blue-400">Key Trends:</span>
              <ul className="mt-2 space-y-1 ml-4">
                {analysis.marketViability.trends.map((t: string, i: number) => (
                  <li key={i} className="text-gray-300">• {t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.section>

      {/* --- Competition --- */}
      <motion.section 
        variants={itemVariants}
        className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg p-8 mb-10"
      >
        <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Competition</h2>
        <p className="text-gray-300 mb-6">{analysis?.competition?.summary}</p>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-semibold text-gray-200 mb-3">Direct Competitors</h4>
            <div className="space-y-2">
              {analysis?.competition?.directCompetitors?.map((c: string, i: number) => (
                <div key={i} className="p-2 bg-gray-900/50 rounded text-gray-300 border-l-2 border-orange-400">
                  {c}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-200 mb-3">Indirect Competitors</h4>
            <div className="space-y-2">
              {analysis?.competition?.indirectCompetitors?.map((c: string, i: number) => (
                <div key={i} className="p-2 bg-gray-900/50 rounded text-gray-300 border-l-2 border-blue-400">
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded border border-green-700/50">
          <h4 className="font-semibold text-green-400 mb-2">Competitive Advantage</h4>
          <p className="text-gray-300">{analysis?.competition?.competitiveAdvantage}</p>
        </div>
      </motion.section>

      {/* --- Key Metrics --- */}
      <motion.section 
        variants={itemVariants}
        className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg p-8 mb-10"
      >
        <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Key Metrics</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
            <div className="text-sm text-gray-400">Funding Required</div>
            <div className="text-lg font-semibold text-blue-400 mt-1">{keyMetrics?.fundingRequired}</div>
          </div>
          <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
            <div className="text-sm text-gray-400">Break-even Point</div>
            <div className="text-lg font-semibold text-blue-400 mt-1">{keyMetrics?.breakEvenPoint}</div>
          </div>
          <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
            <div className="text-sm text-gray-400">Time to Market</div>
            <div className="text-lg font-semibold text-blue-400 mt-1">{keyMetrics?.timeToMarket}</div>
          </div>
          <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
            <div className="text-sm text-gray-400">Scalability Rating</div>
            <div className="text-lg font-semibold text-blue-400 mt-1">{keyMetrics?.scalabilityRating}</div>
          </div>
        </div>
      </motion.section>

      {/* --- Risks --- */}
      <motion.section 
        variants={itemVariants}
        className="bg-gray-800/50 border border-red-700/30 rounded-xl shadow-lg p-8 mb-10"
      >
        <h2 className="text-2xl font-semibold mb-6 text-red-400">Risks & Challenges</h2>
        <div className="space-y-4">
          {risks?.map((r: any, i: number) => (
            <div key={i} className="border-l-4 border-red-500 bg-red-900/10 pl-4 p-4 rounded">
              <h4 className="font-semibold text-gray-200 mb-1">{r.category}</h4>
              <p className="text-gray-300 mb-2 text-sm">{r.description}</p>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-red-400 font-medium">Severity:</span> 
                  <span className="text-gray-300 ml-1">{r.severity}</span>
                </div>
                <div>
                  <span className="text-green-400 font-medium">Mitigation:</span> 
                  <span className="text-gray-300 ml-1">{r.mitigation}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* --- Opportunities --- */}
      <motion.section 
        variants={itemVariants}
        className="bg-gray-800/50 border border-green-700/30 rounded-xl shadow-lg p-8 mb-10"
      >
        <h2 className="text-2xl font-semibold mb-6 text-green-400">Opportunities</h2>
        <div className="space-y-4">
          {opportunities?.map((o: any, i: number) => (
            <div key={i} className="border-l-4 border-green-500 bg-green-900/10 pl-4 p-4 rounded">
              <h4 className="font-semibold text-gray-200 mb-1">{o.category}</h4>
              <p className="text-gray-300 mb-2 text-sm">{o.description}</p>
              <span className="text-green-400 font-medium">Impact:</span> 
              <span className="text-gray-300 ml-1">{o.impact}</span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* --- Recommendations --- */}
      <motion.section 
        variants={itemVariants}
        className="bg-gray-800/50 border border-blue-700/30 rounded-xl shadow-lg p-8"
      >
        <h2 className="text-2xl font-semibold mb-6 text-blue-400">Recommendations</h2>
        <div className="space-y-4">
          {recommendations?.map((rec: any, i: number) => (
            <div key={i} className="border-l-4 border-blue-500 bg-blue-900/10 pl-4 p-4 rounded">
              <h4 className="font-semibold text-gray-200 mb-2">{rec.category}</h4>
              <p className="text-gray-300 mb-3 text-sm">{rec.action}</p>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-blue-400 font-medium">Priority:</span> 
                  <span className="text-gray-300 ml-1">{rec.priority}</span>
                </div>
                <div>
                  <span className="text-blue-400 font-medium">Timeline:</span> 
                  <span className="text-gray-300 ml-1">{rec.timeline}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
};

export default Results;
