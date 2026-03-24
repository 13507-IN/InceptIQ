import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Crosshair, BookOpen, ArrowUpRight, RefreshCw } from 'lucide-react';

interface MarketTier {
  value: string;
  description: string;
}

interface MarketSizingData {
  tam: MarketTier;
  sam: MarketTier;
  som: MarketTier;
  methodology: string;
  growthRate: string;
  sources: string[];
}

interface MarketSizeEstimatorProps {
  data: MarketSizingData | null | undefined;
  onReanalyze?: () => void;
}

const tiers = [
  {
    key: 'tam' as const,
    label: 'TAM',
    fullLabel: 'Total Addressable Market',
    icon: Target,
    gradient: 'from-purple-500 to-indigo-500',
    bgGlow: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-300',
    barWidth: '100%',
  },
  {
    key: 'sam' as const,
    label: 'SAM',
    fullLabel: 'Serviceable Addressable Market',
    icon: Crosshair,
    gradient: 'from-blue-500 to-cyan-500',
    bgGlow: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-300',
    barWidth: '65%',
  },
  {
    key: 'som' as const,
    label: 'SOM',
    fullLabel: 'Serviceable Obtainable Market',
    icon: TrendingUp,
    gradient: 'from-emerald-500 to-green-500',
    bgGlow: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-300',
    barWidth: '35%',
  },
];

const MarketSizeEstimator: React.FC<MarketSizeEstimatorProps> = ({ data, onReanalyze }) => {
  const isUnavailable =
    !data ||
    !data.tam?.value ||
    data.tam.value === 'Unable to determine';

  if (isUnavailable) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
        <Target className="h-12 w-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-300 mb-2">Market Sizing Not Available</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
          TAM/SAM/SOM estimates are not available for this analysis. Re-analyze your idea to generate market sizing data.
        </p>
        {onReanalyze && (
          <button
            onClick={onReanalyze}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-500/30 rounded-lg text-sm font-semibold transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Re-analyze Idea
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
      <h3 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
        Market Size Estimator
      </h3>
      <p className="text-gray-400 text-sm mb-8">
        TAM → SAM → SOM funnel based on your idea and target market.
      </p>

      {/* Funnel Visualization */}
      <div className="space-y-4 mb-8">
        {tiers.map((tier, index) => {
          const tierData = data[tier.key];
          const Icon = tier.icon;
          return (
            <motion.div
              key={tier.key}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
            >
              {/* Funnel bar */}
              <div className="flex items-center gap-4">
                <div className="w-16 flex-shrink-0 text-right">
                  <span className={`text-sm font-bold ${tier.textColor}`}>{tier.label}</span>
                </div>
                <div className="flex-1 relative">
                  <div className="w-full bg-gray-900/60 rounded-lg h-14 border border-gray-700 overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${tier.gradient} rounded-lg flex items-center px-4 gap-3`}
                      initial={{ width: 0 }}
                      animate={{ width: tier.barWidth }}
                      transition={{ delay: index * 0.15 + 0.3, duration: 0.8, ease: 'easeOut' }}
                    >
                      <Icon className="h-5 w-5 text-white/80 flex-shrink-0" />
                      <span className="text-white font-bold text-lg truncate">
                        {tierData?.value || 'N/A'}
                      </span>
                    </motion.div>
                  </div>
                </div>
              </div>
              {/* Description */}
              <div className="ml-20 mt-1.5">
                <p className="text-xs text-gray-400">{tier.fullLabel}</p>
                <p className="text-sm text-gray-300 mt-0.5">{tierData?.description || ''}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Growth Rate & Methodology */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {data.growthRate && data.growthRate !== 'Unable to determine' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-700/40 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="h-4 w-4 text-green-400" />
              <span className="text-sm font-semibold text-green-300">Growth Rate</span>
            </div>
            <p className="text-lg font-bold text-white">{data.growthRate}</p>
          </motion.div>
        )}

        {data.methodology && data.methodology !== 'Unable to determine' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-900/50 border border-gray-700 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-300">Methodology</span>
            </div>
            <p className="text-sm text-gray-300">{data.methodology}</p>
          </motion.div>
        )}
      </div>

      {/* Sources */}
      {data.sources && data.sources.length > 0 && data.sources[0] !== '' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-gray-900/40 border border-gray-700/50 rounded-lg p-4"
        >
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Data Sources & References</h4>
          <div className="flex flex-wrap gap-2">
            {data.sources.map((source: string, i: number) => (
              <span
                key={i}
                className="text-xs px-3 py-1.5 bg-gray-800/80 border border-gray-600/50 rounded-full text-gray-300"
              >
                {source}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MarketSizeEstimator;
