const { v4: uuidv4 } = require('uuid');
const { analysisStorage, communityStorage } = require('../utils/storage');

const pickIdeaFields = (input = {}) => ({
    ideaTitle: input.ideaTitle || '',
    ideaDescription: input.ideaDescription || '',
    targetMarket: input.targetMarket || '',
    businessModel: input.businessModel || '',
    industry: input.industry || '',
    budget: input.budget || '',
    timeline: input.timeline || ''
});

const communityController = {
    listPosts(req, res) {
        const posts = communityStorage.list();
        res.status(200).json({
            success: true,
            data: posts
        });
    },

    publishFromAnalysis(req, res) {
        try {
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

            const idea = pickIdeaFields(analysis.input);

            if (!idea.ideaTitle.trim() || !idea.ideaDescription.trim()) {
                return res.status(400).json({
                    success: false,
                    error: 'Incomplete idea data',
                    message: 'Idea title and description are required to publish'
                });
            }

            const post = {
                id: uuidv4(),
                analysisId: id,
                createdAt: new Date().toISOString(),
                idea,
                author: req.user ? {
                    id: req.user.id,
                    email: req.user.email || null,
                    name: req.user.name || null
                } : {
                    id: null,
                    email: null,
                    name: 'Anonymous'
                }
            };

            communityStorage.add(post);

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
    }
};

module.exports = communityController;
