const express = require('express');
const router = express.Router();

// Import route modules
const analysisRoutes = require('./analysis');
const reportRoutes = require('./reports');
const authRoutes = require('./auth');
const communityRoutes = require('./community');
const collaborationRoutes = require('./collaboration');
const investorRoutes = require('./investors');
const pitchDeckRoutes = require('./pitchDecks');

// Route definitions
router.use('/analyze', analysisRoutes);
router.use('/reports', reportRoutes);
router.use('/auth', authRoutes);
router.use('/community', communityRoutes);
router.use('/collaboration', collaborationRoutes);
router.use('/investors', investorRoutes);
router.use('/pitch-decks', pitchDeckRoutes);

// API info endpoint
router.get('/', (req, res) => {
    res.json({
        name: 'AI Startup Validator API',
        version: '1.0.0',
        description: 'API for analyzing startup ideas using Google Gemini AI',
        endpoints: {
            analysis: '/api/analyze',
            reports: '/api/reports',
            community: '/api/community',
            collaboration: '/api/collaboration',
            investors: '/api/investors',
            pitchDecks: '/api/pitch-decks',
            health: '/health'
        },
        status: 'active'
    });
});

module.exports = router;
