const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');

// Middleware for request validation
const validateAnalysisRequest = require('../middleware/validateAnalysisRequest');

// POST /api/analyze - Submit startup idea for analysis
router.post('/', validateAnalysisRequest, analysisController.analyzeIdea);

// GET /api/analyze/:id - Get analysis result by ID
router.get('/:id', analysisController.getAnalysis);

module.exports = router;
