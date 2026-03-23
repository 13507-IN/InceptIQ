import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Star, TrendingUp, Sparkles, ThumbsUp, ArrowRight } from 'lucide-react';
import axios from 'axios';

interface SpotlightPost {
  id: string;
  idea: {
    ideaTitle: string;
    ideaDescription: string;
    industry?: string;
    ideaType?: string;
  };
  author?: {
    id?: string;
    name?: string;
    email?: string;
  };
  upvotes: number;
  downvotes: number;
  likes: number;
  createdAt: string;
}

const WeeklySpotlight: React.FC = () => {
  const [spotlight, setSpotlight] = useState<SpotlightPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpotlight = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/community/weekly-spotlight`
        );
        if (response.data.success && response.data.data) {
          setSpotlight(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch weekly spotlight:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpotlight();
  }, []);

  // Don't render if loading or no spotlight available
  if (loading || !spotlight) return null;

  const totalEngagement = (spotlight.upvotes || 0) + (spotlight.likes || 0);
  const authorName = spotlight.author?.name || 'Anonymous Founder';

  return (
    <section className="reveal py-24 bg-gradient-to-b from-sage-500/15 via-sand-100/5 to-transparent border-b border-sand-100/10">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-sage-500/20 border border-sage-400/30">
            <Star className="h-5 w-5 text-sage-300" fill="currentColor" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-sand-100">Weekly Spotlight</h2>
            <p className="text-sm text-sand-400">This week's most valuable community idea</p>
          </div>
        </div>

        <Link to="/community" className="block group">
          <Card className="bg-gradient-to-br from-sage-500/20 to-sand-200/10 border border-sage-400/50 overflow-hidden hover:border-sage-400/80 transition-all duration-300 hover:shadow-lg hover:shadow-sage-500/20">
            <CardContent className="p-0">
              {/* Header with badge */}
              <div className="relative p-6 border-b border-sage-400/30 bg-sage-500/10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-500/30 border border-sage-400/40 mb-4">
                      <TrendingUp className="h-3 w-3 text-sage-300" />
                      <span className="text-xs font-semibold uppercase tracking-[0.15em] text-sage-200">
                        Trending
                      </span>
                    </div>
                    <h3 className="text-2xl font-semibold text-sand-100 group-hover:text-sage-300 transition-colors">
                      {spotlight.idea.ideaTitle}
                    </h3>
                    <div className="flex items-center gap-2 mt-3 text-xs text-sand-400">
                      <span>by {authorName}</span>
                      {spotlight.idea.industry && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-sand-400" />
                          <span>{spotlight.idea.industry}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-sage-300">
                      {totalEngagement}
                    </div>
                    <div className="text-xs text-sand-400">community votes</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-6 border-b border-sage-400/20">
                <p className="text-sand-200 line-clamp-3">
                  {spotlight.idea.ideaDescription}
                </p>
              </div>

              {/* Stats and CTA */}
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-sand-100">
                      {spotlight.upvotes || 0}
                    </div>
                    <div className="text-xs text-sand-400">Upvotes</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center text-lg font-semibold text-sand-100">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {spotlight.likes || 0}
                    </div>
                    <div className="text-xs text-sand-400">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-sand-100">
                      {new Date(spotlight.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-sand-400">Published</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sage-300 group-hover:text-sage-200 transition-colors">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-semibold">View idea</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Encourage community participation */}
        <div className="mt-8 text-center">
          <p className="text-sand-400 mb-4">
            Have a great idea? <Link to="/community" className="text-sage-300 hover:text-sage-200 font-semibold">Share it with the community</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default WeeklySpotlight;
