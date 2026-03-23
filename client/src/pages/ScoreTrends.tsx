import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, BarChart2, Trophy, Target } from 'lucide-react';
import { apiService } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import ScoreTrendChart, { TrendDataPoint } from '../components/ScoreTrendChart';
import LoadingSpinner from '../components/LoadingSpinner';

const ScoreTrends: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getUserResearches();
        const requests = response?.requests || [];

        // Extract score data, sorted chronologically
        const points: TrendDataPoint[] = requests
          .filter((r: any) => {
            const a = r.analysis;
            return a && (a.overallScore != null || a.analysis?.overallScore != null);
          })
          .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          .map((r: any) => {
            const a = r.analysis?.analysis ?? r.analysis ?? {};
            const title = r.input?.ideaTitle || 'Untitled';
            return {
              name: title.length > 18 ? title.slice(0, 18) + '…' : title,
              fullTitle: title,
              date: new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
              overall: a.overallScore ?? 0,
              uniqueness: a.uniquenessScore ?? 0,
              market: a.marketViabilityScore ?? 0,
              competition: a.competitionScore ?? 0,
            };
          });

        setTrendData(points);
      } catch (err: any) {
        console.error('Failed to load score trends:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchData();
    else setLoading(false);
  }, [user?.id]);

  if (loading) return <LoadingSpinner fullScreen message="Loading score trends..." />;

  // Compute summary stats
  const latest = trendData[trendData.length - 1];
  const first = trendData[0];
  const best = trendData.length > 0 ? trendData.reduce((a, b) => (b.overall > a.overall ? b : a)) : null;
  const avgOverall = trendData.length > 0 ? Math.round(trendData.reduce((s, d) => s + d.overall, 0) / trendData.length) : 0;
  const overallDelta = latest && first ? latest.overall - first.overall : 0;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="min-h-screen bg-[#0a122a] py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => navigate('/profile')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-400" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-emerald-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  Score Trends
                </h1>
                <p className="text-sm text-gray-400">Track how your startup ideas are improving</p>
              </div>
            </div>
          </div>
        </motion.div>

        {trendData.length < 2 ? (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="bg-gray-800/50 border border-gray-700 rounded-2xl p-12 text-center"
          >
            <BarChart2 className="h-16 w-16 text-gray-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-semibold text-gray-400 mb-2">Not Enough Data</h3>
            <p className="text-gray-500 mb-6">
              You need at least 2 analyses to see score trends. You currently have {trendData.length}.
            </p>
            <button
              onClick={() => navigate('/analysis')}
              className="bg-gradient-to-r from-blue-500 to-emerald-600 hover:from-blue-600 hover:to-emerald-700 text-white font-semibold py-3 px-8 rounded-lg transition-all transform hover:scale-105"
            >
              Start New Analysis
            </button>
          </motion.div>
        ) : (
          <>
            {/* Summary Cards */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart2 className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-gray-400">Total Analyses</span>
                </div>
                <div className="text-2xl font-bold text-white">{trendData.length}</div>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs text-gray-400">Avg. Score</span>
                </div>
                <div className="text-2xl font-bold text-white">{avgOverall}</div>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span className="text-xs text-gray-400">Best Score</span>
                </div>
                <div className="text-2xl font-bold text-white">{best?.overall ?? '—'}</div>
                <div className="text-xs text-gray-500 truncate mt-1">{best?.fullTitle}</div>
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                  <span className="text-xs text-gray-400">Growth</span>
                </div>
                <div className={`text-2xl font-bold ${overallDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {overallDelta >= 0 ? '+' : ''}{overallDelta}
                </div>
                <div className="text-xs text-gray-500">First → Latest</div>
              </div>
            </motion.div>

            {/* Chart */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="bg-gray-900/50 border border-gray-700 rounded-2xl shadow-2xl p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Score Progression</h2>
              <ScoreTrendChart data={trendData} />
            </motion.div>

            {/* Score Table */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="mt-8 bg-gray-900/50 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">All Scores</h2>
                <p className="text-sm text-gray-400">Chronological breakdown of every analysis</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase tracking-wider">
                      <th className="text-left px-6 py-3">Idea</th>
                      <th className="text-left px-4 py-3">Date</th>
                      <th className="text-center px-4 py-3">Overall</th>
                      <th className="text-center px-4 py-3">Uniqueness</th>
                      <th className="text-center px-4 py-3">Market</th>
                      <th className="text-center px-4 py-3">Competition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trendData.map((d, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-6 py-3 text-gray-200 max-w-[200px] truncate">{d.fullTitle}</td>
                        <td className="px-4 py-3 text-gray-400">{d.date}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-semibold text-emerald-300">{d.overall}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-blue-300">{d.uniqueness}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-purple-300">{d.market}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-amber-300">{d.competition}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ScoreTrends;
