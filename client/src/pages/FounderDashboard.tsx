import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext, AuthContextValue } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { apiService } from '../services/api';
import { ArrowRight, LineChart, Plus, TrendingUp, Calendar, Users, Zap, BarChart3, FileText, AlertCircle, Target } from 'lucide-react';

interface Analysis {
  id: string;
  input?: {
    ideaTitle?: string;
  };
  idea?: string;
  createdAt: string;
  score?: number;
  status?: string;
}

interface DashboardStats {
  totalAnalyses: number;
  averageScore: number;
  totalViews: number;
}

const FounderDashboard: React.FC = () => {
  const { token, user } = useContext<AuthContextValue>(AuthContext);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalAnalyses: 0, averageScore: 0, totalViews: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        setLoading(true);
        setError(null);
        
        // Using the api service which handles token automatically
        const response = await apiService.getUserResearches();
        
        if (response && response.requests && Array.isArray(response.requests)) {
          const allAnalyses = response.requests as Analysis[];
          
          // Filter for analyses with valid scores (same logic as ScoreTrends)
          const validAnalyses = allAnalyses.filter((r: any) => {
            const a = r.analysis;
            return a && (a.overallScore != null || a.analysis?.overallScore != null);
          });

          // Show only last 3 analyses
          const recentAnalyses = allAnalyses.slice(0, 3);
          setAnalyses(recentAnalyses);

          // Calculate average score (same formula as ScoreTrends - Math.round())
          const totalAnalyses = allAnalyses.length;
          const averageScore = validAnalyses.length > 0
            ? Math.round(validAnalyses.reduce((sum: number, a: any) => {
                // Handle nested score structure like ScoreTrends does
                const score = a.analysis?.analysis?.overallScore ?? a.analysis?.overallScore ?? 0;
                return sum + score;
              }, 0) / validAnalyses.length)
            : 0;
          const totalViews = allAnalyses.length * 2; // Mock calculation

          setStats({ totalAnalyses, averageScore, totalViews });
        } else {
          setAnalyses([]);
          setStats({ totalAnalyses: 0, averageScore: 0, totalViews: 0 });
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
        setAnalyses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a122a] via-[#111b36] to-[#0a122a] px-4 py-8">
      <motion.div
        className="container mx-auto max-w-7xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-sage-300 to-sand-200 bg-clip-text text-transparent mb-2">
            Founder Dashboard
          </h1>
          <p className="text-sand-400 text-lg">Welcome back, {user?.email}! Here's your analysis overview.</p>
        </motion.div>

        {/* Quick Action Button */}
        <motion.div variants={itemVariants} className="mb-8 flex flex-wrap gap-4">
          <Link
            to="/founder/analysis"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sage-500 to-sage-400 hover:from-sage-400 hover:to-sage-300 text-ink-900 font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-sage-500/30 group"
          >
            <Plus className="h-5 w-5" />
            Start New Analysis
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/competitors"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0a122a] border border-sage-500/30 hover:border-sage-400 hover:bg-sage-500/10 text-sage-400 font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-sage-500/20 group"
          >
            <Target className="h-5 w-5" />
            Competitors Tracker
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {/* Total Analyses */}
          <motion.div
            whileHover={{ translateY: -5 }}
            className="bg-gradient-to-br from-sage-500/20 to-sage-500/5 border border-sage-500/40 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sand-300 font-semibold">Total Analyses</h3>
              <div className="p-2 bg-sage-500/20 rounded-lg">
                <FileText className="h-5 w-5 text-sage-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-sand-100">{stats.totalAnalyses}</p>
            <p className="text-sm text-sand-400 mt-2">Ideas analyzed</p>
          </motion.div>

          {/* Average Score */}
          <motion.div
            whileHover={{ translateY: -5 }}
            className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/40 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sand-300 font-semibold">Avg. Score</h3>
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-sand-100">
              {stats.averageScore}
              <span className="text-lg text-sand-400">/100</span>
            </p>
            <p className="text-sm text-sand-400 mt-2">Overall performance</p>
          </motion.div>

          {/* Total Views */}
          <motion.div
            whileHover={{ translateY: -5 }}
            className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/40 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sand-300 font-semibold">Total Views</h3>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-sand-100">{stats.totalViews}</p>
            <p className="text-sm text-sand-400 mt-2">Community engagement</p>
          </motion.div>
        </motion.div>

        {/* Recent Analyses Section */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-sand-100">Last 3 Analyses</h2>
            <span className="text-sm bg-sage-500/20 text-sage-300 px-3 py-1 rounded-full">
              {analyses.length}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="animate-spin h-8 w-8 border-4 border-sage-500 border-t-transparent rounded-full"></div>
              </div>
              <p className="text-sand-400 mt-4">Loading your analyses...</p>
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/50 rounded-lg p-8 text-center"
            >
              <div className="inline-block mb-4 p-3 bg-red-500/20 rounded-full">
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-red-300 mb-2">Unable to Load Dashboard</h3>
              <p className="text-red-400 mb-6">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  // Trigger refetch
                  apiService.getUserResearches()
                    .then(response => {
                      if (response?.requests) {
                        const allAnalyses = response.requests as Analysis[];
                        setAnalyses(allAnalyses.slice(0, 3));
                        
                        const validAnalyses = allAnalyses.filter((r: any) => {
                          const a = r.analysis;
                          return a && (a.overallScore != null || a.analysis?.overallScore != null);
                        });
                        
                        const totalAnalyses = allAnalyses.length;
                        const averageScore = validAnalyses.length > 0
                          ? Math.round(validAnalyses.reduce((sum: number, a: any) => {
                              const score = a.analysis?.analysis?.overallScore ?? a.analysis?.overallScore ?? 0;
                              return sum + score;
                            }, 0) / validAnalyses.length)
                          : 0;
                        
                        setStats({ totalAnalyses, averageScore, totalViews: allAnalyses.length * 2 });
                      }
                    })
                    .catch(err => setError(err.message || 'Failed to retry'))
                    .finally(() => setLoading(false));
                }}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
              >
                Try Again
              </button>
            </motion.div>
          ) : analyses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-sand-100/5 to-sage-500/5 border border-sand-200/10 rounded-xl p-12 text-center"
            >
              <Zap className="h-12 w-12 text-sand-300 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-sand-200 mb-2">No analyses yet</h3>
              <p className="text-sand-400 mb-6">Start your first analysis to see your ideas evaluated by our AI system.</p>
              <Link
                to="/founder/analysis"
                className="inline-flex items-center gap-2 px-6 py-2 bg-sage-500 hover:bg-sage-400 text-ink-900 font-semibold rounded-lg transition-all"
              >
                <Plus className="h-4 w-4" />
                Create First Analysis
              </Link>
            </motion.div>
          ) : (
            <motion.div className="grid grid-cols-1 gap-4">
              {analyses.map((analysis, index) => (
                <motion.div
                  key={analysis.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-gradient-to-r from-ink-800/40 to-ink-900/40 border border-sand-200/10 hover:border-sage-400/40 rounded-lg p-5 transition-all hover:shadow-lg hover:shadow-sage-500/10"
                >
                    <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sand-100 font-semibold group-hover:text-sage-300 transition-colors line-clamp-2 mb-2">
                        {analysis.input?.ideaTitle || analysis.idea || 'Untitled Analysis'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-sand-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(analysis.createdAt)}
                        </div>
                        {(() => {
                          const score = (analysis as any).analysis?.analysis?.overallScore ?? (analysis as any).analysis?.overallScore;
                          return score != null ? (
                            <div className="flex items-center gap-1 px-2 py-1 bg-sage-500/20 rounded text-sage-300">
                              <LineChart className="h-4 w-4" />
                              Score: {Math.round(score)}/100
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </div>
                    <Link
                      to={`/results/${analysis.id}`}
                      className="flex-shrink-0 px-4 py-2 bg-sage-500/20 hover:bg-sage-500/40 text-sage-300 rounded-lg transition-colors whitespace-nowrap"
                    >
                      View
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {analyses.length > 0 && (stats.totalAnalyses > 3) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-center"
            >
              <p className="text-sand-400 mb-4">
                Showing latest 3 of {stats.totalAnalyses} total analyses
              </p>
              <Link
                to="/community"
                className="inline-flex items-center gap-2 px-6 py-2 bg-sage-500/20 hover:bg-sage-500/30 text-sage-300 rounded-lg transition-colors"
              >
                View all analyses
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Quick Links Section */}
        <motion.div variants={itemVariants} className="mt-12 pt-8 border-t border-sand-200/10">
          <h3 className="text-lg font-semibold text-sand-200 mb-4">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/founder/analysis"
              className="flex items-center gap-3 p-4 bg-sand-100/5 hover:bg-sand-100/10 border border-sand-200/10 hover:border-sage-400/40 rounded-lg transition-all group"
            >
              <div className="p-2 bg-sage-500/20 rounded-lg">
                <Plus className="h-5 w-5 text-sage-400" />
              </div>
              <div>
                <h4 className="font-semibold text-sand-100 group-hover:text-sage-300">New Analysis</h4>
                <p className="text-xs text-sand-400">Analyze a new idea</p>
              </div>
              <ArrowRight className="h-4 w-4 text-sand-500 group-hover:text-sage-400 ml-auto" />
            </Link>
            <Link
              to="/compare"
              className="flex items-center gap-3 p-4 bg-sand-100/5 hover:bg-sand-100/10 border border-sand-200/10 hover:border-sage-400/40 rounded-lg transition-all group"
            >
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-sand-100 group-hover:text-sage-300">Compare Ideas</h4>
                <p className="text-xs text-sand-400">Side-by-side analysis</p>
              </div>
              <ArrowRight className="h-4 w-4 text-sand-500 group-hover:text-sage-400 ml-auto" />
            </Link>
            <Link
              to="/community"
              className="flex items-center gap-3 p-4 bg-sand-100/5 hover:bg-sand-100/10 border border-sand-200/10 hover:border-sage-400/40 rounded-lg transition-all group"
            >
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Users className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h4 className="font-semibold text-sand-100 group-hover:text-sage-300">Community</h4>
                <p className="text-xs text-sand-400">Connect with others</p>
              </div>
              <ArrowRight className="h-4 w-4 text-sand-500 group-hover:text-sage-400 ml-auto" />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FounderDashboard;
