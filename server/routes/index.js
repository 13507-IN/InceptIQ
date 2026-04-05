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
const uploadRoutes = require('./uploads');
const shareRoutes = require('./share');
const notificationRoutes = require('./notifications');
const researchRoutes = require('./research');
const benchmarkRoutes = require('./benchmark');
const competitorRoutes = require('./competitors');

// Route definitions
router.use('/analyze', analysisRoutes);
router.use('/reports', reportRoutes);
router.use('/auth', authRoutes);
router.use('/community', communityRoutes);
router.use('/collaboration', collaborationRoutes);
router.use('/investors', investorRoutes);
router.use('/pitch-decks', pitchDeckRoutes);
router.use('/uploads', uploadRoutes);
router.use('/share', shareRoutes);
router.use('/notifications', notificationRoutes);
router.use('/research', researchRoutes);
router.use('/benchmark', benchmarkRoutes);
router.use('/competitors', competitorRoutes);

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
            uploads: '/api/uploads',
            share: '/api/share',
            health: '/health'
        },
        status: 'active'
    });
});

module.exports = router;
