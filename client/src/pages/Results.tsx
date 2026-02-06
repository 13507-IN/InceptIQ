import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { Download, AlertCircle, ArrowLeft, Send, Users, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import ScoreChart from "../components/ScoreChart";
import ScoreBadge from "../components/ScoreBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { AuthContext } from "../contexts/AuthContext";

const Results: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { analysisId } = useParams<{ analysisId: string }>();
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [analysisInput, setAnalysisInput] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [collabInfo, setCollabInfo] = useState<any>(null);
  const [collabLoading, setCollabLoading] = useState(false);
  const [collabError, setCollabError] = useState<string | null>(null);
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [inviteSummary, setInviteSummary] = useState<{ invited?: number; skipped?: number; errors?: number } | null>(null);
  const [inviteDetails, setInviteDetails] = useState<{ errors?: any[]; skipped?: any[] } | null>(null);

  useEffect(() => {
    if (analysisId) fetchAnalysisData(analysisId);
  }, [analysisId]);

  useEffect(() => {
    if (analysisId && user) loadCollaboration(analysisId);
  }, [analysisId, user?.id]);

  const fetchAnalysisData = async (id: string) => {
    try {
      console.log(`📊 Fetching analysis data for ID: ${id}`);
      setLoading(true);
      const response = await apiService.getAnalysis(id);
      const full = response?.data ?? response ?? null;
      const resolved = full?.analysis ?? full ?? null;
      
      if (!resolved) {
        console.error('❌ No analysis data in response:', response);
        setError("Analysis data not found in response.");
        return;
      }
      
      console.log(`✅ Analysis data loaded successfully`);
      setAnalysisData(resolved);
      setAnalysisInput(full?.input || null);
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

  const loadCollaboration = async (id: string) => {
    try {
      setCollabLoading(true);
      setCollabError(null);
      const response = await apiService.getCollaboration(id);
      setCollabInfo(response || null);
    } catch (err: any) {
      setCollabError(err.message || 'Failed to load collaboration info.');
    } finally {
      setCollabLoading(false);
    }
  };

  const parseEmailList = (value: string) =>
    value
      .split(/[,\s]+/)
      .map((email) => email.trim())
      .filter(Boolean);

  const getInitial = (value?: string | null) =>
    (value || '?').trim().charAt(0).toUpperCase();

  const handleInvite = async () => {
    if (!analysisId) return;
    const emails = parseEmailList(inviteEmails);
    if (emails.length === 0) {
      setInviteError('Please enter at least one email address.');
      return;
    }

    try {
      setInviteBusy(true);
      setInviteError(null);
      setInviteSuccess(null);
      setInviteSummary(null);
      setInviteDetails(null);
      const response = await apiService.inviteCollaborators(analysisId, emails);
      const invitedCount = response?.invited?.length || 0;
      const skippedCount = response?.skipped?.length || 0;
      const errorCount = response?.errors?.length || 0;
      setInviteSuccess(`Invited ${invitedCount} collaborator${invitedCount === 1 ? '' : 's'}.`);
      setInviteSummary({
        invited: invitedCount,
        skipped: skippedCount,
        errors: errorCount
      });
      setInviteDetails({
        errors: response?.errors || [],
        skipped: response?.skipped || []
      });
      setInviteEmails('');
      await loadCollaboration(analysisId);
    } catch (err: any) {
      setInviteError(err.message || 'Failed to invite collaborators.');
    } finally {
      setInviteBusy(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!analysisId) {
      console.error('❌ No analysis ID provided');
      setPdfError("Analysis ID is missing");
      return;
    }
    
    // let startTime = 0;
    
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📥 PDF DOWNLOAD REQUEST`);
      console.log(`Analysis ID: ${analysisId}`);
      console.log(`Timestamp: ${new Date().toISOString()}`);
      console.log(`${'='.repeat(60)}\n`);
      
      setDownloadingPdf(true);
      setPdfError(null);
      
      // startTime = performance.now();
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

  const handlePublishCommunity = () => {
    if (!analysisId) {
      setPdfError('Analysis ID is missing');
      return;
    }

    navigate(`/community/publish?analysisId=${analysisId}`, {
      state: {
        analysisId,
        prefillIdea: analysisInput || null
      }
    });
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
        className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8"
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
        <div className="flex flex-col sm:flex-row gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePublishCommunity}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all"
          >
            <Send className="h-5 w-5" />
            Publish to Community
          </motion.button>
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
        </div>
      </motion.div>

      {/* Team Collaboration */}
      <motion.section
        variants={itemVariants}
        className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg p-6 mb-10"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <Users className="h-5 w-5 text-blue-300" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-100">Team Collaboration</h2>
              <p className="text-sm text-gray-400">Invite teammates to view and discuss this analysis.</p>
            </div>
          </div>
          {collabInfo?.role === 'owner' && (
            <span className="text-xs text-green-300 bg-green-500/10 border border-green-500/30 px-2 py-1 rounded-full">
              Owner
            </span>
          )}
          {collabInfo?.role === 'collaborator' && (
            <span className="text-xs text-blue-300 bg-blue-500/10 border border-blue-500/30 px-2 py-1 rounded-full">
              Collaborator
            </span>
          )}
        </div>

        {!user ? (
          <p className="mt-4 text-sm text-gray-400">
            Sign in to invite teammates and manage collaborators.
          </p>
        ) : collabLoading ? (
          <p className="mt-4 text-sm text-gray-400">Loading collaboration info...</p>
        ) : collabError ? (
          <p className="mt-4 text-sm text-red-300">{collabError}</p>
        ) : collabInfo?.role === 'collaborator' ? (
          <p className="mt-4 text-sm text-gray-300">
            Shared by{' '}
            <span className="text-gray-100 font-semibold">
              {collabInfo.sharedBy?.name || collabInfo.sharedBy?.email || 'a teammate'}
            </span>
          </p>
        ) : (
          <div className="mt-4">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInvite();
                  }
                }}
                placeholder="Add emails (comma or space separated)"
                className="flex-1 bg-gray-900/60 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button
                onClick={handleInvite}
                disabled={inviteBusy || !inviteEmails.trim()}
                className="inline-flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 font-semibold px-4 py-2 rounded-lg transition-all border border-blue-500/30 hover:border-blue-500/50 disabled:opacity-50"
              >
                <UserPlus className="h-4 w-4" />
                {inviteBusy ? 'Inviting...' : 'Invite'}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Invites are available for existing accounts. Ask teammates to sign up first.
            </p>
            {inviteError && <p className="mt-2 text-sm text-red-300">{inviteError}</p>}
            {inviteSuccess && <p className="mt-2 text-sm text-green-300">{inviteSuccess}</p>}
            {inviteSummary && (
              <p className="mt-2 text-xs text-gray-400">
                Invited: {inviteSummary.invited || 0} · Skipped: {inviteSummary.skipped || 0} · Errors:{' '}
                {inviteSummary.errors || 0}
              </p>
            )}
            {inviteDetails?.errors?.length ? (
              <div className="mt-2 text-xs text-red-300">
                {inviteDetails.errors.map((entry: any) => (
                  <div key={entry.email}>{entry.email}: {entry.reason}</div>
                ))}
              </div>
            ) : null}
            {inviteDetails?.skipped?.length ? (
              <div className="mt-2 text-xs text-yellow-300">
                {inviteDetails.skipped.map((entry: any) => (
                  <div key={entry.email}>{entry.email}: {entry.reason}</div>
                ))}
              </div>
            ) : null}

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {collabInfo?.collaborators?.length ? (
                collabInfo.collaborators.map((collaborator: any) => (
                  <div
                    key={collaborator.email}
                    className="flex items-center justify-between bg-gray-900/50 border border-gray-700 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {getInitial(collaborator.name || collaborator.email)}
                      </div>
                      <div>
                        <div className="text-sm text-gray-200">
                          {collaborator.name || collaborator.email}
                        </div>
                        <div className="text-xs text-gray-500">{collaborator.email}</div>
                      </div>
                    </div>
                    <span className="text-xs text-blue-300 bg-blue-500/10 border border-blue-500/30 px-2 py-1 rounded-full">
                      {collaborator.role || 'viewer'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No collaborators yet.</p>
              )}
            </div>
          </div>
        )}
      </motion.section>

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
