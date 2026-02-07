const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const authMiddleware = require('../middleware/auth');

// Middleware for request validation
const validateAnalysisRequest = require('../middleware/validateAnalysisRequest');

// POST /api/analyze - Submit startup idea for analysis
router.post('/', authMiddleware, validateAnalysisRequest, analysisController.analyzeIdea);

// POST /api/analyze/extract-pdf-fields - Extract form fields from PDF text using AI
// MUST be before /:id route to avoid being caught by wildcard
router.post('/extract-pdf-fields', analysisController.extractFormFieldsFromPdf);

// GET /api/analyze/:id - Get analysis result by ID
router.get('/:id', analysisController.getAnalysis);

module.exports = router;
