const express = require('express');
const router = express.Router();

// Import route modules
const analysisRoutes = require('./analysis');
const reportRoutes = require('./reports');

// Route definitions
router.use('/analyze', analysisRoutes);
router.use('/reports', reportRoutes);

// API info endpoint
router.get('/', (req, res) => {
    res.json({
        name: 'AI Startup Validator API',
        version: '1.0.0',
        description: 'API for analyzing startup ideas using Google Gemini AI',
        endpoints: {
            analysis: '/api/analyze',
            reports: '/api/reports',
            health: '/health'
        },
        status: 'active'
    });
});

module.exports = router;
