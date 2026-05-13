import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Loader2, AlertCircle, Sparkles, ThumbsUp, ThumbsDown, Heart, TrendingUp, Mail, Briefcase, Trash2, Handshake } from 'lucide-react';
import { apiService } from '../services/api';
import { CommunityPost } from '../types';
import { AuthContext } from '../contexts/AuthContext';

interface CommunityProps {
  variant?: 'community' | 'projects';
}

const Community: React.FC<CommunityProps> = ({ variant = 'community' }) => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  const [voting, setVoting] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const [interesting, setInteresting] = useState<Record<string, boolean>>({});

  const isProjects = variant === 'projects';
  const title = isProjects ? 'Projects' : 'Community Ideas';
  const description = isProjects
    ? 'Review startup projects shared by founders. Vote to surface strong ideas and connect directly with project owners.'
    : 'Share ideas and get feedback from the public. Community posts only include the form details you entered, not the AI report.';
  const showPublish = !isProjects;
  const showContact = isProjects;
  const headerIcon = isProjects ? Briefcase : Users;
  const sidebarTitle = isProjects ? 'Top Projects' : 'Top Voted';
  const sidebarSubtitle = isProjects ? 'Investor favorites right now' : 'Community favorites right now';

  const HeaderIcon = headerIcon;
  const DESCRIPTION_LIMIT = 220;

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const data = await apiService.listCommunityPosts();
        setPosts(data);
      } catch (err: any) {
        setLoadError(err.message || 'Failed to load community posts.');
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

  const truncateText = (value: string, limit: number) => (
    value.length > limit ? `${value.slice(0, limit).trim()}...` : value
  );

  const getVoteScore = (post: CommunityPost) => (
    (post.upvotes ?? 0) + Math.round((post.likes ?? 0) * 0.5) - (post.downvotes ?? 0)
  );

  const topPosts = [...posts]
    .sort((a, b) => {
      const scoreDiff = getVoteScore(b) - getVoteScore(a);
      if (scoreDiff !== 0) return scoreDiff;
      const likeDiff = (b.likes ?? 0) - (a.likes ?? 0);
      if (likeDiff !== 0) return likeDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 5);

  const [matchedPostsMap, setMatchedPostsMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const matchedArray: string[] = JSON.parse(localStorage.getItem('iv_matched_posts') || '[]');
      const map: Record<string, boolean> = {};
      matchedArray.forEach(id => { map[id] = true; });
      setMatchedPostsMap(map);
    } catch (e) {
      // ignore parse errors
    }
  }, [posts]);

  const toggleExpanded = (postId: string) => {
    setExpandedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleVote = async (postId: string, type: 'up' | 'down' | 'like') => {
    try {
      setActionError(null);
      setVoting(prev => ({ ...prev, [postId]: true }));
      const updated = await apiService.voteCommunityPost(postId, type);
      setPosts(prev => prev.map(post => (
        post.id === postId ? { ...post, ...updated } : post
      )));
    } catch (err: any) {
      setActionError(err.message || 'Failed to register vote.');
    } finally {
      setVoting(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleDelete = async (postId: string) => {
    const confirmed = window.confirm('Delete this post? This action cannot be undone.');
    if (!confirmed) return;

    try {
      setActionError(null);
      setDeleting(prev => ({ ...prev, [postId]: true }));
      await apiService.deleteCommunityPost(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete post.');
    } finally {
      setDeleting(prev => ({ ...prev, [postId]: false }));
    }
  };

  return (
    <motion.div
      className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-10"
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
              <HeaderIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">{title}</h1>
          </div>
          <p className="text-gray-400 max-w-2xl">
            {description}
          </p>
        </div>
        {showPublish && (
          <Link
            to="/community/publish"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-medium hover:from-blue-700 hover:to-emerald-600 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            Publish New Idea
          </Link>
        )}
      </motion.div>

      {loading && (
        <div className="flex items-center gap-3 text-gray-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          {isProjects ? 'Loading projects...' : 'Loading community posts...'}
        </div>
      )}

      {loadError && !loading && (
        <div className="flex items-center gap-3 text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <AlertCircle className="h-5 w-5" />
          <span>{loadError}</span>
        </div>
      )}

      {actionError && !loading && (
        <div className="flex items-center gap-3 text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
          <AlertCircle className="h-5 w-5" />
          <span>{actionError}</span>
        </div>
      )}

      {!loading && !loadError && posts.length === 0 && (
        <div className="text-gray-400 bg-gray-800/40 border border-gray-700/60 rounded-lg p-6">
          {isProjects
            ? 'No projects available yet. Check back soon for new submissions.'
            : 'No community posts yet. Be the first to publish your idea.'}
        </div>
      )}

      {!loading && !loadError && posts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] gap-8 items-start">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {posts.map(post => {
              const description = post.idea.ideaDescription || '';
              const isLong = description.length > DESCRIPTION_LIMIT;
              const isExpanded = expandedPosts[post.id];
              const displayDescription = isLong && !isExpanded
                ? truncateText(description, DESCRIPTION_LIMIT)
                : description;
              const isVoting = voting[post.id];
              const isDeleting = deleting[post.id];
              const canDelete = !!user?.id && post.author?.id === user.id;
              const authorLabel = showContact
                ? (post.author?.name || post.author?.email || 'Anonymous')
                : (post.author?.name || 'Anonymous');
              const authorEmail = post.author?.email?.trim() || '';
              const contactHref = authorEmail
                ? `mailto:${authorEmail}?subject=${encodeURIComponent(`Investor inquiry: ${post.idea.ideaTitle || 'Project'}`)}`
                : '';
              const isMatched = matchedPostsMap[post.id];
              const isInvestor = user?.role === 'investor';
              const isAlreadyInterested = post.interestedInvestors?.some(inv => inv.userId === user?.id);
              const isInteresting = interesting[post.id];

              return (
                <motion.div
                  key={post.id}
                  variants={itemVariants}
                  className={`border rounded-lg p-6 shadow-xl transition-all ${
                    isMatched 
                      ? 'bg-gradient-to-br from-indigo-900/60 to-purple-900/40 border-indigo-500/60 shadow-indigo-500/20' 
                      : 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold text-white">{post.idea.ideaTitle}</h3>
                        {isMatched && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500 text-white uppercase tracking-wider animate-pulse">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Matched
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(post.id)}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-red-500/40 bg-red-500/10 text-red-200 text-xs font-semibold hover:bg-red-500/20 transition disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {displayDescription}
                  </p>
                  {isLong && (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(post.id)}
                      className="mt-2 text-xs font-semibold text-emerald-300 hover:text-emerald-200 transition"
                    >
                      {isExpanded ? 'See less' : 'See more'}
                    </button>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mt-4 mb-4">
                    <button
                      type="button"
                      onClick={() => handleVote(post.id, 'up')}
                      disabled={isVoting}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 text-xs font-medium hover:bg-emerald-500/20 transition disabled:opacity-50"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{post.upvotes ?? 0}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVote(post.id, 'down')}
                      disabled={isVoting}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-200 text-xs font-medium hover:bg-amber-500/20 transition disabled:opacity-50"
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                      <span>{post.downvotes ?? 0}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVote(post.id, 'like')}
                      disabled={isVoting}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-rose-500/40 bg-rose-500/10 text-rose-200 text-xs font-medium hover:bg-rose-500/20 transition disabled:opacity-50"
                    >
                      <Heart className="h-3.5 w-3.5" />
                      <span>{post.likes ?? 0}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.idea.ideaType && (
                      <span className="text-xs px-2 py-1 rounded-md bg-gray-500/10 text-gray-200 border border-gray-500/30 uppercase">
                        {post.idea.ideaType}
                      </span>
                    )}
                    {post.idea.targetMarket && (
                      <span className="text-xs px-2 py-1 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/30">
                        Target: {post.idea.targetMarket}
                      </span>
                    )}
                    {post.idea.businessModel && (
                      <span className="text-xs px-2 py-1 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/30">
                        Model: {post.idea.businessModel}
                      </span>
                    )}
                    {post.idea.industry && (
                      <span className="text-xs px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        Industry: {post.idea.industry}
                      </span>
                    )}
                    {post.idea.budget && (
                      <span className="text-xs px-2 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        Budget: {post.idea.budget}
                      </span>
                    )}
                    {post.idea.timeline && (
                      <span className="text-xs px-2 py-1 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/30">
                        Timeline: {post.idea.timeline}
                      </span>
                    )}
                  </div>

                  {isInvestor && (
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            setActionError(null);
                            setInteresting(prev => ({ ...prev, [post.id]: true }));
                            const updated = await apiService.expressInterest(post.id);
                            setPosts(prev => prev.map(p =>
                              p.id === post.id ? { ...p, ...updated } : p
                            ));
                          } catch (err: any) {
                            setActionError(err.message || 'Failed to register interest.');
                          } finally {
                            setInteresting(prev => ({ ...prev, [post.id]: false }));
                          }
                        }}
                        disabled={isAlreadyInterested || isInteresting}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                          isAlreadyInterested
                            ? 'border border-emerald-500/60 bg-emerald-500/20 text-emerald-100'
                            : 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20'
                        }`}
                      >
                        <Handshake className="h-3.5 w-3.5" />
                        {isAlreadyInterested ? 'Interested' : isInteresting ? 'Registering...' : 'Interested'}
                        {post.interestCount != null && post.interestCount > 0 && (
                          <span className="ml-1 text-emerald-300">({post.interestCount})</span>
                        )}
                      </button>
                    </div>
                  )}

                  {showContact && (
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      {authorEmail ? (
                        <a
                          href={contactHref}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-100 text-xs font-semibold hover:bg-emerald-500/20 transition"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Contact owner
                        </a>
                      ) : (
                        <span className="text-xs text-gray-500">Owner email unavailable</span>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-gray-400">
                    {showContact ? 'Project owner' : 'Posted by'} {authorLabel}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="bg-gradient-to-br from-gray-900/70 to-gray-800/50 border border-gray-700/60 rounded-lg p-5 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-emerald-500/15">
                  <TrendingUp className="h-4 w-4 text-emerald-300" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white uppercase tracking-wide">{sidebarTitle}</h2>
                  <p className="text-xs text-gray-400">{sidebarSubtitle}</p>
                </div>
              </div>

              <div className="space-y-3">
                {topPosts.map(post => (
                  <div
                    key={post.id}
                    className="p-3 rounded-xl border border-gray-700/50 bg-gray-900/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-semibold text-white">
                        {truncateText(post.idea.ideaTitle || 'Untitled idea', 52)}
                      </div>
                      <div className="text-xs font-semibold text-emerald-300">
                        {getVoteScore(post)}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {truncateText(post.idea.ideaDescription || '', 90)}
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {post.upvotes ?? 0}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ThumbsDown className="h-3 w-3" />
                        {post.downvotes ?? 0}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {post.likes ?? 0}
                      </span>
                    </div>
                  </div>
                ))}
                {topPosts.length === 0 && (
                  <div className="text-xs text-gray-400">
                    Votes will appear once ideas start getting feedback.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Community;
