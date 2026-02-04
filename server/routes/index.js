const express = require('express');
const router = express.Router();

// Import route modules
const analysisRoutes = require('./analysis');
const reportRoutes = require('./reports');
const authRoutes = require('./auth');
const communityRoutes = require('./community');

// Route definitions
router.use('/analyze', analysisRoutes);
router.use('/reports', reportRoutes);
router.use('/auth', authRoutes);
router.use('/community', communityRoutes);

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
            health: '/health'
        },
        status: 'active'
    });
});

module.exports = router;
