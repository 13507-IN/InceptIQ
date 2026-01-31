import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Calendar, FileText, TrendingUp, Download, Eye } from 'lucide-react';
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface ResearchItem {
  id: string;
  input: {
    ideaTitle: string;
    ideaDescription: string;
    targetMarket?: string;
  };
  createdAt: string;
}

const Profile: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [researches, setResearches] = useState<ResearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResearches = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('\n' + '='.repeat(60));
        console.log('📋 FETCHING USER RESEARCH HISTORY');
        console.log(`User ID: ${user?.id}`);
        console.log('='.repeat(60));
        
        const response = await apiService.getUserResearches();
        console.log('✅ Response received:', response);
        console.log(`📝 Total researches: ${response.requests?.length || 0}`);
        
        if (response.requests && response.requests.length > 0) {
          console.log('Research list:');
            response.requests.forEach((r: ResearchItem, idx: number) => {
            console.log(`   ${idx + 1}. ${r.input?.ideaTitle || 'Unknown'} (${r.id})`);
            });
        }
        
        setResearches(response.requests || []);
        console.log('='.repeat(60) + '\n');
      } catch (err: any) {
        console.error('❌ Failed to fetch researches:', err);
        console.error('Error details:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data
        });
        console.log('='.repeat(60) + '\n');
        setError(err.message || 'Failed to load your research history');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchResearches();
    } else {
      console.warn('⚠️  No user ID available. Skipping research fetch.');
      setLoading(false);
    }
  }, [user?.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Profile Header */}
        <motion.div
          className="mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-8 mb-8"
            variants={itemVariants}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {user?.name || 'Welcome'}
                </h1>
                <p className="text-gray-400">{user?.email}</p>
              </div>
            </div>

            {/* User Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Email */}
              <motion.div
                className="bg-gray-900/50 border border-gray-700 rounded-lg p-4"
                variants={itemVariants}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <span className="text-sm text-gray-400">Email</span>
                </div>
                <p className="text-lg font-semibold text-white break-all">{user?.email}</p>
              </motion.div>

              {/* Account Created */}
              <motion.div
                className="bg-gray-900/50 border border-gray-700 rounded-lg p-4"
                variants={itemVariants}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-5 w-5 text-purple-400" />
                  <span className="text-sm text-gray-400">Total Researches</span>
                </div>
                <p className="text-lg font-semibold text-white">{researches.length}</p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Research History */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="text-3xl font-bold text-white mb-8 flex items-center gap-3"
            variants={itemVariants}
          >
            <TrendingUp className="h-8 w-8 text-blue-400" />
            Your Research History
          </motion.h2>

          {loading ? (
            <motion.div
              className="flex justify-center items-center py-12"
              variants={itemVariants}
            >
              <div className="inline-flex flex-col items-center gap-3">
                <div className="relative w-12 h-12">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    style={{
                      maskImage: 'conic-gradient(transparent 30%, black)',
                      WebkitMaskImage: 'conic-gradient(transparent 30%, black)',
                    }}
                  />
                </div>
                <p className="text-gray-400 text-sm">Loading your research...</p>
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center"
              variants={itemVariants}
            >
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          ) : researches.length === 0 ? (
            <motion.div
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-12 text-center"
              variants={itemVariants}
            >
              <FileText className="h-16 w-16 text-gray-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-semibold text-gray-400 mb-2">
                No Research Yet
              </h3>
              <p className="text-gray-500 mb-6">
                Start your first analysis to see it appear here
              </p>
              <button
                onClick={() => navigate('/analysis')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 inline-block"
              >
                Start New Analysis
              </button>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              variants={containerVariants}
            >
              {researches.map((research) => (
                <motion.div
                  key={research.id}
                  className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700 hover:border-blue-500/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
                  {/* Research Title */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                      {research.input.ideaTitle}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-3">
                      {research.input.ideaDescription}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-3 mb-6 pt-4 border-t border-gray-700">
                    {research.input.targetMarket && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase mt-1">
                          Market:
                        </span>
                        <span className="text-sm text-gray-300 bg-gray-900/50 px-3 py-1 rounded-full">
                          {research.input.targetMarket}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{formatDate(research.createdAt)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => navigate(`/results/${research.id}`)}
                      className="flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-semibold py-2 px-4 rounded-lg transition-all duration-200 border border-blue-500/30 hover:border-blue-500/50"
                    >
                      <Eye className="h-4 w-4" />
                      View Results
                    </button>
                    <button
                      onClick={() => {
                        // Download functionality can be added here
                        alert('Download feature coming soon!');
                      }}
                      className="flex items-center justify-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-semibold py-2 px-4 rounded-lg transition-all duration-200 border border-purple-500/30 hover:border-purple-500/50"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Create New Analysis Button */}
        {!loading && researches.length > 0 && (
          <motion.div
            className="mt-12 text-center"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={() => navigate('/analysis')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 inline-block text-lg"
            >
              Start New Analysis
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Profile;
