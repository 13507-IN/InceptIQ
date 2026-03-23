import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, CheckCircle2, AlertTriangle, Sparkles, ExternalLink, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { apiService } from "../services/api";
import ScoreChart from "../components/ScoreChart";
import ScoreBadge from "../components/ScoreBadge";
import LoadingSpinner from "../components/LoadingSpinner";

const SharedResults: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [analysisInput, setAnalysisInput] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'uniqueness' | 'market' | 'competition' | 'metrics' | 'risks' | 'opportunities' | 'recommendations'
  >('overview');

  useEffect(() => {
    if (token) fetchSharedData(token);
  }, [token]);

  const fetchSharedData = async (shareToken: string) => {
    try {
      setLoading(true);
      const response = await apiService.getSharedAnalysis(shareToken);
      const full = response?.data ?? response ?? null;
      const resolved = full?.analysis ?? full ?? null;

      if (!resolved) {
        setError("Analysis data not found.");
        return;
      }

      setAnalysisData(resolved);
      setAnalysisInput(response?.input || full?.input || null);
      setExpiresAt(response?.expiresAt || null);
    } catch (err: any) {
      setError(err.message || "Unable to load shared analysis.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading shared analysis..." />;

  if (error || !analysisData)
    return (
      <div className="flex flex-col justify-center items-center h-screen px-4">
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-100 mb-2">Link Unavailable</h2>
          <p className="text-gray-400 mb-6">{error || "This shared analysis could not be loaded."}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-emerald-700 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Go to InceptIQ
          </Link>
        </div>
      </div>
    );

  const {
    overallScore, uniquenessScore, marketViabilityScore, competitionScore,
    analysis, recommendations, risks, opportunities, keyMetrics
  } = analysisData;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const getCount = (value: any) => (Array.isArray(value) ? value.length : 0);
  const stats = [
    { label: 'Strengths', value: getCount(analysis?.uniqueness?.strengths) },
    { label: 'Concerns', value: getCount(analysis?.uniqueness?.concerns) },
    { label: 'Trends', value: getCount(analysis?.marketViability?.trends) },
    { label: 'Direct Competitors', value: getCount(analysis?.competition?.directCompetitors) },
    { label: 'Indirect Competitors', value: getCount(analysis?.competition?.indirectCompetitors) },
    { label: 'Recommendations', value: getCount(recommendations) },
    { label: 'Risks', value: getCount(risks) },
    { label: 'Opportunities', value: getCount(opportunities) }
  ];

  const panelClass = "bg-gray-800/50 border border-gray-700 rounded-xl p-6";
  const tabButtonClass = (isActive: boolean) =>
    `whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
      isActive
        ? 'bg-blue-500/20 text-blue-200 border-blue-500/50 shadow-lg shadow-blue-500/10'
        : 'bg-gray-900/40 text-gray-400 border-gray-700 hover:text-gray-200 hover:border-gray-500'
    }`;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'uniqueness', label: 'Uniqueness' },
    { id: 'market', label: 'Market' },
    { id: 'competition', label: 'Competition' },
    { id: 'metrics', label: 'Key Metrics' },
    { id: 'risks', label: 'Risks' },
    { id: 'opportunities', label: 'Opportunities' },
    { id: 'recommendations', label: 'Recommendations' }
  ] as const;

  return (
    <motion.div
      className="max-w-6xl mx-auto px-6 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Shared Banner */}
      <motion.div
        variants={itemVariants}
        className="mb-6 bg-gradient-to-r from-blue-900/30 to-emerald-900/30 border border-blue-500/20 rounded-xl p-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <ExternalLink className="h-5 w-5 text-blue-300" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-200">Shared Analysis Report</h3>
              <p className="text-xs text-gray-400">
                This analysis was shared via InceptIQ.
                {expiresAt && (
                  <span className="inline-flex items-center gap-1 ml-2">
                    <Clock className="h-3 w-3" />
                    Expires {new Date(expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                )}
              </p>
            </div>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-emerald-700 transition-all"
          >
            Sign up for free
            <ArrowLeft className="h-3 w-3 rotate-180" />
          </Link>
        </div>
      </motion.div>

      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            {analysisInput?.ideaTitle || 'Startup Analysis Results'}
          </h1>
          {analysisInput?.ideaDescription && (
            <p className="text-gray-400 mt-2 text-sm max-w-2xl line-clamp-3">
              {analysisInput.ideaDescription}
            </p>
          )}
        </div>
      </motion.div>

      {/* Results Tabs */}
      <motion.section
        variants={itemVariants}
        className="bg-gray-900/50 border border-gray-700 rounded-2xl shadow-2xl p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">Result Strategy</h2>
            <p className="text-sm text-gray-400">
              Dive into each lens with focused tabs instead of a long scroll.
            </p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={tabButtonClass(activeTab === tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {activeTab === 'overview' && (
            <div>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-200 mb-3">Overall Viability Score</h3>
                  <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    {overallScore ?? 0}
                  </div>
                  <p className="text-gray-400 mt-2">out of 100</p>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { label: "Uniqueness", score: uniquenessScore },
                    { label: "Market Viability", score: marketViabilityScore },
                    { label: "Competition", score: competitionScore },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-gray-800/50 border border-gray-700 p-4 rounded-xl shadow-lg hover:shadow-xl hover:border-blue-500/50 transition-all"
                    >
                      <h4 className="text-sm font-semibold text-gray-200 mb-3">{item.label}</h4>
                      <ScoreBadge score={item.score ?? 0} label={`${item.label} Score`} size="sm" />
                      <div className="mt-3">
                        <ScoreChart score={item.score ?? 0} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="text-sm text-gray-400">{stat.label}</div>
                    <div className="text-2xl font-semibold text-gray-100">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'uniqueness' && (
            <div className={panelClass}>
              <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Uniqueness Analysis
              </h3>
              <p className="text-gray-300 mb-6">{analysis?.uniqueness?.summary || 'No summary available.'}</p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    Strengths
                  </h4>
                  <ul className="space-y-2 text-gray-300">
                    {analysis?.uniqueness?.strengths?.map((s: string, i: number) => (
                      <li key={i} className="flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{s}</span>
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
                        <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'market' && (
            <div className={panelClass}>
              <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Market Viability
              </h3>
              <p className="text-gray-300 mb-6">{analysis?.marketViability?.summary || 'No summary available.'}</p>
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
                        <li key={i} className="flex gap-2 text-gray-300">
                          <Sparkles className="h-4 w-4 text-blue-300 mt-0.5 flex-shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'competition' && (
            <div className={panelClass}>
              <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Competition
              </h3>
              <p className="text-gray-300 mb-6">{analysis?.competition?.summary || 'No summary available.'}</p>

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
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className={panelClass}>
              <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Key Metrics
              </h3>
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
            </div>
          )}

          {activeTab === 'risks' && (
            <div className="bg-gray-800/50 border border-red-700/30 rounded-xl p-6">
              <h3 className="text-2xl font-semibold mb-6 text-red-400">Risks & Challenges</h3>
              {risks?.length ? (
                <div className="space-y-4">
                  {risks.map((r: any, i: number) => (
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
              ) : (
                <p className="text-gray-400">No risks identified in this analysis.</p>
              )}
            </div>
          )}

          {activeTab === 'opportunities' && (
            <div className="bg-gray-800/50 border border-green-700/30 rounded-xl p-6">
              <h3 className="text-2xl font-semibold mb-6 text-green-400">Opportunities</h3>
              {opportunities?.length ? (
                <div className="space-y-4">
                  {opportunities.map((o: any, i: number) => (
                    <div key={i} className="border-l-4 border-green-500 bg-green-900/10 pl-4 p-4 rounded">
                      <h4 className="font-semibold text-gray-200 mb-1">{o.category}</h4>
                      <p className="text-gray-300 mb-2 text-sm">{o.description}</p>
                      <span className="text-green-400 font-medium">Impact:</span>
                      <span className="text-gray-300 ml-1">{o.impact}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No opportunities listed for this analysis.</p>
              )}
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="bg-gray-800/50 border border-blue-700/30 rounded-xl p-6">
              <h3 className="text-2xl font-semibold mb-6 text-blue-400">Recommendations</h3>
              {recommendations?.length ? (
                <div className="space-y-4">
                  {recommendations.map((rec: any, i: number) => (
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
              ) : (
                <p className="text-gray-400">No recommendations available.</p>
              )}
            </div>
          )}
        </div>
      </motion.section>

      {/* CTA Footer */}
      <motion.div
        variants={itemVariants}
        className="mt-10 text-center bg-gradient-to-r from-blue-900/20 to-emerald-900/20 border border-blue-500/20 rounded-xl p-8"
      >
        <h3 className="text-xl font-semibold text-white mb-2">Want to analyze your own startup idea?</h3>
        <p className="text-gray-400 mb-4 text-sm">
          Sign up for free and get AI-powered analysis, PDF reports, pitch decks, and more.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-emerald-700 transition-all"
        >
          Get Started Free
          <ArrowLeft className="h-4 w-4 rotate-180" />
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default SharedResults;
