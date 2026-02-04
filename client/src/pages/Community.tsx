import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { apiService } from '../services/api';
import { CommunityPost } from '../types';

const Community: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const data = await apiService.listCommunityPosts();
        setPosts(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load community posts.');
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } }
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto px-4 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Community Ideas</h1>
          </div>
          <p className="text-gray-400 max-w-2xl">
            Share ideas and get feedback from the public. Community posts only include the form details you entered, not the AI report.
          </p>
        </div>
        <Link
          to="/analysis"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          <Sparkles className="h-4 w-4" />
          Publish New Idea
        </Link>
      </motion.div>

      {loading && (
        <div className="flex items-center gap-3 text-gray-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading community posts...
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-3 text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="text-gray-400 bg-gray-800/40 border border-gray-700/60 rounded-lg p-6">
          No community posts yet. Be the first to publish your idea.
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {posts.map(post => (
            <motion.div
              key={post.id}
              variants={itemVariants}
              className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-xl font-semibold text-white">{post.idea.ideaTitle}</h3>
                <span className="text-xs text-gray-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {post.idea.ideaDescription}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {post.idea.targetMarket && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
                    Target: {post.idea.targetMarket}
                  </span>
                )}
                {post.idea.businessModel && (
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                    Model: {post.idea.businessModel}
                  </span>
                )}
                {post.idea.industry && (
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    Industry: {post.idea.industry}
                  </span>
                )}
                {post.idea.budget && (
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    Budget: {post.idea.budget}
                  </span>
                )}
                {post.idea.timeline && (
                  <span className="text-xs px-2 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">
                    Timeline: {post.idea.timeline}
                  </span>
                )}
              </div>

              <div className="text-xs text-gray-400">
                Posted by {post.author?.name || post.author?.email || 'Anonymous'}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Community;
