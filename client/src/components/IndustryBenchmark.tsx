import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, AlertCircle, Info, BarChart } from 'lucide-react';
import { apiService } from '../services/api';

interface BenchmarkProps {
  industry: string;
  overallScore?: number;
  userScores?: {
    uniqueness: number;
    marketViability: number;
    competition: number;
  };
  ideaTitle?: string;
}

const IndustryBenchmark: React.FC<BenchmarkProps> = ({ industry, overallScore, userScores, ideaTitle }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchBenchmark = async () => {
      try {
        setLoading(true);
        const result = await apiService.getIndustryBenchmark(industry, overallScore, ideaTitle);
        setData(result);
      } catch (err: any) {
        setError('Failed to load benchmark data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (industry) {
      fetchBenchmark();
    } else {
      setLoading(false);
      setError('Industry not specified.');
    }
  }, [industry, overallScore, ideaTitle]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 border-4 border-sage-500/30 rounded-full animate-ping"></div>
          <div className="absolute inset-2 border-4 border-sage-400 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sand-300 font-medium tracking-wide">Gathering real-time industry benchmarks...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-900/20 border border-rose-500/30 rounded-2xl flex items-center gap-4 text-rose-300">
        <AlertCircle className="h-6 w-6" />
        <p>{error || 'No benchmark data available.'}</p>
      </div>
    );
  }

  const avgScores = data.averageScores || {};

  const ScoreBar = ({ label, userSc, avgSc, colorClass }: { label: string, userSc?: number, avgSc: number, colorClass: string }) => {
    return (
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold text-sand-100">{label}</span>
          <span className="text-sand-400">Industry Avg: {avgSc}</span>
        </div>
        <div className="relative h-4 bg-[#0a122a] rounded-full overflow-hidden border border-sand-200/10">
          {/* Average Marker */}
          <div 
            className="absolute top-0 bottom-0 border-l-2 border-dashed border-white/50 z-10"
            style={{ left: `${avgSc}%` }}
            title={`Industry Average: ${avgSc}`}
          />
          {/* User Score Bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${userSc || 0}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full ${colorClass} rounded-full`}
          />
        </div>
        {userSc !== undefined && (
          <div className="text-xs text-right mt-1 font-medium" style={{color: userSc >= avgSc ? '#34d399' : '#fbbf24'}}>
            Your score: {userSc} {userSc >= avgSc ? '(Above Avg)' : '(Below Avg)'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-[#111b36] to-[#0a122a] border border-sand-200/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-32 bg-sage-500/5 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-sage-500/20 rounded-xl border border-sage-500/30 text-sage-400">
            <BarChart className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-sand-100">Industry Benchmark</h2>
            <p className="text-sm text-sand-400 uppercase tracking-wider">{data.industry}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-[1fr_2fr] gap-10">
          {/* Left Column: Overall Stats */}
          <div className="flex flex-col gap-6">
            <div className="bg-[#0a122a] p-6 rounded-2xl border border-sand-200/5 flex flex-col items-center justify-center text-center">
              <span className="text-sm text-sand-400 mb-2">Overall Percentile</span>
              <div className="text-5xl font-black bg-gradient-to-r from-sage-300 to-sage-500 bg-clip-text text-transparent mb-2">
                Top {100 - (data.userPercentile || 50)}%
              </div>
              <p className="text-xs text-sand-500">of early-stage setups in this sector</p>
            </div>

            <div className="bg-sage-500/10 p-5 rounded-2xl border border-sage-500/20">
              <h4 className="text-sm font-semibold text-sage-300 mb-3 flex items-center gap-2">
                <Info className="h-4 w-4" /> Market Insights
              </h4>
              <ul className="space-y-3">
                {(data.insights || []).map((insight: string, idx: number) => (
                  <li key={idx} className="text-sm text-sand-200 flex items-start gap-2">
                    <span className="text-sage-400 mt-1">•</span> {insight}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Comparative Bars */}
          <div className="bg-[#0a122a]/50 p-6 rounded-2xl border border-sand-200/5">
            <h3 className="text-lg font-medium text-sand-100 mb-6 flex items-center gap-2">
              <Target className="h-5 w-5 text-sand-400" /> Metric Comparison
            </h3>
            
            <ScoreBar 
              label="Overall Readiness" 
              userSc={overallScore} 
              avgSc={avgScores.overall || 50} 
              colorClass="bg-gradient-to-r from-emerald-500 to-teal-400" 
            />
            <ScoreBar 
              label="Uniqueness" 
              userSc={userScores?.uniqueness} 
              avgSc={avgScores.uniqueness || 50} 
              colorClass="bg-gradient-to-r from-blue-500 to-indigo-400" 
            />
            <ScoreBar 
              label="Market Viability" 
              userSc={userScores?.marketViability} 
              avgSc={avgScores.marketViability || 50} 
              colorClass="bg-gradient-to-r from-purple-500 to-fuchsia-400" 
            />
             <ScoreBar 
              label="Competition Resistance" 
              userSc={userScores?.competition} 
              avgSc={avgScores.competition || 50} 
              colorClass="bg-gradient-to-r from-amber-500 to-orange-400" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndustryBenchmark;
