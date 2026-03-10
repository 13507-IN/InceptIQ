const { v4: uuidv4 } = require('uuid');
const { analysisStorage, communityStorage } = require('../utils/storage');
const CommunityPost = require('../models/communityPost');
const { mongoose } = require('../db');
const { findFounderMatches } = require('../services/founderMatchService');

const normalizeIdeaType = (value) => {
    if (!value) return '';
    const normalized = String(value).trim().toLowerCase();
    if (normalized === 'startup' || normalized === 'hackathon') return normalized;
    return '';
};

const pickIdeaFields = (input = {}, ideaType = '') => ({
    ideaTitle: input.ideaTitle || '',
    ideaDescription: input.ideaDescription || '',
    targetMarket: input.targetMarket || '',
    businessModel: input.businessModel || '',
    industry: input.industry || '',
    budget: input.budget || '',
    timeline: input.timeline || '',
    ideaType: normalizeIdeaType(ideaType || input.ideaType)
});

const createPostRecord = ({ idea, analysisId, req }) => ({
    id: uuidv4(),
    analysisId: analysisId || null,
    createdAt: new Date().toISOString(),
    idea,
    upvotes: 0,
    downvotes: 0,
    likes: 0,
    votes: { up: [], down: [], like: [] },
    author: req.user ? {
        id: req.user.id,
        email: req.user.email || null,
        name: req.user.name || null
    } : {
        id: null,
        email: null,
        name: 'Anonymous'
    }
});

const isDbConnected = () => mongoose?.connection?.readyState === 1;
const voteFields = {
    up: 'upvotes',
    down: 'downvotes',
    like: 'likes'
};
const voteArrayFields = {
    up: 'votes.up',
    down: 'votes.down',
    like: 'votes.like'
};

const normalizeVoteCounts = (post) => {
    const upArray = Array.isArray(post?.votes?.up) ? post.votes.up.length : 0;
    const downArray = Array.isArray(post?.votes?.down) ? post.votes.down.length : 0;
    const likeArray = Array.isArray(post?.votes?.like) ? post.votes.like.length : 0;

    return {
        ...post,
        upvotes: Math.max(post?.upvotes ?? 0, upArray),
        downvotes: Math.max(post?.downvotes ?? 0, downArray),
        likes: Math.max(post?.likes ?? 0, likeArray)
    };
};

const communityController = {
    async listPosts(req, res) {
        try {
            if (isDbConnected()) {
                const posts = await CommunityPost.find().sort({ createdAt: -1 }).lean();
                return res.status(200).json({
                    success: true,
                    data: posts.map(post => normalizeVoteCounts(post))
                });
            }

            const posts = communityStorage.list();
            return res.status(200).json({
                success: true,
                data: posts,
                note: 'Using in-memory storage (MongoDB not connected)'
            });
        } catch (error) {
            console.error('Community list posts failed:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to load community posts',
                message: error.message
            });
        }
    },

    async matchFounders(req, res) {
        try {
            if (!req.user?.id) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'Please log in to find founder matches.'
                });
            }

            const { idea = {}, minScore = 35, maxResults = 5 } = req.body || {};
            const title = String(idea.ideaTitle || '').trim();
            const description = String(idea.ideaDescription || '').trim();

            if (!title || !description) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing idea data',
                    message: 'Idea title and description are required to match founders.'
                });
            }

            const posts = isDbConnected()
                ? await CommunityPost.find().sort({ createdAt: -1 }).lean()
                : communityStorage.list();

            const matches = findFounderMatches({
                idea,
                posts,
                userId: req.user.id,
                userEmail: req.user.email,
                minScore,
                maxResults
            });

            return res.status(200).json({
                success: true,
                data: matches,
                count: matches.length
            });
        } catch (error) {
            console.error('Community match founders failed:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to match founders',
                message: error.message
            });
        }
    },

    async createPost(req, res) {
        try {
            if (req.user?.role === 'investor') {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden',
                    message: 'Investor accounts cannot publish community posts'
                });
            }

            const { idea = {}, analysisId = null } = req.body || {};
            const normalizedIdea = pickIdeaFields(idea);

            if (!normalizedIdea.ideaTitle.trim() || !normalizedIdea.ideaDescription.trim()) {
                return res.status(400).json({
                    success: false,
                    error: 'Incomplete idea data',
                    message: 'Idea title and description are required to publish'
                });
            }

            if (!normalizedIdea.ideaType) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing idea type',
                    message: 'Please choose startup or hackathon'
                });
            }

            const post = createPostRecord({ idea: normalizedIdea, analysisId, req });

            if (isDbConnected()) {
                await CommunityPost.create(post);
            } else {
                communityStorage.add(post);
            }

            res.status(201).json({
                success: true,
                message: 'Idea published to community',
                data: post
            });
        } catch (error) {
            console.error('Community create post failed:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to publish idea',
                message: error.message
            });
        }
    },

    async publishFromAnalysis(req, res) {
        try {
            if (req.user?.role === 'investor') {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden',
                    message: 'Investor accounts cannot publish community posts'
                });
            }

            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing analysis ID',
                    message: 'Analysis ID is required to publish to community'
                });
            }

            const analysis = analysisStorage.get(id);
            if (!analysis || !analysis.input) {
                return res.status(404).json({
                    success: false,
                    error: 'Analysis not found',
                    message: `No analysis found with ID: ${id}`
                });
            }

            const idea = pickIdeaFields(analysis.input, 'startup');

            if (!idea.ideaTitle.trim() || !idea.ideaDescription.trim()) {
                return res.status(400).json({
                    success: false,
                    error: 'Incomplete idea data',
                    message: 'Idea title and description are required to publish'
                });
            }

            const post = createPostRecord({ idea, analysisId: id, req });

            if (isDbConnected()) {
                await CommunityPost.create(post);
            } else {
                communityStorage.add(post);
            }

            res.status(201).json({
                success: true,
                message: 'Idea published to community',
                data: post
            });
        } catch (error) {
            console.error('Community publish failed:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to publish idea',
                message: error.message
            });
        }
    },

    async voteOnPost(req, res) {
        try {
            const { id } = req.params;
            const { type } = req.body || {};
            const field = voteFields[type];
            const voteArrayField = voteArrayFields[type];
            const userId = req.user?.id;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing post ID',
                    message: 'Post ID is required'
                });
            }

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'Please log in to vote on community posts'
                });
            }

            if (!field) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid vote type',
                    message: 'Vote type must be up, down, or like'
                });
            }

            if (isDbConnected()) {
                const updated = await CommunityPost.findOneAndUpdate(
                    { id, [voteArrayField]: { $ne: userId } },
                    {
                        $addToSet: { [voteArrayField]: userId },
                        $inc: { [field]: 1 }
                    },
                    { new: true }
                ).lean();

                if (!updated) {
                    const existing = await CommunityPost.findOne({ id }).lean();
                    if (existing) {
                        return res.status(409).json({
                            success: false,
                            error: 'Already voted',
                            message: 'You have already cast this vote'
                        });
                    }

                    return res.status(404).json({
                        success: false,
                        error: 'Post not found',
                        message: `No community post found with ID: ${id}`
                    });
                }

                return res.status(200).json({
                    success: true,
                    data: normalizeVoteCounts(updated)
                });
            }

            const post = communityStorage.get(id);
            if (!post) {
                return res.status(404).json({
                    success: false,
                    error: 'Post not found',
                    message: `No community post found with ID: ${id}`
                });
            }

            if (!post.votes || typeof post.votes !== 'object') post.votes = { up: [], down: [], like: [] };
            if (!Array.isArray(post.votes[type])) post.votes[type] = [];

            if (post.votes[type].includes(userId)) {
                return res.status(409).json({
                    success: false,
                    error: 'Already voted',
                    message: 'You have already cast this vote'
                });
            }

            post.votes[type].push(userId);
            post[field] = (post[field] ?? 0) + 1;

            return res.status(200).json({
                success: true,
                data: normalizeVoteCounts(post)
            });
        } catch (error) {
            console.error('Community vote failed:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to vote',
                message: error.message
            });
        }
    },

    async deletePost(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing post ID',
                    message: 'Post ID is required'
                });
            }

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'Please log in to delete your post'
                });
            }

            if (isDbConnected()) {
                const existing = await CommunityPost.findOne({ id }).lean();
                if (!existing) {
                    return res.status(404).json({
                        success: false,
                        error: 'Post not found',
                        message: `No community post found with ID: ${id}`
                    });
                }

                if (existing.author?.id !== userId) {
                    return res.status(403).json({
                        success: false,
                        error: 'Forbidden',
                        message: 'You can only delete your own post'
                    });
                }

                await CommunityPost.deleteOne({ id });

                return res.status(200).json({
                    success: true,
                    message: 'Post deleted',
                    data: { id }
                });
            }

            const post = communityStorage.get(id);
            if (!post) {
                return res.status(404).json({
                    success: false,
                    error: 'Post not found',
                    message: `No community post found with ID: ${id}`
                });
            }

            if (post.author?.id !== userId) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden',
                    message: 'You can only delete your own post'
                });
            }

            communityStorage.remove(id);

            return res.status(200).json({
                success: true,
                message: 'Post deleted',
                data: { id }
            });
        } catch (error) {
            console.error('Community delete post failed:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to delete post',
                message: error.message
            });
        }
    },

    async getWeeklySpotlight(req, res) {
        try {
            // Calculate the start of the current week (last 7 days)
            const now = new Date();
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            let posts = [];

            if (isDbConnected()) {
                posts = await CommunityPost.find({
                    createdAt: { $gte: sevenDaysAgo }
                }).lean();
            } else {
                all_posts = communityStorage.list();
                posts = all_posts.filter(post => {
                    const postDate = new Date(post.createdAt);
                    return postDate >= sevenDaysAgo;
                });
            }

            if (posts.length === 0) {
                return res.status(200).json({
                    success: true,
                    data: null,
                    message: 'No posts this week yet'
                });
            }

            // Calculate score: upvotes + likes, with upvotes weighted higher
            const postsWithScores = posts.map(post => {
                const normalized = normalizeVoteCounts(post);
                const score = (normalized.upvotes || 0) * 2 + (normalized.likes || 0);
                return {
                    ...normalized,
                    score
                };
            });

            // Find the highest scored post
            const spotlight = postsWithScores.reduce((prev, current) => 
                (prev.score > current.score) ? prev : current
            );

            // Remove score from response
            const { score, ...spotlightData } = spotlight;

            res.status(200).json({
                success: true,
                data: spotlightData
            });
        } catch (error) {
            console.error('Community weekly spotlight failed:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch weekly spotlight',
                message: error.message
            });
        }
    }
};

module.exports = communityController;
